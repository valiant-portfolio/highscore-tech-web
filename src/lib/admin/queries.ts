// Server-only admin reads. Uses the service-role client to bypass RLS —
// admin pages are role-gated upstream and need the unfiltered view.

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

// ── KPIs for the dashboard ────────────────────────────────────────────────
export interface AdminKpis {
  totalRevenueNgn: number;
  totalCommittedNgn: number;
  activeEnrollments: number;
  pendingEnrollments: number;
  totalCourses: number;
  totalStaff: number;
  unreadContact: number;
  publishedProjects: number;
  monthlyPayroll: number;
}

export async function getKpis(): Promise<AdminKpis> {
  const admin = serviceClient();

  const [
    payments,
    enrollments,
    coursesC,
    staffC,
    contactC,
    portfolioC,
    staffSalaries,
  ] = await Promise.all([
    admin.from('payments').select('amount_ngn, status'),
    admin.from('enrollments').select('total_ngn, status'),
    admin.from('courses').select('id', { count: 'exact', head: true }),
    admin.from('staff').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('portfolio_projects').select('id', { count: 'exact', head: true }).eq('published', true),
    admin.from('staff').select('salary_ngn').eq('status', 'active'),
  ]);

  const totalRevenueNgn = (payments.data ?? [])
    .filter((p) => p.status === 'succeeded')
    .reduce((s, p) => s + (p.amount_ngn ?? 0), 0);
  const totalCommittedNgn = (enrollments.data ?? []).reduce((s, e) => s + (e.total_ngn ?? 0), 0);
  const activeEnrollments  = (enrollments.data ?? []).filter((e) => e.status === 'active').length;
  const pendingEnrollments = (enrollments.data ?? []).filter((e) => e.status === 'pending').length;
  const monthlyPayroll = (staffSalaries.data ?? []).reduce((s, r) => s + (r.salary_ngn ?? 0), 0);

  return {
    totalRevenueNgn,
    totalCommittedNgn,
    activeEnrollments,
    pendingEnrollments,
    totalCourses:        coursesC.count   ?? 0,
    totalStaff:          staffC.count     ?? 0,
    unreadContact:       contactC.count   ?? 0,
    publishedProjects:   portfolioC.count ?? 0,
    monthlyPayroll,
  };
}

// ── Portfolio list ────────────────────────────────────────────────────────
export interface AdminPortfolio {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  category: string | null;
  year: number | null;
  published: boolean;
  sort_order: number;
}

export async function listPortfolioAdmin(): Promise<AdminPortfolio[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('portfolio_projects')
    .select('id, slug, title, client, category, year, published, sort_order')
    .order('sort_order', { ascending: true });
  return (data ?? []) as AdminPortfolio[];
}

export interface AdminPortfolioFull extends AdminPortfolio {
  summary: string;
  body_md: string | null;
  tech_stack: string[];
  cover_image_url: string | null;
  external_url: string | null;
}

export async function getPortfolioAdmin(id: string): Promise<AdminPortfolioFull | null> {
  const admin = serviceClient();
  const { data } = await admin
    .from('portfolio_projects')
    .select('id, slug, title, client, category, year, published, sort_order, summary, body_md, tech_stack, cover_image_url, external_url')
    .eq('id', id)
    .maybeSingle<AdminPortfolioFull>();
  return data;
}

// ── Courses ───────────────────────────────────────────────────────────────
export interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  price_ngn: number;
  duration_weeks: number | null;
  mode: 'online' | 'offline' | 'hybrid';
  level: string | null;
  published: boolean;
  sort_order: number;
}

export async function listCoursesAdmin(): Promise<AdminCourse[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('courses')
    .select('id, slug, title, price_ngn, duration_weeks, mode, level, published, sort_order')
    .order('sort_order', { ascending: true });
  return (data ?? []) as AdminCourse[];
}

export interface AdminCourseFull extends AdminCourse {
  summary: string;
  full_description: string | null;
  outcomes: string[];
  prerequisites: string[];
}

export async function getCourseAdmin(id: string): Promise<AdminCourseFull | null> {
  const admin = serviceClient();
  const { data } = await admin
    .from('courses')
    .select('id, slug, title, price_ngn, duration_weeks, mode, level, published, sort_order, summary, full_description, outcomes, prerequisites')
    .eq('id', id)
    .maybeSingle<AdminCourseFull>();
  return data;
}

// ── Enrollments ───────────────────────────────────────────────────────────
export interface AdminEnrollment {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  pay_plan: 'full' | 'installment';
  total_ngn: number;
  paid_ngn: number;
  created_at: string;
  student_name: string | null;
  student_email: string;
  course_title: string;
  course_slug: string;
}

interface EnrollmentJoin {
  id: string;
  status: AdminEnrollment['status'];
  pay_plan: AdminEnrollment['pay_plan'];
  total_ngn: number;
  paid_ngn: number;
  created_at: string;
  users: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
  courses: { title: string; slug: string } | { title: string; slug: string }[] | null;
}

function pickOne<T>(rel: T | T[] | null): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

export async function listEnrollmentsAdmin(): Promise<AdminEnrollment[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('enrollments')
    .select(`
      id, status, pay_plan, total_ngn, paid_ngn, created_at,
      users:student_id(full_name, email),
      courses(title, slug)
    `)
    .order('created_at', { ascending: false });
  return ((data ?? []) as unknown as EnrollmentJoin[]).map((row) => {
    const u = pickOne(row.users);
    const c = pickOne(row.courses);
    return {
      id: row.id,
      status: row.status,
      pay_plan: row.pay_plan,
      total_ngn: row.total_ngn,
      paid_ngn: row.paid_ngn,
      created_at: row.created_at,
      student_name: u?.full_name ?? null,
      student_email: u?.email ?? '',
      course_title: c?.title ?? 'Course',
      course_slug: c?.slug ?? '',
    };
  });
}

export interface AdminEnrollmentDetail extends AdminEnrollment {
  installments: {
    id: string;
    sort_order: number;
    due_date: string;
    amount_ngn: number;
    status: 'pending' | 'paid' | 'overdue' | 'waived';
    paid_at: string | null;
  }[];
  payments: {
    id: string;
    amount_ngn: number;
    status: 'pending' | 'succeeded' | 'failed' | 'refunded';
    alatpay_reference: string | null;
    created_at: string;
  }[];
}

export async function getEnrollmentAdmin(id: string): Promise<AdminEnrollmentDetail | null> {
  const admin = serviceClient();
  const { data: enrollment } = await admin
    .from('enrollments')
    .select(`
      id, status, pay_plan, total_ngn, paid_ngn, created_at,
      users:student_id(full_name, email),
      courses(title, slug)
    `)
    .eq('id', id)
    .maybeSingle();
  if (!enrollment) return null;
  const row = enrollment as unknown as EnrollmentJoin;
  const u = pickOne(row.users);
  const c = pickOne(row.courses);

  const [{ data: installments }, { data: payments }] = await Promise.all([
    admin.from('installments').select('id, sort_order, due_date, amount_ngn, status, paid_at').eq('enrollment_id', id).order('sort_order'),
    admin.from('payments').select('id, amount_ngn, status, alatpay_reference, created_at').eq('enrollment_id', id).order('created_at', { ascending: false }),
  ]);

  return {
    id: row.id,
    status: row.status,
    pay_plan: row.pay_plan,
    total_ngn: row.total_ngn,
    paid_ngn: row.paid_ngn,
    created_at: row.created_at,
    student_name: u?.full_name ?? null,
    student_email: u?.email ?? '',
    course_title: c?.title ?? 'Course',
    course_slug: c?.slug ?? '',
    installments: (installments ?? []) as AdminEnrollmentDetail['installments'],
    payments: (payments ?? []) as AdminEnrollmentDetail['payments'],
  };
}

// ── Contact messages ──────────────────────────────────────────────────────
export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export async function listContactMessagesAdmin(): Promise<AdminContactMessage[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('contact_messages')
    .select('id, name, email, phone, subject, message, status, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as AdminContactMessage[];
}

// ── Staff ─────────────────────────────────────────────────────────────────
export interface AdminStaff {
  id: string;
  slug: string;
  full_name: string;
  role_title: string;
  department: string | null;
  salary_ngn: number;
  start_date: string | null;
  status: 'active' | 'former';
  has_personal_email: boolean;
}

export async function listStaffAdmin(): Promise<AdminStaff[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('staff')
    .select('id, slug, full_name, role_title, department, salary_ngn, start_date, status, personal_email_hash')
    .order('salary_ngn', { ascending: false });
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    full_name: String(r.full_name),
    role_title: String(r.role_title),
    department: (r.department as string | null) ?? null,
    salary_ngn: Number(r.salary_ngn ?? 0),
    start_date: (r.start_date as string | null) ?? null,
    status: r.status as 'active' | 'former',
    has_personal_email: r.personal_email_hash !== null,
  }));
}
