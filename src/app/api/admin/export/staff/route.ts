// GET /api/admin/export/staff — CSV of all staff (active + former).

import { createClient } from '@/lib/supabase/server';
import { listStaffAdminFull } from '@/lib/admin/staff-queries';
import { toCsv, csvResponse } from '@/lib/admin/csv';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorised', { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return new Response('Forbidden', { status: 403 });

  const rows = await listStaffAdminFull();
  const csv = toCsv(rows, [
    { key: 'slug',          label: 'Slug' },
    { key: 'full_name',     label: 'Full name' },
    { key: 'role_title',    label: 'Role' },
    { key: 'department',    label: 'Department' },
    { key: 'work_email',    label: 'Work email' },
    { key: 'salary_ngn',    label: 'Salary (NGN/mo)' },
    { key: 'start_date',    label: 'Start date' },
    { key: 'status',        label: 'Status' },
    { key: 'nda_signed_at', label: 'NDA signed' },
  ]);
  const ts = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `highscore-tech-staff-${ts}.csv`);
}
