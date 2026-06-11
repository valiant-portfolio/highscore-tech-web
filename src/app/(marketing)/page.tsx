// Home — full landing.
// Hero (computer.jpg backdrop) → services strip → portfolio teaser →
// academy callout → FAQ → final CTA.

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bot, Code2, Compass, GraduationCap, Layers } from 'lucide-react';
import { HomeHero } from '@/components/marketing/HomeHero';
import { Reveal, SectionHeading } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';
import JsonLd from '@/components/seo/JsonLd';
import { academySchema } from '@/components/seo/structured-data';
import { getPublicStats } from '@/lib/stats/public';
import { listProjects } from '@/lib/portfolio/queries';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

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

const COURSE_CHIPS = [
  { label: 'Frontend', href: '/academy' },
  { label: 'Backend',  href: '/academy' },
  { label: 'Full stack', href: '/academy' },
  { label: 'Python', href: '/academy' },
  { label: 'React Native', href: '/academy' },
  { label: 'Python ML/AI', href: '/academy' },
];

const FAQS = [
  {
    q: 'What kind of projects do you take on?',
    a: 'AI integrations into existing products, custom AI products from scratch, and full software builds (web + mobile). Smaller engagements start at scoping workshops; larger ones run as multi-month delivery projects.',
  },
  {
    q: 'Where is the team based?',
    a: 'Highscore Tech is a fully remote Nigerian company based in Lagos (CAC RC No. 7223102). Our engineers work from across the country and we deliver to clients in Africa, Europe, and North America.',
  },
  {
    q: 'How does the academy connect to the studio?',
    a: 'The academy trains engineers in the same stack we ship on. Our top graduates are hired directly into Highscore Tech — every cohort feeds the studio.',
  },
  {
    q: 'Can I pay for courses in instalments?',
    a: 'Yes. Each course supports a full upfront payment or a structured instalment plan you can track on your profile.',
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
      <JsonLd data={academySchema(SITE_URL)} />
      <HomeHero />

      {/* ── Social proof strip ─────────────────────────────────── */}
      <section className="relative isolate px-4 md:px-8 py-10 md:py-14 border-y border-border bg-bg-elevated/40">
        <div className="mx-auto max-w-[1180px] grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 text-center">
          <div>
            <p className="font-mono tabular text-3xl md:text-4xl font-extrabold text-fg">{stats.studentCount}+</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">Active students</p>
          </div>
          <div>
            <p className="font-mono tabular text-3xl md:text-4xl font-extrabold text-fg">{stats.courseCount}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">Live courses</p>
          </div>
          <div>
            <p className="font-mono tabular text-3xl md:text-4xl font-extrabold text-fg">{stats.projectCount}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">Shipped projects</p>
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

      {/* ── Academy callout ─────────────────────────────────────── */}
      <Reveal ambient="brand-soft" id="academy" className="!py-16 md:!py-28">
        <div className="grid lg:grid-cols-[1fr_440px] gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Academy</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
              We train engineers.<br />
              And we hire the best of them.
            </h2>
            <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed max-w-xl">
              Six courses across frontend, backend, full stack, Python, mobile, and machine learning.
              Each course ends with real client work and a path to a job at Highscore Tech.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {COURSE_CHIPS.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  className="inline-flex h-8 items-center px-3 rounded-full border border-border bg-surface/60 backdrop-blur text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/academy" leftIcon={<GraduationCap className="h-4 w-4" />}>
                Browse courses
              </LinkButton>
              <LinkButton href="/signup" variant="secondary">
                Enrol
              </LinkButton>
            </div>
          </div>

          <PremiumCard className="h-full" highlight>
            <div className="p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">
                Why study with us
              </p>
              <ul className="mt-5 space-y-4 text-sm md:text-[15px] text-fg-muted">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                  <span><b className="text-fg">Same stack we ship on</b> — what you learn is what we use.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                  <span><b className="text-fg">Online or onsite</b> — choose the mode that fits your life.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                  <span><b className="text-fg">Instalment-friendly</b> — pay in full or break the fee into instalments.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                  <span><b className="text-fg">Hiring pipeline</b> — top graduates join Highscore Tech directly.</span>
                </li>
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
