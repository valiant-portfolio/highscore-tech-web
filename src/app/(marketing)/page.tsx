// Home — the company landing.
// Hero → stats strip → the four products (Autotrade / Analysis / Build / Studio)
// → portfolio teaser → FAQ → final CTA (with the investor call).
//
// The main page's job: one visitor, one scroll, understands everything Highscore
// Tech does. Each product is named in one word and opens on its own subdomain.

import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Bot, LineChart, Code2, Music, Layers } from 'lucide-react';
import { HomeHero } from '@/components/marketing/HomeHero';
import { Reveal, SectionHeading } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';
import { getPublicStats } from '@/lib/stats/public';
import { listProjects } from '@/lib/portfolio/queries';
import { AUTOTRADE_URL, ANALYSIS_URL, BUILD_URL, STUDIO_URL } from '@/lib/subdomains';

// The four things we do. One word each — the name IS the subdomain.
const PRODUCTS = [
  {
    word: 'Autotrade',
    icon: <Bot className="h-6 w-6" />,
    tagline: 'AI trading bot for businesses',
    description:
      'An AI that trades on your own broker account — you keep custody of your money, it does the work. Risk-managed, watched around the clock, every position visible in real time.',
    points: [
      'Trades your account, never holds your funds',
      'Live chart, trades and performance',
      'Human-checked before every entry',
    ],
    href: AUTOTRADE_URL,
  },
  {
    word: 'Analysis',
    icon: <LineChart className="h-6 w-6" />,
    tagline: 'AI trading analysis',
    description:
      'Read any market in plain English. Our AI lays out the trend, the structure, the levels and the risk — so you decide with a clear head instead of a hunch.',
    points: [
      'The market read in plain language',
      'Trend, levels and risk at a glance',
      'Ask it anything about a market',
    ],
    href: ANALYSIS_URL,
  },
  {
    word: 'Build',
    icon: <Code2 className="h-6 w-6" />,
    tagline: 'Software, built and run',
    description:
      'The agency. We build and run the software businesses depend on — gaming and casino platforms, AI integrations, web and mobile — and keep it live after launch, not just handed over. The same stack we build our own products on.',
    points: [
      'Gaming & casino platforms',
      'AI integrations & custom models',
      'Built, launched and kept running',
    ],
    href: BUILD_URL,
  },
  {
    word: 'Studio',
    icon: <Music className="h-6 w-6" />,
    tagline: 'Media & content',
    description:
      'Our creative branch. Custom songs and jingles, promo videos filmed or AI-made, and the campaigns that put a brand everywhere its customers are — social, radio, TV, billboards and Google.',
    points: [
      'Songs, jingles & promo videos',
      'Social, radio, TV & outdoor',
      'Get found, then get in front of buyers',
    ],
    href: STUDIO_URL,
  },
] as const;

const FAQS = [
  {
    q: 'What does Highscore Tech actually do?',
    a: 'Four things: an AI trading bot that trades on your own account (Autotrade), AI market analysis in plain English (Analysis), a software agency that builds and runs software — gaming and casino platforms, AI, web and mobile (Build), and a creative studio for songs, video and campaigns (Studio). Each has its own site.',
  },
  {
    q: 'Can you add AI to a product we already have?',
    a: "Yes — that's a lot of what Build does. We integrate models like Claude or Groq into your existing product, or build and train a custom model where it earns its place. We work with your codebase, not around it.",
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
            <p className="font-display text-3xl md:text-4xl font-extrabold text-fg">4</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">Products, one roof</p>
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

      {/* ── The four products ────────────────────────────────────── */}
      <Reveal ambient="brand-soft" id="services" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="What we do"
          title={<>One craft, four products.</>}
          description="It all runs on software and AI — two products we own and run, the software we build and run for you, and the studio that makes it land. Open any of them."
          align="center"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {PRODUCTS.map((p) => (
            <PremiumCard key={p.word} className="h-full">
              <div className="flex h-full flex-col p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-tint text-brand shrink-0">
                    {p.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-fg leading-none">
                      {p.word}
                    </h3>
                    <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-fg-subtle">
                      {p.tagline}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm md:text-[15px] text-fg-muted leading-relaxed">{p.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-sm text-fg-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand transition-all hover:gap-2.5"
                >
                  Open {p.word} <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </PremiumCard>
          ))}
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

      {/* ── Final CTA + investor call ───────────────────────────── */}
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
          <div className="mt-10 border-t border-border pt-8">
            <p className="text-sm text-fg-muted">
              We're building in the open and raising.{' '}
              <a href="/contact?topic=investors" className="font-semibold text-brand hover:underline">
                Investors — let's talk
              </a>
              .
            </p>
          </div>
        </div>
      </Reveal>
    </>
  );
}
