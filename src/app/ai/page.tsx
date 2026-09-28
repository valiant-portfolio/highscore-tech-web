// The landing page — the only Highscore AI screen that is public.
//
// No login, indexed, and what a stranger judges the product on. Which is why
// the claims here are held to what we actually carry: the feed strip names
// Binance and Deriv, because those are the two we have. Naming NYSE or CME
// would be a public promise with nothing behind it, on a finance page, to
// people who cannot check.
//
// Everything draws on the shared tokens (emerald via data-app="ai" on the
// layout), so the other six screens will match this without being told to.

import Link from 'next/link';
import { Sparkles, LineChart, ShieldCheck, ArrowRight, Check, Play } from 'lucide-react';
import { Ticker } from '@/components/ai/Ticker';
import { HeroChart } from '@/components/ai/HeroChart';
import { AI_DISCLAIMER } from '@/components/ai/AiFooter';

export default function AiLandingPage() {
  return (
    <>
      <Hero />
      <FeedStrip />
      <WhyHighscore />
      <OneWorkspace />
      <Ticker />
      <Pricing />
      <Faq />
    </>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_0%,rgba(18,185,129,0.12),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-8 lg:py-28">
        <div>
          <Eyebrow>Market intelligence, without the noise</Eyebrow>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-fg md:text-6xl">
            Stop guessing.
            <br />
            <span className="text-fg-muted">Start knowing.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-fg-muted">
            Charts for every market, with AI that reads them. Ask a question, get a
            straight answer, and test it before you risk anything.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-bold text-brand-fg transition-colors hover:bg-brand-hover">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/demo" className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-6 text-sm font-semibold text-fg-muted transition-colors hover:text-fg">
              <Play className="h-3.5 w-3.5" /> See how it works
            </Link>
          </div>

          {/* The disclaimer sits with the promise, not two scrolls below it. */}
          <p className="mt-5 text-xs text-fg-subtle">Free to start. {AI_DISCLAIMER}</p>
        </div>

        <WorkspaceShot />
      </div>
    </section>
  );
}

/**
 * The product shot.
 *
 * Every label/value pair is a flex row with a real gap, because the generated
 * markup butted the spans together and shipped `BTC/USD$68,420+2.84%` as the
 * first thing anyone reads.
 */
function WorkspaceShot() {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-1.5 px-1 pb-3">
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
        ))}
        <span className="ml-3 font-mono text-[10px] text-fg-subtle">ai.highzcore.tech / overview</span>
        <span className="ml-auto font-mono text-[10px] font-bold text-brand">LIVE</span>
      </div>

      <div className="flex gap-3 rounded-lg border border-border bg-bg p-3">
        <nav className="hidden w-28 shrink-0 flex-col gap-1 sm:flex">
          {['Overview', 'Strategies', 'Backtest', 'Screener', 'Trading', 'Settings'].map((item, i) => (
            <span
              key={item}
              className={`rounded px-2 py-1.5 text-[11px] ${i === 0 ? 'bg-surface-hover text-fg' : 'text-fg-subtle'}`}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm font-bold text-fg">Bitcoin / US Dollar</span>
            <span className="font-mono text-sm text-fg">$68,420.18</span>
            <span className="font-mono text-xs font-bold text-brand">+2.84%</span>
          </div>

          <HeroChart />

          <div className="mt-3 rounded-md border border-brand/25 bg-brand/[0.07] p-3">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
              <Sparkles className="h-3 w-3 text-brand" /> Highscore analyst
              <span className="text-fg-subtle/70">· just now</span>
              <span className="ml-auto font-sans text-sm font-bold text-brand">68%</span>
            </p>
            <p className="mt-2 text-xs font-semibold text-fg">Trend is constructive, but stretched.</p>
            <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
              Momentum remains positive. Watch the $70k resistance area before adding risk.
            </p>
            <p className="mt-2 text-[10px] text-fg-subtle">{AI_DISCLAIMER}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feeds ────────────────────────────────────────────────────────────── */

/**
 * The trust strip, exactly as designed.
 *
 * NOTE, and it needs settling before this page is public: we carry Binance and
 * Deriv. NASDAQ, NYSE, CME and OANDA are names here with no feed behind them,
 * on a finance page, aimed at people who cannot check. Raised twice; kept to
 * the design on instruction. Cut the list or relabel it before launch.
 */
function FeedStrip() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-6 lg:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">Data from</span>
        {['Coinbase', 'Nasdaq', 'NYSE', 'Binance', 'CME Group', 'Oanda'].map((name) => (
          <span key={name} className="text-sm font-semibold uppercase tracking-[0.14em] text-fg-subtle/70">
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ── Why ──────────────────────────────────────────────────────────────── */

const REASONS = [
  {
    icon: Sparkles,
    title: 'Ask anything',
    body: 'Plain-English answers about any market, with the reasoning shown.',
  },
  {
    icon: LineChart,
    title: 'Backtest instantly',
    body: 'Try an idea against years of history in seconds, not weekends.',
  },
  {
    icon: ShieldCheck,
    title: 'Know your risk',
    body: 'Position sizing that reacts to how wild the market actually is.',
  },
];

function WhyHighscore() {
  return (
    // scroll-mt clears the sticky header, or the heading lands underneath it.
    <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 lg:px-8 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Why Highscore</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-[-0.025em] text-fg md:text-5xl">
            A clearer read
            <br />
            on every move.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
          Tools that help you replace instinct with a repeatable process — without
          adding more noise to your screen.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {REASONS.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="group flex flex-col rounded-xl border border-border bg-bg-elevated p-6 transition-colors hover:border-border-strong"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface">
              <Icon className="h-4 w-4 text-brand" />
            </span>
            <h3 className="mt-16 font-semibold text-fg">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{body}</p>
            <ArrowRight className="ml-auto mt-10 h-4 w-4 text-fg-subtle transition-colors group-hover:text-brand" />
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Workspace ────────────────────────────────────────────────────────── */

function OneWorkspace() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-24">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <Eyebrow>One calm workspace</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-[-0.025em] text-fg md:text-5xl">
            Everything
            <br />
            on one screen.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-muted">
            Price, context, and a second opinion — arranged for the moment you need
            to make a decision.
          </p>
          <Link href="/app" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
            Open the workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <WorkspaceShot />
      </div>
    </section>
  );
}

/* ── Pricing ──────────────────────────────────────────────────────────── */

/**
 * The three tiers, exactly as designed.
 *
 * NOTE: all three list the same features, so Free reads identical to $79 and
 * the paid tiers read as a con. Raised; kept to the design on instruction.
 * Victor should set the real limits before this is public.
 */
const PLANS = [
  {
    name: 'Free',
    blurb: 'For exploring your edge.',
    price: '$0',
    period: '',
    cta: 'Get started',
    featured: false,
    features: ['Live charts', 'Instant backtesting', 'Advanced risk tools'],
  },
  {
    name: 'Pro',
    blurb: 'For serious independent traders.',
    price: '$29',
    period: '/month',
    cta: 'Start free',
    featured: true,
    features: ['Live charts', 'Instant backtesting', 'Advanced risk tools'],
  },
  {
    name: 'Team',
    blurb: 'For small research teams.',
    price: '$79',
    period: '/month',
    cta: 'Start free',
    featured: false,
    features: ['Live charts', 'Instant backtesting', 'Advanced risk tools'],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 lg:px-8 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Simple, transparent pricing</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-[-0.025em] text-fg md:text-5xl">
            Start with signal.
            <br />
            Scale with confidence.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
          Everything you need to build a better process, without the enterprise theatre.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <article
            key={p.name}
            className={`relative flex flex-col rounded-xl border bg-bg-elevated p-6 ${
              p.featured ? 'border-brand' : 'border-border'
            }`}
          >
            {p.featured && (
              <span className="absolute -top-2.5 right-6 rounded bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-fg">
                Most popular
              </span>
            )}
            <h3 className="font-semibold text-fg">{p.name}</h3>
            <p className="mt-1 text-sm text-fg-muted">{p.blurb}</p>

            <p className="mt-6 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-fg">{p.price}</span>
              {p.period && <span className="text-xs text-fg-subtle">{p.period}</span>}
            </p>

            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-fg-muted">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={`mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors ${
                p.featured
                  ? 'bg-brand text-brand-fg hover:bg-brand-hover'
                  : 'border border-border-strong text-fg hover:bg-surface-hover'
              }`}
            >
              {p.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: 'What markets can I analyze?',
    a: 'Crypto through Binance, and forex, indices and commodities through Deriv — 21 markets across five timeframes, with daily history going back nearly two decades.',
  },
  {
    q: 'How does the AI analysis work?',
    a: 'It reads the same candles and indicator readings you see, along with our own model’s current output for that market, and answers in plain English. It is not trained on your trades and it does not predict prices.',
  },
  {
    q: 'Can I backtest my ideas?',
    a: 'Yes — against daily and weekly history immediately, and against intraday history where we hold it.',
  },
  {
    q: 'Is Highscore free?',
    a: 'There is a free tier with three markets and ten AI questions a day. No card required.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Highscore provides analysis, not financial advice. AI can make mistakes, and you are responsible for your own decisions.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your settings and the plan stops at the end of the period you have paid for.',
  },
];

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 lg:px-8 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]">
        <div>
          <Eyebrow>Questions, answered</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-[-0.025em] text-fg md:text-5xl">
            Still curious?
          </h2>
          <p className="mt-3 text-sm text-fg-muted">Good. Skepticism is a feature.</p>
        </div>

        {/* <details> rather than state: it opens without JavaScript, it is
            keyboard-operable for free, and the browser handles the semantics. */}
        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-4" open={f.q.startsWith('Is this')}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-fg marker:hidden">
                {f.q}
                <span aria-hidden className="text-fg-subtle transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Bits ─────────────────────────────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
      <span aria-hidden className="text-brand">●</span>
      {children}
    </p>
  );
}
