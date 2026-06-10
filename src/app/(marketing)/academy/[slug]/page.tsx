// Course detail — full module-by-module breakdown, sticky pricing sidebar,
// syllabus PDF download link, and an Enrol CTA.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Download, GraduationCap,
} from 'lucide-react';
import { Reveal } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { Markdown } from '@/components/marketing/Markdown';
import { LinkButton } from '@/components/ui';
import { getCourseWithModules, listCourseSlugs, formatNgn } from '@/lib/academy/queries';
import JsonLd from '@/components/seo/JsonLd';
import { courseSchema, breadcrumbSchema } from '@/components/seo/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export const revalidate = 60;

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseWithModules(slug);
  if (!course) return { title: 'Course — Highscore Tech Academy' };
  return {
    title: `${course.title} — Highscore Tech Academy`,
    description: course.summary,
    alternates: { canonical: `/academy/${course.slug}` },
  };
}

export default async function CourseDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const course = await getCourseWithModules(slug);
  if (!course) notFound();

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <>
      <JsonLd
        data={courseSchema({
          siteUrl: SITE_URL,
          slug: course.slug,
          title: course.title,
          description: course.summary,
          priceNgn: course.price_ngn,
          durationWeeks: course.duration_weeks ?? undefined,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home',    url: `${SITE_URL}/` },
          { name: 'Academy', url: `${SITE_URL}/academy` },
          { name: course.title, url: `${SITE_URL}/academy/${course.slug}` },
        ])}
      />

      {/* ── Top breadcrumb ───────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pt-20 md:pt-28 pb-6">
        <div className="mx-auto max-w-[1180px]">
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All courses
          </Link>
        </div>
      </section>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pb-12 md:pb-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-wrap items-center gap-2">
            {course.level && (
              <span className="inline-flex h-7 items-center px-2.5 rounded-md bg-brand-tint text-brand text-xs font-semibold uppercase tracking-wider">
                {course.level}
              </span>
            )}
            <span className="inline-flex h-7 items-center px-2.5 rounded-md border border-border text-fg-muted text-xs font-medium uppercase tracking-wider">
              {course.mode === 'hybrid' ? 'Online + Onsite' : course.mode}
            </span>
            {course.duration_weeks && (
              <span className="inline-flex h-7 items-center px-2.5 rounded-md border border-border text-fg-muted text-xs font-medium gap-1">
                <Clock className="h-3.5 w-3.5" />
                {course.duration_weeks} weeks
              </span>
            )}
          </div>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05] text-fg">
            {course.title}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-fg-muted leading-relaxed max-w-3xl">
            {course.summary}
          </p>
        </div>
      </section>

      {/* ── Body + sticky sidebar ────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-12 md:!py-20">
        <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-16">
          <div className="space-y-12">
            {/* Overview */}
            {course.full_description && (
              <section>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-fg">
                  About this course
                </h2>
                <Markdown source={course.full_description} className="mt-4" />
              </section>
            )}

            {/* Outcomes */}
            {course.outcomes.length > 0 && (
              <section>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-fg">
                  What you'll be able to do
                </h2>
                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex gap-3 items-start p-4 rounded-xl border border-border bg-surface/60 backdrop-blur-sm">
                      <CheckCircle2 className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                      <span className="text-sm md:text-[15px] text-fg leading-relaxed">{o}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Prerequisites */}
            {course.prerequisites.length > 0 && (
              <section>
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-fg">
                  Before you start
                </h2>
                <p className="mt-3 text-fg-muted">You should already be comfortable with:</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {course.prerequisites.map((p) => (
                    <li
                      key={p}
                      className="inline-flex h-8 items-center px-3 rounded-full border border-border bg-surface/60 backdrop-blur text-sm font-medium text-fg-muted"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Modules */}
            <section>
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-fg">
                  Modules
                </h2>
                <p className="text-sm text-fg-subtle">
                  {course.modules.length} modules · {totalLessons} lessons
                </p>
              </div>

              {course.modules.length === 0 ? (
                <p className="mt-4 text-fg-muted">Module breakdown is being finalised.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {course.modules.map((mod) => (
                    <details
                      key={mod.id}
                      className="group rounded-xl border border-border bg-surface/60 backdrop-blur-sm overflow-hidden"
                    >
                      <summary className="list-none cursor-pointer p-5 md:p-6 flex items-start gap-4 select-none">
                        <span className="font-mono tabular text-sm font-bold text-brand shrink-0 mt-0.5">
                          {String(mod.sort_order).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-semibold text-fg leading-tight">
                            {mod.title}
                          </h3>
                          {mod.summary && (
                            <p className="mt-1 text-sm text-fg-muted leading-relaxed">{mod.summary}</p>
                          )}
                        </div>
                        <span
                          aria-hidden="true"
                          className="mt-1 text-brand text-xl leading-none transition-transform group-open:rotate-45 shrink-0"
                        >
                          +
                        </span>
                      </summary>
                      {mod.lessons.length > 0 && (
                        <ol className="px-5 md:px-6 pb-5 md:pb-6 pt-1 space-y-2 list-none ml-9">
                          {mod.lessons.map((l, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-fg">{l.title}</p>
                                {l.summary && (
                                  <p className="mt-0.5 text-xs text-fg-muted leading-relaxed">{l.summary}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </details>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-28 self-start">
            <PremiumCard noLift highlight>
              <div className="p-6 md:p-7">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-brand">Course fee</p>
                <p className="mt-2 font-mono tabular text-4xl md:text-5xl font-extrabold text-fg leading-none">
                  {formatNgn(course.price_ngn)}
                </p>
                <p className="mt-2 text-sm text-fg-muted">Pay in full or in instalments.</p>

                <div className="mt-6 space-y-2.5">
                  <LinkButton href={`/enrol/${course.slug}`} fullWidth>
                    Enrol now
                  </LinkButton>
                  <a
                    href={`/api/academy/${course.slug}/syllabus.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface/70 text-sm font-semibold text-fg hover:bg-surface-hover transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download syllabus PDF
                  </a>
                </div>

                <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                  {course.duration_weeks && (
                    <div className="flex items-center justify-between">
                      <span className="text-fg-muted">Duration</span>
                      <span className="font-semibold text-fg">{course.duration_weeks} weeks</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Mode</span>
                    <span className="font-semibold text-fg">
                      {course.mode === 'hybrid' ? 'Online + Onsite' : course.mode}
                    </span>
                  </div>
                  {course.level && (
                    <div className="flex items-center justify-between">
                      <span className="text-fg-muted">Level</span>
                      <span className="font-semibold text-fg">{course.level}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Modules</span>
                    <span className="font-semibold text-fg">{course.modules.length}</span>
                  </div>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard noLift>
              <div className="p-6">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-brand-tint text-brand">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold text-fg">Hiring pipeline</h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">
                  Top capstone projects from each cohort are offered roles at Highscore Tech.
                </p>
                <Link
                  href="/about"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                >
                  How that works <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </PremiumCard>
          </aside>
        </div>
      </Reveal>

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <Reveal ambient={false} className="!py-16 md:!py-24">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
            Ready to enrol?
          </h2>
          <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">
            Sign up to lock your seat. Pay in full or set up an instalment plan at checkout.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href={`/enrol/${course.slug}`} size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Enrol in {course.title}
            </LinkButton>
            <LinkButton href="/academy" size="lg" variant="secondary">
              See all courses
            </LinkButton>
          </div>
        </div>
      </Reveal>
    </>
  );
}
