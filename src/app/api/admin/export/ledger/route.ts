// GET /api/admin/export/ledger — CSV of every payment (succeeded + others).

import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { toCsv, csvResponse } from '@/lib/admin/csv';

export const runtime = 'nodejs';

interface PaymentRow {
  id: string;
  created_at: string;
  amount_ngn: number;
  status: string;
  alatpay_reference: string | null;
  enrollment_id: string;
  enrollments: {
    users:   { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
    courses: { title: string }                            | { title: string }[]                          | null;
  } | { users: unknown; courses: unknown }[] | null;
}

function pick<T>(rel: T | T[] | null): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorised', { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return new Response('Forbidden', { status: 403 });

  const admin = serviceClient();
  const { data } = await admin
    .from('payments')
    .select(`
      id, created_at, amount_ngn, status, alatpay_reference, enrollment_id,
      enrollments(users:student_id(email, full_name), courses(title))
    `)
    .order('created_at', { ascending: false });

  const rows = ((data ?? []) as unknown as PaymentRow[]).map((r) => {
    const e = pick(r.enrollments);
    const u = e ? pick((e as { users: unknown }).users as never) : null;
    const c = e ? pick((e as { courses: unknown }).courses as never) : null;
    return {
      created_at:    r.created_at,
      reference:     r.alatpay_reference ?? '',
      enrollment_id: r.enrollment_id,
      student:       (u as { full_name?: string; email: string } | null)?.full_name ?? '',
      email:         (u as { email: string } | null)?.email ?? '',
      course:        (c as { title: string } | null)?.title ?? '',
      amount_ngn:    r.amount_ngn,
      status:        r.status,
    };
  });

  const csv = toCsv(rows, [
    { key: 'created_at',    label: 'Date' },
    { key: 'reference',     label: 'Reference' },
    { key: 'student',       label: 'Student' },
    { key: 'email',         label: 'Email' },
    { key: 'course',        label: 'Course' },
    { key: 'amount_ngn',    label: 'Amount (NGN)' },
    { key: 'status',        label: 'Status' },
    { key: 'enrollment_id', label: 'Enrolment ID' },
  ]);
  const ts = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `highscore-tech-ledger-${ts}.csv`);
}
