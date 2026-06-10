// GET /api/admin/export/contact — CSV of contact form submissions.

import { createClient } from '@/lib/supabase/server';
import { listContactMessagesAdmin } from '@/lib/admin/queries';
import { toCsv, csvResponse } from '@/lib/admin/csv';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorised', { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return new Response('Forbidden', { status: 403 });

  const rows = await listContactMessagesAdmin();
  const csv = toCsv(rows, [
    { key: 'created_at', label: 'Received' },
    { key: 'name',       label: 'Name' },
    { key: 'email',      label: 'Email' },
    { key: 'phone',      label: 'Phone' },
    { key: 'subject',    label: 'Subject' },
    { key: 'status',     label: 'Status' },
    { key: 'message',    label: 'Message' },
  ]);
  const ts = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `highscore-tech-contact-${ts}.csv`);
}
