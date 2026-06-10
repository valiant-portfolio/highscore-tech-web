// Portfolio — public listing of every published portfolio_projects row.
// Server-rendered. Category filter is a simple anchor + scroll behaviour
// (kept dependency-free; no client JS needed for an initial cut).

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Layers } from 'lucide-react';
import { Reveal, SectionHeading } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';
import { listProjects } from '@/lib/portfolio/queries';

export const metadata: Metadata = {
  title: 'Portfolio — Highscore Tech',
  description:
    'Selected client work and internal builds — AI systems, web platforms, and mobile applications shipped by Highscore Tech.',
  alternates: { canonical: '/portfolio' },
};

// Read once per request — kept short so unpublished/private builds stay fresh.
export const revalidate = 60;

export default async function PortfolioPage() {
  const projects = await listProjects();
  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean))) as string[];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pt-24 md:pt-36 pb-12 md:pb-20">
        <div className="mx-auto max-w-[920px] space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Portfolio</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05] text-fg">
            Selected work.
          </h1>
          <p className="text-lg md:text-xl text-fg-muted leading-relaxed max-w-2xl">
            A working showcase of the products we've shipped — for clients and for ourselves.
            New case studies land as projects complete.
          </p>
          {categories.length > 0 && (
            <div className="pt-4 flex flex-wrap gap-2">
              <span className="inline-flex h-8 items-center px-3 rounded-full bg-brand-tint text-brand text-xs font-semibold uppercase tracking-wider">
                All ({projects.length})
              </span>
              {categories.map((c) => (
                <span
                  key={c}
                  className="inline-flex h-8 items-center px-3 rounded-full border border-border bg-surface/60 backdrop-blur text-xs font-medium text-fg-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-12 md:!py-20">
        {projects.length === 0 ? (
          <div className="mx-auto max-w-[640px] text-center py-16">
            <Layers className="h-10 w-10 mx-auto text-fg-subtle" />
            <h2 className="mt-5 font-display text-2xl font-bold text-fg">
              Case studies coming soon.
            </h2>
            <p className="mt-3 text-fg-muted leading-relaxed">
              We're polishing the first round of public case studies. In the meantime,
              talk to us about your project and we'll share relevant examples directly.
            </p>
            <div className="mt-6">
              <LinkButton href="/contact" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get in touch
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {projects.map((p) => (
              <PremiumCard key={p.id} href={`/portfolio/${p.slug}`} className="h-full">
                <div className="flex flex-col h-full">
                  <div
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[15px] bg-surface-hover"
                    aria-hidden="true"
                  >
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
                        className="absolute inset-0"
                        style={{
                          background:
                            'radial-gradient(80% 50% at 50% 30%, color-mix(in srgb, #18C2DC 18%, transparent) 0%, transparent 70%), linear-gradient(135deg, var(--c-graphite-800), var(--c-graphite-900))',
                        }}
                      />
                    )}
                    {p.category && (
                      <span className="absolute top-3 left-3 inline-flex h-6 items-center px-2.5 rounded-full bg-bg/70 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-fg">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <div className="p-5 md:p-6 flex-1 flex flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-lg md:text-xl font-semibold text-fg group-hover:text-brand transition-colors leading-tight">
                        {p.title}
                      </h3>
                      {p.year && (
                        <span className="font-mono tabular text-xs text-fg-subtle shrink-0">{p.year}</span>
                      )}
                    </div>
                    {p.client && (
                      <p className="mt-1 text-xs text-fg-subtle uppercase tracking-wider font-semibold">
                        {p.client}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-fg-muted leading-relaxed flex-1">
                      {p.summary}
                    </p>
                    {p.tech_stack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.tech_stack.slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="inline-flex h-6 items-center px-2 rounded-md bg-surface-hover text-[11px] font-medium text-fg-muted"
                          >
                            {t}
                          </span>
                        ))}
                        {p.tech_stack.length > 4 && (
                          <span className="inline-flex h-6 items-center px-2 text-[11px] text-fg-subtle">
                            +{p.tech_stack.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                      Read case study <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </Reveal>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <Reveal ambient={false} className="!py-20 md:!py-28">
          <div className="mx-auto max-w-[820px] text-center">
            <SectionHeading
              title="Want to be the next case study?"
              description="Tell us about your project. If we're a fit, we'll come back with a scope and timeline."
              align="center"
            />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/contact" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start a project
              </LinkButton>
              <Link
                href="/services"
                className="inline-flex items-center text-sm font-semibold text-fg-muted hover:text-fg"
              >
                See what we offer →
              </Link>
            </div>
          </div>
        </Reveal>
      )}
    </>
  );
}
