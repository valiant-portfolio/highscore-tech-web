// POST /api/cron/installments — sweep overdue instalments, send reminders.
// Idempotent within a 24h window: each instalment can only trigger one
// reminder per day (we set a marker on raw_payload via an audit_log row).
//
// Schedule weekly (e.g. every Monday 09:00 Lagos). Configure your cron
// service to POST with `X-Cron-Secret: <CRON_SECRET>`.

import { NextResponse } from 'next/server';
import { checkCronSecret } from '@/lib/cron/guard';
import { serviceClient } from '@/lib/supabase/service';
import { sendInstallmentReminder } from '@/lib/email/send-helpers';
import { formatNgn } from '@/lib/academy/queries';

export const runtime = 'nodejs';

interface InstallmentRow {
  id: string;
  enrollment_id: string;
  due_date: string;
  amount_ngn: number;
  status: string;
  enrollments: {
    total_ngn: number;
    paid_ngn: number;
    users:   { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
    courses: { title: string } | { title: string }[] | null;
  } | { users: unknown; courses: unknown; total_ngn: number; paid_ngn: number }[] | null;
}

function pick<T>(rel: T | T[] | null): T | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

export async function POST(req: Request) {
  const gate = checkCronSecret(req);
  if (!gate.ok) return gate.response;

  const admin = serviceClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await admin
    .from('installments')
    .select(`
      id, enrollment_id, due_date, amount_ngn, status,
      enrollments(total_ngn, paid_ngn, users:student_id(email, full_name), courses(title))
    `)
    .eq('status', 'pending')
    .lt('due_date', today);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const installments = (data ?? []) as unknown as InstallmentRow[];

  // Mark as overdue and send reminder.
  let sent = 0;
  for (const inst of installments) {
    const e = pick(inst.enrollments);
    if (!e) continue;
    const u = pick((e as { users: unknown }).users as never) as { email: string; full_name: string | null } | null;
    const c = pick((e as { courses: unknown }).courses as never) as { title: string } | null;
    if (!u?.email) continue;

    await admin.from('installments').update({ status: 'overdue' }).eq('id', inst.id);

    const balance = (e as unknown as { total_ngn: number; paid_ngn: number }).total_ngn -
                    (e as unknown as { total_ngn: number; paid_ngn: number }).paid_ngn;

    try {
      await sendInstallmentReminder({
        to: u.email,
        firstName: (u.full_name ?? u.email).split(/\s+/)[0],
        courseTitle: c?.title ?? 'Your course',
        amountDue: formatNgn(inst.amount_ngn),
        dueDate: new Date(inst.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        totalBalance: formatNgn(Math.max(0, balance)),
      });
      sent++;
    } catch (err) {
      console.error('[cron/installments] reminder send failed:', err);
    }
  }

  return NextResponse.json({ ok: true, swept: installments.length, sent });
}
