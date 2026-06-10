// Profile-page reads — enrollments, installments, payments for the
// signed-in student. All routes through the cookie-aware server client so
// RLS scopes results to the caller.

import { createClient } from '@/lib/supabase/server';

export interface ProfileEnrollment {
  id: string;
  course_id: string;
  course_slug: string;
  course_title: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  pay_plan: 'full' | 'installment';
  total_ngn: number;
  paid_ngn: number;
  enrolled_at: string | null;
}

export interface ProfileInstallment {
  id: string;
  enrollment_id: string;
  course_title: string;
  sort_order: number;
  due_date: string;
  amount_ngn: number;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paid_at: string | null;
}

export interface ProfilePayment {
  id: string;
  enrollment_id: string;
  course_title: string;
  amount_ngn: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  alatpay_reference: string | null;
  created_at: string;
}

interface EnrollmentRow {
  id: string;
  course_id: string;
  status: ProfileEnrollment['status'];
  pay_plan: ProfileEnrollment['pay_plan'];
  total_ngn: number;
  paid_ngn: number;
  enrolled_at: string | null;
  courses: { slug: string; title: string } | null;
}

export async function listEnrollments(studentId: string): Promise<ProfileEnrollment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id, course_id, status, pay_plan, total_ngn, paid_ngn, enrolled_at,
      courses(slug, title)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('listEnrollments failed:', error.message);
    return [];
  }
  return ((data ?? []) as unknown as EnrollmentRow[]).map((row) => ({
    id: row.id,
    course_id: row.course_id,
    course_slug: row.courses?.slug ?? '',
    course_title: row.courses?.title ?? 'Course',
    status: row.status,
    pay_plan: row.pay_plan,
    total_ngn: row.total_ngn,
    paid_ngn: row.paid_ngn,
    enrolled_at: row.enrolled_at,
  }));
}

interface InstallmentRow {
  id: string;
  enrollment_id: string;
  sort_order: number;
  due_date: string;
  amount_ngn: number;
  status: ProfileInstallment['status'];
  paid_at: string | null;
  enrollments: { courses: { title: string } | null } | null;
}

export async function listInstallments(studentId: string): Promise<ProfileInstallment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('installments')
    .select(`
      id, enrollment_id, sort_order, due_date, amount_ngn, status, paid_at,
      enrollments!inner(student_id, courses(title))
    `)
    .eq('enrollments.student_id', studentId)
    .order('due_date', { ascending: true });
  if (error) {
    console.error('listInstallments failed:', error.message);
    return [];
  }
  return ((data ?? []) as unknown as InstallmentRow[]).map((row) => ({
    id: row.id,
    enrollment_id: row.enrollment_id,
    course_title: row.enrollments?.courses?.title ?? 'Course',
    sort_order: row.sort_order,
    due_date: row.due_date,
    amount_ngn: row.amount_ngn,
    status: row.status,
    paid_at: row.paid_at,
  }));
}

interface PaymentRow {
  id: string;
  enrollment_id: string;
  amount_ngn: number;
  status: ProfilePayment['status'];
  alatpay_reference: string | null;
  created_at: string;
  enrollments: { courses: { title: string } | null } | null;
}

export async function listPayments(studentId: string): Promise<ProfilePayment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id, enrollment_id, amount_ngn, status, alatpay_reference, created_at,
      enrollments!inner(student_id, courses(title))
    `)
    .eq('enrollments.student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('listPayments failed:', error.message);
    return [];
  }
  return ((data ?? []) as unknown as PaymentRow[]).map((row) => ({
    id: row.id,
    enrollment_id: row.enrollment_id,
    course_title: row.enrollments?.courses?.title ?? 'Course',
    amount_ngn: row.amount_ngn,
    status: row.status,
    alatpay_reference: row.alatpay_reference,
    created_at: row.created_at,
  }));
}
