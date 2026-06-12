// Server-only finance reads: company-wide income (project payments) +
// company-wide expenses (overhead + per-project spend). Used by the
// /admin/finance dashboard.

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export interface FinanceIncomeRow {
  id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  amount_ngn: number;
  received_at: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinanceExpenseRow {
  id: string;
  amount_ngn: number;
  spent_at: string;
  category: string | null;
  reason: string;
  notes: string | null;
  project_id: string | null;
  project_name: string | null;
  recorded_by_email: string | null;
  created_at: string;
}

export interface FinanceProjectOption {
  id: string;
  label: string;       // "Project name · Client name" or "Project name (Internal)"
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  monthIncome: number;
  monthExpenses: number;
  monthNet: number;
}

interface PaymentJoinRow {
  id: string;
  amount_ngn: number;
  received_at: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  project_id: string;
  client_projects: { name: string; client_name: string; project_type: string } |
                   { name: string; client_name: string; project_type: string }[] |
                   null;
}

interface ExpenseJoinRow {
  id: string;
  amount_ngn: number;
  spent_at: string;
  category: string | null;
  reason: string;
  notes: string | null;
  project_id: string | null;
  recorded_by: string | null;
  created_at: string;
  client_projects: { name: string; client_name: string } |
                   { name: string; client_name: string }[] |
                   null;
}

function pick<T>(rel: T | T[] | null): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

function monthOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function getFinance(): Promise<{
  income: FinanceIncomeRow[];
  expenses: FinanceExpenseRow[];
  summary: FinanceSummary;
  projectOptions: FinanceProjectOption[];
}> {
  const admin = serviceClient();
  const [payRes, expRes, projRes] = await Promise.all([
    admin
      .from('client_project_payments')
      .select('id, amount_ngn, received_at, method, reference, notes, created_at, project_id, client_projects(name, client_name, project_type)')
      .order('received_at', { ascending: false })
      .order('created_at',  { ascending: false })
      .limit(500),
    admin
      .from('company_expenses')
      .select('id, amount_ngn, spent_at, category, reason, notes, project_id, recorded_by, created_at, client_projects(name, client_name)')
      .order('spent_at',   { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500),
    admin
      .from('client_projects')
      .select('id, name, client_name, project_type, status')
      .order('created_at', { ascending: false }),
  ]);

  const income: FinanceIncomeRow[] = ((payRes.data ?? []) as unknown as PaymentJoinRow[]).map((r) => {
    const proj = pick(r.client_projects);
    return {
      id: r.id,
      project_id: r.project_id,
      project_name: proj?.name ?? '—',
      client_name: proj?.client_name ?? '—',
      amount_ngn: Number(r.amount_ngn),
      received_at: r.received_at,
      method:    r.method,
      reference: r.reference,
      notes:     r.notes,
      created_at: r.created_at,
    };
  });

  // Resolve recorder emails for expenses in one fetch.
  const recordedByIds = Array.from(new Set(
    ((expRes.data ?? []) as ExpenseJoinRow[])
      .map((r) => r.recorded_by)
      .filter((v): v is string => !!v),
  ));
  let emailsById: Record<string, string> = {};
  if (recordedByIds.length > 0) {
    const { data: users } = await admin.from('users').select('id, email').in('id', recordedByIds);
    for (const u of (users ?? []) as { id: string; email: string | null }[]) {
      emailsById[u.id] = u.email ?? '';
    }
  }

  const expenses: FinanceExpenseRow[] = ((expRes.data ?? []) as unknown as ExpenseJoinRow[]).map((r) => {
    const proj = pick(r.client_projects);
    return {
      id: r.id,
      amount_ngn: Number(r.amount_ngn),
      spent_at:   r.spent_at,
      category:   r.category,
      reason:     r.reason,
      notes:      r.notes,
      project_id: r.project_id,
      project_name: proj?.name ?? null,
      recorded_by_email: r.recorded_by ? (emailsById[r.recorded_by] ?? null) : null,
      created_at: r.created_at,
    };
  });

  const totalIncome   = income.reduce((s, r) => s + r.amount_ngn, 0);
  const totalExpenses = expenses.reduce((s, r) => s + r.amount_ngn, 0);

  const thisMonth = monthOf(new Date());
  const monthIncome   = income.filter((r)   => r.received_at.startsWith(thisMonth)).reduce((s, r) => s + r.amount_ngn, 0);
  const monthExpenses = expenses.filter((r) => r.spent_at.startsWith(thisMonth)).reduce((s, r) => s + r.amount_ngn, 0);

  const summary: FinanceSummary = {
    totalIncome,
    totalExpenses,
    net:           totalIncome - totalExpenses,
    monthIncome,
    monthExpenses,
    monthNet:      monthIncome - monthExpenses,
  };

  interface ProjectOptionRow { id: string; name: string; client_name: string; project_type: string }
  const projectOptions: FinanceProjectOption[] =
    ((projRes.data ?? []) as ProjectOptionRow[]).map((p) => ({
      id: p.id,
      label: p.project_type === 'internal'
        ? `${p.name} (internal)`
        : `${p.name} · ${p.client_name}`,
    }));

  return { income, expenses, summary, projectOptions };
}
