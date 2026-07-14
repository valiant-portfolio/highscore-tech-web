// Portfolio detail — single project case study.
//
// Server-rendered. We pre-generate the published slugs at build time so each
// public case study is statically delivered.

import type { Metadata } from 'next';
import Link from 'next/link';
import { PortfolioGallery } from '@/components/marketing/PortfolioGallery';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Reveal } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { Markdown } from '@/components/marketing/Markdown';
import { LinkButton } from '@/components/ui';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/components/seo/structured-data';
import { getProject, listProjectSlugs } from '@/lib/portfolio/queries';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export const revalidate = 60;

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Case study — Highscore Tech' };
  return {
    title: `${project.title} — Highscore Tech`,
    description: project.summary,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      ...(project.cover_image_url && { images: [project.cover_image_url] }),
    },
  };
}

export default async function PortfolioDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home',      url: `${SITE_URL}/` },
          { name: 'Portfolio', url: `${SITE_URL}/portfolio` },
          { name: project.title, url: `${SITE_URL}/portfolio/${project.slug}` },
        ])}
      />
      {/* ── Header ───────────────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pt-20 md:pt-28 pb-8">
        <div className="mx-auto max-w-[1180px]">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All work
          </Link>
        </div>
      </section>

      <section className="relative px-4 md:px-8 pb-10 md:pb-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-end">
            <div className="space-y-3">
              {project.category && (
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">
                  {project.category}
                </p>
              )}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05] text-fg">
                {project.title}
              </h1>
              {project.client && (
                <p className="text-base md:text-lg text-fg-muted">
                  For <span className="text-fg font-semibold">{project.client}</span>
                  {project.year && <span> · {project.year}</span>}
                </p>
              )}
            </div>
            {project.external_url && (
              <LinkButton
                href={project.external_url}
                external
                variant="secondary"
                rightIcon={<ExternalLink className="h-4 w-4" />}
              >
                Visit live
              </LinkButton>
            )}
          </div>
        </div>
      </section>

      {/* ── Cover + gallery (click any to view full size) ───────────── */}
      <section className="relative px-4 md:px-8 pb-12 md:pb-20">
        <div className="mx-auto max-w-[1180px]">
          {((project.images ?? []).length > 0 || project.video_url) ? (
            <PortfolioGallery images={project.images ?? []} title={project.title} videoUrl={project.video_url} />
          ) : (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-surface">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(80% 50% at 50% 30%, color-mix(in srgb, #18C2DC 22%, transparent) 0%, transparent 70%), linear-gradient(135deg, var(--c-graphite-800), var(--c-graphite-900))',
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Body + sidebar ───────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-12 md:!py-20">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-16">
          <article>
            <p className="text-xl md:text-2xl text-fg leading-relaxed font-display tracking-tight">
              {project.summary}
            </p>
            {project.body_md && (
              <Markdown source={project.body_md} className="mt-8" />
            )}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-28 self-start">
            <PremiumCard noLift>
              <div className="p-6 space-y-5">
                {project.client && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Client</p>
                    <p className="mt-1 text-base font-semibold text-fg">{project.client}</p>
                  </div>
                )}
                {project.year && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Year</p>
                    <p className="mt-1 text-base font-mono tabular text-fg">{project.year}</p>
                  </div>
                )}
                {project.category && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Category</p>
                    <p className="mt-1 text-base font-semibold text-fg">{project.category}</p>
                  </div>
                )}
                {project.tech_stack.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-2">Stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech_stack.map((t) => (
                        <span
                          key={t}
                          className="inline-flex h-6 items-center px-2 rounded-md bg-brand-tint text-brand text-[11px] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>

            <PremiumCard noLift>
              <div className="p-6">
                <p className="text-sm text-fg-muted leading-relaxed">
                  Got a similar project in mind?
                </p>
                <LinkButton href="/contact" size="sm" className="mt-3">
                  Get in touch
                </LinkButton>
              </div>
            </PremiumCard>
          </aside>
        </div>
      </Reveal>

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <Reveal ambient={false} className="!py-16 md:!py-24">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
            See more of our work.
          </h2>
          <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">
            Browse the full portfolio or get in touch about a specific need.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/portfolio" variant="secondary">
              Back to portfolio
            </LinkButton>
            <LinkButton href="/contact">
              Start a project
            </LinkButton>
          </div>
        </div>
      </Reveal>
    </>
  );
}
