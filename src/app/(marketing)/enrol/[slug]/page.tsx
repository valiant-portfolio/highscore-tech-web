// Course enrolment + checkout — pick a pay plan, confirm, hand off to
// ALATPay. Auth-required; middleware bounces anon users to /login?next=…

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Clock, Shield } from 'lucide-react';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { EnrolPlanPicker } from '@/components/checkout/EnrolPlanPicker';
import { getCourseWithModules, formatNgn } from '@/lib/academy/queries';
import { getCurrentUser } from '@/lib/auth/queries';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseWithModules(slug);
  return {
    title: course ? `Enrol — ${course.title}` : 'Enrol — Highscore Tech',
    robots: { index: false, follow: false },
  };
}

export default async function EnrolPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/enrol/${slug}`);

  const course = await getCourseWithModules(slug);
  if (!course) notFound();

  return (
    <section className="relative px-4 md:px-8 pt-20 md:pt-28 pb-24">
      <div className="mx-auto max-w-[920px]">
        <Link
          href={`/academy/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Enrol</p>
          <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg leading-tight">
            {course.title}
          </h1>
          <p className="mt-3 text-base md:text-lg text-fg-muted leading-relaxed max-w-2xl">
            Pick a pay plan to confirm your seat. You'll be sent to ALATPay to complete the first payment.
          </p>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-10">
          {/* Plan picker */}
          <PremiumCard noLift>
            <div className="p-6 md:p-7">
              <h2 className="font-display text-xl md:text-2xl font-bold text-fg">Choose your pay plan</h2>
              <p className="mt-1 text-sm text-fg-muted">
                Full payment or split into 2 or 3 monthly instalments. The schedule is locked in once you pay the first installment.
              </p>
              <div className="mt-6">
                <EnrolPlanPicker
                  courseSlug={course.slug}
                  courseTitle={course.title}
                  totalNgn={course.price_ngn}
                />
              </div>
            </div>
          </PremiumCard>

          {/* Summary */}
          <aside className="space-y-4 lg:sticky lg:top-28 self-start">
            <PremiumCard noLift highlight>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-brand">Course fee</p>
                <p className="mt-2 font-mono tabular text-4xl font-extrabold text-fg leading-none">
                  {formatNgn(course.price_ngn)}
                </p>
                <div className="mt-5 border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Mode</span>
                    <span className="font-semibold text-fg">
                      {course.mode === 'hybrid' ? 'Online + Onsite' : course.mode}
                    </span>
                  </div>
                  {course.duration_weeks && (
                    <div className="flex items-center justify-between">
                      <span className="text-fg-muted">Duration</span>
                      <span className="font-semibold text-fg inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-fg-muted" />
                        {course.duration_weeks} weeks
                      </span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex items-center justify-between">
                      <span className="text-fg-muted">Level</span>
                      <span className="font-semibold text-fg">{course.level}</span>
                    </div>
                  )}
                </div>
              </div>
            </PremiumCard>

            <PremiumCard noLift>
              <div className="p-6">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-brand-tint text-brand">
                  <Shield className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-base font-semibold text-fg">Secured by ALATPay</h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">
                  Payments are processed by WEMA Bank's ALATPay gateway. We never see your card details.
                </p>
              </div>
            </PremiumCard>
          </aside>
        </div>
      </div>
    </section>
  );
}
