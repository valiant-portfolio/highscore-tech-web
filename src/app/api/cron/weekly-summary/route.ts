// POST /api/cron/weekly-summary — send the weekly CEO performance email
// every Friday at EOD. Schedules: pick whatever your cron host supports.

import { NextResponse } from 'next/server';
import { checkCronSecret } from '@/lib/cron/guard';
import { serviceClient } from '@/lib/supabase/service';
import { sendWeeklyCeoSummary } from '@/lib/email/send-helpers';
import { getStaffPerformance } from '@/lib/admin/performance';
import { formatNgn } from '@/lib/academy/queries';

export const runtime = 'nodejs';

function weekWindow(): { from: Date; to: Date; label: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 7);
  const label = `${from.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${to.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  return { from, to, label };
}

export async function POST(req: Request) {
  const gate = checkCronSecret(req);
  if (!gate.ok) return gate.response;

  const admin = serviceClient();
  const { from, label } = weekWindow();
  const fromIso = from.toISOString();

  const [paymentsRes, enrollRes, contactRes, perfAll] = await Promise.all([
    admin.from('payments').select('amount_ngn').eq('status', 'succeeded').gte('created_at', fromIso),
    admin.from('enrollments').select('id').gte('created_at', fromIso),
    admin.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    getStaffPerformance(),
  ]);

  const newRevenue = (paymentsRes.data ?? []).reduce((s, r) => s + (r.amount_ngn ?? 0), 0);
  const activeStaff = perfAll.filter((p) => p.status === 'active');

  // Find the CEO email — first admin in users table.
  const { data: ceo } = await admin.from('users').select('email, full_name').eq('role', 'admin').limit(1).maybeSingle();
  if (!ceo?.email) {
    return NextResponse.json({ ok: false, error: 'No admin user to send to.' });
  }

  await sendWeeklyCeoSummary({
    to: ceo.email,
    weekRange: label,
    activeStaff: activeStaff.length,
    newRevenueNgn: formatNgn(newRevenue),
    enrolledThisWeek: enrollRes.data?.length ?? 0,
    unreadContact: contactRes.count ?? 0,
    perStaff: activeStaff.map((p) => ({
      name: p.full_name,
      role: p.role_title,
      streak: p.streakDays,
      reportsWeek: p.reportsThisWeek,
      reportsMonth: p.reportsThisMonth,
      selfFiledPct: p.selfFiledPct,
      ndaSigned: !!p.ndaSignedAt,
    })),
  });

  return NextResponse.json({ ok: true, to: ceo.email, weekRange: label });
}
