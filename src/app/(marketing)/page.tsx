// Home — full landing.
// Hero (computer.jpg backdrop) → services strip → portfolio teaser →
// FAQ → final CTA.

import Image from 'next/image';
import { ArrowRight, Bot, Code2, Compass, Layers, Music } from 'lucide-react';
import { HomeHero } from '@/components/marketing/HomeHero';
import { Reveal, SectionHeading } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';
import { getPublicStats } from '@/lib/stats/public';
import { listProjects } from '@/lib/portfolio/queries';
import { STUDIO_URL } from '@/lib/studio/catalog';

const SERVICES = [
  {
    icon: <Bot className="h-6 w-6" />,
    title: 'AI development',
    description:
      'From model selection and prompt engineering to full multi-agent systems and RAG pipelines — integrated into your product.',
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: 'Software development',
    description:
      'Web and mobile builds in Next.js, React Native, and the Supabase / Postgres stack we use internally every day.',
  },
  {
    icon: <Compass className="h-6 w-6" />,
    title: 'Product strategy',
    description:
      'Discovery, scoping, and delivery planning. We help you decide what to build before we help you build it.',
  },
];

const FAQS = [
  {
    q: 'What kind of projects do you take on?',
    a: 'AI integrations into existing products, custom AI products from scratch, and full software builds (web + mobile). Smaller engagements start at scoping workshops; larger ones run as multi-month delivery projects.',
  },
  {
    q: 'Can you add AI to a product we already have?',
    a: "Yes — that's a lot of what we do. We integrate models like Claude or Groq into your existing product, or build and train a custom model where it earns its place. We work with your codebase, not around it.",
  },
  {
    q: 'Where is the team based?',
    a: 'Highscore Tech is a fully remote Nigerian company based in Lagos (CAC RC No. 7223102). We deliver to clients in Africa, Europe, and North America.',
  },
  {
    q: 'How does an engagement start?',
    a: 'Tell us what you’re working on via the contact page. We come back with a clear scope and a plan — including whether we’re the right team for it before you pay anything.',
  },
];

export default async function HomePage() {
  const [stats, projects] = await Promise.all([
    getPublicStats(),
    listProjects(),
  ]);
  const featured = projects.slice(0, 3);
  return (
    <>
      <HomeHero />

      {/* ── Social proof strip ─────────────────────────────────── */}
      <section className="relative isolate px-4 md:px-8 py-10 md:py-14 border-y border-border bg-bg-elevated/40">
        <div className="mx-auto max-w-[1180px] grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 text-center">
          <div>
            <p className="font-mono tabular text-3xl md:text-4xl font-extrabold text-fg">{stats.projectCount}+</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">Projects shipped</p>
          </div>
          <div>
            <p className="font-display text-3xl md:text-4xl font-extrabold text-fg">AI-first</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">How we build</p>
          </div>
          <div>
            <p className="font-display text-3xl md:text-4xl font-extrabold text-fg">Global</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">Clients served</p>
          </div>
          <div>
            <p className="font-mono tabular text-3xl md:text-4xl font-extrabold text-fg">100%</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">Built in Nigeria</p>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" id="services" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="What we do"
          title={<>Three ways we work with you.</>}
          description="We can integrate into your team for a single sprint or own delivery end-to-end. Either way, we ship."
          align="center"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {SERVICES.map((s) => (
            <PremiumCard key={s.title} className="h-full">
              <div className="p-6 md:p-7">
                <span className="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-brand-tint text-brand">
                  {s.icon}
                </span>
                <h3 className="mt-5 text-lg md:text-xl font-semibold text-fg">{s.title}</h3>
                <p className="mt-2 text-sm md:text-[15px] text-fg-muted leading-relaxed">
                  {s.description}
                </p>
              </div>
            </PremiumCard>
          ))}
        </div>
        <div className="mt-10 text-center">
          <LinkButton href="/services" variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
            See services in detail
          </LinkButton>
        </div>
      </Reveal>

      {/* ── Portfolio teaser ─────────────────────────────────────── */}
      <Reveal ambient={false} id="portfolio" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="Selected work"
          title={<>The proof is in the products.</>}
          description="From AI-powered platforms to consumer software, here's a sample of what we've shipped."
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {featured.map((p) => (
            <PremiumCard key={p.id} href={`/portfolio/${p.slug}`} className="h-full">
              <div className="flex flex-col h-full">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[15px] bg-surface-hover" aria-hidden="true">
                  {p.cover_image_url ? (
                    <Image
                      src={p.cover_image_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background:
                          'radial-gradient(80% 50% at 50% 30%, color-mix(in srgb, #18C2DC 18%, transparent) 0%, transparent 70%), linear-gradient(135deg, var(--c-graphite-800), var(--c-graphite-900))',
                      }}
                    >
                      <Layers className="h-10 w-10 text-fg-subtle/40" />
                    </div>
                  )}
                  {p.category && (
                    <span className="absolute top-3 left-3 inline-flex h-6 items-center px-2.5 rounded-full bg-bg/70 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-fg">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="p-5 md:p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-fg group-hover:text-brand transition-colors leading-tight">
                    {p.title}
                  </h3>
                  {p.client && (
                    <p className="mt-1 text-xs text-fg-subtle uppercase tracking-wider font-semibold">{p.client}</p>
                  )}
                  <p className="mt-3 text-sm text-fg-muted leading-relaxed flex-1 line-clamp-3">{p.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    Read case study <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
        <div className="mt-10 text-center">
          <LinkButton href="/portfolio" variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
            View full portfolio
          </LinkButton>
        </div>
      </Reveal>

      {/* ── Studio ──────────────────────────────────────────────── */}
      {/* Our creative branch. It lives on its own subdomain, so these are real
          outbound links rather than <Link> routes. */}
      <Reveal ambient="brand-soft" id="studio" className="!py-16 md:!py-28">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-warning">
              <Music className="h-3.5 w-3.5" />
              Highscore Tech Studio
            </p>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
              We also make businesses<br />
              <span className="text-warning">impossible to ignore.</span>
            </h2>
            <p className="mt-4 max-w-xl text-base md:text-lg text-fg-muted leading-relaxed">
              Our creative branch writes custom songs and jingles, produces promo videos —
              filmed or AI-made — and puts brands everywhere their customers are: social,
              radio, live TV, billboards, Google and paid ads.
            </p>
            <p className="mt-3 max-w-xl text-sm text-fg-muted">
              Songs for businesses, churches, weddings, birthdays and events — from{' '}
              <span className="font-bold text-warning">$8</span> up to full monthly campaigns.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={STUDIO_URL}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-warning px-6 text-sm font-bold text-ink transition-opacity hover:opacity-90"
              >
                Visit Highscore Studio <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`${STUDIO_URL}/pricing`}
                className="inline-flex h-12 items-center rounded-lg border border-border px-6 text-sm font-semibold text-fg hover:bg-surface-hover"
              >
                See Studio pricing
              </a>
            </div>
          </div>

          <PremiumCard className="h-full" highlight>
            <div className="p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-warning">
                What the Studio does
              </p>
              <ul className="mt-5 space-y-4 text-sm md:text-[15px] text-fg-muted">
                {[
                  ['Custom songs & jingles', 'written about your business or occasion'],
                  ['Promo videos', 'filmed live, or made with AI from your photos'],
                  ['Radio, TV & outdoor', 'broadcast-ready cuts, billboards and signage'],
                  ['Google ranking & ads', 'get found, then get in front of buyers'],
                ].map(([title, rest]) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                    <span><b className="text-fg">{title}</b> — {rest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PremiumCard>
        </div>
      </Reveal>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <Reveal ambient={false} id="faq" className="!py-16 md:!py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
          <SectionHeading
            eyebrow="FAQ"
            title="Common questions."
            description="If you don't see your question here, send us a note via the contact page."
          />
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-surface/60 backdrop-blur-sm overflow-hidden"
              >
                <summary className="list-none cursor-pointer p-5 md:p-6 flex items-start justify-between gap-4 select-none">
                  <span className="font-semibold text-fg">{f.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-1 text-brand text-xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-2 text-fg-muted leading-relaxed text-[15px]">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" id="cta" className="!py-20 md:!py-32">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
            Let's build something good.
          </h2>
          <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">
            Tell us what you're working on. We'll come back with a clear path forward —
            including whether we're the right people for it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start a project
            </LinkButton>
            <LinkButton href="/portfolio" size="lg" variant="secondary">
              See our work first
            </LinkButton>
          </div>
        </div>
      </Reveal>
    </>
  );
}
