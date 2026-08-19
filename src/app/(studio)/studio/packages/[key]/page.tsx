// One package, explained in full.
//
// The compact cards sell the idea; this page answers the questions someone asks
// before parting with real money — what exactly do I get, how does it run, and
// what is NOT covered. Its own URL so it can also be sent straight to a
// customer who asked "what does the ₦350,000 one include?".

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, Clock, Users, X } from 'lucide-react';
import { PACKAGES, PACKAGE_BY_KEY, ADDONS, formatNgn } from '@/lib/studio/catalog';
import { detailFor } from '@/lib/studio/packages';
import { LinkButton } from '@/components/ui';
import JsonLd from '@/components/seo/JsonLd';
import { serviceSchema } from '@/components/seo/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ key: p.key }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ key: string }> },
): Promise<Metadata> {
  const { key } = await params;
  const pkg = PACKAGE_BY_KEY[key];
  if (!pkg) return {};
  const price = `${formatNgn(pkg.priceNgn)}${pkg.monthly ? ' per month' : ''}`;
  return {
    title: `${pkg.name} — ${price} | Highscore Studio`,
    description: `${pkg.blurb} ${detailFor(pkg.key)?.bestFor ?? ''}`.trim().slice(0, 300),
    alternates: { canonical: `/studio/packages/${pkg.key}` },
  };
}

export default async function PackagePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const pkg = PACKAGE_BY_KEY[key];
  if (!pkg) notFound();
  const d = detailFor(pkg.key);

  const siblings = PACKAGES.filter((p) => p.group === pkg.group && p.key !== pkg.key);

  return (
    <>
      <JsonLd
        data={serviceSchema({
          siteUrl: SITE_URL,
          name: pkg.name,
          description: pkg.blurb,
          path: `/studio/packages/${pkg.key}`,
          priceFrom: pkg.priceNgn,
          currency: 'NGN',
        })}
      />

      <section className="px-4 md:px-8 pt-10 md:pt-14 pb-10">
        <div className="mx-auto max-w-[1100px]">
          <nav aria-label="Breadcrumb" className="text-xs text-fg-subtle">
            <Link href="/studio" className="hover:text-fg">Studio</Link>
            <span className="mx-1.5">/</span>
            <Link href="/studio/pricing" className="hover:text-fg">Pricing</Link>
            <span className="mx-1.5">/</span>
            <span className="text-fg-muted">{pkg.name}</span>
          </nav>

          <div className="mt-5 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
            <div className="min-w-0">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.06] text-fg">
                {pkg.name}
              </h1>
              <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">{pkg.blurb}</p>

              {d && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-subtle">
                      <Users className="h-3.5 w-3.5" /> Best for
                    </p>
                    <p className="mt-1.5 text-sm text-fg leading-relaxed">{d.bestFor}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-subtle">
                      <Clock className="h-3.5 w-3.5" /> Turnaround
                    </p>
                    <p className="mt-1.5 text-sm text-fg leading-relaxed">{d.turnaround}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price + order, sticky so it follows the reading. */}
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-brand/40 bg-surface p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fg-subtle">
                  {pkg.monthly ? 'Monthly' : 'One-off'}
                </p>
                <p className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                  {pkg.from && <span className="text-sm font-semibold text-fg-subtle">from</span>}
                  <span className="font-display text-3xl font-extrabold tabular-nums text-brand">
                    {formatNgn(pkg.priceNgn)}
                  </span>
                  {pkg.monthly && <span className="text-sm font-semibold text-fg-muted">/month</span>}
                </p>
                {pkg.note && (
                  <p className="mt-3 text-xs text-fg-subtle leading-relaxed">{pkg.note}</p>
                )}
                <div className="mt-5">
                  <LinkButton href={`/studio/order?package=${pkg.key}`} fullWidth size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Order this
                  </LinkButton>
                </div>
                <p className="mt-3 text-center text-[11px] text-fg-subtle">
                  Questions first?{' '}
                  <Link href="/studio/contact" className="font-semibold text-brand hover:underline">Talk to us</Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── What you get ─────────────────────────────────────────── */}
      {d && (
        <section className="px-4 md:px-8 py-12 border-t border-border">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-fg">
              What you get
            </h2>
            <p className="mt-2 text-fg-muted">Everything below is included in the price.</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {d.deliverables.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="flex items-start gap-2.5 font-semibold text-fg">
                    <Check className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                    <span>{item.title}</span>
                  </h3>
                  <p className="mt-2 pl-[30px] text-sm text-fg-muted leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────── */}
      {d && (
        <section className="px-4 md:px-8 py-12 border-t border-border">
          <div className="mx-auto max-w-[820px]">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-fg">
              How it works
            </h2>
            <ol className="mt-7 space-y-4">
              {d.process.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint font-display text-sm font-extrabold text-brand">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-fg-muted leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── What's not included ──────────────────────────────────── */}
      {d && d.notIncluded.length > 0 && (
        <section className="px-4 md:px-8 py-12 border-t border-border">
          <div className="mx-auto max-w-[820px] rounded-2xl border border-border bg-surface p-6 md:p-8">
            <h2 className="font-semibold text-fg">What this price does not cover</h2>
            <p className="mt-2 text-sm text-fg-muted">
              So there are no surprises later.
            </p>
            <ul className="mt-4 space-y-2.5">
              {d.notIncluded.map((n) => (
                <li key={n} className="flex gap-2.5 text-sm text-fg-muted leading-relaxed">
                  <X className="h-4 w-4 shrink-0 mt-0.5 text-fg-subtle" aria-hidden="true" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Add broadcast ────────────────────────────────────────── */}
      {pkg.group !== 'brand' && (
        <section className="px-4 md:px-8 py-12 border-t border-border">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="font-display text-xl md:text-2xl font-bold tracking-[-0.02em] text-fg">
              Want it on air too?
            </h2>
            <p className="mt-2 text-sm text-fg-muted">
              Add either of these at the order form and we produce the broadcast master and book
              the station. The airtime itself is your budget, quoted per campaign.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
              {ADDONS.map((a) => (
                <div key={a.key} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold text-fg">{a.name}</h3>
                    <p className="font-display text-xl font-extrabold tabular-nums text-brand whitespace-nowrap">
                      +{formatNgn(a.priceNgn)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-fg-muted leading-relaxed">{a.blurb}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Siblings ─────────────────────────────────────────────── */}
      {siblings.length > 0 && (
        <section className="px-4 md:px-8 py-12 border-t border-border">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="font-display text-lg font-bold text-fg">Other options in this range</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((s) => (
                <Link
                  key={s.key}
                  href={`/studio/packages/${s.key}`}
                  className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/60"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-fg text-sm">{s.name}</span>
                    <span className="font-display font-extrabold tabular-nums text-brand text-sm whitespace-nowrap">
                      {s.from && <span className="text-[10px] text-fg-subtle mr-0.5">from</span>}
                      {formatNgn(s.priceNgn)}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-fg-muted leading-relaxed">{s.blurb}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 md:px-8 py-14 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-fg">
          Ready to order?
        </h2>
        <p className="mt-2 text-fg-muted">The brief takes a few minutes. Payment comes last.</p>
        <div className="mt-6">
          <LinkButton href={`/studio/order?package=${pkg.key}`} size="lg"
            rightIcon={<ArrowRight className="h-4 w-4" />}>
            Order {pkg.name}
          </LinkButton>
        </div>
      </section>
    </>
  );
}
