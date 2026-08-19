// Studio order queue. Everything needed to actually start the work: the brief,
// the deadline we committed to, and where the finished piece has to be sent.

import { Music, Download } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { listStudioOrders } from '@/lib/studio/queries';
import { PROJECT_TYPE_BY_KEY } from '@/lib/studio/catalog';
import { COUNTRY_NAME } from '@/lib/studio/countries';

export const dynamic = 'force-dynamic';

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
  awaiting_payment: { bg: 'bg-warning/15',     fg: 'text-warning',  label: 'Awaiting payment' },
  paid:             { bg: 'bg-success/15',     fg: 'text-success',  label: 'Paid — to start' },
  in_progress:      { bg: 'bg-brand-tint',     fg: 'text-brand',    label: 'In progress' },
  delivered:        { bg: 'bg-surface-hover',  fg: 'text-fg-muted', label: 'Delivered' },
  cancelled:        { bg: 'bg-danger/15',      fg: 'text-danger',   label: 'Cancelled' },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/** Days until the promised delivery — negative means we are late. */
function daysLeft(due: string | null): number | null {
  if (!due) return null;
  const ms = new Date(due).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export default async function AdminStudioPage() {
  const orders = await listStudioOrders();
  const paid = orders.filter((o) => o.payment_status === 'succeeded');
  const revenueUsd = paid.reduce((s, o) => s + Number(o.amount_usd), 0);
  const toStart = orders.filter((o) => o.status === 'paid').length;

  return (
    <>
      <PageHead
        title="Studio orders"
        description="Every order customers have placed, with the brief they filled in and the date we promised."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Paid" value={String(paid.length)} tone="text-success" />
        <Stat label="To start" value={String(toStart)} tone="text-warning" />
        <Stat label="Revenue" value={`$${revenueUsd.toFixed(2)}`} tone="text-success" />
      </div>

      {orders.length === 0 ? (
        <AdminCard>
          <div className="p-12 text-center">
            <Music className="h-10 w-10 mx-auto text-fg-subtle" />
            <h3 className="mt-4 font-display text-lg font-bold text-fg">No orders yet.</h3>
            <p className="mt-1.5 text-sm text-fg-muted">
              They’ll appear here the moment someone orders from the Studio.
            </p>
          </div>
        </AdminCard>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const pill = STATUS_PILL[o.status] ?? STATUS_PILL.awaiting_payment;
            const left = daysLeft(o.delivery_due);
            const late = left != null && left < 0 && o.status !== 'delivered';
            return (
              <AdminCard key={o.id}>
                <div className="p-5">
                  {/* header row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-fg">{o.package_name}</h3>
                        <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-semibold ${pill.bg} ${pill.fg}`}>
                          {pill.label}
                        </span>
                        <span className="inline-flex h-6 items-center px-2 rounded-md bg-surface-hover text-[11px] font-semibold text-fg-muted">
                          {PROJECT_TYPE_BY_KEY[o.project_type]?.label ?? o.project_type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-fg-muted">
                        {o.customer_name} · {o.customer_email} · {COUNTRY_NAME[o.country] ?? o.country}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-fg-subtle">{o.reference}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-2xl font-extrabold tabular text-fg">
                        ${Number(o.amount_usd).toFixed(2)}
                      </p>
                      {o.amount_ngn != null && (
                        <p className="text-xs text-fg-subtle tabular">
                          ₦{Number(o.amount_ngn).toLocaleString('en-NG')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* delivery bar */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-surface-hover/50 px-4 py-3 text-sm">
                    <span>
                      <span className="text-fg-subtle">Deliver by </span>
                      <span className={`font-semibold ${late ? 'text-danger' : 'text-fg'}`}>{fmt(o.delivery_due)}</span>
                      {left != null && o.status !== 'delivered' && (
                        <span className={`ml-1.5 text-xs font-semibold ${late ? 'text-danger' : 'text-fg-muted'}`}>
                          ({late ? `${Math.abs(left)}d late` : `${left}d left`})
                        </span>
                      )}
                    </span>
                    <span>
                      <span className="text-fg-subtle">Send via </span>
                      <span className="font-semibold text-fg">{o.delivery_channel}</span>
                      <span className="text-fg-muted"> — {o.delivery_handle}</span>
                    </span>
                    <span className="text-fg-subtle">Ordered {fmt(o.created_at)}</span>
                    {o.payment_status === 'succeeded' && (
                      <a
                        href={`/api/studio/${o.reference}/invoice.pdf`}
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" /> Invoice
                      </a>
                    )}
                  </div>

                  {/* the brief */}
                  {Object.keys(o.brief ?? {}).length > 0 && (
                    <details className="mt-3 group">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-fg-muted hover:text-fg select-none">
                        <span className="group-open:hidden">Show the brief ▸</span>
                        <span className="hidden group-open:inline">Hide the brief ▾</span>
                      </summary>
                      <dl className="mt-3 divide-y divide-border rounded-lg border border-border">
                        {Object.entries(o.brief).map(([k, v]) => (
                          <div key={k} className="grid grid-cols-[minmax(130px,30%)_1fr] gap-4 px-4 py-2.5 text-sm">
                            <dt className="text-fg-subtle">{k}</dt>
                            <dd className="text-fg whitespace-pre-wrap break-words">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </>
  );
}

function Stat({ label, value, tone = 'text-fg' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-extrabold tabular ${tone}`}>{value}</p>
    </div>
  );
}
