// Services — the studio's commercial offer. Three tracks (AI dev,
// software dev, product strategy) explained with what each engagement
// looks like, what you get, and how we work.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Bot, Code2, Compass, Layers,
  Briefcase, Clock, FileSearch, GitBranch, Handshake, Rocket,
  ShieldCheck, Sparkles, Target, Users, CheckCircle2,
} from 'lucide-react';
import { Reveal, SectionHeading } from '@/components/marketing/sections';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Services — Highscore Tech',
  description:
    'AI development, custom software delivery, and product strategy from a Nigeria-based studio serving clients globally. Senior delivery without the senior overhead.',
  alternates: { canonical: '/services' },
};

export const revalidate = 300;

// ── The three service tracks ─────────────────────────────────────────────
const TRACKS = [
  {
    id: 'ai',
    icon: <Bot className="h-6 w-6" />,
    eyebrow: 'Track 1',
    title: 'AI development',
    blurb:
      'From integrating a single model into an existing product to designing multi-agent systems and RAG pipelines from scratch.',
    whatWeDo: [
      'Model selection, prompt engineering, and evaluation harnesses',
      'RAG pipelines on your own data — chunking, embeddings, hybrid retrieval',
      'Multi-agent workflows with tool use, structured outputs, and guardrails',
      'AI integration into existing web, mobile, and back-office systems',
      'Cost / latency / accuracy tradeoffs measured before we recommend',
    ],
    typicalEngagement:
      '4 – 16 weeks. Starts with a 2-week discovery and a written architecture brief; delivery in fortnightly milestones with a live demo at the end of each.',
    bestFor:
      "Teams that know AI should be part of their product but haven't found a partner who can engineer it past a demo.",
  },
  {
    id: 'software',
    icon: <Code2 className="h-6 w-6" />,
    eyebrow: 'Track 2',
    title: 'Software development',
    blurb:
      "Full web and mobile builds in the modern stack we use internally — Next.js, React Native, TypeScript, and Postgres. No agency hand-offs to junior teams.",
    whatWeDo: [
      'Greenfield web apps (Next.js + Supabase + Tailwind)',
      'Mobile apps (React Native, Expo, App Store / Play Store delivery)',
      'API design, payments integration, auth flows',
      'Performance, accessibility, and SEO audits with concrete fixes',
      'Existing-codebase rescue: refactor without rewrite',
    ],
    typicalEngagement:
      '6 – 24 weeks. Fixed scope or time-and-materials. Source code is yours from day one — pushed to your GitHub, not ours.',
    bestFor:
      'Founders shipping a v1, product teams needing extra senior bandwidth for a quarter, or operators replacing a legacy system without downtime.',
  },
  {
    id: 'strategy',
    icon: <Compass className="h-6 w-6" />,
    eyebrow: 'Track 3',
    title: 'Product strategy',
    blurb:
      "Discovery, scoping, and delivery planning. We help you decide what to build before we help you build it — so you don't waste a quarter on the wrong thing.",
    whatWeDo: [
      'Discovery workshops with stakeholders + users',
      'Scope reduction — what to ship in v1, what to defer, what to cut',
      'Technical due diligence on existing codebases',
      'Hiring plans for your own engineering team',
      'Written architecture briefs you can hand to any vendor',
    ],
    typicalEngagement:
      '2 – 6 weeks. Output is a written brief + roadmap + estimated budget. Optional: a working prototype that proves the riskiest assumption.',
    bestFor:
      'Founders pre-build, CTOs deciding whether to refactor or rebuild, and teams that have hired a vendor before and felt the scope drift.',
  },
];

// ── How we work — process steps ──────────────────────────────────────────
const PROCESS = [
  {
    n: '01',
    icon: <FileSearch className="h-4 w-4" />,
    title: 'Discovery',
    body: "Two weeks talking to your team and users. We come back with a written brief: what we'll build, what we won't, what we're betting on.",
  },
  {
    n: '02',
    icon: <Target className="h-4 w-4" />,
    title: 'Scope & estimate',
    body: 'Fixed scope or time-and-materials, your call. Milestone-based payment so you only release the next tranche when the previous one ships.',
  },
  {
    n: '03',
    icon: <GitBranch className="h-4 w-4" />,
    title: 'Build',
    body: "Two-week sprints. Live demo at the end of every sprint. Your team has access to our GitHub from day one — there's no hidden codebase.",
  },
  {
    n: '04',
    icon: <Rocket className="h-4 w-4" />,
    title: 'Ship',
    body: "Production deploy, monitoring set up, and a written runbook your team can follow. We're available for 30 days post-launch at no extra cost.",
  },
  {
    n: '05',
    icon: <Handshake className="h-4 w-4" />,
    title: 'Handover or stay',
    body: "Once it's running, you decide. Some clients take the code and run it themselves. Others keep us on retainer for ongoing development.",
  },
];

// ── Engagement models ────────────────────────────────────────────────────
const MODELS = [
  {
    title: 'Fixed scope',
    description: "You know what you want built. We agree the scope, the price, and the timeline up front. Best for greenfield projects with a clear v1.",
    payment: 'Milestone-based — 4 or 5 tranches across the project.',
  },
  {
    title: 'Time & materials',
    description: 'You have a moving target or want flexibility. We bill weekly against an agreed rate card. Best for evolving products or quarterly engagements.',
    payment: 'Weekly invoicing, monthly true-up.',
  },
  {
    title: 'Embedded engineer',
    description: "One of our senior engineers joins your team for a defined block — usually a quarter — works in your tooling, attends your standups. You manage their week.",
    payment: 'Monthly retainer.',
  },
  {
    title: 'Strategy sprint',
    description: 'Short, fixed engagement: 2 – 6 weeks of discovery + scoping. Output is a written brief and budget you can use with any vendor, including us.',
    payment: 'Fixed fee, paid 50/50 at start and end.',
  },
];

// ── Why us — differentiators ─────────────────────────────────────────────
const WHY_US = [
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Senior delivery, every engagement',
    body: 'No agency two-step where a partner sells and juniors build. The same engineers on the discovery call are the ones writing the code.',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'AI is core, not a buzzword',
    body: "We've shipped production AI systems — agents, RAG, fine-tuned classifiers. We know which problems AI solves and which it just complicates.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Your code, your repo, day one',
    body: 'Every commit goes to your GitHub. No vendor lock-in, no "we host the code and license it back to you" tricks. You own what we build.',
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'We say no when we should',
    body: "If your project doesn't fit our skill set or budget, we'll tell you in the first call — and refer you to someone who does. Wasted quarters are nobody's win.",
  },
];

// ── FAQ ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What does an engagement cost?',
    a: 'Strategy sprints typically start around ₦8m. Build projects vary widely with scope — a focused v1 mobile app might be ₦25 – 40m; a complete AI integration into an enterprise platform can run higher. Discovery calls are free.',
  },
  {
    q: 'How small a project will you take on?',
    a: "We've taken on focused 2-week strategy sprints and 12-month enterprise builds. The minimum isn't size — it's clarity of problem. A clear small project beats an unclear big one.",
  },
  {
    q: 'Do you work with clients outside Nigeria?',
    a: "Yes. Our active clients span Africa, Europe, and the US. We work in your timezone for live calls and use async writing (Linear, Loom, written briefs) for the rest.",
  },
  {
    q: 'Will you sign an NDA?',
    a: 'Yes — standard mutual NDA, signed before discovery starts. We work under NDA for most engagements.',
  },
  {
    q: "What happens if we're not happy?",
    a: "Either side can walk after any milestone. If you cancel mid-milestone, you owe pro-rata for work already shipped. Code shipped is code you keep. We don't hold codebases hostage.",
  },
  {
    q: 'Can your academy graduates work on our project?',
    a: "Top academy graduates sometimes join engagements as junior engineers, supervised by a senior. We're transparent about who's on your team and at what level — and the senior owns the outcome regardless.",
  },
];

export default function ServicesPage() {
  return (
    <>
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
        <div className="mx-auto max-w-[1180px]">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Services</p>
          <h1 className="mt-3 font-display text-[44px] sm:text-6xl md:text-7xl lg:text-[88px] font-extrabold tracking-[-0.035em] leading-[1.02] text-fg max-w-[900px]">
            Senior delivery,<br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #6CE8FA 0%, #18C2DC 60%, #0A8EA8 100%)',
              }}
            >
              without the senior overhead.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-fg-muted leading-relaxed">
            We build AI systems and software for organisations from Nigeria, serving
            clients worldwide. Three tracks — AI development, custom software,
            product strategy — each engagement led by the same engineers who'll write
            the code.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/contact" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start a project
            </LinkButton>
            <LinkButton href="#tracks" size="lg" variant="secondary">
              See the three tracks
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── Three tracks ─────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" id="tracks" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="What we do"
          title="Three tracks. Pick the one that fits."
          description="An engagement usually maps cleanly to one of these — and sometimes spans two when an AI build needs a fresh app to live in."
          align="center"
        />
        <div className="mt-10 md:mt-14 space-y-6">
          {TRACKS.map((t) => (
            <PremiumCard key={t.id} className="!group" noLift>
              <div className="p-6 md:p-10 grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
                <div>
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-brand-tint text-brand">
                    {t.icon}
                  </span>
                  <p className="mt-5 text-xs uppercase tracking-[0.18em] font-semibold text-brand">
                    {t.eyebrow}
                  </p>
                  <h3 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-fg">
                    {t.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-[15px] text-fg-muted leading-relaxed">
                    {t.blurb}
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-3">
                      What we do
                    </p>
                    <ul className="space-y-2">
                      {t.whatWeDo.map((line) => (
                        <li key={line} className="flex items-start gap-2 text-sm md:text-[15px] text-fg-muted leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-border">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
                        Typical engagement
                      </p>
                      <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{t.typicalEngagement}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
                        Best for
                      </p>
                      <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{t.bestFor}</p>
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── Process ──────────────────────────────────────────────── */}
      <Reveal ambient={false} className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="How we work"
          title="From first call to shipped product."
          description="Same process whether the engagement is a 2-week strategy sprint or a 6-month build."
          align="center"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {PROCESS.map((step) => (
            <PremiumCard key={step.n} className="h-full" noLift>
              <div className="p-6 flex flex-col h-full">
                <p className="font-mono tabular text-3xl font-extrabold text-brand">{step.n}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] font-bold text-fg-subtle">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-brand-tint text-brand">
                    {step.icon}
                  </span>
                  {step.title}
                </div>
                <p className="mt-3 text-sm text-fg-muted leading-relaxed flex-1">{step.body}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── Engagement models ────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="Engagement models"
          title="Pick the commercial shape that suits you."
          description="We're flexible on structure — what we won't flex on is staffing it with the senior engineers we promised."
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {MODELS.map((m) => (
            <PremiumCard key={m.title} className="h-full" noLift>
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-brand-tint text-brand">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <h3 className="text-lg md:text-xl font-semibold text-fg">{m.title}</h3>
                </div>
                <p className="mt-3 text-sm md:text-[15px] text-fg-muted leading-relaxed">{m.description}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-mono text-fg-subtle">
                  <Clock className="h-3 w-3" />
                  {m.payment}
                </p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── Why us ───────────────────────────────────────────────── */}
      <Reveal ambient={false} className="!py-16 md:!py-24">
        <SectionHeading
          eyebrow="Why us"
          title="Four things that make us different."
          align="center"
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {WHY_US.map((w) => (
            <PremiumCard key={w.title} className="h-full" noLift>
              <div className="p-6 md:p-7 flex gap-5">
                <span className="inline-flex items-center justify-center h-12 w-12 shrink-0 rounded-md bg-brand-tint text-brand">
                  {w.icon}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-fg">{w.title}</h3>
                  <p className="mt-2 text-sm md:text-[15px] text-fg-muted leading-relaxed">{w.body}</p>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      {/* ── Portfolio cross-link ─────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-16 md:!py-24">
        <div className="grid lg:grid-cols-[1fr_440px] gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Proof, not promises</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
              See what we've shipped.
            </h2>
            <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed max-w-xl">
              Case studies of real client work — AI support copilots, mobile commerce,
              clinical triage tools, school management platforms. The proof is in the
              products.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/portfolio" leftIcon={<Layers className="h-4 w-4" />}>
                Browse portfolio
              </LinkButton>
              <LinkButton href="/about" variant="secondary">
                Meet the team
              </LinkButton>
            </div>
          </div>

          <PremiumCard className="h-full" highlight>
            <div className="p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">
                What you walk away with
              </p>
              <ul className="mt-5 space-y-4 text-sm md:text-[15px] text-fg-muted">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>Production code in your repo, not ours</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>Written runbook your team can follow</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>30 days of post-launch support, no extra cost</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>Monitoring + alerts wired before we hand over</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>An option to retain us, never an obligation</span>
                </li>
              </ul>
            </div>
          </PremiumCard>
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
                  <span aria-hidden="true" className="mt-1 text-brand text-xl leading-none transition-transform group-open:rotate-45">
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

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <Reveal ambient="brand-soft" className="!py-20 md:!py-32">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.025em] leading-[1.08] text-fg">
            Tell us about your project.
          </h2>
          <p className="mt-4 text-base md:text-lg text-fg-muted leading-relaxed">
            One-paragraph email, one short call. If we're a fit, we'll come back with
            a written brief and a budget. If we're not, we'll say so on the call.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start a project
            </LinkButton>
            <Link href="/portfolio" className="inline-flex items-center text-sm font-semibold text-fg-muted hover:text-fg">
              Or see our work first →
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}
