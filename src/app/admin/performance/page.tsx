// /admin/performance — per-staff metrics at a glance.

import Link from 'next/link';
import { CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { getStaffPerformance } from '@/lib/admin/performance';

function fmtAge(ts: string | null): string {
  if (!ts) return 'never';
  const ms = Date.now() - new Date(ts).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  return `${m}mo ago`;
}

export default async function AdminPerformancePage() {
  const perf = await getStaffPerformance();
  const active = perf.filter((p) => p.status === 'active');

  // Aggregate KPIs
  const signedNda = active.filter((p) => p.ndaSignedAt).length;
  const filedToday = active.filter((p) => p.reportsThisWeek > 0 && p.lastReportAt &&
    new Date(p.lastReportAt).toDateString() === new Date().toDateString()).length;
  const totalReports30 = active.reduce((s, p) => s + p.reportsThisMonth, 0);
  const avgStreak = active.length === 0
    ? 0
    : Math.round(active.reduce((s, p) => s + p.streakDays, 0) / active.length);

  return (
    <>
      <PageHead
        title="Performance"
        description="Per-staff metrics — last activity, report cadence, streak, and contract status."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Active staff"        value={active.length} />
        <Kpi label="Filed today"         value={`${filedToday} / ${active.length}`} tone={filedToday === active.length ? 'success' : 'default'} />
        <Kpi label="Reports (30d)"       value={totalReports30} />
        <Kpi label="Avg streak"          value={`${avgStreak}d`} tone="brand" />
      </div>

      <AdminCard>
        <table className="w-full text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <th className="text-left  px-4 py-3 font-bold">Member</th>
              <th className="text-right px-4 py-3 font-bold">Streak</th>
              <th className="text-right px-4 py-3 font-bold">Reports (7d)</th>
              <th className="text-right px-4 py-3 font-bold">Reports (30d)</th>
              <th className="text-right px-4 py-3 font-bold">Self-filed</th>
              <th className="text-left  px-4 py-3 font-bold">Last report</th>
              <th className="text-left  px-4 py-3 font-bold">Last sign-in</th>
              <th className="text-left  px-4 py-3 font-bold">Contract</th>
              <th className="text-right px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {active.map((p) => (
              <tr key={p.staffId} className="hover:bg-surface-hover/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/staff/${p.staffId}`} className="font-semibold text-fg hover:text-brand">
                    {p.full_name}
                  </Link>
                  <p className="text-xs text-fg-subtle">{p.role_title}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 font-mono tabular font-extrabold ${
                    p.streakDays >= 5 ? 'text-success' : p.streakDays > 0 ? 'text-warning' : 'text-danger'
                  }`}>
                    {p.streakDays >= 3 && <Flame className="h-3.5 w-3.5" />}
                    {p.streakDays}d
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular text-fg">{p.reportsThisWeek}</td>
                <td className="px-4 py-3 text-right font-mono tabular text-fg-muted">{p.reportsThisMonth}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono tabular text-xs ${p.selfFiledPct >= 0.9 ? 'text-success' : p.selfFiledPct >= 0.6 ? 'text-warning' : 'text-danger'}`}>
                    {Math.round(p.selfFiledPct * 100)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-fg-muted text-xs">{fmtAge(p.lastReportAt)}</td>
                <td className="px-4 py-3 text-fg-muted text-xs">{fmtAge(p.lastSignInAt)}</td>
                <td className="px-4 py-3">
                  {p.ndaSignedAt ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold">
                      <CheckCircle2 className="h-3 w-3" /> Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-warning font-semibold">
                      <AlertTriangle className="h-3 w-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/staff/${p.staffId}`} className="text-brand text-sm font-semibold hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {perf.length > active.length && (
          <div className="border-t border-border px-4 py-3 text-xs text-fg-subtle">
            {perf.length - active.length} former staff hidden from this view.
          </div>
        )}
      </AdminCard>

      <AdminCard className="mt-6">
        <div className="p-5 md:p-6 text-sm text-fg-muted leading-relaxed">
          <p className="text-fg font-semibold mb-2">How this is calculated</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b className="text-fg">Streak</b> — consecutive calendar days with at least one report, ending today (one-day grace window before EOD).</li>
            <li><b className="text-fg">Reports (7d / 30d)</b> — reports filed in the trailing 7 / 30 days from `report_date`.</li>
            <li><b className="text-fg">Self-filed</b> — share of reports the staff member submitted themselves (vs admin overrides).</li>
            <li><b className="text-fg">Last sign-in</b> — pulled from Supabase Auth `last_sign_in_at`.</li>
          </ul>
        </div>
      </AdminCard>
    </>
  );
}
