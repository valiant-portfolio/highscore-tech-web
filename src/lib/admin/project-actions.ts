'use server';

// CRUD + workflow actions for client_projects and its sub-tables. All
// admin-gated. Every write writes an audit_log row so we have a forensic
// trail of project spending and status changes.

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { checkSection } from './access';
import { logAudit } from './audit';

// Admins pass; staff pass if granted the 'projects' section.
async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  return checkSection('projects');
}

export type ProjectFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

// ── Create project ───────────────────────────────────────────────────────
export async function createProjectAction(
  _prev: ProjectFormState, formData: FormData,
): Promise<ProjectFormState> {
  void _prev;
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const name        = String(formData.get('name')         ?? '').trim();
  const project_type = (String(formData.get('project_type') ?? 'client').trim() === 'internal'
                        ? 'internal' : 'client') as 'client' | 'internal';
  const client_name = project_type === 'internal'
    ? 'Highscore Tech'
    : String(formData.get('client_name')  ?? '').trim();
  const client_email = project_type === 'internal' ? null : (String(formData.get('client_email') ?? '').trim() || null);
  const client_phone = project_type === 'internal' ? null : (String(formData.get('client_phone') ?? '').trim() || null);
  const description  = String(formData.get('description')  ?? '').trim() || null;
  const project_url  = String(formData.get('project_url')  ?? '').trim() || null;
  const costRaw = Number(formData.get('cost_ngn') ?? 0);
  const cost_ngn = (project_type === 'internal' || !costRaw) ? null : costRaw;
  const started_at = String(formData.get('started_at') ?? '') || null;
  const due_at     = String(formData.get('due_at')     ?? '') || null;

  const fieldErrors: Record<string, string> = {};
  if (!name)                                  fieldErrors.name        = 'Required.';
  if (project_type === 'client' && !client_name)
                                              fieldErrors.client_name = 'Required for client projects.';

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const admin = serviceClient();
  const { data: created, error } = await admin.from('client_projects').insert({
    name, project_type, client_name, client_email, client_phone,
    description, project_url, cost_ngn,
    started_at, due_at,
    status: 'in_progress',
  }).select('id').single();

  if (error || !created) return { status: 'error', message: `Could not create: ${error?.message ?? 'unknown'}` };

  await logAudit({
    action: 'project.create',
    targetType: 'project',
    targetId: created.id,
    targetLabel: `${name}${project_type === 'client' ? ` · ${client_name}` : ' · Internal'}`,
    notes: cost_ngn ? `Cost: ${cost_ngn.toLocaleString('en-NG')} NGN` : 'Internal product',
  });
  revalidatePath('/admin/projects');
  redirect(`/admin/projects/${created.id}`);
}

// ── Update project basics ────────────────────────────────────────────────
export async function updateProjectAction(
  projectId: string, _prev: ProjectFormState, formData: FormData,
): Promise<ProjectFormState> {
  void _prev;
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const patch = {
    name:         String(formData.get('name')         ?? '').trim(),
    client_name:  String(formData.get('client_name')  ?? '').trim(),
    client_email: String(formData.get('client_email') ?? '').trim() || null,
    client_phone: String(formData.get('client_phone') ?? '').trim() || null,
    description:  String(formData.get('description')  ?? '').trim() || null,
    cost_ngn:     Number(formData.get('cost_ngn') ?? 0),
    started_at:   String(formData.get('started_at') ?? '') || null,
    due_at:       String(formData.get('due_at')     ?? '') || null,
    updated_at:   new Date().toISOString(),
  };

  if (!patch.name || !patch.client_name) {
    return { status: 'error', message: 'Name and client name are required.' };
  }

  const admin = serviceClient();
  const { error } = await admin.from('client_projects').update(patch).eq('id', projectId);
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  await logAudit({
    action: 'project.update',
    targetType: 'project',
    targetId: projectId,
    targetLabel: `${patch.name} · ${patch.client_name}`,
  });
  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${projectId}`);
  return { status: 'success', message: 'Project updated.' };
}

// ── Status change ────────────────────────────────────────────────────────
export async function setProjectStatusAction(
  projectId: string, status: 'in_progress' | 'completed' | 'cancelled',
): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const admin = serviceClient();
  const ended_at = (status === 'completed' || status === 'cancelled') ? new Date().toISOString().slice(0, 10) : null;
  const { data: before } = await admin.from('client_projects').select('status, name, client_name').eq('id', projectId).maybeSingle();
  await admin.from('client_projects').update({ status, ended_at, updated_at: new Date().toISOString() }).eq('id', projectId);
  await logAudit({
    action: 'project.status_change',
    targetType: 'project',
    targetId: projectId,
    targetLabel: before ? `${before.name} · ${before.client_name}` : projectId,
    diff: { status: { before: before?.status ?? null, after: status } },
  });
  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${projectId}`);
}

// ── Add payment ──────────────────────────────────────────────────────────
export async function addProjectPaymentAction(
  projectId: string, _prev: ProjectFormState, formData: FormData,
): Promise<ProjectFormState> {
  void _prev;
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const amount_ngn = Number(formData.get('amount_ngn') ?? 0);
  const received_at = String(formData.get('received_at') ?? new Date().toISOString().slice(0, 10));
  const method    = (String(formData.get('method')    ?? '').trim() || null);
  const reference = (String(formData.get('reference') ?? '').trim() || null);
  const notes     = (String(formData.get('notes')     ?? '').trim() || null);

  if (!amount_ngn || amount_ngn <= 0) return { status: 'error', message: 'Enter an amount.' };

  const admin = serviceClient();
  const { error } = await admin.from('client_project_payments').insert({
    project_id: projectId, amount_ngn, received_at, method, reference, notes,
    recorded_by: gate.userId,
  });
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  await logAudit({
    action: 'project.payment_added',
    targetType: 'project',
    targetId: projectId,
    notes: `${amount_ngn.toLocaleString('en-NG')} NGN${method ? ` · ${method}` : ''}${reference ? ` · ref ${reference}` : ''}`,
  });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/admin/projects');
  return { status: 'success', message: 'Payment recorded.' };
}

// (addProjectExpenseAction removed — expenses now live in
//  company_expenses and are recorded from /admin/finance.)

// ── Add milestone ────────────────────────────────────────────────────────
export async function addMilestoneAction(
  projectId: string, _prev: ProjectFormState, formData: FormData,
): Promise<ProjectFormState> {
  void _prev;
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const title = String(formData.get('title') ?? '').trim();
  const description = (String(formData.get('description') ?? '').trim() || null);
  const due_date    = String(formData.get('due_date') ?? '') || null;
  if (!title) return { status: 'error', message: 'Enter a title.' };

  const admin = serviceClient();
  // sort_order = current max + 10
  const { data: top } = await admin
    .from('client_project_milestones')
    .select('sort_order')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = ((top?.sort_order as number | undefined) ?? 0) + 10;

  const { error } = await admin.from('client_project_milestones').insert({
    project_id: projectId, title, description, due_date, sort_order: nextOrder,
  });
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  await logAudit({
    action: 'project.milestone_add',
    targetType: 'project',
    targetId: projectId,
    notes: title,
  });
  revalidatePath(`/admin/projects/${projectId}`);
  return { status: 'success', message: 'Milestone added.' };
}

// ── Update milestone status ──────────────────────────────────────────────
export async function setMilestoneStatusAction(
  milestoneId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const admin = serviceClient();
  const completed_at = status === 'completed' ? new Date().toISOString() : null;
  const { data: ms } = await admin.from('client_project_milestones').select('project_id, title, status').eq('id', milestoneId).maybeSingle();
  await admin.from('client_project_milestones').update({ status, completed_at }).eq('id', milestoneId);
  await logAudit({
    action: 'project.milestone_status_change',
    targetType: 'project_milestone',
    targetId: milestoneId,
    targetLabel: ms?.title ?? milestoneId,
    diff: { status: { before: ms?.status ?? null, after: status } },
  });
  if (ms?.project_id) revalidatePath(`/admin/projects/${ms.project_id}`);
}

// ── Assign staff ─────────────────────────────────────────────────────────
export async function assignStaffAction(
  projectId: string, _prev: ProjectFormState, formData: FormData,
): Promise<ProjectFormState> {
  void _prev;
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const staff_id = String(formData.get('staff_id') ?? '');
  const role     = (String(formData.get('role')     ?? '').trim() || null);
  if (!staff_id) return { status: 'error', message: 'Pick a staff.' };

  const admin = serviceClient();
  const { error } = await admin.from('client_project_assignments').insert({
    project_id: projectId, staff_id, role,
  });
  if (error) {
    // Duplicate is the common case (UNIQUE constraint).
    if (error.code === '23505') return { status: 'error', message: 'That staff is already on this project.' };
    return { status: 'error', message: `Could not assign: ${error.message}` };
  }

  await logAudit({
    action: 'project.staff_assigned',
    targetType: 'project',
    targetId: projectId,
    notes: `Staff ${staff_id}${role ? ` as ${role}` : ''}`,
  });
  revalidatePath(`/admin/projects/${projectId}`);
  return { status: 'success', message: 'Staff assigned.' };
}

export async function unassignStaffAction(assignmentId: string, projectId: string): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const admin = serviceClient();
  await admin.from('client_project_assignments').delete().eq('id', assignmentId);
  await logAudit({
    action: 'project.staff_unassigned',
    targetType: 'project',
    targetId: projectId,
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

// ── Add project progress report ──────────────────────────────────────────
export async function addProjectReportAction(
  projectId: string, _prev: ProjectFormState, formData: FormData,
): Promise<ProjectFormState> {
  void _prev;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Sign in first.' };

  const content     = String(formData.get('content')     ?? '').trim();
  const report_date = String(formData.get('report_date') ?? new Date().toISOString().slice(0, 10));
  if (!content) return { status: 'error', message: 'Enter the report content.' };

  const admin = serviceClient();
  const { error } = await admin.from('client_project_reports').insert({
    project_id: projectId, report_date, content,
    submitted_by: user.id,
  });
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  await logAudit({
    action: 'project.report_added',
    targetType: 'project',
    targetId: projectId,
    notes: `${content.length} chars`,
  });
  revalidatePath(`/admin/projects/${projectId}`);
  return { status: 'success', message: 'Report added.' };
}

// ── Delete (lightweight) ─────────────────────────────────────────────────
export async function deleteProjectPaymentAction(paymentId: string, projectId: string): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const admin = serviceClient();
  await admin.from('client_project_payments').delete().eq('id', paymentId);
  await logAudit({ action: 'project.payment_delete', targetType: 'project', targetId: projectId });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/admin/finance');
}
