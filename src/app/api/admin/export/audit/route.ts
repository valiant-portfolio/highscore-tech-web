// GET /api/admin/export/audit — CSV of the audit log.

import { createClient } from '@/lib/supabase/server';
import { listAudit } from '@/lib/admin/audit-queries';
import { toCsv, csvResponse } from '@/lib/admin/csv';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorised', { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return new Response('Forbidden', { status: 403 });

  const rows = (await listAudit({ limit: 5000 })).map((r) => ({
    ...r,
    diff: r.diff ? JSON.stringify(r.diff) : '',
  }));
  const csv = toCsv(rows, [
    { key: 'created_at',   label: 'Timestamp' },
    { key: 'actor_email',  label: 'Actor' },
    { key: 'action',       label: 'Action' },
    { key: 'target_type',  label: 'Target type' },
    { key: 'target_id',    label: 'Target ID' },
    { key: 'target_label', label: 'Target' },
    { key: 'diff',         label: 'Diff (JSON)' },
    { key: 'notes',        label: 'Notes' },
  ]);
  const ts = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `highscore-tech-audit-${ts}.csv`);
}
