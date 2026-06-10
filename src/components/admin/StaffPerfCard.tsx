// Performance summary card embedded in /admin/staff/[id].

import { Flame, CalendarDays, Activity, ClipboardCheck } from 'lucide-react';
import { AdminCard } from './AdminPage';
import type { StaffPerf } from '@/lib/admin/performance';

function fmtAge(ts: string | null): string {
  if (!ts) return 'never';
  const ms = Date.now() - new Date(ts).getTime();
  const h = Math.floor(ms / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function StaffPerfCard({ perf }: { perf: StaffPerf }) {
  return (
    <AdminCard>
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg md:text-xl font-bold text-fg">Performance</h2>
          <span className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-xs font-bold ${
            perf.streakDays >= 5 ? 'bg-success/15 text-success' :
            perf.streakDays > 0  ? 'bg-warning/15 text-warning' :
                                   'bg-danger/15 text-danger'
          }`}>
            {perf.streakDays >= 3 && <Flame className="h-3 w-3" />}
            {perf.streakDays} day streak
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="p-3 rounded-md border border-border bg-surface/40">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Reports (7d)</p>
            <p className="mt-1 font-mono tabular text-2xl font-extrabold text-fg">{perf.reportsThisWeek}</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-surface/40">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Reports (30d)</p>
            <p className="mt-1 font-mono tabular text-2xl font-extrabold text-fg">{perf.reportsThisMonth}</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-surface/40">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Self-filed</p>
            <p className="mt-1 font-mono tabular text-2xl font-extrabold text-fg">
              {Math.round(perf.selfFiledPct * 100)}%
            </p>
          </div>
          <div className="p-3 rounded-md border border-border bg-surface/40">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Days employed</p>
            <p className="mt-1 font-mono tabular text-2xl font-extrabold text-fg">
              {perf.daysEmployed ?? '—'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-3 text-xs text-fg-muted">
          <p className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-brand" />
            Last sign-in: <span className="text-fg font-semibold">{fmtAge(perf.lastSignInAt)}</span>
          </p>
          <p className="flex items-center gap-2">
            <ClipboardCheck className="h-3.5 w-3.5 text-brand" />
            Last report: <span className="text-fg font-semibold">{fmtAge(perf.lastReportAt)}</span>
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-brand" />
            Total reports: <span className="text-fg font-semibold">{perf.reportCount}</span>
          </p>
        </div>
      </div>
    </AdminCard>
  );
}
