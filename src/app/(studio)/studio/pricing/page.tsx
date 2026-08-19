// The full Studio menu — every package, itemised, from the ₦25,000 personal
// song to always-on brand retainers.

import type { Metadata } from 'next';
import { ArrowRight, Download } from 'lucide-react';
import { PACKAGES, ADDONS, formatNgn } from '@/lib/studio/catalog';
import { PackageCard } from '@/components/studio/PackageCard';
import { LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Studio pricing — songs from ₦25,000, business jingles from ₦120,000',
  description:
    'Highscore Studio pricing: personal songs from ₦25,000, business jingles from ₦120,000, AI advert video from ₦220,000, filmed on location from ₦350,000, plus radio and live TV, Google ranking and ads management.',
  alternates: { canonical: '/studio/pricing' },
};

const GROUPS = [
  {
    id: 'personal',
    eyebrow: 'Personal & occasions',
    title: 'For the person, or the day.',
    body: 'Birthdays, weddings, anniversaries, church programmes. Priced so anyone can order one.',
  },
  {
    id: 'business',
    eyebrow: 'Business & brands',
    title: 'For the business that wants to be heard.',
    body: 'Commercial work: full usage rights, scripting written around your offer and your prices, and masters built for wherever the advert runs.',
  },
  {
    id: 'brand',
    eyebrow: 'Ongoing',
    title: 'Stay on their screens every month.',
    body: 'Retainers, for brands that would rather be everywhere all year than appear once.',
  },
] as const;

export default function StudioPricingPage() {
  return (
    <>
      {/* No hero. Someone on the pricing page came to see prices, so the first
          thing on screen is the first package, not a headline about them. */}
      <section className="px-4 md:px-8 pt-10 md:pt-12 pb-2">
        <div className="mx-auto max-w-[1180px] flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-fg">
            Pricing
          </h1>
          {/* Sales document, not a page dump: the same catalogue rendered as a
              PDF you can send to a client, or they can keep. */}
          <a
            href="/api/studio/rate-card.pdf"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-bold text-fg transition-colors hover:border-brand/60 hover:bg-surface-hover"
          >
            <Download className="h-4 w-4" />
            Download as PDF
          </a>
        </div>
      </section>

      {GROUPS.map((g, i) => {
        const items = PACKAGES.filter((p) => p.group === g.id);
        return (
          <section
            key={g.id}
            className={`px-4 md:px-8 py-10 md:py-12 ${i > 0 ? 'border-t border-border' : ''}`}
          >
            <div className="mx-auto max-w-[1180px]">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">{g.eyebrow}</p>
                <h2 className="mt-2 font-display text-xl md:text-2xl font-bold tracking-[-0.02em] text-fg">{g.title}</h2>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">{g.body}</p>
              </div>
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((p) => <PackageCard key={p.key} pkg={p} />)}
              </div>
            </div>
          </section>
        );
      })}

      {/* Broadcast add-ons — priced on top of any package. */}
      <section className="px-4 md:px-8 py-10 md:py-12 border-t border-border">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Add broadcast</p>
            <h2 className="mt-2 font-display text-xl md:text-2xl font-bold tracking-[-0.02em] text-fg">
              Put it on air.
            </h2>
            <p className="mt-2 text-sm text-fg-muted leading-relaxed">
              Added on top of any package above, at the order form.
            </p>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:max-w-3xl">
            {ADDONS.map((a) => (
              <div key={a.key} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-bold text-fg">{a.name}</h3>
                  <p className="font-display text-2xl font-extrabold tabular-nums text-brand whitespace-nowrap">
                    +{formatNgn(a.priceNgn)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">{a.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What the price covers — set expectations before they pay. */}
      <section className="px-4 md:px-8 py-12 border-t border-border">
        <div className="mx-auto max-w-[820px] rounded-2xl border border-border bg-surface p-6 md:p-8">
          <h2 className="font-semibold text-fg">What the price covers</h2>
          <p className="mt-3 text-sm text-fg-muted leading-relaxed">
            The prices above are our creative and management fees. Broadcast airtime for TV and
            radio, billboard rental and printing, and paid ad spend are your budget and are paid
            to the stations and platforms — we quote those per campaign so you always know what
            goes where. Bigger or longer campaigns are custom-quoted.
          </p>
        </div>
      </section>

      <section className="px-4 md:px-8 py-16 md:py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-fg">
          Pick your package and let’s go.
        </h2>
        <div className="mt-7">
          <LinkButton href="/studio/order" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Start your order
          </LinkButton>
        </div>
      </section>
    </>
  );
}
