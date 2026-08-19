// Highscore Studio — landing page. Sells the whole ladder: an $8 song for the
// smallest business, up to always-on brand campaigns on TV, radio and outdoor.

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Music, Clapperboard, Radio, Tv, Megaphone, Search, TrendingUp } from 'lucide-react';
import { PACKAGES } from '@/lib/studio/catalog';
import { OCCASIONS } from '@/lib/studio/occasions';
import { PackageCard } from '@/components/studio/PackageCard';
import { StudioHeroBackdrop } from '@/components/studio/StudioHeroBackdrop';
import { LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Highscore Studio — custom songs, jingles & promo videos',
  description:
    'We make businesses famous. Custom songs and jingles from $8, promo videos, radio and TV campaigns, outdoor branding, Google ranking and paid ads. Songs for birthdays, weddings, churches, parties and events.',
  alternates: { canonical: '/studio' },
};

const WHAT_WE_DO = [
  { icon: <Music className="h-5 w-5" />,        title: 'Custom songs & jingles', body: 'A song written about your business, your event, or the person you love. Yours to keep.' },
  { icon: <Clapperboard className="h-5 w-5" />, title: 'Promo videos',           body: 'Filmed live or made with AI — we can turn your photos into moving video.' },
  { icon: <Radio className="h-5 w-5" />,        title: 'Radio campaigns',        body: 'Jingles written for air, delivered in broadcast format for any station.' },
  { icon: <Tv className="h-5 w-5" />,           title: 'Live TV promotion',      body: 'Commercials produced and placed — your brand on live television.' },
  { icon: <Megaphone className="h-5 w-5" />,    title: 'Outdoor branding',       body: 'Billboards, banners, signage, vehicle and shop-front branding.' },
  { icon: <Search className="h-5 w-5" />,       title: 'Google ranking & ads',   body: 'Rank on Google and run paid ads that put you in front of buyers.' },
];

export default function StudioHomePage() {
  const start = PACKAGES.filter((p) => p.group === 'start');
  const ladder = PACKAGES.filter((p) => p.group === 'ladder');

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      {/* Deep bottom padding is deliberate: it reserves a clear band for the
          spectrum below the copy, instead of the bars running through it. */}
      <section className="relative isolate overflow-hidden px-4 md:px-8 pt-20 md:pt-28 pb-40 md:pb-48">
        {/* Photo backdrop. A CSS background rather than next/image on purpose:
            if the file is missing it simply doesn't paint, and the gradients
            below still carry the hero — no broken-image box on a live page. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-cover bg-center"
          style={{ backgroundImage: 'url(/studio-hero.jpg)' }}
        />
        {/* Darkening + brand tint over the photo, so the copy stays readable
            whatever the image is. Mirrors the treatment on the main site. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--color-ink) 58%, transparent) 0%, color-mix(in srgb, var(--color-ink) 70%, transparent) 55%, var(--color-bg) 100%), ' +
              'radial-gradient(70% 55% at 50% 0%, color-mix(in srgb, var(--color-brand) 16%, transparent) 0%, transparent 70%)',
          }}
        />
        {/* Live spectrum analyser — the thing that says "music studio" before
            anyone reads a word. Anchored to the lower half of the hero: across
            the whole section it climbed straight through the headline. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[46%] -z-10">
          <StudioHeroBackdrop />
        </div>
        <div className="relative mx-auto max-w-[900px] text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            Highscore Tech Studio
          </p>
          <h1 className="mt-6 font-display text-[40px] sm:text-6xl md:text-7xl font-extrabold tracking-[-0.035em] leading-[1.03] text-fg">
            We make your business{' '}
            <span className="text-brand">impossible to ignore.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-fg-muted leading-relaxed">
            Custom songs, jingles and videos that people actually remember — then we put
            them everywhere your customers are. Social, radio, live TV, billboards.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/studio/order" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start your order
            </LinkButton>
            <LinkButton href="/studio/work" size="lg" variant="secondary">
              Hear our work
            </LinkButton>
          </div>
          <p className="mt-6 text-sm text-fg-subtle">
            Songs from <span className="font-bold text-brand">$8</span> · full campaigns up to $800 · we deliver to WhatsApp, Telegram or email
          </p>
        </div>
      </section>

      {/* ── What we do ───────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-16 md:py-20 border-y border-border bg-bg-elevated/40">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-fg text-center">
            Everything we can do for your brand.
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {WHAT_WE_DO.map((w) => (
              <div key={w.title} className="rounded-xl border border-border bg-surface p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
                  {w.icon}
                </span>
                <h3 className="mt-4 font-semibold text-fg">{w.title}</h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us ───────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-16 md:py-20">
        <div className="mx-auto max-w-[820px] rounded-2xl border border-border bg-surface p-7 md:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Why us</p>
          <h2 className="mt-3 font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-fg">
            Anyone can hold the tools. Not everyone can do this.
          </h2>
          <p className="mt-4 text-fg-muted leading-relaxed">
            Yes, we use AI — and so does anyone with a laptop. The difference is what we do
            with it: the writing, the timing, the taste, and the read on <b className="text-fg">your</b> market
            that turns a clip into a campaign. The tools are cheap. Knowing exactly what makes
            your customer stop scrolling is not. That is the part you are paying for, and it is
            why our work lands.
          </p>
        </div>
      </section>

      {/* ── Pricing: start here ──────────────────────────────────── */}
      <section id="pricing" className="px-4 md:px-8 py-16 md:py-20 border-t border-border">
        <div className="mx-auto max-w-[1180px]">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Start here</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-fg">
              No business is too small.
            </h2>
            <p className="mt-3 text-fg-muted leading-relaxed">
              We priced the first step so a struggling business can still show up looking
              like the big brands.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {start.map((p) => <PackageCard key={p.key} pkg={p} />)}
          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Pay more, get more</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-fg">
              Every step up is a bigger deliverable.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {ladder.map((p) => <PackageCard key={p.key} pkg={p} />)}
          </div>

          <div className="mt-12 text-center">
            <LinkButton href="/studio/pricing" variant="secondary" rightIcon={<TrendingUp className="h-4 w-4" />}>
              See the full menu — radio, TV, outdoor, Google &amp; ads
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── Occasions ────────────────────────────────────────────── */}
      {/* Real links, not decoration: each of these is a page built to rank for
          its own search, and this is how crawlers and customers find them. */}
      <section className="px-4 md:px-8 py-14 md:py-16 border-t border-border">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">What’s the occasion?</p>
            <h2 className="mt-3 font-display text-2xl md:text-4xl font-bold tracking-[-0.02em] text-fg">
              We make songs for all of it.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OCCASIONS.map((o) => (
              <Link
                key={o.slug}
                href={`/studio/songs/${o.slug}`}
                className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/60 hover:bg-surface-hover"
              >
                <h3 className="flex items-center justify-between gap-3 font-semibold text-fg">
                  {o.name}
                  <ArrowRight className="h-4 w-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
                </h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed line-clamp-2">{o.intro}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-16 md:py-20 border-t border-border bg-bg-elevated/40">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-[-0.02em] text-fg text-center">
            How it works.
          </h2>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '1', t: 'Tell us what you want', b: 'Pick your package and fill a short brief — we ask different questions for a church, a business, a birthday or an event.' },
              { n: '2', t: 'Pay securely', b: 'Nigerian cards pay through ALAT by Wema. Everyone else pays by card. All prices in USD.' },
              { n: '3', t: 'We get to work', b: 'You get a delivery date straight away, and your invoice to download.' },
              { n: '4', t: 'We send it over', b: 'Finished work arrives on WhatsApp, Telegram or email — whichever you chose.' },
            ].map((s) => (
              <li key={s.n} className="rounded-xl border border-border bg-surface p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-fg font-display font-extrabold">
                  {s.n}
                </span>
                <h3 className="mt-3.5 font-semibold text-fg">{s.t}</h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-20 md:py-28">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-[-0.025em] text-fg">
            Let’s make them hear you.
          </h2>
          <p className="mt-4 text-fg-muted leading-relaxed">
            Start with an $8 song, or go all the way to a campaign on live TV. Either way,
            it starts with one form.
          </p>
          <div className="mt-8">
            <LinkButton href="/studio/order" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start your order
            </LinkButton>
          </div>
          <p className="mt-5 text-sm text-fg-subtle">
            Questions first? <Link href="/contact" className="font-semibold text-brand hover:underline">Talk to us</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
