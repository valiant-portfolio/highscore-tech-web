// Server-only reads for the client-project module. All queries run
// through the service-role client so they bypass RLS (the pages above
// are admin-gated already).

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export type ProjectStatus = 'in_progress' | 'completed' | 'cancelled';
export type ProjectType   = 'client' | 'internal';

export interface ProjectBase {
  id: string;
  name: string;
  project_type: ProjectType;
  project_url: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  description: string | null;
  cost_ngn: number | null;
  status: ProjectStatus;
  started_at: string | null;
  due_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListRow extends ProjectBase {
  milestones_total: number;
  milestones_completed: number;
  staff_count: number;
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
  milestones: MilestoneRow[];
  assignments: AssignmentRow[];
  reports: ProjectReportRow[];
}

interface RawMs      { project_id: string; status: MilestoneStatus }
interface RawAssign  { project_id: string }

function sumBy<T>(rows: T[], key: keyof T): number {
  let total = 0;
  for (const r of rows) total += Number(r[key] ?? 0);
  return total;
}

export async function listProjects(): Promise<ProjectListRow[]> {
  const admin = serviceClient();
  const [projects, milestones, assigns] = await Promise.all([
    admin.from('client_projects').select('*').order('created_at', { ascending: false }),
    admin.from('client_project_milestones').select('project_id, status'),
    admin.from('client_project_assignments').select('project_id'),
  ]);

  const msTotal:      Record<string, number> = {};
  const msCompleted:  Record<string, number> = {};
  const staffCount:   Record<string, number> = {};

  for (const m of (milestones.data ?? []) as RawMs[]) {
    msTotal[m.project_id] = (msTotal[m.project_id] ?? 0) + 1;
    if (m.status === 'completed') msCompleted[m.project_id] = (msCompleted[m.project_id] ?? 0) + 1;
  }
  for (const a of (assigns.data ?? []) as RawAssign[]) staffCount[a.project_id] = (staffCount[a.project_id] ?? 0) + 1;

  return ((projects.data ?? []) as ProjectBase[]).map((p) => ({
    ...p,
    milestones_total:     msTotal[p.id]     ?? 0,
    milestones_completed: msCompleted[p.id] ?? 0,
    staff_count:          staffCount[p.id]  ?? 0,
  }));
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

  const [mss, assigns, reps] = await Promise.all([
    admin.from('client_project_milestones').select('*').eq('project_id', id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    admin.from('client_project_assignments').select('id, project_id, staff_id, role, assigned_at, staff:staff_id(full_name, role_title)').eq('project_id', id),
    admin.from('client_project_reports').select('*').eq('project_id', id).order('report_date', { ascending: false }).order('created_at', { ascending: false }).limit(60),
  ]);

  const userIds: string[] = [];
  for (const r of (reps.data ?? [])) if (r.submitted_by) userIds.push(r.submitted_by as string);

  const emailsBy = await lookupUserEmails(admin, userIds);

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

  return {
    project: project as ProjectBase,
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
