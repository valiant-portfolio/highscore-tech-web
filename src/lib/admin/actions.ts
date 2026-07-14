'use server';

// Admin server actions. Each one re-checks that the caller is an admin
// before mutating anything — the layout guard is the first line of defence
// but actions can be invoked from anywhere, so we duplicate the check.

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { serviceClient } from '@/lib/supabase/service';
import type { SupabaseClient } from '@supabase/supabase-js';
import { markPaymentSucceededAction } from '@/lib/enrollment/actions';
import { sendContactReply } from '@/lib/email/send-helpers';
import { requireSection } from './access';
import { logAudit } from './audit';
import { computeDiff } from './audit-helpers';

const PORTFOLIO_BUCKET = 'portfolio';
const MAX_PORTFOLIO_IMAGES = 5;

// Process + upload one picked image to the public 'portfolio' bucket, returning
// its public URL. Resizes to a sane max and converts to WebP; falls back to the
// original bytes if sharp can't handle the input.
async function uploadPortfolioImage(admin: SupabaseClient, slug: string, file: File): Promise<string> {
  const raw = Buffer.from(await file.arrayBuffer());
  let out: Uint8Array = raw;
  let ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
  let contentType = file.type || 'image/png';
  try {
    out = await sharp(raw)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    ext = 'webp';
    contentType = 'image/webp';
  } catch {
    // keep original bytes/type
  }
  const path = `${slug || 'project'}/${randomUUID()}.${ext}`;
  const { error } = await admin.storage.from(PORTFOLIO_BUCKET).upload(path, out, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  return admin.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export type AdminFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

// ── helpers ────────────────────────────────────────────────────────────────
function csvToArray(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ════════════════════════════════════════════════════════════════════════
// Portfolio
// ════════════════════════════════════════════════════════════════════════

export async function upsertPortfolioAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireSection('portfolio');
  const id = String(formData.get('id') ?? '').trim() || null;
  const slug = String(formData.get('slug') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const client = String(formData.get('client') ?? '').trim() || null;
  const category = String(formData.get('category') ?? '').trim() || null;
  const year = Number(formData.get('year')) || null;
  const sort_order = Number(formData.get('sort_order')) || 0;
  const tech_stack = csvToArray(String(formData.get('tech_stack') ?? ''));
  const body_md = String(formData.get('body_md') ?? '').trim() || null;
  const external_url = String(formData.get('external_url') ?? '').trim() || null;
  const published = formData.get('published') === 'on';

  // Images: existing URLs the admin kept + newly uploaded files. First = cover.
  const keptImages = formData.getAll('existing_images').map((v) => String(v)).filter(Boolean);
  const newFiles = formData.getAll('new_images').filter((f): f is File => f instanceof File && f.size > 0);

  const errors: Record<string, string> = {};
  if (!slug) errors.slug = 'Slug required.';
  else if (!/^[a-z0-9-]+$/.test(slug)) errors.slug = 'Lowercase letters / digits / hyphens only.';
  if (!title) errors.title = 'Title required.';
  if (!summary) errors.summary = 'Summary required.';
  if (keptImages.length + newFiles.length > MAX_PORTFOLIO_IMAGES) {
    errors.images = `Up to ${MAX_PORTFOLIO_IMAGES} images.`;
  }
  if (newFiles.some((f) => f.size > 8 * 1024 * 1024)) {
    errors.images = 'Each image must be 8 MB or smaller.';
  }
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: errors };
  }

  const admin = serviceClient();

  // Upload the new files, then assemble the final ordered image list.
  let uploaded: string[] = [];
  try {
    uploaded = await Promise.all(newFiles.map((f) => uploadPortfolioImage(admin, slug, f)));
  } catch (err) {
    return { status: 'error', message: `Image upload failed: ${err instanceof Error ? err.message : 'unknown'}` };
  }
  const images = [...keptImages, ...uploaded].slice(0, MAX_PORTFOLIO_IMAGES);
  const cover_image_url = images[0] ?? null;

  const payload = {
    slug, title, summary, client, category, year, sort_order,
    tech_stack, body_md, cover_image_url, images, external_url, published,
  };

  if (id) {
    const { data: before } = await admin.from('portfolio_projects').select('*').eq('id', id).maybeSingle();
    const { error } = await admin.from('portfolio_projects').update(payload).eq('id', id);
    if (error) return { status: 'error', message: error.message };
    if (before) {
      const diff = computeDiff(
        before as Record<string, unknown>,
        payload as unknown as Record<string, unknown>,
        ['title', 'slug', 'summary', 'client', 'category', 'year', 'published', 'sort_order'],
      );
      if (diff) {
        await logAudit({
          action: 'portfolio.update',
          targetType: 'portfolio_project',
          targetId: id,
          targetLabel: title,
          diff,
        });
      }
    }
  } else {
    const { data, error } = await admin.from('portfolio_projects').insert(payload).select('id').single();
    if (error) return { status: 'error', message: error.message };
    await logAudit({
      action: 'portfolio.create',
      targetType: 'portfolio_project',
      targetId: data!.id,
      targetLabel: title,
    });
    revalidatePath('/portfolio');
    revalidatePath('/admin/portfolio');
    redirect(`/admin/portfolio/${data!.id}`);
  }
  revalidatePath('/portfolio');
  revalidatePath('/portfolio/[slug]', 'page');
  revalidatePath('/admin/portfolio');
  return { status: 'success', message: 'Saved.' };
}

// Pull the storage object path out of a public portfolio URL, or null if the URL
// isn't one of ours (e.g. a legacy pasted external cover).
function portfolioStoragePath(url: string): string | null {
  const marker = '/storage/v1/object/public/' + PORTFOLIO_BUCKET + '/';
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

// Returns a result instead of redirect()ing. The old version threw NEXT_REDIRECT
// from inside a client-invoked closure, which surfaced as an unhandled error
// (the "delete crashes the page") — the client now navigates on { ok: true }.
export async function deletePortfolioAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireSection('portfolio');
  const admin = serviceClient();

  const { data: before } = await admin
    .from('portfolio_projects')
    .select('title, slug, images, cover_image_url')
    .eq('id', id)
    .maybeSingle();
  if (!before) return { ok: false, error: 'Project not found — it may already be deleted. Refresh the list.' };

  const { error } = await admin.from('portfolio_projects').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  // Best-effort: remove this project's uploaded images from the bucket. Never
  // let a storage hiccup fail the delete — the row is already gone.
  try {
    const urls = [...(before.images ?? []), before.cover_image_url].filter(Boolean) as string[];
    const paths = Array.from(new Set(urls.map(portfolioStoragePath).filter((p): p is string => !!p)));
    if (paths.length) await admin.storage.from(PORTFOLIO_BUCKET).remove(paths);
  } catch (e) {
    console.error('[portfolio.delete] image cleanup failed (row already deleted):', e);
  }

  await logAudit({
    action: 'portfolio.delete',
    targetType: 'portfolio_project',
    targetId: id,
    targetLabel: before.title ?? id,
    notes: before.slug ?? undefined,
  });
  revalidatePath('/portfolio');
  revalidatePath('/admin/portfolio');
  return { ok: true };
}

// ════════════════════════════════════════════════════════════════════════
// Courses
// ════════════════════════════════════════════════════════════════════════

export async function updateCourseAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireSection('courses');
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return { status: 'error', message: 'Course ID missing.' };

  const title = String(formData.get('title') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const full_description = String(formData.get('full_description') ?? '').trim() || null;
  const price_ngn = Math.max(0, Number(formData.get('price_ngn')) || 0);
  const duration_weeks = Number(formData.get('duration_weeks')) || null;
  const mode = String(formData.get('mode') ?? 'hybrid') as 'online' | 'offline' | 'hybrid';
  const level = String(formData.get('level') ?? '').trim() || null;
  const outcomes = csvToArray(String(formData.get('outcomes') ?? ''));
  const prerequisites = csvToArray(String(formData.get('prerequisites') ?? ''));
  const sort_order = Number(formData.get('sort_order')) || 0;
  const published = formData.get('published') === 'on';

  const errors: Record<string, string> = {};
  if (!title) errors.title = 'Title required.';
  if (!summary) errors.summary = 'Summary required.';
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: errors };
  }

  const admin = serviceClient();
  const { data: before } = await admin.from('courses').select('*').eq('id', id).maybeSingle();
  const patch = {
    title, summary, full_description, price_ngn, duration_weeks, mode, level,
    outcomes, prerequisites, sort_order, published,
  };
  const { error } = await admin.from('courses').update(patch).eq('id', id);
  if (error) return { status: 'error', message: error.message };

  if (before) {
    const diff = computeDiff(
      before as Record<string, unknown>,
      patch as unknown as Record<string, unknown>,
      ['title', 'summary', 'price_ngn', 'duration_weeks', 'mode', 'level', 'published', 'sort_order'],
    );
    if (diff) {
      await logAudit({
        action: 'course.update',
        targetType: 'course',
        targetId: id,
        targetLabel: title,
        diff,
      });
    }
  }

  revalidatePath('/academy');
  revalidatePath('/academy/[slug]', 'page');
  revalidatePath('/admin/courses');
  return { status: 'success', message: 'Saved.' };
}

// ════════════════════════════════════════════════════════════════════════
// Installments — manual marking for offline payments
// ════════════════════════════════════════════════════════════════════════

export async function markInstallmentPaidAction(
  installmentId: string,
  enrollmentId: string,
): Promise<void> {
  await requireSection('enrollments');
  const admin = serviceClient();

  const { data: inst } = await admin
    .from('installments')
    .select('id, amount_ngn, status, enrollment_id')
    .eq('id', installmentId)
    .maybeSingle();
  if (!inst || inst.enrollment_id !== enrollmentId) return;
  if (inst.status === 'paid') return;

  // Insert a manual payment row marked succeeded, then mark the installment
  // paid + bump paid_ngn via the existing helper which is idempotent.
  const manualRef = `MANUAL-${installmentId.slice(0, 8)}-${Date.now().toString(36)}`;
  const { data: pay } = await admin.from('payments').insert({
    enrollment_id: enrollmentId,
    installment_id: installmentId,
    amount_ngn: inst.amount_ngn,
    status: 'pending',
    alatpay_reference: manualRef,
  }).select('id').single();
  if (!pay) return;

  await markPaymentSucceededAction(manualRef, { source: 'manual-admin' });
  await logAudit({
    action: 'enrollment.installment_marked_paid',
    targetType: 'enrollment',
    targetId: enrollmentId,
    targetLabel: `Installment ${installmentId.slice(0, 8)}`,
    notes: `Manual mark · ₦${inst.amount_ngn.toLocaleString()}`,
  });
  revalidatePath(`/admin/enrollments/${enrollmentId}`);
  revalidatePath('/admin/enrollments');
  revalidatePath('/admin/ledger');
}

export async function markEnrollmentStatusAction(
  enrollmentId: string,
  status: 'pending' | 'active' | 'completed' | 'cancelled',
): Promise<void> {
  await requireSection('enrollments');
  const admin = serviceClient();
  const { data: before } = await admin.from('enrollments').select('status').eq('id', enrollmentId).maybeSingle();
  await admin.from('enrollments').update({ status }).eq('id', enrollmentId);
  await logAudit({
    action: 'enrollment.status_change',
    targetType: 'enrollment',
    targetId: enrollmentId,
    diff: { status: { before: before?.status ?? null, after: status } },
  });
  revalidatePath(`/admin/enrollments/${enrollmentId}`);
  revalidatePath('/admin/enrollments');
}

// ════════════════════════════════════════════════════════════════════════
// Staff
// ════════════════════════════════════════════════════════════════════════

export async function resetStaffEmailAction(staffId: string): Promise<void> {
  await requireSection('staff');
  const admin = serviceClient();
  const { data: who } = await admin.from('staff').select('full_name, slug').eq('id', staffId).maybeSingle();
  await admin.from('staff').update({ personal_email_hash: null }).eq('id', staffId);
  await logAudit({
    action: 'staff.reset_legacy_email',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: who ? `${who.full_name} (${who.slug})` : staffId,
  });
  revalidatePath('/admin/staff');
}

export async function updateStaffSalaryAction(
  staffId: string,
  newSalary: number,
): Promise<void> {
  await requireSection('staff');
  if (newSalary < 0) return;
  const admin = serviceClient();
  const { data: before } = await admin.from('staff').select('salary_ngn, full_name, slug').eq('id', staffId).maybeSingle();
  await admin.from('staff').update({ salary_ngn: newSalary }).eq('id', staffId);
  await logAudit({
    action: 'staff.salary_update',
    targetType: 'staff',
    targetId: staffId,
    targetLabel: before ? `${before.full_name} (${before.slug})` : staffId,
    diff: { salary_ngn: { before: before?.salary_ngn ?? null, after: newSalary } },
  });
  revalidatePath('/admin/staff');
  revalidatePath('/admin/ledger');
}

// ════════════════════════════════════════════════════════════════════════
// Contact messages
// ════════════════════════════════════════════════════════════════════════

export async function updateContactStatusAction(
  id: string,
  status: 'new' | 'read' | 'replied' | 'archived',
): Promise<void> {
  await requireSection('contact');
  const admin = serviceClient();
  const { data: before } = await admin.from('contact_messages').select('status, name, email').eq('id', id).maybeSingle();
  await admin.from('contact_messages').update({ status }).eq('id', id);
  await logAudit({
    action: 'contact_message.status_change',
    targetType: 'contact_message',
    targetId: id,
    targetLabel: before ? `${before.name} <${before.email}>` : id,
    diff: { status: { before: before?.status ?? null, after: status } },
  });
  revalidatePath('/admin/contact');
}

// Reply to a contact enquiry: email the sender, then mark the thread replied.
// The reply body is kept in the audit log so there's a record of what was sent.
export async function replyToContactAction(
  id: string,
  subject: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireSection('contact');
  const reply = body.trim();
  if (!reply) return { ok: false, error: 'Write a reply first.' };

  const admin = serviceClient();
  const { data: msg } = await admin
    .from('contact_messages')
    .select('name, email, subject, message')
    .eq('id', id)
    .maybeSingle();
  if (!msg) return { ok: false, error: 'Message not found.' };

  const subj = subject.trim() || `Re: ${msg.subject || 'Your enquiry'}`;
  const firstName = (msg.name ?? '').trim().split(/\s+/)[0] || 'there';

  const res = await sendContactReply({
    to: msg.email,
    subject: subj,
    heading: `Hi ${firstName},`,
    bodyText: reply,
    originalMessage: msg.message,
  });
  if (!res.ok) return { ok: false, error: res.error ?? 'Could not send the reply.' };

  await admin.from('contact_messages').update({ status: 'replied' }).eq('id', id);
  await logAudit({
    action: 'contact_message.replied',
    targetType: 'contact_message',
    targetId: id,
    targetLabel: `${msg.name} <${msg.email}>`,
    notes: `Subject: ${subj}\n\n${reply}`,
  });
  revalidatePath('/admin/contact');
  return { ok: true };
}
