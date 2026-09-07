// The full Studio menu — every package, itemised, from the ₦45,000 short song
// to a full election campaign.
//
// The media-rates table near the bottom is not filler. Publishing the real
// station rates is what proves our package price is a production fee and not
// a markup, and it stops a client expecting television inside a ₦380,000
// package. It is also the single most persuasive thing on the page for a
// business owner who has been quoted "all-in" by somebody else.

import type { Metadata } from 'next';
import { ArrowRight, Download } from 'lucide-react';
import { PACKAGES, PACKAGE_GROUPS, ADDONS, MEDIA_RATES, formatNgn } from '@/lib/studio/catalog';
import { PackageCard } from '@/components/studio/PackageCard';
import { LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Studio pricing — songs from ₦45,000, business packages from ₦180,000',
  description:
    'Highscore Studio pricing. Occasion songs from ₦45,000. Business packages from ₦180,000 — every one includes a website, your Google listing and your profiles set up properly. Campaign jingles for 2027 from ₦250,000. Real station rates published.',
  alternates: { canonical: '/studio/pricing' },
};

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

      {PACKAGE_GROUPS.map((g, i) => {
        const items = PACKAGES.filter((p) => p.group === g.id);
        if (items.length === 0) return null;
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

      {/* Add-ons — real services with a fixed price. Note what is NOT here. */}
      <section className="px-4 md:px-8 py-10 md:py-12 border-t border-border">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Add to any package</p>
            <h2 className="mt-2 font-display text-xl md:text-2xl font-bold tracking-[-0.02em] text-fg">
              Extras, at a fixed price.
            </h2>
            <p className="mt-2 text-sm text-fg-muted leading-relaxed">
              Added at the order form. Airtime is not on this list, and never will be — see below.
            </p>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ADDONS.map((a) => (
              <div key={a.key} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-bold text-fg">{a.name}</h3>
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

      {/* The real station rates. This is the trust-builder on the whole page. */}
      <section className="px-4 md:px-8 py-10 md:py-12 border-t border-border">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Media, at cost</p>
            <h2 className="mt-2 font-display text-xl md:text-2xl font-bold tracking-[-0.02em] text-fg">
              We never hide what airtime costs.
            </h2>
            <p className="mt-2 text-sm text-fg-muted leading-relaxed">
              Airtime, billboard rental and printing are never inside a package price. They are billed
              at the station’s own rate plus 15% for the booking — and because stations already give
              agencies 15–30% off card, that 15% comes out of the discount and costs you nothing extra.
              These are the real numbers, so you can see for yourself that our fee is for making the
              work, not a markup on somebody else’s airtime.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {MEDIA_RATES.map((block) => (
              <div key={block.heading} className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand">{block.heading}</h3>
                <dl className="mt-4 space-y-3.5">
                  {block.items.map((it) => (
                    <div key={it.label} className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm text-fg-muted leading-snug">{it.label}</dt>
                      <dd className="text-sm font-bold tabular-nums text-fg whitespace-nowrap">
                        {it.rate}
                        {it.note && (
                          <span className="ml-1 font-normal text-fg-subtle">{it.note}</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-fg-subtle leading-relaxed max-w-3xl">
            Rates verified September 2026 against station cards and agency guides, and re-confirmed
            before every booking. Political campaigns pay a 31–50% premium on published rates as
            standard across Nigerian media — we quote the real figure up front rather than after.
          </p>
        </div>
      </section>

      {/* What the price covers — set expectations before they pay. */}
      <section className="px-4 md:px-8 py-12 border-t border-border">
        <div className="mx-auto max-w-[820px] rounded-2xl border border-border bg-surface p-6 md:p-8">
          <h2 className="font-semibold text-fg">What the price covers</h2>
          <p className="mt-3 text-sm text-fg-muted leading-relaxed">
            Every price above is our fee for making the work and running it. Broadcast airtime,
            billboard rental and printing, permit fees and paid ad spend are your budget and are paid
            to the stations, printers and platforms — quoted per campaign so you always know what
            goes where. Where a package includes months of ongoing work, the monthly price after
            those months is printed on the card, not saved for later. Bigger or longer campaigns are
            custom-quoted.
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
