// One order: pay for it, then track it. The URL's reference IS the key to this
// page — it's unguessable, and guests have no account to log into.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, Download, MessageCircle, Send, Mail, AlertCircle } from 'lucide-react';
import { getStudioOrder } from '@/lib/studio/queries';
import { sweepStudioOrder } from '@/lib/studio/actions';
import { AlatPayButton } from '@/components/checkout/AlatPayButton';
import { COUNTRY_NAME } from '@/lib/studio/countries';
import { CONTACT_LINKS } from '@/lib/studio/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your order — Highscore Studio',
  robots: { index: false, follow: false },
};

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-4 w-4" />,
  telegram: <Send className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
};

function prettyDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function StudioOrderStatusPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;

  // Catch payments whose callback never fired before we render.
  await sweepStudioOrder(reference).catch(() => {});

  const order = await getStudioOrder(reference);
  if (!order) notFound();

  const paid = order.payment_status === 'succeeded';

  return (
    <section className="px-4 md:px-8 py-12 md:py-16">
      <div className="mx-auto max-w-[760px]">

        {/* ── Status header ─────────────────────────────────────── */}
        <div className={`rounded-2xl border p-6 md:p-8 ${paid ? 'border-success/40 bg-success/5' : 'border-brand/40 bg-brand/5'}`}>
          <div className="flex items-start gap-4">
            {paid
              ? <CheckCircle2 className="h-8 w-8 shrink-0 text-success" />
              : <Clock className="h-8 w-8 shrink-0 text-brand" />}
            <div className="min-w-0">
              <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-fg">
                {paid ? 'Payment received — we’re on it.' : 'Almost there. One payment to go.'}
              </h1>
              <p className="mt-2 text-fg-muted leading-relaxed">
                {paid
                  ? `Thank you, ${order.customer_name.split(' ')[0]}. Your ${order.package_name.toLowerCase()} is booked in and we’ve started work.`
                  : `Your order is saved. It starts the moment payment lands.`}
              </p>
              <p className="mt-3 font-mono text-xs text-fg-subtle">
                Order reference <span className="font-bold text-fg">{order.reference}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Pay ───────────────────────────────────────────────── */}
        {!paid && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6 md:p-8">
            <h2 className="font-semibold text-fg">Pay for your order</h2>

            <div className="mt-4 flex items-baseline justify-between gap-4 rounded-xl bg-bg-elevated px-4 py-3">
              <span className="text-sm text-fg-muted">{order.package_name}</span>
              <span className="font-display text-2xl font-extrabold tabular-nums text-brand">
                ${Number(order.amount_usd).toFixed(2)}
              </span>
            </div>

            {order.payment_method === 'alatpay' ? (
              <>
                <p className="mt-4 text-sm text-fg-muted leading-relaxed">
                  Paying from Nigeria through <b className="text-fg">ALAT by Wema</b>. You’ll be charged{' '}
                  <b className="text-fg tabular-nums">₦{Number(order.amount_ngn ?? 0).toLocaleString('en-NG')}</b>{' '}
                  {order.usd_ngn_rate && (
                    <span className="text-fg-subtle">(at ₦{Number(order.usd_ngn_rate).toLocaleString('en-NG')} to $1)</span>
                  )}.
                </p>
                <div className="mt-5">
                  <AlatPayButton
                    reference={order.payment_reference ?? order.reference}
                    amountNgn={Number(order.amount_ngn ?? 0)}
                    customerEmail={order.customer_email}
                    customerName={order.customer_name}
                    description={`Highscore Studio — ${order.package_name}`}
                    successHref={`/studio/order/${order.reference}`}
                  >
                    Pay ₦{Number(order.amount_ngn ?? 0).toLocaleString('en-NG')} now
                  </AlatPayButton>
                </div>
                <p className="mt-3 text-xs text-fg-subtle">
                  Keep this page open until the payment finishes. If you close it by mistake, come
                  back to this link — we re-check automatically.
                </p>
              </>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-bg-elevated p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-brand mt-0.5" />
                <div className="text-sm text-fg-muted leading-relaxed">
                  <p className="font-semibold text-fg">Paying from {COUNTRY_NAME[order.country] ?? 'outside Nigeria'}</p>
                  <p className="mt-1">
                    We’ll send you a secure card payment link on your {order.delivery_channel} within a few
                    hours. Your order and brief are already saved — nothing is lost.
                  </p>
                  <p className="mt-2">
                    Need it faster? Message us on{' '}
                    <a href={`mailto:${CONTACT_LINKS.email}`} className="font-semibold text-brand hover:underline">
                      {CONTACT_LINKS.email}
                    </a>{' '}
                    with your reference.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Delivery + invoice ────────────────────────────────── */}
        {paid && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg-subtle">Delivery date</p>
              <p className="mt-2 font-display text-xl font-bold text-fg">{prettyDate(order.delivery_due)}</p>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                We’ll send your finished work to your{' '}
                <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
                  {CHANNEL_ICON[order.delivery_channel]}
                  {order.delivery_channel}
                </span>{' '}
                on or before this date.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg-subtle">Invoice</p>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed flex-1">
                Your paid invoice is ready to download for your records.
              </p>
              <a
                href={`/api/studio/${order.reference}/invoice.pdf`}
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-brand-fg hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Download invoice
              </a>
            </div>
          </div>
        )}

        {/* ── What we're making ─────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 md:p-8">
          <h2 className="font-semibold text-fg">What we’re making</h2>
          <dl className="mt-4 divide-y divide-border text-sm">
            <Row label="Package" value={order.package_name} />
            <Row label="For" value={order.project_type} />
            <Row label="Ordered" value={prettyDate(order.created_at)} />
            {order.needed_by && <Row label="You asked for it by" value={prettyDate(order.needed_by)} />}
            <Row label="Send it to" value={`${order.delivery_channel} · ${order.delivery_handle}`} />
            {Object.entries(order.brief ?? {}).map(([k, v]) => <Row key={k} label={k} value={v} />)}
          </dl>
        </div>

        <p className="mt-8 text-center text-sm text-fg-subtle">
          Questions about this order?{' '}
          <Link href="/contact" className="font-semibold text-brand hover:underline">Talk to us</Link>{' '}
          — quote <span className="font-mono text-fg">{order.reference}</span>.
        </p>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(120px,34%)_1fr] gap-4 py-3">
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="text-fg whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );
}
