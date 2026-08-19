// One occasion, one page. Each targets a specific search AND a specific buyer,
// which is why they're separate pages rather than tabs on one.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { OCCASIONS, OCCASION_BY_SLUG } from '@/lib/studio/occasions';
import { PACKAGE_BY_KEY, formatNgn } from '@/lib/studio/catalog';
import { PackageCard } from '@/components/studio/PackageCard';
import { LinkButton } from '@/components/ui';
import JsonLd from '@/components/seo/JsonLd';
import { faqSchema, serviceSchema } from '@/components/seo/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const o = OCCASION_BY_SLUG[slug];
  if (!o) return {};
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: `/studio/songs/${o.slug}` },
    openGraph: { title: o.title, description: o.description, type: 'website' },
  };
}

export default async function OccasionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = OCCASION_BY_SLUG[slug];
  if (!o) notFound();

  const packages = o.packages.map((k) => PACKAGE_BY_KEY[k]).filter(Boolean);
  const cheapest = packages.reduce<number | null>(
    (min, p) => (min == null || p.priceNgn < min ? p.priceNgn : min),
    null,
  );
  // Land people on the order form with their branch already chosen.
  const orderHref = `/studio/order?package=${packages[0]?.key ?? ''}`;

  return (
    <>
      <JsonLd data={serviceSchema({ siteUrl: SITE_URL, name: o.title, description: o.description, path: `/studio/songs/${o.slug}`, priceFrom: cheapest })} />
      <JsonLd data={faqSchema(o.faqs)} />

      {/* ── Intro ────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 pt-12 md:pt-16 pb-10">
        <div className="mx-auto max-w-[820px]">
          <nav aria-label="Breadcrumb" className="text-xs text-fg-subtle">
            <Link href="/studio" className="hover:text-fg">Studio</Link>
            <span className="mx-1.5">/</span>
            <span className="text-fg-muted">{o.name}</span>
          </nav>

          <h1 className="mt-4 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.06] text-fg">
            {o.heading}
          </h1>
          <p className="mt-5 text-base md:text-lg text-fg-muted leading-relaxed">{o.intro}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <LinkButton href={orderHref} size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start your order
            </LinkButton>
            {cheapest != null && (
              <span className="text-sm text-fg-subtle">
                from <span className="font-bold text-brand">{formatNgn(cheapest)}</span>
              </span>
            )}
          </div>

          <ul className="mt-9 grid gap-2.5 sm:grid-cols-2">
            {o.gets.map((g) => (
              <li key={g} className="flex gap-2.5 rounded-xl border border-border bg-surface p-3.5 text-sm text-fg-muted leading-relaxed">
                <Check className="h-4 w-4 shrink-0 mt-0.5 text-success" aria-hidden="true" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Packages ─────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-12 border-t border-border">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-[-0.02em] text-fg">
            What people usually order for this
          </h2>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((p) => <PackageCard key={p.key} pkg={p} />)}
          </div>
          <p className="mt-6 text-sm text-fg-muted">
            Not what you had in mind?{' '}
            <Link href="/studio/pricing" className="font-semibold text-brand hover:underline">
              See the full menu
            </Link>
            {' '}— live TV, radio, outdoor branding, Google ranking and ads.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-12 border-t border-border">
        <div className="mx-auto max-w-[820px]">
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-[-0.02em] text-fg">
            Questions people ask
          </h2>
          <div className="mt-6 space-y-3">
            {o.faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-surface overflow-hidden">
                <summary className="list-none p-4 md:p-5 flex items-start justify-between gap-4 select-none">
                  <span className="font-semibold text-fg">{f.q}</span>
                  <span aria-hidden="true" className="mt-0.5 text-brand text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-4 md:px-5 pb-4 md:pb-5 -mt-1 text-[15px] text-fg-muted leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other occasions ──────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-12 border-t border-border">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-display text-lg font-bold text-fg">We also make songs for</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {OCCASIONS.filter((x) => x.slug !== o.slug).map((x) => (
              <Link
                key={x.slug}
                href={`/studio/songs/${x.slug}`}
                className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-fg-muted hover:border-brand/60 hover:text-fg"
              >
                {x.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-fg">
          Ready when you are.
        </h2>
        <div className="mt-6">
          <LinkButton href={orderHref} size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Start your order
          </LinkButton>
        </div>
      </section>
    </>
  );
}
