// About — company story, mission, team, values.

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Users, Lightbulb, Target, Heart } from 'lucide-react';
import { Reveal, SectionHeading } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';
import { listPublicTeam } from '@/lib/stats/team';

export const metadata: Metadata = {
  title: 'About — Highscore Tech',
  description:
    'Highscore Tech is a fully remote Nigerian AI & software development studio (CAC RC No. 7223102), building AI systems and software for clients worldwide.',
  alternates: { canonical: '/about' },
};

export const revalidate = 300;

const VALUES = [
  {
    icon: <Target className="h-5 w-5" />,
    title: 'Long-term over short-term',
    description: "We build things designed to last. Quick wins are a side-effect, not the strategy.",
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: 'Ship production code',
    description: 'We build things that go live and get used — real products for real clients, not demos.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Small, senior team',
    description: 'We stay deliberately small — every person owns real work and the outcome that comes with it.',
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: 'Honest about scope',
    description: "If we're not the right team for a project, we'll say so before you pay anything.",
  },
];

export default async function AboutPage() {
  const team = await listPublicTeam();
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pt-24 md:pt-36 pb-12 md:pb-20">
        <div className="mx-auto max-w-[920px] space-y-5">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">About Highscore Tech</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05] text-fg">
            A studio that builds — <br />and ships.
          </h1>
          <p className="text-lg md:text-xl text-fg-muted leading-relaxed max-w-3xl">
            Highscore Tech is a fully remote Nigerian AI &amp; software development studio based
            in Lagos, registered with the Corporate Affairs Commission (CAC RC No. 7223102). We
            build AI systems and ship software for organisations across Africa, Europe, and
            beyond — from AI integrations and custom models to full web and mobile products.
          </p>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-16 md:!py-24">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-20">
          <SectionHeading
            eyebrow="Our story"
            title="Built from the inside out."
          />
          <div className="space-y-5 text-base md:text-[17px] text-fg-muted leading-relaxed">
            <p>
              We started Highscore Tech with a simple belief: Africa has no shortage of
              talent — only a shortage of teams trusted to build and ship serious software
              for the rest of the world.
            </p>
            <p>
              So we built a studio that delivers real work to real clients — AI systems,
              web and mobile products — and treats every build as production, not a demo.
            </p>
            <p>
              Today we serve clients across the continent and beyond, shipping AI-powered
              products end to end. MyPoker is one of them.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Values ───────────────────────────────────────────────── */}
      <Reveal ambient={false} className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="What we believe"
          title="Four things we don't compromise on."
          align="center"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {VALUES.map((v) => (
            <PremiumCard key={v.title} className="h-full">
              <div className="p-6">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-brand-tint text-brand">
                  {v.icon}
                </span>
                <h3 className="mt-4 text-base font-semibold text-fg">{v.title}</h3>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">{v.description}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="The team"
          title="A small, deliberate team."
          description="We stay small on purpose — every person on the team owns real work and ships real things."
        />
        <div className="mt-10 md:mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {team.map((member) => (
            <PremiumCard key={member.name} className="h-full" noLift>
              <div className="p-5 md:p-6 flex flex-col items-center text-center">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="h-16 w-16 rounded-full object-cover shadow-[0_8px_24px_-4px_rgba(24,194,220,0.35)] border border-border"
                  />
                ) : (
                  <span
                    className="inline-flex items-center justify-center h-16 w-16 rounded-full text-bg font-extrabold text-lg shadow-[0_8px_24px_-4px_rgba(24,194,220,0.45)]"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)',
                    }}
                    aria-hidden="true"
                  >
                    {member.initials}
                  </span>
                )}
                <h3 className="mt-4 text-sm md:text-[15px] font-semibold text-fg leading-tight">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs text-fg-muted">{member.role}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <Reveal ambient={false} className="!py-20 md:!py-28">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
            Have a project in mind?
          </h2>
          <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">
            We'd love to hear about it — tell us what you're building and we'll come
            back with a clear path forward.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Get in touch
            </LinkButton>
            <Link
              href="/portfolio"
              className="inline-flex items-center text-sm font-semibold text-fg-muted hover:text-fg"
            >
              See our work →
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
