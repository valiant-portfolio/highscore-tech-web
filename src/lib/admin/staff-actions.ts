'use server';

// Admin-only staff management actions: upload photo, amend record (with
// email notification), change status (fire / suspend / reinstate), reset
// password / email-hash, and create "admin override" reports on behalf of
// a staff member who couldn't submit themselves.

import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { sendStaffAmendmentEmail, sendStaffOffboardingEmail, sendStaffMessageEmail } from '@/lib/email/send-helpers';
import { logAudit } from './audit';
import { computeDiff } from './audit-helpers';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const { data } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (data?.role !== 'admin') throw new Error('Not authorised.');
  return { adminUserId: user.id };
}

export type AdminStaffState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

// Ban / un-ban a staff member's Supabase auth user. A 'former' staff is banned
// so they cannot sign in at all — not merely bounced off the dashboard;
// reinstating un-bans them. No-op when the staff has no linked auth user.
async function setAuthBan(userId: string | null | undefined, banned: boolean) {
  if (!userId) return;
  const admin = serviceClient();
  try {
    await admin.auth.admin.updateUserById(userId, {
      // ~100 years ≈ permanent; 'none' clears the ban on reinstate.
      ban_duration: banned ? '876000h' : 'none',
    });
  } catch (err) {
    console.error(`[staff auth] failed to ${banned ? 'ban' : 'un-ban'} ${userId}:`, err);
  }
}

// ── Upload photo ──────────────────────────────────────────────────────────
export async function uploadStaffPhotoAction(_prev: AdminStaffState, formData: FormData): Promise<AdminStaffState> {
  await requireAdmin();
  const staffId = String(formData.get('staff_id') ?? '');
  const file = formData.get('photo') as File | null;
  if (!staffId) return { status: 'error', message: 'Missing staff id.' };
  if (!file || file.size === 0) return { status: 'error', message: 'Pick a photo.', fieldErrors: { photo: 'Required.' } };
  if (file.size > 5 * 1024 * 1024) return { status: 'error', message: 'File too large (5 MB max).' };

  // Process: rotate from EXIF, square-crop, resize to 600x600, encode JPEG.
  let processed: Buffer;
  try {
    const raw = Buffer.from(await file.arrayBuffer());
    processed = await sharp(raw)
      .rotate()
      .resize(600, 600, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
  } catch (err) {
    return { status: 'error', message: `Image processing failed: ${err instanceof Error ? err.message : 'unknown'}` };
  }

  const admin = serviceClient();
  const path = `${staffId}.jpg`;
  const { error: upErr } = await admin.storage.from('staff-photos').upload(path, processed, {
    contentType: 'image/jpeg',
    upsert: true,
    cacheControl: '60',
  });
  if (upErr) return { status: 'error', message: `Upload failed: ${upErr.message}` };

  await admin.from('staff').update({ photo_url: path }).eq('id', staffId);

  const { data: who } = await admin.from('staff').select('full_name, slug').eq('id', staffId).maybeSingle();
  await logAudit({
    action: 'staff.photo_upload',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: who ? `${who.full_name} (${who.slug})` : staffId,
    notes: `${(processed.length / 1024).toFixed(0)} KB JPEG`,
  });

  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${staffId}`);
  revalidatePath('/staff');
  return { status: 'success', message: 'Photo updated. New picture is live on the ID card and dashboard.' };
}

export async function deleteStaffPhotoAction(staffId: string): Promise<void> {
  await requireAdmin();
  const admin = serviceClient();
  await admin.storage.from('staff-photos').remove([`${staffId}.jpg`]);
  await admin.from('staff').update({ photo_url: null }).eq('id', staffId);

  const { data: who } = await admin.from('staff').select('full_name, slug').eq('id', staffId).maybeSingle();
  await logAudit({
    action: 'staff.photo_delete',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: who ? `${who.full_name} (${who.slug})` : staffId,
  });

  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${staffId}`);
}

// ── Amend staff record ────────────────────────────────────────────────────
// Editable fields: full_name, role_title, department, salary_ngn,
// start_date, work_email. Compares before/after, sends a notification
// email to the staff member listing what changed.
export async function amendStaffAction(_prev: AdminStaffState, formData: FormData): Promise<AdminStaffState> {
  await requireAdmin();
  const staffId = String(formData.get('staff_id') ?? '');
  if (!staffId) return { status: 'error', message: 'Missing staff id.' };

  const admin = serviceClient();
  const { data: before } = await admin.from('staff').select('*, users:user_id(email)').eq('id', staffId).maybeSingle();
  if (!before) return { status: 'error', message: 'Staff not found.' };

  const fullName   = String(formData.get('full_name') ?? '').trim();
  const roleTitle  = String(formData.get('role_title') ?? '').trim();
  const department = String(formData.get('department') ?? '').trim() || null;
  const salaryNgn  = Math.max(0, Number(formData.get('salary_ngn')) || 0);
  const startDate  = String(formData.get('start_date') ?? '').trim() || null;
  const workEmail  = String(formData.get('work_email') ?? '').trim().toLowerCase() || null;

  const errors: Record<string, string> = {};
  if (!fullName) errors.full_name = 'Required.';
  if (!roleTitle) errors.role_title = 'Required.';
  if (!salaryNgn) errors.salary_ngn = 'Required.';
  if (Object.keys(errors).length) return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors: errors };

  const patch = {
    full_name: fullName,
    role_title: roleTitle,
    department,
    salary_ngn: salaryNgn,
    start_date: startDate,
    work_email: workEmail,
  };

  const { error: upErr } = await admin.from('staff').update(patch).eq('id', staffId);
  if (upErr) return { status: 'error', message: `Could not save: ${upErr.message}` };

  // Compute diff summary for the email + audit log.
  const changes: { field: string; before: string; after: string }[] = [];
  function diff(field: string, b: unknown, a: unknown, label: string) {
    if (String(b ?? '') !== String(a ?? '')) {
      changes.push({ field: label, before: String(b ?? '—'), after: String(a ?? '—') });
    }
  }
  diff('full_name',  before.full_name,  patch.full_name,  'Name');
  diff('role_title', before.role_title, patch.role_title, 'Role');
  diff('department', before.department, patch.department, 'Department');
  diff('salary_ngn', before.salary_ngn, patch.salary_ngn, 'Salary (₦)');
  diff('start_date', before.start_date, patch.start_date, 'Start date');
  diff('work_email', before.work_email, patch.work_email, 'Work email');

  // Structured diff for the audit log.
  const structuredDiff = computeDiff(
    before as Record<string, unknown>,
    patch as unknown as Record<string, unknown>,
    ['full_name', 'role_title', 'department', 'salary_ngn', 'start_date', 'work_email'],
  );

  if (structuredDiff) {
    await logAudit({
      action: 'staff.amend',
      targetType: 'staff',
      targetId: staffId,
      targetLabel: `${before.full_name} (${before.slug})`,
      diff: structuredDiff,
    });
  }

  // Notify staff if something changed AND we have an email to reach them.
  // Await — fire-and-forget kills the SMTP mid-flight on serverless.
  const notifyTo = patch.work_email ?? before?.users?.email;
  if (changes.length > 0 && notifyTo) {
    try {
      await sendStaffAmendmentEmail({
        to: notifyTo,
        firstName: fullName.split(' ')[0] || 'Team',
        changes,
      });
    } catch (err) {
      console.error('[staff-amend] sendStaffAmendmentEmail threw:', err);
    }
  }

  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${staffId}`);
  revalidatePath('/staff');
  return {
    status: 'success',
    message: changes.length === 0
      ? 'Saved — no changes detected.'
      : `Saved. ${changes.length} change${changes.length === 1 ? '' : 's'}. Notification email sent to ${notifyTo}.`,
  };
}

// ── Status (fire / suspend / reinstate) ──────────────────────────────────
export async function setStaffStatusAction(staffId: string, status: 'active' | 'former'): Promise<void> {
  await requireAdmin();
  const admin = serviceClient();
  const { data: before } = await admin.from('staff').select('status, full_name, slug, user_id').eq('id', staffId).maybeSingle();
  await admin.from('staff').update({ status }).eq('id', staffId);
  await setAuthBan(before?.user_id, status === 'former');
  await logAudit({
    action: status === 'former' ? 'staff.fire_suspend' : 'staff.reinstate',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: before ? `${before.full_name} (${before.slug})` : staffId,
    diff: { status: { before: before?.status ?? null, after: status } },
  });
  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${staffId}`);
}

// ── Offboard (suspend / fire) ────────────────────────────────────────────
// Sets status='former' AND emails the staff member a letter (typed by the
// admin) at their personal email, with a signed PDF copy attached. Suspend
// and fire share the flow; they differ in the default letter, the audit
// action, and the letter heading. (Suspension is reversible via Reinstate —
// both land on 'former', which is what removes portal access.)
export async function offboardStaffAction(_prev: AdminStaffState, formData: FormData): Promise<AdminStaffState> {
  await requireAdmin();
  const staffId       = String(formData.get('staff_id') ?? '');
  const mode          = String(formData.get('mode') ?? '') as 'suspend' | 'fire';
  const personalEmail = String(formData.get('personal_email') ?? '').trim().toLowerCase();
  const subject       = String(formData.get('subject') ?? '').trim();
  const body          = String(formData.get('body') ?? '').trim();

  if (!staffId) return { status: 'error', message: 'Missing staff id.' };
  if (mode !== 'suspend' && mode !== 'fire') return { status: 'error', message: 'Invalid action.' };

  const fieldErrors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) fieldErrors.personal_email = 'Enter a valid email.';
  if (!subject) fieldErrors.subject = 'Required.';
  if (!body)    fieldErrors.body = 'Required.';
  if (Object.keys(fieldErrors).length) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const admin = serviceClient();
  const { data: before } = await admin.from('staff').select('status, full_name, slug, user_id').eq('id', staffId).maybeSingle();
  if (!before) return { status: 'error', message: 'Staff not found.' };

  const { error: upErr } = await admin.from('staff').update({ status: 'former' }).eq('id', staffId);
  if (upErr) return { status: 'error', message: `Could not update status: ${upErr.message}` };

  // Block sign-in at the auth layer (reversible — reinstating un-bans).
  await setAuthBan(before.user_id, true);

  const heading = mode === 'fire' ? 'Conclusion of Engagement' : 'Notice of Suspension';
  const dateStr = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  await logAudit({
    action: mode === 'fire' ? 'staff.fire' : 'staff.suspend',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: `${before.full_name} (${before.slug})`,
    notes: `${mode === 'fire' ? 'Fired' : 'Suspended'} (status ${before.status ?? '—'} → former) · letter emailed to ${personalEmail} · subject: ${subject}`,
  });

  const name = before.full_name;
  let message: string;
  try {
    const res = await sendStaffOffboardingEmail({
      to: personalEmail,
      subject,
      heading,
      bodyText: body,
      recipientName: name,
      dateStr,
    });
    if (!res.ok) {
      message = `${name} set to former, but the email FAILED to send (${res.error ?? 'unknown error'}). Check the logs and resend manually.`;
    } else if (res.id === 'noop') {
      // Transport not configured → sendEmail is a logging no-op.
      message = `${name} set to former, but NO email was sent: the mail server isn't configured (GMAIL_USER / GMAIL_APP_PASSWORD missing in this environment).`;
    } else {
      message = `${name} set to former. Letter sent to ${personalEmail}.`;
    }
  } catch (err) {
    console.error('[offboard] sendStaffOffboardingEmail threw:', err);
    message = `${name} set to former, but sending errored (${err instanceof Error ? err.message : 'unknown'}). Resend manually.`;
  }

  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${staffId}`);
  revalidatePath('/staff');
  return { status: 'success', message };
}

// ── General message ───────────────────────────────────────────────────────
// Emails a staff member an arbitrary message (heading + body) at their personal
// email. Does NOT change status or attach a PDF — for warnings, reinstatements,
// announcements, praise, etc. Body supports **bold**, paragraphs and line breaks.
export async function sendStaffMessageAction(_prev: AdminStaffState, formData: FormData): Promise<AdminStaffState> {
  await requireAdmin();
  const staffId       = String(formData.get('staff_id') ?? '');
  const personalEmail = String(formData.get('personal_email') ?? '').trim().toLowerCase();
  const subject       = String(formData.get('subject') ?? '').trim();
  const heading       = String(formData.get('heading') ?? '').trim();
  const body          = String(formData.get('body') ?? '').trim();

  if (!staffId) return { status: 'error', message: 'Missing staff id.' };

  const fieldErrors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) fieldErrors.personal_email = 'Enter a valid email.';
  if (!subject) fieldErrors.subject = 'Required.';
  if (!body)    fieldErrors.body = 'Required.';
  if (Object.keys(fieldErrors).length) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const admin = serviceClient();
  const { data: before } = await admin.from('staff').select('full_name, slug').eq('id', staffId).maybeSingle();
  if (!before) return { status: 'error', message: 'Staff not found.' };

  await logAudit({
    action: 'staff.message',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: `${before.full_name} (${before.slug})`,
    notes: `Message emailed to ${personalEmail} · subject: ${subject}`,
  });

  let message: string;
  try {
    const res = await sendStaffMessageEmail({
      to: personalEmail,
      subject,
      heading: heading || subject,
      bodyText: body,
    });
    if (!res.ok) {
      message = `Message NOT sent (${res.error ?? 'unknown error'}). Try again.`;
    } else if (res.id === 'noop') {
      message = `No email sent: the mail server isn't configured (GMAIL_USER / GMAIL_APP_PASSWORD missing in this environment).`;
    } else {
      message = `Message sent to ${personalEmail}.`;
    }
  } catch (err) {
    console.error('[staff message] sendStaffMessageEmail threw:', err);
    message = `Sending errored (${err instanceof Error ? err.message : 'unknown'}). Try again.`;
  }

  return { status: 'success', message };
}

// ── Reports ──────────────────────────────────────────────────────────────
// Staff submits their own SOD/EOD/general report.
export async function submitStaffReportAction(_prev: AdminStaffState, formData: FormData): Promise<AdminStaffState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Sign in to submit a report.' };

  const admin = serviceClient();
  const { data: staff } = await admin.from('staff').select('id, status').eq('user_id', user.id).maybeSingle();
  if (!staff || staff.status !== 'active') return { status: 'error', message: 'You are not registered as active staff.' };

  const kind = String(formData.get('kind') ?? 'general') as 'sod' | 'eod' | 'general';
  const content = String(formData.get('content') ?? '').trim();
  if (!content) return { status: 'error', message: 'Type the report content.', fieldErrors: { content: 'Required.' } };

  const { error } = await admin.from('staff_reports').insert({
    staff_id: staff.id,
    kind,
    content,
    submitted_by: user.id,
    is_admin_override: false,
  });
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  revalidatePath('/staff');
  revalidatePath(`/admin/staff/${staff.id}`);
  return { status: 'success', message: 'Report submitted.' };
}

// Admin "saves the day" by submitting on behalf of a staff member.
export async function adminCreateReportAction(_prev: AdminStaffState, formData: FormData): Promise<AdminStaffState> {
  const { adminUserId } = await requireAdmin();
  const staffId = String(formData.get('staff_id') ?? '');
  if (!staffId) return { status: 'error', message: 'Missing staff id.' };
  const kind = String(formData.get('kind') ?? 'general') as 'sod' | 'eod' | 'general';
  const content = String(formData.get('content') ?? '').trim();
  if (!content) return { status: 'error', message: 'Type the report content.', fieldErrors: { content: 'Required.' } };

  const admin = serviceClient();
  const { error } = await admin.from('staff_reports').insert({
    staff_id: staffId,
    kind,
    content,
    submitted_by: adminUserId,
    is_admin_override: true,
  });
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  const { data: who } = await admin.from('staff').select('full_name, slug').eq('id', staffId).maybeSingle();
  await logAudit({
    action: 'staff.report_admin_override',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: who ? `${who.full_name} (${who.slug})` : staffId,
    notes: `${kind} report (${content.length} chars)`,
  });

  revalidatePath('/staff');
  revalidatePath(`/admin/staff/${staffId}`);
  return { status: 'success', message: 'Override report saved on behalf of staff.' };
}

// ── Create staff (admin provisions a new employee) ───────────────────────
// Admin enters all employment details + sets a default password. We create
// the Supabase Auth user, insert the staff record, log the audit, and
// return the credentials so admin can hand them to the new hire.

export type CreateStaffState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string;
      credentials: { email: string; password: string; slug: string; staffId: string } };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createStaffAction(
  _prev: CreateStaffState, formData: FormData,
): Promise<CreateStaffState> {
  void _prev;
  await requireAdmin();

  const full_name      = String(formData.get('full_name')   ?? '').trim();
  let   slug           = String(formData.get('slug')        ?? '').trim().toLowerCase();
  const role_title     = String(formData.get('role_title')  ?? '').trim();
  const department     = (String(formData.get('department') ?? '').trim() || null);
  const work_email     = String(formData.get('work_email')  ?? '').trim().toLowerCase();
  const salary_ngn     = Number(formData.get('salary_ngn')  ?? 0);
  const start_date     = String(formData.get('start_date')  ?? '');
  const reports_to     = (String(formData.get('reports_to') ?? '').trim() || null);
  const password       = String(formData.get('password')    ?? '');

  // If no slug entered, derive one from the name.
  if (!slug && full_name) slug = slugify(full_name);

  const fieldErrors: Record<string, string> = {};
  if (!full_name)                                fieldErrors.full_name   = 'Required.';
  if (!slug)                                     fieldErrors.slug        = 'Required.';
  else if (!/^[a-z0-9-]+$/.test(slug))           fieldErrors.slug        = 'Lowercase letters, numbers, and hyphens only.';
  if (!role_title)                               fieldErrors.role_title  = 'Required.';
  if (!work_email)                               fieldErrors.work_email  = 'Required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(work_email))
                                                 fieldErrors.work_email  = 'Use a valid email address.';
  if (!salary_ngn || salary_ngn <= 0)            fieldErrors.salary_ngn  = 'Enter a salary in naira.';
  if (!start_date)                               fieldErrors.start_date  = 'Required.';
  if (!password || password.length < 6)          fieldErrors.password    = 'At least 6 characters.';

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const admin = serviceClient();

  // Uniqueness pre-checks (also enforced by DB constraints, but a friendly
  // error here is nicer than a 500).
  const { data: slugExists } = await admin.from('staff').select('id').eq('slug', slug).maybeSingle();
  if (slugExists) return { status: 'error', message: 'That slug is already in use.', fieldErrors: { slug: 'Already taken.' } };

  const { data: emailExists } = await admin.from('staff').select('id').eq('work_email', work_email).maybeSingle();
  if (emailExists) return { status: 'error', message: 'That work email is already in use.', fieldErrors: { work_email: 'Already taken.' } };

  // 1. Create the Supabase Auth user. email_confirm=true skips the
  //    verification email — admin is provisioning, not the user.
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: work_email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (authErr || !authData?.user) {
    return { status: 'error', message: `Auth user creation failed: ${authErr?.message ?? 'unknown'}` };
  }
  const newUserId = authData.user.id;

  // 2. Insert the staff record.
  const { data: created, error: staffErr } = await admin.from('staff').insert({
    user_id:      newUserId,
    slug,
    full_name,
    role_title,
    department,
    salary_ngn,
    start_date,
    work_email,
    reports_to,
    status: 'active',
  }).select('id').single();

  if (staffErr || !created) {
    // Roll back the auth user so we don't end up with an orphan.
    await admin.auth.admin.deleteUser(newUserId).catch(() => undefined);
    return { status: 'error', message: `Could not create staff record: ${staffErr?.message ?? 'unknown'}` };
  }

  // 3. Audit log. We DO record the email (it's not secret); we do NOT
  //    record the password.
  await logAudit({
    action: 'staff.create',
    targetType: 'staff',
    targetId: created.id,
    targetLabel: `${full_name} (${slug})`,
    notes: `Email: ${work_email} · Role: ${role_title} · Salary: ${salary_ngn.toLocaleString('en-NG')} NGN`,
  });

  revalidatePath('/admin/staff');
  return {
    status: 'success',
    message: 'Staff created. Hand them the credentials below.',
    credentials: {
      email: work_email,
      password,
      slug,
      staffId: created.id,
    },
  };
}

// ── Team EOD (Olivia only) ───────────────────────────────────────────────
// Olivia compiles the day's report covering every active staff and posts
// it as a single row. content is stored as JSON: { entries: [...] }.

interface TeamEodEntry {
  staff_id: string;
  full_name: string;
  did_work: boolean;
  notes: string;
}

export async function submitTeamEodAction(
  _prev: AdminStaffState, formData: FormData,
): Promise<AdminStaffState> {
  void _prev;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Sign in first.' };

  const admin = serviceClient();
  const { data: me } = await admin
    .from('staff')
    .select('id, slug, status')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!me)                       return { status: 'error', message: 'You are not staff.' };
  if (me.status !== 'active')    return { status: 'error', message: 'Your account is not active.' };
  if (me.slug !== 'olivia')      return { status: 'error', message: 'Only the operations manager can post the team EOD.' };

  // Pull all per-staff entries from the form. Convention: each field is
  // named `entry.<staff_id>.<key>`.
  // EVERY active staff is included in the saved record — even if Olivia
  // didn't tick "worked today" AND didn't enter a reason. That way the
  // CEO can see at a glance who skipped without notice, rather than that
  // staff member silently disappearing from the report.
  const allActive = await admin
    .from('staff')
    .select('id, full_name')
    .eq('status', 'active')
    .order('full_name', { ascending: true });
  const staffList: { id: string; full_name: string }[] = (allActive.data ?? []).map((s) => ({
    id: s.id as string,
    full_name: s.full_name as string,
  }));

  const entries: TeamEodEntry[] = staffList.map((s) => ({
    staff_id: s.id,
    full_name: s.full_name,
    did_work: formData.get(`entry.${s.id}.did_work`) === 'on',
    notes:    String(formData.get(`entry.${s.id}.notes`) ?? '').trim(),
  }));

  if (entries.length === 0) {
    return { status: 'error', message: 'No active staff found.' };
  }

  const reportDate = String(formData.get('report_date') ?? new Date().toISOString().slice(0, 10));
  const summary    = String(formData.get('summary') ?? '').trim();

  const payload = JSON.stringify({ summary, entries });

  const { error: insErr } = await admin.from('staff_reports').insert({
    staff_id: me.id,                    // belongs to Olivia
    kind: 'team_eod',
    content: payload,
    report_date: reportDate,
    submitted_by: user.id,
    is_admin_override: false,
  });
  if (insErr) return { status: 'error', message: `Could not save: ${insErr.message}` };

  const workedCount = entries.filter((e) => e.did_work).length;

  await logAudit({
    action: 'staff.team_eod_submit',
    targetType: 'staff',
    targetId: me.id,
    targetLabel: 'Team EOD',
    notes: `${entries.length} staff covered · ${workedCount} worked`,
  });

  // Notify admin. Awaited (not fire-and-forget) so the email actually
  // sends on serverless before the function freezes.
  try {
    const { sendTeamEodReport } = await import('@/lib/email/send-helpers');
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(reportDate));
    await sendTeamEodReport({
      reportDate: formattedDate,
      postedBy: 'Olivia (Operations Manager)',
      summary,
      entries: entries.map((e) => ({ full_name: e.full_name, did_work: e.did_work, notes: e.notes })),
    });
  } catch (err) {
    console.error('[team-eod] notification email failed:', err);
  }

  revalidatePath('/staff');
  revalidatePath('/admin/staff');
  revalidatePath('/admin/reports');
  return { status: 'success', message: `Team EOD posted for ${reportDate} covering ${entries.length} staff.` };
}
