'use server';

// Finance: record a company expense + admin can also record a project
// payment from the finance page (action delegates to the existing
// project-actions one).

import { revalidatePath } from 'next/cache';
import { serviceClient } from '@/lib/supabase/service';
import { checkSection } from './access';
import { logAudit } from './audit';

// Admins pass; staff pass if granted the 'finance' section.
async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  return checkSection('finance');
}

export type FinanceActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

const INITIAL: FinanceActionState = { status: 'idle' };
void INITIAL;

// ── Add company expense ──────────────────────────────────────────────────
export async function addCompanyExpenseAction(
  _prev: FinanceActionState, formData: FormData,
): Promise<FinanceActionState> {
  void _prev;
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const amount_ngn = Number(formData.get('amount_ngn') ?? 0);
  const spent_at   = String(formData.get('spent_at')   ?? new Date().toISOString().slice(0, 10));
  const category   = (String(formData.get('category') ?? '').trim() || null);
  const reason     = String(formData.get('reason')   ?? '').trim();
  const notes      = (String(formData.get('notes')    ?? '').trim() || null);
  const project_id = (String(formData.get('project_id') ?? '').trim() || null);

  const fieldErrors: Record<string, string> = {};
  if (!amount_ngn || amount_ngn <= 0) fieldErrors.amount_ngn = 'Enter an amount.';
  if (!reason) fieldErrors.reason = 'Reason is required.';
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const admin = serviceClient();
  const { error } = await admin.from('company_expenses').insert({
    amount_ngn, spent_at, category, reason, notes, project_id,
    recorded_by: gate.userId,
  });
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  await logAudit({
    action: 'finance.expense_added',
    targetType: 'company_expense',
    notes: `${amount_ngn.toLocaleString('en-NG')} NGN · ${reason.slice(0, 80)}${project_id ? ' · linked project' : ''}`,
  });

  revalidatePath('/admin/finance');
  if (project_id) revalidatePath(`/admin/projects/${project_id}`);
  return { status: 'success', message: 'Expense recorded.' };
}

// ── Delete company expense ───────────────────────────────────────────────
export async function deleteCompanyExpenseAction(expenseId: string): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const admin = serviceClient();
  await admin.from('company_expenses').delete().eq('id', expenseId);
  await logAudit({
    action: 'finance.expense_delete',
    targetType: 'company_expense',
    targetId: expenseId,
  });
  revalidatePath('/admin/finance');
}

// ── Add income (project payment) from the finance page ───────────────────
export async function addIncomePaymentAction(
  _prev: FinanceActionState, formData: FormData,
): Promise<FinanceActionState> {
  void _prev;
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const project_id = String(formData.get('project_id') ?? '');
  const amount_ngn = Number(formData.get('amount_ngn') ?? 0);
  const received_at = String(formData.get('received_at') ?? new Date().toISOString().slice(0, 10));
  const method    = (String(formData.get('method')    ?? '').trim() || null);
  const reference = (String(formData.get('reference') ?? '').trim() || null);
  const notes     = (String(formData.get('notes')     ?? '').trim() || null);

  const fieldErrors: Record<string, string> = {};
  if (!project_id) fieldErrors.project_id = 'Pick a project.';
  if (!amount_ngn || amount_ngn <= 0) fieldErrors.amount_ngn = 'Enter an amount.';
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const admin = serviceClient();
  const { error } = await admin.from('client_project_payments').insert({
    project_id, amount_ngn, received_at, method, reference, notes,
    recorded_by: gate.userId,
  });
  if (error) return { status: 'error', message: `Could not save: ${error.message}` };

  await logAudit({
    action: 'finance.income_added',
    targetType: 'project',
    targetId: project_id,
    notes: `${amount_ngn.toLocaleString('en-NG')} NGN${method ? ` · ${method}` : ''}${reference ? ` · ref ${reference}` : ''}`,
  });

  revalidatePath('/admin/finance');
  revalidatePath(`/admin/projects/${project_id}`);
  revalidatePath('/admin/projects');
  return { status: 'success', message: 'Income recorded.' };
}

// ── Delete income payment ────────────────────────────────────────────────
export async function deleteIncomePaymentAction(paymentId: string): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const admin = serviceClient();
  const { data: row } = await admin.from('client_project_payments').select('project_id').eq('id', paymentId).maybeSingle();
  await admin.from('client_project_payments').delete().eq('id', paymentId);
  await logAudit({
    action: 'finance.income_delete',
    targetType: 'project_payment',
    targetId: paymentId,
  });
  revalidatePath('/admin/finance');
  if (row?.project_id) revalidatePath(`/admin/projects/${row.project_id}`);
}
