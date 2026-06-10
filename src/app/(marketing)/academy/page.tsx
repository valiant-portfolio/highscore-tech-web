// Academy — public catalog with level / mode / sort filters.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, Briefcase, Clock, GraduationCap,
  Lightbulb, Users,
} from 'lucide-react';
import { Reveal, SectionHeading } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';
import { listCourses, formatNgn, type Course } from '@/lib/academy/queries';
import JsonLd from '@/components/seo/JsonLd';
import { academySchema } from '@/components/seo/structured-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export const metadata: Metadata = {
  title: 'Academy — Highscore Tech',
  description:
    'Train in Frontend, Backend, Full stack, Python, React Native, or Python ML/AI at Highscore Tech Academy. Online + offline cohorts, instalment plans, and a hiring pipeline.',
  alternates: { canonical: '/academy' },
};

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ level?: string; mode?: string; sort?: string }>;
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const MODES  = ['hybrid', 'online', 'offline'] as const;

function applyFilters(
  courses: Course[],
  filters: { level?: string; mode?: string; sort?: string },
): Course[] {
  let out = [...courses];
  if (filters.level && LEVELS.includes(filters.level)) {
    out = out.filter((c) => c.level === filters.level);
  }
  if (filters.mode && (MODES as readonly string[]).includes(filters.mode)) {
    out = out.filter((c) => c.mode === filters.mode);
  }
  switch (filters.sort) {
    case 'price_asc':  out.sort((a, b) => a.price_ngn - b.price_ngn); break;
    case 'price_desc': out.sort((a, b) => b.price_ngn - a.price_ngn); break;
    case 'duration':   out.sort((a, b) => (a.duration_weeks ?? 99) - (b.duration_weeks ?? 99)); break;
    default:           /* keep DB sort_order */ break;
  }
  return out;
}

const WHY = [
  { icon: <Briefcase className="h-5 w-5" />, title: 'We hire from our cohorts',
    description: 'Top graduates skip the job market entirely — they join Highscore Tech.' },
  { icon: <BookOpen className="h-5 w-5" />,  title: 'Same stack we ship on',
    description: 'What you learn is what we use in production. No textbook detours.' },
  { icon: <Users className="h-5 w-5" />,     title: 'Online or onsite',
    description: 'Pick a hybrid mode that fits your life. The cohort moves at one pace.' },
  { icon: <Lightbulb className="h-5 w-5" />, title: 'Pay in instalments',
    description: 'Spread the fee across the cohort — your profile tracks every payment.' },
];

const FAQS = [
  { q: 'Do I need any prior experience?',
    a: 'For Frontend and Python, no — we start from first principles. For Backend, Full stack, React Native, and Python ML/AI you should be comfortable with at least one programming language and the basics of Git.' },
  { q: 'How long does each course take?',
    a: 'Most courses run 10–16 weeks depending on depth. Each course page lists the exact duration.' },
  { q: 'Is there an instalment plan?',
    a: 'Yes. At checkout you can pay the full fee or split it across the cohort. Your profile tracks every instalment.' },
  { q: 'What does "we hire our students" actually mean?',
    a: 'Every cohort ends with a capstone judged by Highscore Tech engineers. Standouts get offered roles inside the studio — same stack, same engineers.' },
];

function FilterPill({
  href, label, active,
}: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`inline-flex h-8 items-center px-3 rounded-full text-xs font-semibold transition-colors ${
        active
          ? 'bg-brand text-brand-fg'
          : 'border border-border bg-surface/60 text-fg-muted hover:text-fg hover:bg-surface-hover'
      }`}
    >
      {label}
    </Link>
  );
}

function buildHref(current: { level?: string; mode?: string; sort?: string }, patch: Partial<{ level?: string; mode?: string; sort?: string }>): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...patch };
  if (merged.level) params.set('level', merged.level);
  if (merged.mode)  params.set('mode',  merged.mode);
  if (merged.sort)  params.set('sort',  merged.sort);
  const qs = params.toString();
  return `/academy${qs ? `?${qs}` : ''}#courses`;
}

export default async function AcademyPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filters = { level: sp.level, mode: sp.mode, sort: sp.sort };

  const all = await listCourses();
  const courses = applyFilters(all, filters);

  return (
    <>
      <JsonLd data={academySchema(SITE_URL)} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden px-4 md:px-8 pt-28 md:pt-40 pb-16 md:pb-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 30%, color-mix(in srgb, #18C2DC 18%, transparent) 0%, transparent 70%)',
          }}
        />
        <div className="mx-auto max-w-[1180px] text-center space-y-5">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-tint/40 border border-brand/20 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand backdrop-blur-sm">
            <GraduationCap className="h-3.5 w-3.5" />
            Highscore Tech Academy
          </p>
          <h1 className="font-display text-[44px] sm:text-6xl md:text-7xl lg:text-[88px] font-extrabold tracking-[-0.035em] leading-[1.02] text-fg">
            We train engineers.<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #6CE8FA 0%, #18C2DC 60%, #0A8EA8 100%)' }}>
              We hire the best of them.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-fg-muted leading-relaxed">
            Six courses across the modern web, mobile, and machine-learning stack.
            Online or onsite. Pay in full or in instalments.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="#courses" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Browse {all.length} courses
            </LinkButton>
            <LinkButton href="/signup" size="lg" variant="secondary">
              Enrol
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── Why study with us ────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="Why study with us"
          title="Four reasons this is different."
          align="center"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {WHY.map((w) => (
            <PremiumCard key={w.title} className="h-full">
              <div className="p-6">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-brand-tint text-brand">
                  {w.icon}
                </span>
                <h3 className="mt-4 text-base font-semibold text-fg">{w.title}</h3>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">{w.description}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── Courses + filters ────────────────────────────────────── */}
      <Reveal ambient={false} id="courses" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="Courses"
          title={<>Pick the track that fits your goal.</>}
          description="Filter by level, mode, or sort by price to find what you need."
        />

        {/* Filter bar */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mr-2">Level</span>
            <FilterPill href={buildHref(filters, { level: undefined })} label="All" active={!filters.level} />
            {LEVELS.map((l) => (
              <FilterPill key={l} href={buildHref(filters, { level: l })} label={l} active={filters.level === l} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mr-2">Mode</span>
            <FilterPill href={buildHref(filters, { mode: undefined })} label="All" active={!filters.mode} />
            <FilterPill href={buildHref(filters, { mode: 'hybrid' })} label="Hybrid" active={filters.mode === 'hybrid'} />
            <FilterPill href={buildHref(filters, { mode: 'online' })} label="Online" active={filters.mode === 'online'} />
            <FilterPill href={buildHref(filters, { mode: 'offline' })} label="Onsite" active={filters.mode === 'offline'} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mr-2">Sort</span>
            <FilterPill href={buildHref(filters, { sort: undefined })} label="Recommended" active={!filters.sort} />
            <FilterPill href={buildHref(filters, { sort: 'price_asc' })}  label="Price ↑"   active={filters.sort === 'price_asc'} />
            <FilterPill href={buildHref(filters, { sort: 'price_desc' })} label="Price ↓"   active={filters.sort === 'price_desc'} />
            <FilterPill href={buildHref(filters, { sort: 'duration' })}   label="Duration"  active={filters.sort === 'duration'} />
          </div>
          <p className="text-xs text-fg-subtle">
            {courses.length === all.length
              ? `Showing all ${all.length} courses.`
              : `${courses.length} of ${all.length} courses match your filters.`}
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="mt-16 mx-auto max-w-[640px] text-center">
            <BookOpen className="h-10 w-10 mx-auto text-fg-subtle" />
            <p className="mt-4 text-fg-muted">No courses match those filters.</p>
            <Link href="/academy" scroll={false} className="mt-3 inline-flex text-sm font-semibold text-brand hover:underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {courses.map((c) => (
              <PremiumCard key={c.id} href={`/academy/${c.slug}`} className="h-full">
                <div className="p-6 md:p-7 flex flex-col h-full">
                  <div className="flex items-center gap-2">
                    {c.level && (
                      <span className="inline-flex h-6 items-center px-2 rounded-md bg-brand-tint text-brand text-[11px] font-semibold uppercase tracking-wider">
                        {c.level}
                      </span>
                    )}
                    <span className="inline-flex h-6 items-center px-2 rounded-md border border-border text-fg-muted text-[11px] font-medium uppercase tracking-wider">
                      {c.mode === 'hybrid' ? 'Online + Onsite' : c.mode}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl md:text-2xl font-bold text-fg group-hover:text-brand transition-colors tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm text-fg-muted leading-relaxed flex-1">
                    {c.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Fee</p>
                      <p className="mt-0.5 text-lg font-mono tabular font-extrabold text-fg">{formatNgn(c.price_ngn)}</p>
                    </div>
                    {c.duration_weeks && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Duration</p>
                        <p className="mt-0.5 text-sm font-semibold text-fg inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-fg-muted" />
                          {c.duration_weeks} weeks
                        </p>
                      </div>
                    )}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    See modules <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </Reveal>

      {/* ── How it works ─────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From enrol to hired in four steps."
          align="center"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { n: '01', title: 'Enrol', body: 'Pick a course, choose your mode, pay in full or set up an instalment plan.' },
            { n: '02', title: 'Learn',  body: 'Live cohorts with weekly office hours. Build real things from week one.' },
            { n: '03', title: 'Build',  body: 'Capstone shipped at the end — your own product, your own code.' },
            { n: '04', title: 'Get hired', body: 'Top capstones earn an offer from Highscore Tech.' },
          ].map((s) => (
            <PremiumCard key={s.n} className="h-full">
              <div className="p-6">
                <p className="font-mono tabular text-3xl font-extrabold text-brand">{s.n}</p>
                <h3 className="mt-3 text-base font-semibold text-fg">{s.title}</h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{s.body}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <Reveal ambient={false} className="!py-16 md:!py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
          <SectionHeading
            eyebrow="FAQ"
            title="Common questions."
            description="Anything missing? The contact page reaches us directly."
          />
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-surface/60 backdrop-blur-sm overflow-hidden"
              >
                <summary className="list-none cursor-pointer p-5 md:p-6 flex items-start justify-between gap-4 select-none">
                  <span className="font-semibold text-fg">{f.q}</span>
                  <span aria-hidden="true" className="mt-1 text-brand text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-2 text-fg-muted leading-relaxed text-[15px]">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-20 md:!py-32">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
            Ready to start?
          </h2>
          <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">
            Create an account, pick a course, and we'll guide you the rest of the way.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/signup" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Sign up
            </LinkButton>
            <Link href="/contact" className="inline-flex items-center text-sm font-semibold text-fg-muted hover:text-fg">
              Or talk to us first →
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
