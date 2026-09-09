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
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, faqSchema, offerCatalogSchema } from '@/components/seo/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

/**
 * The questions people actually type before they buy, answered in full on the
 * page rather than hidden behind a DM. Two reasons this is here and not in a
 * blog post: an answer in FAQPage schema can be quoted directly inside a Google
 * AI Overview, and a rival whose whole pricing strategy is "DM for price" has
 * nothing for that overview to quote.
 */
const PRICING_FAQS = [
  {
    q: 'How much does a custom song cost in Nigeria?',
    a: 'At Highscore Studio a one-minute custom song is ₦45,000 and takes about three days. A full song written from someone’s real story, professionally sung and produced, is ₦120,000 in five days. The Full Story — song, film, and release to Spotify and Apple Music — is ₦280,000 in seven days. Every price is published on this page; we do not ask anyone to message us for a quote.',
  },
  {
    q: 'How much does a business jingle cost in Nigeria?',
    a: 'Business packages start at ₦180,000 for The Starter, which includes a custom jingle in three lengths plus a website on your own domain, your domain submitted to Google, your Google Business Profile claimed and WhatsApp Business set up properly. The Brand Pack is ₦380,000 and adds a 30–60 second advert video and a month of Google and social work. The Launch is ₦750,000 and The Full Campaign starts at ₦1,500,000.',
  },
  {
    q: 'Is radio or TV airtime included in the price?',
    a: 'No, and we say so plainly rather than burying it. Airtime is billed at the station’s own rate plus 15% for booking and managing it. A 60-second radio spot runs from about ₦20,000 on a state station to ₦85,000 on Cool FM or Beat FM; 30 seconds on Channels TV is about ₦200,000; a mainland 48-sheet billboard is ₦300,000 to ₦600,000 a month. The real rates are published further up this page.',
  },
  {
    q: 'How long does it take to get a song or jingle?',
    a: 'Three days for a one-minute song, five for a full song or a campaign jingle, seven for The Starter or The Full Story, fourteen for The Brand Pack, twenty-one for The Launch and thirty for a full managed campaign. Turnaround runs from the day payment clears, and it is printed on every package.',
  },
  {
    q: 'Do you work with businesses outside Lagos?',
    a: 'Yes. Everything except filming is delivered digitally, so we work with businesses and families across Nigeria — Abuja, Port Harcourt, Ibadan, Benin City, Enugu, Kano — and with Nigerians abroad in the UK, the US and Canada. Filming on location is included in The Launch and above, with travel outside Lagos quoted separately.',
  },
  {
    q: 'Does a business package really include a website?',
    a: 'Yes, every one of them. We are a technology company as well as a studio, so a business package includes a website on your own domain with hosting for the first year, your domain registered in Google Search Console with a sitemap submitted, your Google Business Profile claimed and filled in, your WhatsApp Business catalogue set up, your social profiles cleaned up and a business email on your own domain.',
  },
  {
    q: 'How much does a campaign jingle cost for the 2027 elections?',
    a: 'A campaign jingle is ₦250,000 and takes five days. The Campaign Pack — jingle, advert films cut for every screen, poster and billboard artwork, up to four languages — is ₦850,000 in fourteen days. A full managed campaign, with media planned, costed, booked and confirmed, starts at ₦2,000,000.',
  },
  {
    q: 'Do I own the song afterwards?',
    a: 'Yes. The song, the video, the domain, the website and the profiles are yours to keep and to use however you like, including commercially. If you stop a monthly plan, none of it is taken back.',
  },
];

export const metadata: Metadata = {
  title: 'Pricing — songs from ₦45,000, business from ₦180,000',
  description:
    'Highscore Studio pricing. Occasion songs from ₦45,000. Business packages from ₦180,000 — every one includes a website, your Google listing and your profiles set up properly. Campaign jingles for 2027 from ₦250,000. Real station rates published.',
  alternates: { canonical: '/studio/pricing' },
};

export default function StudioPricingPage() {
  return (
    <>
      <JsonLd data={faqSchema(PRICING_FAQS)} />
      <JsonLd
        data={offerCatalogSchema({
          siteUrl: SITE_URL,
          name: 'Highscore Studio packages',
          items: PACKAGES.map((pkg) => ({
            name: pkg.name,
            description: pkg.blurb,
            priceNgn: pkg.priceNgn,
            path: `/studio/packages/${pkg.key}`,
            from: pkg.from,
          })),
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Highscore Studio', url: `${SITE_URL}/studio` },
          { name: 'Pricing', url: `${SITE_URL}/studio/pricing` },
        ])}
      />

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

      {/* ── Questions people ask before they pay ─────────────────── */}
      <section className="px-4 md:px-8 py-14 md:py-20 border-t border-border">
        <div className="mx-auto max-w-[820px]">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-fg">
            Questions people ask before they pay
          </h2>
          <div className="mt-8 divide-y divide-border">
            {PRICING_FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <h3 className="text-base md:text-lg font-bold text-fg">{f.q}</h3>
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-fg-subtle transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm md:text-base text-fg-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
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
