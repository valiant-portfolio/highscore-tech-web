// The full Studio menu — every package, itemised, from the $8 song to
// always-on brand campaigns.

import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { PACKAGES } from '@/lib/studio/catalog';
import { PackageCard } from '@/components/studio/PackageCard';
import { LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Studio pricing — songs from $8 to full brand campaigns',
  description:
    'Highscore Studio pricing: custom songs from $8, song + video from $15, event and business packages, radio and TV campaigns, outdoor branding, Google ranking and ads management, and always-on monthly brand contracts.',
  alternates: { canonical: '/studio/pricing' },
};

const GROUPS = [
  {
    id: 'start',
    eyebrow: 'Start here',
    title: 'No business is too small.',
    body: 'Priced so anyone can afford to show up looking like the big brands.',
  },
  {
    id: 'ladder',
    eyebrow: 'Pay more, get more',
    title: 'Every step up is a bigger deliverable.',
    body: 'You can see exactly what the extra money buys — no vague “premium” tiers.',
  },
  {
    id: 'reach',
    eyebrow: 'Reach further',
    title: 'Put your brand everywhere.',
    body: 'Where we stop making content and start running your whole presence — broadcast, outdoor, Google and paid ads.',
  },
] as const;

export default function StudioPricingPage() {
  return (
    <>
      <section className="px-4 md:px-8 pt-16 md:pt-24 pb-10 text-center">
        <div className="mx-auto max-w-[760px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-warning">Pricing</p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.05] text-fg">
            The full menu.
          </h1>
          <p className="mt-5 text-base md:text-lg text-fg-muted leading-relaxed">
            All prices in US dollars so anyone, anywhere can pay. Nigerian cards settle
            through ALAT by Wema at checkout.
          </p>
        </div>
      </section>

      {GROUPS.map((g) => {
        const items = PACKAGES.filter((p) => p.group === g.id);
        return (
          <section key={g.id} className="px-4 md:px-8 py-12 md:py-16 border-t border-border first-of-type:border-t-0">
            <div className="mx-auto max-w-[1180px]">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-warning">{g.eyebrow}</p>
                <h2 className="mt-3 font-display text-2xl md:text-4xl font-bold tracking-[-0.02em] text-fg">{g.title}</h2>
                <p className="mt-3 text-fg-muted leading-relaxed">{g.body}</p>
              </div>
              <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((p) => <PackageCard key={p.key} pkg={p} />)}
              </div>
            </div>
          </section>
        );
      })}

      {/* What the price covers — set expectations before they pay. */}
      <section className="px-4 md:px-8 py-12 md:py-16 border-t border-border">
        <div className="mx-auto max-w-[820px] rounded-2xl border border-border bg-surface p-6 md:p-8">
          <h2 className="font-semibold text-fg">What the price covers</h2>
          <p className="mt-3 text-sm text-fg-muted leading-relaxed">
            The prices above are our creative and management fees. Broadcast airtime for TV
            and radio, billboard placement, and paid ad spend are your budget and are paid to
            the stations and platforms — we quote those per campaign so you always know what
            goes where. Larger or longer campaigns beyond $800 are custom-quoted.
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
