// GET /api/admin/export/enrollments — CSV of every enrolment.

import { createClient } from '@/lib/supabase/server';
import { listEnrollmentsAdmin } from '@/lib/admin/queries';
import { toCsv, csvResponse } from '@/lib/admin/csv';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorised', { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return new Response('Forbidden', { status: 403 });

  const rows = await listEnrollmentsAdmin();
  const csv = toCsv(rows, [
    { key: 'id',             label: 'Enrollment ID' },
    { key: 'student_name',   label: 'Student' },
    { key: 'student_email',  label: 'Email' },
    { key: 'course_title',   label: 'Course' },
    { key: 'pay_plan',       label: 'Plan' },
    { key: 'total_ngn',      label: 'Total (NGN)' },
    { key: 'paid_ngn',       label: 'Paid (NGN)' },
    { key: 'status',         label: 'Status' },
    { key: 'created_at',     label: 'Created' },
  ]);
  const ts = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `highscore-tech-enrollments-${ts}.csv`);
}
