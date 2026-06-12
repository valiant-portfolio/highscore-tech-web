// Server-only reads for the client-project module. All queries run
// through the service-role client so they bypass RLS (the pages above
// are admin-gated already).

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export type ProjectStatus = 'in_progress' | 'completed' | 'cancelled';

export interface ProjectBase {
  id: string;
  name: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  description: string | null;
  cost_ngn: number;
  status: ProjectStatus;
  started_at: string | null;
  due_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListRow extends ProjectBase {
  received_ngn: number;
  spent_ngn: number;
  balance_owed_ngn: number;          // cost − received
  net_ngn: number;                   // received − spent
  milestones_total: number;
  milestones_completed: number;
  staff_count: number;
}

export interface PaymentRow {
  id: string;
  project_id: string;
  amount_ngn: number;
  received_at: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
  recorded_by: string | null;
  recorded_by_email: string | null;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  project_id: string;
  amount_ngn: number;
  spent_at: string;
  category: string | null;
  reason: string;
  notes: string | null;
  recorded_by: string | null;
  recorded_by_email: string | null;
  created_at: string;
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface MilestoneRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface AssignmentRow {
  id: string;
  project_id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  role: string | null;
  assigned_at: string;
}

export interface ProjectReportRow {
  id: string;
  project_id: string;
  report_date: string;
  content: string;
  submitted_by: string | null;
  submitted_by_email: string | null;
  created_at: string;
}

export interface ProjectDetail {
  project: ProjectBase;
  metrics: {
    received_ngn: number;
    spent_ngn: number;
    balance_owed_ngn: number;
    net_ngn: number;
  };
  payments: PaymentRow[];
  expenses: ExpenseRow[];
  milestones: MilestoneRow[];
  assignments: AssignmentRow[];
  reports: ProjectReportRow[];
}

interface RawPayment { project_id: string; amount_ngn: number }
interface RawExpense { project_id: string; amount_ngn: number }
interface RawMs      { project_id: string; status: MilestoneStatus }
interface RawAssign  { project_id: string }

function sumBy<T>(rows: T[], key: keyof T): number {
  let total = 0;
  for (const r of rows) total += Number(r[key] ?? 0);
  return total;
}

export async function listProjects(): Promise<ProjectListRow[]> {
  const admin = serviceClient();
  const [projects, payments, expenses, milestones, assigns] = await Promise.all([
    admin.from('client_projects').select('*').order('created_at', { ascending: false }),
    admin.from('client_project_payments').select('project_id, amount_ngn'),
    admin.from('client_project_expenses').select('project_id, amount_ngn'),
    admin.from('client_project_milestones').select('project_id, status'),
    admin.from('client_project_assignments').select('project_id'),
  ]);

  const paymentsBy:   Record<string, number> = {};
  const expensesBy:   Record<string, number> = {};
  const msTotal:      Record<string, number> = {};
  const msCompleted:  Record<string, number> = {};
  const staffCount:   Record<string, number> = {};

  for (const p of (payments.data ?? []) as RawPayment[])  paymentsBy[p.project_id] = (paymentsBy[p.project_id] ?? 0) + Number(p.amount_ngn);
  for (const e of (expenses.data ?? []) as RawExpense[])  expensesBy[e.project_id] = (expensesBy[e.project_id] ?? 0) + Number(e.amount_ngn);
  for (const m of (milestones.data ?? []) as RawMs[]) {
    msTotal[m.project_id] = (msTotal[m.project_id] ?? 0) + 1;
    if (m.status === 'completed') msCompleted[m.project_id] = (msCompleted[m.project_id] ?? 0) + 1;
  }
  for (const a of (assigns.data ?? []) as RawAssign[]) staffCount[a.project_id] = (staffCount[a.project_id] ?? 0) + 1;

  return ((projects.data ?? []) as ProjectBase[]).map((p) => {
    const received = paymentsBy[p.id] ?? 0;
    const spent    = expensesBy[p.id] ?? 0;
    return {
      ...p,
      received_ngn: received,
      spent_ngn:    spent,
      balance_owed_ngn: Math.max(0, Number(p.cost_ngn) - received),
      net_ngn:          received - spent,
      milestones_total:     msTotal[p.id]     ?? 0,
      milestones_completed: msCompleted[p.id] ?? 0,
      staff_count:          staffCount[p.id]  ?? 0,
    };
  });
}

interface UserMini { id: string; email: string | null }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function lookupUserEmails(admin: any, ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const unique = Array.from(new Set(ids));
  const { data } = await admin.from('users').select('id, email').in('id', unique);
  const map: Record<string, string> = {};
  for (const u of ((data ?? []) as UserMini[])) map[u.id] = u.email ?? '';
  return map;
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const admin = serviceClient();
  const { data: project } = await admin
    .from('client_projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!project) return null;

  const [pays, exps, mss, assigns, reps] = await Promise.all([
    admin.from('client_project_payments').select('*').eq('project_id', id).order('received_at', { ascending: false }),
    admin.from('client_project_expenses').select('*').eq('project_id', id).order('spent_at',    { ascending: false }),
    admin.from('client_project_milestones').select('*').eq('project_id', id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    admin.from('client_project_assignments').select('id, project_id, staff_id, role, assigned_at, staff:staff_id(full_name, role_title)').eq('project_id', id),
    admin.from('client_project_reports').select('*').eq('project_id', id).order('report_date', { ascending: false }).order('created_at', { ascending: false }).limit(60),
  ]);

  const userIds: string[] = [];
  for (const p of (pays.data ?? [])) if (p.recorded_by) userIds.push(p.recorded_by as string);
  for (const e of (exps.data ?? [])) if (e.recorded_by) userIds.push(e.recorded_by as string);
  for (const r of (reps.data ?? [])) if (r.submitted_by) userIds.push(r.submitted_by as string);

  const emailsBy = await lookupUserEmails(admin, userIds);

  const payments: PaymentRow[] = (pays.data ?? []).map((r) => ({
    id: r.id, project_id: r.project_id,
    amount_ngn: Number(r.amount_ngn),
    received_at: r.received_at,
    method: r.method, reference: r.reference, notes: r.notes,
    recorded_by: r.recorded_by ?? null,
    recorded_by_email: r.recorded_by ? (emailsBy[r.recorded_by] ?? null) : null,
    created_at: r.created_at,
  }));
  const expenses: ExpenseRow[] = (exps.data ?? []).map((r) => ({
    id: r.id, project_id: r.project_id,
    amount_ngn: Number(r.amount_ngn),
    spent_at: r.spent_at,
    category: r.category, reason: r.reason, notes: r.notes,
    recorded_by: r.recorded_by ?? null,
    recorded_by_email: r.recorded_by ? (emailsBy[r.recorded_by] ?? null) : null,
    created_at: r.created_at,
  }));
  const milestones: MilestoneRow[] = (mss.data ?? []).map((r) => ({
    id: r.id, project_id: r.project_id,
    title: r.title, description: r.description,
    status: r.status as MilestoneStatus, due_date: r.due_date,
    completed_at: r.completed_at, sort_order: r.sort_order,
    created_at: r.created_at,
  }));

  type AssignmentJoin = {
    id: string; project_id: string; staff_id: string; role: string | null; assigned_at: string;
    staff: { full_name: string; role_title: string } | { full_name: string; role_title: string }[] | null;
  };
  const assignments: AssignmentRow[] = ((assigns.data ?? []) as unknown as AssignmentJoin[]).map((r) => {
    const s = Array.isArray(r.staff) ? r.staff[0] : r.staff;
    return {
      id: r.id, project_id: r.project_id, staff_id: r.staff_id,
      staff_name: s?.full_name ?? '—',
      staff_role: s?.role_title ?? '',
      role: r.role, assigned_at: r.assigned_at,
    };
  });
  const reports: ProjectReportRow[] = (reps.data ?? []).map((r) => ({
    id: r.id, project_id: r.project_id, report_date: r.report_date,
    content: r.content,
    submitted_by: r.submitted_by ?? null,
    submitted_by_email: r.submitted_by ? (emailsBy[r.submitted_by] ?? null) : null,
    created_at: r.created_at,
  }));

  const received = sumBy(payments, 'amount_ngn');
  const spent    = sumBy(expenses, 'amount_ngn');

  return {
    project: project as ProjectBase,
    metrics: {
      received_ngn: received,
      spent_ngn:    spent,
      balance_owed_ngn: Math.max(0, Number(project.cost_ngn) - received),
      net_ngn: received - spent,
    },
    payments,
    expenses,
    milestones,
    assignments,
    reports,
  };
}

export async function listAssignableStaff(): Promise<{ id: string; full_name: string; role_title: string }[]> {
  const admin = serviceClient();
  const { data } = await admin.from('staff').select('id, full_name, role_title').eq('status', 'active').order('full_name', { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id as string,
    full_name: r.full_name as string,
    role_title: r.role_title as string,
  }));
}
