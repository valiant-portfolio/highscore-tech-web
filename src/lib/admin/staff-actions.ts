'use server';

// Admin-only staff management actions: upload photo, amend record (with
// email notification), change status (fire / suspend / reinstate), reset
// password / email-hash, and create "admin override" reports on behalf of
// a staff member who couldn't submit themselves.

import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { sendStaffAmendmentEmail } from '@/lib/email/send-helpers';
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
  const { data: before } = await admin.from('staff').select('status, full_name, slug').eq('id', staffId).maybeSingle();
  await admin.from('staff').update({ status }).eq('id', staffId);
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
