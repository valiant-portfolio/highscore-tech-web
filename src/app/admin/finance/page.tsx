// /admin/finance — the money dashboard. Every kobo in and out of the
// company, with optional links to the projects each entry relates to.

import Link from 'next/link';
import {
  ArrowDownCircle, ArrowUpCircle, CircleDollarSign, Coins, TrendingDown, TrendingUp,
} from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import {
  AddExpenseForm, AddIncomeForm, DeleteExpenseButton, DeleteIncomeButton,
} from '@/components/admin/FinanceSections';
import { getFinance } from '@/lib/admin/finance-queries';
import { formatNgn } from '@/lib/academy/queries';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminFinancePage() {
  const { income, expenses, summary, projectOptions } = await getFinance();

  return (
    <>
      <PageHead
        title="Finance"
        description="Every payment received and every Naira spent across the company. Each entry can be linked to a project."
      />

      {/* KPI strip — totals + this month */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Total income"   value={formatNgn(summary.totalIncome)}   tone="success" />
        <Kpi label="Total expenses" value={formatNgn(summary.totalExpenses)} tone="default" />
        <Kpi
          label="Net (income − expenses)"
          value={`${summary.net < 0 ? '−' : ''}${formatNgn(Math.abs(summary.net))}`}
          tone={summary.net >= 0 ? 'success' : 'brand'}
        />
        <Kpi
          label="This month — net"
          value={`${summary.monthNet < 0 ? '−' : ''}${formatNgn(Math.abs(summary.monthNet))}`}
          hint={`+${formatNgn(summary.monthIncome)} · −${formatNgn(summary.monthExpenses)}`}
          tone={summary.monthNet >= 0 ? 'success' : 'default'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* INCOME */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <header className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="font-display text-lg md:text-xl font-bold text-fg inline-flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-success" /> Income
              </h2>
              <p className="text-xs text-fg-subtle">{income.length} entries</p>
            </header>
            <p className="mt-1 text-sm text-fg-muted">
              Client payments — always linked to a project so we can trace what was paid for what.
            </p>

            {projectOptions.length === 0 ? (
              <div className="mt-6 rounded-md border border-dashed border-border bg-surface/30 p-6 text-center text-sm text-fg-muted">
                Create a project first before recording income.
                {' '}<Link href="/admin/projects/new" className="text-brand font-semibold hover:underline">Add a project →</Link>
              </div>
            ) : (
              <div className="mt-6">
                <AddIncomeForm projectOptions={projectOptions} />
              </div>
            )}

            <div className="mt-6">
              {income.length === 0 ? (
                <p className="text-sm text-fg-muted text-center py-6">No income recorded yet.</p>
              ) : (
                <ul className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {income.map((r) => (
                    <li key={r.id} className="rounded-md border border-border bg-surface/30 p-3 flex items-start justify-between gap-3 text-sm">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-mono tabular font-bold text-success">+ {formatNgn(r.amount_ngn)}</p>
                        <p className="text-xs text-fg">
                          <Link href={`/admin/projects/${r.project_id}`} className="font-semibold hover:text-brand">
                            {r.project_name}
                          </Link>
                          {' · '}<span className="text-fg-muted">{r.client_name}</span>
                        </p>
                        <p className="text-xs text-fg-subtle">
                          {formatDate(r.received_at)}
                          {r.method && <> · {r.method}</>}
                          {r.reference && <> · {r.reference}</>}
                        </p>
                        {r.notes && <p className="mt-1 text-xs text-fg-muted">{r.notes}</p>}
                      </div>
                      <DeleteIncomeButton paymentId={r.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AdminCard>

        {/* EXPENSES */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <header className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="font-display text-lg md:text-xl font-bold text-fg inline-flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-danger" /> Expenses
              </h2>
              <p className="text-xs text-fg-subtle">{expenses.length} entries</p>
            </header>
            <p className="mt-1 text-sm text-fg-muted">
              Anything the company spends. Link to a project when applicable; otherwise it's general overhead.
            </p>

            <div className="mt-6">
              <AddExpenseForm projectOptions={projectOptions} />
            </div>

            <div className="mt-6">
              {expenses.length === 0 ? (
                <p className="text-sm text-fg-muted text-center py-6">No expenses recorded yet.</p>
              ) : (
                <ul className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {expenses.map((r) => (
                    <li key={r.id} className="rounded-md border border-border bg-surface/30 p-3 flex items-start justify-between gap-3 text-sm">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-mono tabular font-bold text-fg">− {formatNgn(r.amount_ngn)}</p>
                        <p className="text-xs text-fg-subtle">
                          {formatDate(r.spent_at)}
                          {r.category && <> · {r.category}</>}
                          {r.project_id && r.project_name && (
                            <> · <Link href={`/admin/projects/${r.project_id}`} className="text-brand hover:underline">{r.project_name}</Link></>
                          )}
                        </p>
                        <p className="mt-1 text-sm text-fg whitespace-pre-wrap">{r.reason}</p>
                        {r.notes && <p className="mt-1 text-xs text-fg-muted">{r.notes}</p>}
                        {r.recorded_by_email && (
                          <p className="mt-1 text-[10px] text-fg-subtle font-mono">by {r.recorded_by_email}</p>
                        )}
                      </div>
                      <DeleteExpenseButton expenseId={r.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      <p className="mt-6 text-xs text-fg-subtle flex items-center gap-2 flex-wrap">
        <CircleDollarSign className="h-3 w-3" />
        Income comes from client payments on projects · Expenses can be overhead (no project) or specific to a project.
        {summary.net >= 0 ? (
          <span className="inline-flex items-center gap-1 text-success font-semibold ml-1">
            <TrendingUp className="h-3 w-3" /> Company is currently in the green.
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-danger font-semibold ml-1">
            <TrendingDown className="h-3 w-3" /> Company is currently in the red.
          </span>
        )}
      </p>

      <span className="sr-only"><Coins /></span>
    </>
  );
}
