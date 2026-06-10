'use server';

// Admin server actions. Each one re-checks that the caller is an admin
// before mutating anything — the layout guard is the first line of defence
// but actions can be invoked from anywhere, so we duplicate the check.

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serviceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { markPaymentSucceededAction } from '@/lib/enrollment/actions';
import { logAudit } from './audit';
import { computeDiff } from './audit-helpers';

async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const { data } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (data?.role !== 'admin') throw new Error('Not authorised.');
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
  await requireAdmin();
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
  const cover_image_url = String(formData.get('cover_image_url') ?? '').trim() || null;
  const external_url = String(formData.get('external_url') ?? '').trim() || null;
  const published = formData.get('published') === 'on';

  const errors: Record<string, string> = {};
  if (!slug) errors.slug = 'Slug required.';
  else if (!/^[a-z0-9-]+$/.test(slug)) errors.slug = 'Lowercase letters / digits / hyphens only.';
  if (!title) errors.title = 'Title required.';
  if (!summary) errors.summary = 'Summary required.';
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: errors };
  }

  const admin = serviceClient();
  const payload = {
    slug, title, summary, client, category, year, sort_order,
    tech_stack, body_md, cover_image_url, external_url, published,
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

export async function deletePortfolioAction(id: string): Promise<void> {
  await requireAdmin();
  const admin = serviceClient();
  const { data: before } = await admin.from('portfolio_projects').select('title, slug').eq('id', id).maybeSingle();
  await admin.from('portfolio_projects').delete().eq('id', id);
  await logAudit({
    action: 'portfolio.delete',
    targetType: 'portfolio_project',
    targetId: id,
    targetLabel: before?.title ?? id,
    notes: before?.slug ?? undefined,
  });
  revalidatePath('/portfolio');
  revalidatePath('/admin/portfolio');
  redirect('/admin/portfolio');
}

// ════════════════════════════════════════════════════════════════════════
// Courses
// ════════════════════════════════════════════════════════════════════════

export async function updateCourseAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
