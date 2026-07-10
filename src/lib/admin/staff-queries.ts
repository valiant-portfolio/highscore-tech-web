// Admin reads against staff + staff_reports. Service-role; role-gated upstream.

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export interface AdminStaffFull {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  role_title: string;
  department: string | null;
  salary_ngn: number;
  start_date: string | null;
  status: 'active' | 'former';
  work_email: string | null;
  personal_email: string | null;
  photo_url: string | null;
  photo_public_url: string | null;
  signature_url: string | null;
  nda_signed_at: string | null;
  reports_to_id: string | null;
  reports_to_name: string | null;
  // Payroll — set by the staff in their Settings tab, locked to 90-day
  // edit cycle. Admin sees the full account number (needed for transfer).
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  bank_updated_at: string | null;
}

interface Row {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  role_title: string;
  department: string | null;
  salary_ngn: number;
  start_date: string | null;
  status: 'active' | 'former';
  work_email: string | null;
  personal_email: string | null;
  photo_url: string | null;
  signature_url: string | null;
  nda_signed_at: string | null;
  reports_to: string | null;
  reports_to_rel: { full_name: string } | { full_name: string }[] | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  bank_updated_at: string | null;
}

const COLS =
  'id, user_id, slug, full_name, role_title, department, salary_ngn, start_date, status, work_email, personal_email, photo_url, signature_url, nda_signed_at, reports_to, reports_to_rel:reports_to(full_name), bank_name, bank_account_number, bank_account_name, bank_updated_at';

function publicUrlFor(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
  return `${base}/storage/v1/object/public/staff-photos/${path}`;
}

function pick<T>(rel: T | T[] | null): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

function shape(row: Row): AdminStaffFull {
  const reportsRel = pick(row.reports_to_rel);
  return {
    id: row.id,
    user_id: row.user_id,
    slug: row.slug,
    full_name: row.full_name,
    role_title: row.role_title,
    department: row.department,
    salary_ngn: row.salary_ngn,
    start_date: row.start_date,
    status: row.status,
    work_email: row.work_email,
    personal_email: row.personal_email,
    photo_url: row.photo_url,
    photo_public_url: publicUrlFor(row.photo_url),
    signature_url: row.signature_url,
    nda_signed_at: row.nda_signed_at,
    reports_to_id: row.reports_to,
    reports_to_name: reportsRel?.full_name ?? null,
    bank_name: row.bank_name,
    bank_account_number: row.bank_account_number,
    bank_account_name: row.bank_account_name,
    bank_updated_at: row.bank_updated_at,
  };
}

export async function listStaffAdminFull(): Promise<AdminStaffFull[]> {
  const admin = serviceClient();
  const { data } = await admin.from('staff').select(COLS).order('salary_ngn', { ascending: false });
  return ((data ?? []) as unknown as Row[]).map(shape);
}

export async function getStaffAdminFull(id: string): Promise<AdminStaffFull | null> {
  const admin = serviceClient();
  const { data } = await admin.from('staff').select(COLS).eq('id', id).maybeSingle();
  if (!data) return null;
  return shape(data as unknown as Row);
}

// The admin sections currently granted to a staff member's linked account, plus
// whether that account is itself a full admin (in which case sections are moot).
export async function getUserAccess(
  userId: string | null,
): Promise<{ sections: string[]; isAdmin: boolean }> {
  if (!userId) return { sections: [], isAdmin: false };
  const admin = serviceClient();
  const { data } = await admin
    .from('users')
    .select('role, admin_sections')
    .eq('id', userId)
    .maybeSingle();
  return {
    sections: (data?.admin_sections as string[] | null) ?? [],
    isAdmin: data?.role === 'admin',
  };
}

// ── Reports ──────────────────────────────────────────────────────────────
export interface StaffReport {
  id: string;
  staff_id: string;
  kind: 'sod' | 'eod' | 'general' | 'team_eod';
  report_date: string;
  content: string;
  is_admin_override: boolean;
  submitted_by: string | null;
  created_at: string;
}

export async function listReportsForStaff(staffId: string, limit = 50): Promise<StaffReport[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('staff_reports')
    .select('id, staff_id, kind, report_date, content, is_admin_override, submitted_by, created_at')
    .eq('staff_id', staffId)
    .order('report_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as StaffReport[];
}
