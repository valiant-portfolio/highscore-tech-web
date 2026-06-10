import { Download } from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { getLedger } from '@/lib/admin/ledger';
import { formatNgn } from '@/lib/academy/queries';

export default async function AdminLedgerPage() {
  const l = await getLedger();
  const maxAbs = Math.max(
    ...l.months.map((m) => Math.max(m.revenueNgn, m.payrollNgn)),
    1,
  );

  return (
    <>
      <PageHead
        title="Ledger"
        description="Cash collected from Academy enrolments vs monthly payroll across the last six months."
        actions={
          <a
            href="/api/admin/export/ledger"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <Kpi label="Revenue (6mo)"     value={formatNgn(l.totalRevenueNgn)} tone="success" hint={`${l.paymentCount} payments`} />
        <Kpi label="Payroll (6mo)"     value={formatNgn(l.totalPayrollNgn)} tone="danger" />
        <Kpi label="Net (6mo)"         value={formatNgn(l.totalNetNgn)}     tone={l.totalNetNgn >= 0 ? 'success' : 'danger'} />
        <Kpi label="Monthly run rate"  value={formatNgn(l.monthlyPayrollRunRate)} hint="payroll only" />
      </div>

      <AdminCard className="mb-8">
        <div className="p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] font-bold text-fg-subtle mb-4">Monthly breakdown</p>
          <div className="space-y-4">
            {l.months.map((m) => {
              const revPct = (m.revenueNgn / maxAbs) * 100;
              const payPct = (m.payrollNgn / maxAbs) * 100;
              return (
                <div key={m.month}>
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="font-semibold text-fg">{m.monthLabel}</p>
                    <p className={`font-mono tabular text-sm font-semibold ${m.netNgn >= 0 ? 'text-success' : 'text-danger'}`}>
                      Net {formatNgn(m.netNgn)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-fg-muted">Revenue</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-hover overflow-hidden">
                        <div className="h-full rounded-full bg-success" style={{ width: `${revPct}%` }} />
                      </div>
                      <span className="font-mono tabular text-xs text-fg w-28 text-right">
                        {formatNgn(m.revenueNgn)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-fg-muted">Payroll</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-hover overflow-hidden">
                        <div className="h-full rounded-full bg-danger" style={{ width: `${payPct}%` }} />
                      </div>
                      <span className="font-mono tabular text-xs text-fg w-28 text-right">
                        {formatNgn(m.payrollNgn)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <div className="p-5 md:p-6 text-sm text-fg-muted leading-relaxed">
          <p className="text-fg font-semibold mb-2">How this is calculated</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Revenue = sum of <span className="font-mono">payments.status = 'succeeded'</span> grouped by month created.</li>
            <li>Payroll = sum of active staff salaries, counted only for months on/after each staff member's <span className="font-mono">start_date</span>.</li>
            <li>Net = Revenue − Payroll. Doesn't account for non-payroll expenses (rent, infrastructure, etc.).</li>
          </ul>
        </div>
      </AdminCard>
    </>
  );
}
