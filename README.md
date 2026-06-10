# Highzcore

A creator-growth platform for YouTube creators. Real audiences, honest
data, real growth. Built on a Telegram-native + web stack.

Four products, one platform:

- **Audience Insights** — real people in your target demographic watch your
  video and answer structured questions before you publish.
- **Thumbnail & Title A/B Testing** — click-test 2–4 variants with statistical
  confidence in under an hour.
- **Promote** — workers with verified follower counts share your video to
  their real audiences on 7 platforms, UTM-tracked.
- **Collab Matchmaking** — creator-to-creator partnerships with two-sided
  escrow.

The web app and the Telegram mini-app share the same backend, the same
account, and the same dashboards.

## Stack

- **Next.js 16.2.4** (App Router, Turbopack, Server Actions)
- **TypeScript 5** strict mode
- **Tailwind v4**
- **Supabase** — Postgres 15 + Auth + Storage + Row-Level Security
- **grammy** — Telegram bot framework
- **Framer Motion** — micro-animations + scroll-driven reveals
- **lucide-react** — icons
- **Netlify** — deploy target

## Project structure

```
src/
├── app/                   # Next.js App Router pages
│   ├── (marketing)        # Public marketing routes (/, /products/*, /pricing, etc.)
│   ├── (auth flow)        # /signup, /login, /onboarding, /post-login
│   ├── (legal/trust)      # /privacy, /terms, /refund-policy, …
│   ├── creator/           # Authed creator dashboard
│   ├── worker/            # Authed worker dashboard
│   ├── admin/             # Admin dashboard
│   ├── api/               # Server routes (telegram webhook, cron, verify-channel)
│   └── auth/              # OAuth callback + password reset
├── components/
│   ├── marketing/         # Public-page primitives (Header, Footer, Hero, etc.)
│   ├── shells/            # Authed-page layouts (Creator / Worker / Admin)
│   ├── ui/                # Shared design-system primitives (Button, Card, …)
│   ├── insights/          # Audience Insights product UI
│   ├── abtest/            # AB Test product UI
│   ├── promote/           # Promote product UI
│   ├── collab/            # Collab product UI
│   ├── admin/             # Admin-specific UI
│   ├── auth/              # Sign-up / login forms
│   ├── onboarding/        # Wizard primitives
│   ├── creator/           # Creator-side shared bits
│   ├── worker/            # Worker-side shared bits
│   ├── brand/             # Logo
│   ├── seo/               # JsonLd + structured-data builders
│   ├── theme/             # Theme provider + toggles
│   └── telegram/          # Mini-app helpers (auto-link, signup button)
└── lib/
    ├── supabase/          # Browser + server + service clients + Database types
    ├── auth/              # Auth server actions
    ├── creator/           # Creator queries
    ├── worker/            # Worker queries + actions
    ├── admin/             # Admin queries + actions + audit
    ├── insights/          # Insights pricing + actions + queries
    ├── abtest/            # AB test pricing + statistics + actions
    ├── promote/           # Promote pricing + UTM + actions
    ├── collab/            # Collab pricing + actions + queries
    ├── notifications/     # Template render + queue + dispatch
    ├── telegram/          # Bot + webapp helpers + initData verify
    ├── youtube/           # Channel + video metadata helpers
    ├── storage/           # Supabase Storage upload helper
    ├── onboarding/        # Shared option catalogs
    └── motion.ts, utils.ts
```

## Local dev

```bash
npm install
cp .env.example .env.local    # then fill in the values per LAUNCH.md §3
npm run dev                   # http://localhost:3000
```

Typecheck + build:

```bash
./node_modules/.bin/tsc --noEmit
npm run build
```

## Deploying

See [`LAUNCH.md`](./LAUNCH.md) for the full runbook (Supabase setup, schema
apply, bot setup, env vars, smoke tests).

## Reference docs

- [`BRAND.md`](./BRAND.md) — voice, tone, positioning, naming. Read before
  writing copy.
- [`DESIGN.md`](./DESIGN.md) — Apple-inspired design language: tokens,
  type, motion, components. Read before touching UI.
- [`schema.sql`](./schema.sql) — authoritative database schema. Keep
  `src/lib/supabase/types.ts` in sync when you change it.
- [`LAUNCH.md`](./LAUNCH.md) — deployment runbook.

## Compliance posture

Highzcore does not sell subscribers, views, likes, or comments. We do not
touch your YouTube account. Every product we ship works because YouTube
would approve, not because they wouldn't notice. See
[`/compare/sub-services`](./src/app/compare/sub-services/page.tsx) for the
full rationale.
