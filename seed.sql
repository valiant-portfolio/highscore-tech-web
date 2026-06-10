-- =============================================================================
-- seed.sql — Highscore Tech starter content (2026-06-10)
-- =============================================================================
-- Run AFTER applying schema.sql. Idempotent: re-running upserts on slug so
-- you can tweak copy in this file and re-apply.
--
-- Sections (each grows per milestone):
--   1. Portfolio projects                    (M2)
--   2. Courses + modules                     (M3, populated later)
--   3. Staff records                         (M6, populated later)
--   4. (optional) Admin promotion            tail of file
-- =============================================================================


-- =============================================================================
-- 1. Portfolio projects (M2) — four representative case studies. Edit copy,
--    swap cover_image_url for real screenshots, and add more rows as work
--    ships. `published = TRUE` makes them visible on /portfolio.
-- =============================================================================

INSERT INTO portfolio_projects
  (slug, title, client, summary, body_md, tech_stack, category, year, external_url, sort_order, published)
VALUES
-- ── 1. AI customer support copilot for a fintech ─────────────────────────────
(
  'fintech-ai-support-copilot',
  'AI support copilot for a fintech',
  'Confidential fintech client',
  'We built an AI copilot that drafts the first reply to every customer support ticket, cutting median response time from 18 minutes to under 90 seconds without sacrificing quality.',
  $md$
## The problem

The client's support team was being crushed by a 4× spike in ticket volume after a product launch. Hiring couldn't scale fast enough, and the quality of replies started to slip as agents triaged faster and faster.

## What we built

A retrieval-augmented copilot that sits inside the existing helpdesk. Each new ticket triggers a Supabase edge function that:

- Embeds the ticket using the OpenAI embeddings API.
- Retrieves the most relevant historical resolutions + product docs.
- Drafts a reply in the brand voice, tagged with the source documents.
- Surfaces the draft to the agent for one-click approval, edit, or send.

## Outcomes

- **Median first response time: 18 min → 87 seconds.**
- **Agent throughput up 2.4×** with the same headcount.
- **94% of drafted replies** are sent with zero or one-line edits.

## Stack notes

The retrieval index lives in **pgvector** alongside the rest of the data. We avoided introducing a separate vector DB to keep ops surface minimal and let RLS govern who sees what.
  $md$,
  ARRAY['Next.js', 'Supabase', 'pgvector', 'OpenAI', 'TypeScript'],
  'AI',
  2026,
  NULL,
  10,
  TRUE
),
-- ── 2. E-commerce mobile app for a Lagos retailer ───────────────────────────
(
  'lagos-retail-mobile',
  'Mobile commerce app for a Lagos retailer',
  'Mensa Stores',
  'A React Native shopping app with Paystack checkout, real-time inventory, and a delivery tracker — built in 10 weeks and live across iOS and Android.',
  $md$
## Context

Mensa Stores wanted to move beyond Instagram orders and WhatsApp invoicing into a real mobile commerce experience. They wanted parity with the giants on the basics (search, checkout, tracking) without the bloat — and they wanted it live before their next peak season.

## What we shipped

- **Catalogue + search** powered by Postgres full-text search with category filters and saved searches.
- **Cart + checkout** with Paystack inline checkout (card, transfer, USSD).
- **Real-time inventory** so a sold-out item disappears from the listing the moment the last unit is paid for.
- **Delivery tracker** linked to the dispatch desk's WhatsApp status updates.
- **Push notifications** for order milestones — placed, packed, dispatched, delivered.

## Outcomes

- Cross-platform launch in **10 weeks** from kickoff.
- Conversion rate from product view → purchase **2.7× the Instagram funnel**.
- Returning-customer rate **doubled** within the first 90 days.

## Stack notes

The same Supabase backend serves the staff admin tool (a separate Next.js app) and the mobile clients. One schema, two clients, fewer surprises.
  $md$,
  ARRAY['React Native', 'Expo', 'Supabase', 'Paystack', 'TypeScript'],
  'Mobile',
  2025,
  NULL,
  20,
  TRUE
),
-- ── 3. School management platform ───────────────────────────────────────────
(
  'school-management-platform',
  'School management platform',
  'Brightway Schools',
  'We replaced a tangle of spreadsheets with a single platform handling student records, fee billing, attendance, and parent communication for a 1,400-student private school.',
  $md$
## What it covers

- **Student records** — every learner has a single profile that follows them from intake to graduation.
- **Fees + billing** — termly invoices, partial payments, automatic receipts, and a dashboard the bursar can read at 7am with one eye open.
- **Attendance** — class teachers mark from any device; parents see live status.
- **Parent portal** — academic progress, fee status, and a direct line to the form teacher.

## Why it mattered

The school previously ran on a chain of spreadsheets, WhatsApp groups, and three different finance apps. Errors compounded: a child's fees would show paid in one place and unpaid in another. The single source of truth was nobody.

We collapsed the operations into a single platform with proper roles and audit. The bursar's monthly reconciliation went from **two full days to ninety minutes**.

## Stack notes

Built on Next.js + Supabase. The reporting layer uses **server actions + PDF generation** rather than a separate reporting service — fewer moving parts for a small IT team to maintain.
  $md$,
  ARRAY['Next.js', 'Supabase', 'PostgreSQL', 'Tailwind', 'PDF generation'],
  'Software',
  2025,
  NULL,
  30,
  TRUE
),
-- ── 4. Health triage AI for a clinic chain ──────────────────────────────────
(
  'clinic-triage-ai',
  'Triage AI for a clinic chain',
  'Confidential clinic network',
  'A symptom-triage assistant that routes patient enquiries to the right specialist before they even book — built with hard guardrails and an offline review trail.',
  $md$
## Brief

A four-branch clinic chain was losing patients to early friction: people described their symptoms, got routed to the wrong consultant, and bounced. They wanted an AI front door — but one that *never* gave clinical advice and *always* deferred to a human.

## What we built

- A **symptom intake form** that uses a structured-output LLM call to classify the enquiry into a specialty + urgency band.
- A **routing layer** that hands the enquiry to the correct branch + specialist queue.
- A **review log** so a senior clinician can audit every classification daily.
- A **safety net**: any enquiry that mentions chest pain, breathing trouble, or self-harm bypasses the AI entirely and gets escalated to a human within 60 seconds.

## Outcomes

- Booking-to-consultation match rate **up from 71% to 96%**.
- Average time-to-correct-specialist **down 4.2×**.
- Zero clinical-advice incidents in the first 90 days of operation.

## What we didn't do

We deliberately did **not** ship a chatbot that gives medical advice. The platform's only job is to route — every clinical word comes from a human.
  $md$,
  ARRAY['Next.js', 'OpenAI', 'Supabase', 'Twilio', 'TypeScript'],
  'AI',
  2026,
  NULL,
  40,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  title           = EXCLUDED.title,
  client          = EXCLUDED.client,
  summary         = EXCLUDED.summary,
  body_md         = EXCLUDED.body_md,
  tech_stack      = EXCLUDED.tech_stack,
  category        = EXCLUDED.category,
  year            = EXCLUDED.year,
  external_url    = EXCLUDED.external_url,
  sort_order      = EXCLUDED.sort_order,
  published       = EXCLUDED.published,
  updated_at      = NOW();


-- =============================================================================
-- 2. Courses + modules (M3) — six tracks across web, mobile, and ML/AI.
-- =============================================================================
-- Each course is upserted by slug; per-course modules are wiped + reinserted
-- so editing a module here re-applies cleanly on re-run.

-- ── Course rows (upsert) ────────────────────────────────────────────────────
INSERT INTO courses
  (slug, title, summary, full_description, price_ngn, duration_weeks, mode, level, outcomes, prerequisites, sort_order, published)
VALUES
-- 1. Frontend ────────────────────────────────────────────────────────────────
(
  'frontend',
  'Frontend Engineering',
  'Master HTML, CSS, modern JavaScript, TypeScript, and React. Ship production-quality UIs the same way our studio does.',
  $md$
## Who this is for

Anyone who wants to build the things people actually use. You'll come out able to design, build, and ship a real product UI from scratch — and to read and contribute to a senior React codebase from day one of a job.

## What you'll build

Across the course you'll ship three projects: a marketing site, a dashboard with data fetching and forms, and a full-page application with routing, auth, and a real backend.

## How we teach

Live cohorts with weekly office hours, one-to-one code review on every project, and a final capstone graded by a Highscore Tech engineer.
  $md$,
  200000, 12, 'hybrid', 'Beginner',
  ARRAY[
    'Build production-quality UIs in React + TypeScript from scratch',
    'Read and contribute to a senior-level codebase confidently',
    'Style with Tailwind and a design-system mindset (tokens, primitives, composition)',
    'Fetch, mutate, and cache data with modern patterns (React Query, server components)',
    'Build forms that are accessible, validated, and a pleasure to use',
    'Deploy a real product to a CDN with previews per PR'
  ],
  ARRAY['A laptop and an internet connection — that''s it'],
  10, TRUE
),
-- 2. Backend ─────────────────────────────────────────────────────────────────
(
  'backend',
  'Backend Engineering — Node.js, Supabase, SQL & Mongo',
  'Build APIs and data layers that survive production. SQL, NoSQL, Supabase, auth, background jobs, observability — the full stack behind the screen.',
  $md$
## Who this is for

Engineers who already write a bit of JavaScript and want to own the part of the system the users never see. You will leave with strong intuitions for database design, API construction, and the operational discipline that keeps services up.

## What you'll build

A multi-tenant SaaS backend in Node.js + Supabase with auth, RLS, billing, background jobs, and a full deployment pipeline.

## How we teach

Live cohorts with code review on every PR. Final capstone reviewed by Promise (our mid-developer) and our CEO.
  $md$,
  250000, 14, 'hybrid', 'Intermediate',
  ARRAY[
    'Design relational schemas with proper normalisation, indexes, and constraints',
    'Build REST APIs in Node.js + TypeScript with input validation and proper error shapes',
    'Use Supabase for auth, Row-Level Security, realtime, and storage',
    'Work confidently with both PostgreSQL and MongoDB and know when each fits',
    'Run background jobs, schedule cron tasks, and handle long-running work safely',
    'Deploy, monitor, and roll back services without panicking'
  ],
  ARRAY['Comfortable with one programming language', 'Basic terminal + Git skills'],
  20, TRUE
),
-- 3. Full Stack ──────────────────────────────────────────────────────────────
(
  'fullstack',
  'Full Stack Engineering',
  'Frontend + backend + database + deployment. Build complete products end-to-end the way modern teams ship them.',
  $md$
## Who this is for

Anyone who wants to ship complete products — not just one half. We compress Frontend and Backend into one coherent journey with the integration glue (auth, payments, deployment) you actually need.

## What you'll build

Two complete products: a social-style app with realtime feeds, and a SaaS dashboard with payments and team accounts. Both shipped to production.

## How we teach

Longer cohort, more capstones, deeper integration work. Top capstones earn direct offers from the Highscore Tech studio.
  $md$,
  350000, 16, 'hybrid', 'Intermediate',
  ARRAY[
    'Ship a complete product end-to-end — UI, API, database, auth, payments, deployment',
    'Make sensible architectural calls about where logic should live',
    'Build with Next.js (App Router), Supabase, and TypeScript end-to-end',
    'Integrate payment providers and handle webhooks safely',
    'Build a real-time layer (presence, live updates) that scales',
    'Run a production deployment pipeline with previews and rollbacks'
  ],
  ARRAY['Some programming experience (any language)', 'Git basics'],
  30, TRUE
),
-- 4. Python ──────────────────────────────────────────────────────────────────
(
  'python',
  'Python Programming',
  'From first principles to building real apps. Python the language, then Python the toolkit — data work, APIs, automation, web services.',
  $md$
## Who this is for

Anyone who wants to learn programming in the most versatile language we know — whether you''re aiming for software, data, or ML further down the line.

## What you'll build

Three projects: a CLI utility, a REST API powering a small web app, and an automation tool that does real work against external services.

## How we teach

Live cohorts with pair-programming sessions. Final capstone graded by Highscore Tech engineers.
  $md$,
  200000, 10, 'hybrid', 'Beginner',
  ARRAY[
    'Write clean, idiomatic Python with confidence',
    'Use the standard library and key third-party packages (requests, pydantic, etc.)',
    'Build a REST API with FastAPI from scratch',
    'Talk to databases via SQLAlchemy',
    'Test your code and run it in production',
    'Have a foundation strong enough to take on the ML/AI course next'
  ],
  ARRAY['A laptop and an internet connection'],
  40, TRUE
),
-- 5. React Native ────────────────────────────────────────────────────────────
(
  'react-native',
  'Mobile Engineering with React Native',
  'Ship iOS + Android apps from one codebase. Expo, navigation, native APIs, push notifications, store submission — the lot.',
  $md$
## Who this is for

Engineers who already know JavaScript or React and want to add real mobile work to their toolkit — from UI to native modules to App Store / Play Store submissions.

## What you'll build

A production-grade mobile app: auth, offline-friendly data layer, native camera + filesystem usage, push notifications, and a real submission to TestFlight and the Play Store.

## How we teach

Heavy device emulator + real-device practice in onsite sessions. Online cohorts use Expo Go for live previews.
  $md$,
  300000, 14, 'hybrid', 'Intermediate',
  ARRAY[
    'Build production iOS + Android apps with React Native + Expo',
    'Navigate apps cleanly with React Navigation',
    'Use native APIs — camera, files, location, biometrics — without the pain',
    'Set up push notifications end-to-end',
    'Handle offline state, sync, and slow networks gracefully',
    'Sign, build, and ship apps to TestFlight and the Play Store'
  ],
  ARRAY['React fundamentals or our Frontend course', 'Comfortable with JavaScript / TypeScript'],
  50, TRUE
),
-- 6. Python ML/AI ────────────────────────────────────────────────────────────
(
  'python-ml-ai',
  'Python for Machine Learning & AI',
  'Classical ML, deep learning with PyTorch, NLP, LLMs, RAG, and the operational discipline to run ML systems in production.',
  $md$
## Who this is for

Engineers and analysts who want a serious, end-to-end grounding in modern ML and AI — including the LLM era. We cover both the maths and the production engineering.

## What you'll build

Three capstones: a classical ML classifier with proper evaluation, a PyTorch deep-learning project on real data, and a production RAG application with LLMs.

## How we teach

Live cohorts with both maths-side and engineering-side guidance. Capstones graded by senior engineers; standout projects are presented to studio clients.
  $md$,
  400000, 16, 'hybrid', 'Advanced',
  ARRAY[
    'Work fluently with NumPy, Pandas, and the scientific Python stack',
    'Train classical ML models with Scikit-learn and evaluate them honestly',
    'Build deep-learning models with PyTorch from first principles',
    'Apply modern NLP techniques and understand the architectures behind them',
    'Build LLM-powered products with retrieval-augmented generation',
    'Deploy ML services in production with monitoring and re-training pipelines'
  ],
  ARRAY['Solid Python', 'Comfortable with linear algebra basics', 'Some prior programming experience'],
  60, TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  title             = EXCLUDED.title,
  summary           = EXCLUDED.summary,
  full_description  = EXCLUDED.full_description,
  price_ngn         = EXCLUDED.price_ngn,
  duration_weeks    = EXCLUDED.duration_weeks,
  mode              = EXCLUDED.mode,
  level             = EXCLUDED.level,
  outcomes          = EXCLUDED.outcomes,
  prerequisites     = EXCLUDED.prerequisites,
  sort_order        = EXCLUDED.sort_order,
  published         = EXCLUDED.published,
  updated_at        = NOW();


-- ── Wipe + reinsert modules per course ──────────────────────────────────────
-- Each block: DELETE all modules for the course, then INSERT fresh.
-- Lessons live as a jsonb array of {title, summary} objects.

-- ── Frontend modules ────────────────────────────────────────────────────────
DELETE FROM course_modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'frontend');
INSERT INTO course_modules (course_id, sort_order, title, summary, lessons)
SELECT id, 1, 'The web platform',
       'How the modern web actually works — browsers, the DOM, HTTP, the network tab. Get comfortable with the platform before reaching for frameworks.',
       '[
         {"title": "How browsers render a page", "summary": "Parsing, DOM, CSSOM, render tree, paint, composite."},
         {"title": "HTTP, requests, and the network tab", "summary": "Reading DevTools and understanding what gets sent and received."},
         {"title": "URLs, routing, and the back button", "summary": "What client-side routing has to do to feel native."},
         {"title": "The platform vs the framework", "summary": "What React buys you and what it does not."}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 2, 'HTML and semantic markup',
       'Write HTML that is accessible, indexable, and natural to read.',
       '[
         {"title": "Document structure and landmarks"},
         {"title": "Forms, controls, and labels"},
         {"title": "Headings, lists, and semantic flow"},
         {"title": "Accessibility from the markup up"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 3, 'CSS that scales',
       'CSS as a system — layout, the box model, tokens, responsive design.',
       '[
         {"title": "Layout: Flexbox and Grid in earnest"},
         {"title": "The box model and stacking contexts"},
         {"title": "Custom properties and design tokens"},
         {"title": "Responsive design without media-query soup"},
         {"title": "Animations and transitions"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 4, 'JavaScript essentials',
       'Modern JavaScript — the language as it actually is in 2026.',
       '[
         {"title": "Values, scope, and the event loop"},
         {"title": "Functions, closures, and modules"},
         {"title": "Promises and async/await done right"},
         {"title": "Working with arrays and objects fluently"},
         {"title": "Errors and how to handle them gracefully"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 5, 'TypeScript foundations',
       'Types that help, not hurt.',
       '[
         {"title": "Why types — what they buy you in real code"},
         {"title": "Basic types, unions, and narrowing"},
         {"title": "Generics in practice"},
         {"title": "Type-driven design patterns"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 6, 'React fundamentals',
       'Components, props, state, effects — and when to use each.',
       '[
         {"title": "Components and composition"},
         {"title": "State and reconciliation"},
         {"title": "Effects: when, why, and when not to use them"},
         {"title": "Forms and controlled inputs"},
         {"title": "Common React pitfalls and how to avoid them"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 7, 'Data and state at scale',
       'Beyond useState — fetching, caching, mutating, and the React Query mental model.',
       '[
         {"title": "Server state vs UI state"},
         {"title": "React Query / TanStack Query basics"},
         {"title": "Optimistic updates and rollback"},
         {"title": "Context, reducers, and lightweight stores"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 8, 'Production UI patterns',
       'Tailwind, design systems, and how senior teams build UIs.',
       '[
         {"title": "Tailwind CSS in earnest"},
         {"title": "Design tokens and the system mindset"},
         {"title": "Building reusable primitives — Button, Card, Input"},
         {"title": "Composition patterns — slots and headless components"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 9, 'Routing, forms, and accessibility',
       'Make complete apps people can actually use.',
       '[
         {"title": "Client-side routing and code-splitting"},
         {"title": "Forms — validation, error UX, accessibility"},
         {"title": "Keyboard support and focus management"},
         {"title": "Screen-reader testing in your daily flow"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 10, 'Testing and shipping',
       'Unit + component + end-to-end testing, then deployment.',
       '[
         {"title": "Vitest for fast unit tests"},
         {"title": "Testing-library for component tests"},
         {"title": "Playwright for end-to-end coverage"},
         {"title": "Deploying to Vercel / Netlify with previews per PR"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend'
UNION ALL SELECT id, 11, 'Capstone',
       'Build, polish, and ship your own product. Graded by a Highscore Tech engineer.',
       '[
         {"title": "Scope your project and write the brief"},
         {"title": "Build the first slice end-to-end"},
         {"title": "Polish, performance, and accessibility audit"},
         {"title": "Ship to production and present"}
       ]'::jsonb
FROM courses WHERE slug = 'frontend';

-- ── Backend modules ─────────────────────────────────────────────────────────
DELETE FROM course_modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'backend');
INSERT INTO course_modules (course_id, sort_order, title, summary, lessons)
SELECT id, 1, 'Node.js and TypeScript on the server',
       'Set up a modern Node project the way senior teams do.',
       '[
         {"title": "Project setup with TypeScript, ESM, and pnpm"},
         {"title": "Modules, packages, and code organisation"},
         {"title": "Process model, event loop, and concurrency"},
         {"title": "Configuration and the 12-factor approach"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 2, 'SQL fundamentals',
       'Read and write SQL with confidence. Schema design, joins, indexes, transactions.',
       '[
         {"title": "Relational thinking and schema design"},
         {"title": "SELECT, JOIN, GROUP BY in depth"},
         {"title": "Indexes — what they do and what they cost"},
         {"title": "Transactions and isolation levels"},
         {"title": "Migrations — never destroying production"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 3, 'PostgreSQL in production',
       'Postgres as a power tool — JSONB, full-text search, RLS, performance.',
       '[
         {"title": "JSONB and when to use it"},
         {"title": "Full-text search with tsvector and trigram"},
         {"title": "Row-Level Security from first principles"},
         {"title": "Reading EXPLAIN output and tuning queries"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 4, 'MongoDB and NoSQL thinking',
       'Document databases — when they fit, when they do not, and how to use them well.',
       '[
         {"title": "Document modelling for real apps"},
         {"title": "Indexes, aggregations, and pipelines"},
         {"title": "When NoSQL is the right call (and when it is not)"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 5, 'Supabase end-to-end',
       'Use Supabase the way a production team would.',
       '[
         {"title": "Auth — email, OAuth, magic links"},
         {"title": "RLS policies that actually protect data"},
         {"title": "Realtime channels and presence"},
         {"title": "Storage buckets with access control"},
         {"title": "Edge Functions for serverless work"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 6, 'Building APIs',
       'REST APIs that are pleasant to consume and impossible to misuse.',
       '[
         {"title": "Routing and request lifecycle"},
         {"title": "Input validation with Zod or Pydantic-style approaches"},
         {"title": "Auth — sessions, tokens, refresh"},
         {"title": "Pagination, filtering, and consistent error shapes"},
         {"title": "Rate limiting and quotas"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 7, 'Background work',
       'Anything you cannot do in a 200ms request.',
       '[
         {"title": "Queues and workers"},
         {"title": "Scheduled tasks with pg_cron and friends"},
         {"title": "Idempotency, retries, and dead-letter queues"},
         {"title": "Webhooks — sending and receiving safely"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 8, 'Observability and deployment',
       'Run services you can trust.',
       '[
         {"title": "Logs, metrics, and traces — and the difference between them"},
         {"title": "Alerts that are actually actionable"},
         {"title": "Deployments, rollbacks, and blue/green"},
         {"title": "Incident response — what to do when production is on fire"}
       ]'::jsonb
FROM courses WHERE slug = 'backend'
UNION ALL SELECT id, 9, 'Capstone',
       'Build, ship, and operate a multi-tenant SaaS backend.',
       '[
         {"title": "Scope the SaaS and design the schema"},
         {"title": "Build the API + auth + RLS layer"},
         {"title": "Add payments, jobs, and webhooks"},
         {"title": "Deploy, monitor, and present"}
       ]'::jsonb
FROM courses WHERE slug = 'backend';

-- ── Full Stack modules ──────────────────────────────────────────────────────
DELETE FROM course_modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'fullstack');
INSERT INTO course_modules (course_id, sort_order, title, summary, lessons)
SELECT id, 1, 'Modern full-stack architecture',
       'How a modern product fits together — and why.',
       '[
         {"title": "Server components, client components, and the boundary"},
         {"title": "Data flow: from the database to the pixel"},
         {"title": "Choosing where work happens"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 2, 'Next.js App Router in depth',
       'Routing, layouts, server actions, streaming — the whole picture.',
       '[
         {"title": "App Router conventions and layouts"},
         {"title": "Server components and where to use them"},
         {"title": "Server actions and form submissions"},
         {"title": "Streaming, Suspense, and progressive enhancement"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 3, 'TypeScript across the stack',
       'One language, one type system, end-to-end.',
       '[
         {"title": "Shared types between client and server"},
         {"title": "End-to-end type safety with Zod and friends"},
         {"title": "Type-safe database access"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 4, 'Database and data access',
       'Postgres and Supabase as your stack''s spine.',
       '[
         {"title": "Designing schemas that age well"},
         {"title": "Querying from server actions and route handlers"},
         {"title": "Migrations and seed data"},
         {"title": "RLS as your security perimeter"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 5, 'Auth, sessions, and roles',
       'Authentication and authorisation done properly.',
       '[
         {"title": "Email, OAuth, and passwordless login"},
         {"title": "Sessions, cookies, and the auth lifecycle"},
         {"title": "Role-based access control"},
         {"title": "Protecting routes and server actions"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 6, 'Payments and webhooks',
       'Take money safely.',
       '[
         {"title": "Stripe and Paystack — what they do and how"},
         {"title": "Checkout flows and idempotency"},
         {"title": "Webhook handling and verification"},
         {"title": "Receipts, refunds, and reconciliation"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 7, 'Realtime and notifications',
       'Make the product feel alive.',
       '[
         {"title": "Realtime subscriptions"},
         {"title": "Presence and live cursors"},
         {"title": "Email + push notifications with backoff"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 8, 'Testing across the stack',
       'Cover the ground that matters.',
       '[
         {"title": "Unit tests for pure logic"},
         {"title": "Integration tests that hit a real database"},
         {"title": "End-to-end with Playwright"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 9, 'CI/CD and production',
       'From a commit to a deploy.',
       '[
         {"title": "GitHub Actions workflows"},
         {"title": "Preview deployments per PR"},
         {"title": "Database migrations in CI"},
         {"title": "Rollback, observability, and on-call discipline"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack'
UNION ALL SELECT id, 10, 'Capstone',
       'Two complete products, shipped. Top performers earn studio offers.',
       '[
         {"title": "Product 1: a social-style app with realtime"},
         {"title": "Product 2: a SaaS dashboard with payments"},
         {"title": "Polish, perf, deploy"},
         {"title": "Present to Highscore Tech engineers"}
       ]'::jsonb
FROM courses WHERE slug = 'fullstack';

-- ── Python modules ──────────────────────────────────────────────────────────
DELETE FROM course_modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python');
INSERT INTO course_modules (course_id, sort_order, title, summary, lessons)
SELECT id, 1, 'Python — the language',
       'From zero to writing useful Python.',
       '[
         {"title": "Setting up your environment"},
         {"title": "Variables, types, and the REPL"},
         {"title": "Strings, numbers, and basic I/O"},
         {"title": "Control flow and loops"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 2, 'Data structures',
       'Lists, dicts, sets, tuples — and when to reach for each.',
       '[
         {"title": "Lists and tuples"},
         {"title": "Dictionaries and sets"},
         {"title": "Comprehensions and idiomatic Python"},
         {"title": "Iterators and generators"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 3, 'Functions, modules, and packages',
       'Organise your code like a senior engineer.',
       '[
         {"title": "Defining and composing functions"},
         {"title": "Modules and the import system"},
         {"title": "Virtual environments and pip"},
         {"title": "Project layout that scales"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 4, 'Errors, files, and the standard library',
       'Use the batteries that come with Python.',
       '[
         {"title": "Exceptions and error handling"},
         {"title": "File I/O, JSON, CSV"},
         {"title": "Datetime, pathlib, and the platform libs"},
         {"title": "Logging properly"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 5, 'Working with APIs',
       'Talk to the wider world.',
       '[
         {"title": "HTTP with requests and httpx"},
         {"title": "Pagination, retries, and rate limits"},
         {"title": "Parsing and validating JSON with Pydantic"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 6, 'Databases with SQLAlchemy',
       'Persistent state without pain.',
       '[
         {"title": "SQL fundamentals refresher"},
         {"title": "SQLAlchemy ORM basics"},
         {"title": "Migrations with Alembic"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 7, 'Building a real web app with FastAPI',
       'A production-friendly Python web framework.',
       '[
         {"title": "FastAPI fundamentals"},
         {"title": "Routing, validation, dependencies"},
         {"title": "Background tasks and websockets"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 8, 'Testing and deployment',
       'Ship things you trust.',
       '[
         {"title": "Pytest fundamentals"},
         {"title": "Fixtures and parametrised tests"},
         {"title": "Packaging and deploying with Docker"}
       ]'::jsonb
FROM courses WHERE slug = 'python'
UNION ALL SELECT id, 9, 'Capstone',
       'Build, ship, and present a Python project.',
       '[
         {"title": "Scope and brief"},
         {"title": "Implementation sprint"},
         {"title": "Tests, deploy, and present"}
       ]'::jsonb
FROM courses WHERE slug = 'python';

-- ── React Native modules ────────────────────────────────────────────────────
DELETE FROM course_modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'react-native');
INSERT INTO course_modules (course_id, sort_order, title, summary, lessons)
SELECT id, 1, 'React Native and Expo fundamentals',
       'Get a real app running on iOS and Android in week one.',
       '[
         {"title": "Project setup with Expo and EAS"},
         {"title": "Differences from React on the web"},
         {"title": "Layout with Flexbox on mobile"},
         {"title": "Platform-specific code where it matters"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 2, 'Navigation and screen architecture',
       'How to structure a real mobile app.',
       '[
         {"title": "React Navigation in depth"},
         {"title": "Tabs, stacks, and modal flows"},
         {"title": "Deep linking and universal links"},
         {"title": "Back-button and gesture handling"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 3, 'Working with native APIs',
       'Camera, files, location, biometrics — the things that make an app feel native.',
       '[
         {"title": "Permissions done properly"},
         {"title": "Camera, photo library, and file system"},
         {"title": "Location and maps"},
         {"title": "Biometrics, secure storage, and the keychain"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 4, 'Networking and local storage',
       'Talking to APIs and surviving bad networks.',
       '[
         {"title": "Fetching with React Query on mobile"},
         {"title": "Local persistence (AsyncStorage, MMKV, SQLite)"},
         {"title": "Offline-first patterns"},
         {"title": "Sync and conflict resolution"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 5, 'Authentication on mobile',
       'Sign in flows that feel native and stay secure.',
       '[
         {"title": "Email + password and magic-link flows"},
         {"title": "OAuth with native browsers"},
         {"title": "Biometric login and refresh"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 6, 'Push notifications',
       'Reach the user when the app is closed.',
       '[
         {"title": "Expo push and the FCM/APNs path"},
         {"title": "Tokens, topics, and routing"},
         {"title": "Notification UX that respects the user"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 7, 'Performance and native UX',
       'Make it feel like a real app, not a website in a webview.',
       '[
         {"title": "FlatList and virtualisation"},
         {"title": "Reanimated for buttery animations"},
         {"title": "Gestures and feel"},
         {"title": "Profiling and fixing jank"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 8, 'Build, sign, and ship',
       'Get into the App Store and Play Store.',
       '[
         {"title": "EAS Build pipelines"},
         {"title": "Signing certificates and provisioning"},
         {"title": "TestFlight and internal testing"},
         {"title": "App Store and Play Store submissions"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native'
UNION ALL SELECT id, 9, 'Capstone',
       'Ship a real app to TestFlight and the Play Store.',
       '[
         {"title": "Scope and brief"},
         {"title": "Build the core app"},
         {"title": "Sign, submit, and present"}
       ]'::jsonb
FROM courses WHERE slug = 'react-native';

-- ── Python ML/AI modules ────────────────────────────────────────────────────
DELETE FROM course_modules WHERE course_id = (SELECT id FROM courses WHERE slug = 'python-ml-ai');
INSERT INTO course_modules (course_id, sort_order, title, summary, lessons)
SELECT id, 1, 'The scientific Python stack',
       'NumPy and Pandas — the bedrock you cannot skip.',
       '[
         {"title": "NumPy arrays and broadcasting"},
         {"title": "Pandas dataframes for real data work"},
         {"title": "Data cleaning at scale"},
         {"title": "Jupyter notebooks done well"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 2, 'Visualisation',
       'See your data before you model it.',
       '[
         {"title": "Matplotlib essentials"},
         {"title": "Seaborn for statistical plots"},
         {"title": "Plotting for stakeholders, not just yourself"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 3, 'ML fundamentals',
       'The intuitions behind every model.',
       '[
         {"title": "Supervised vs unsupervised vs reinforcement"},
         {"title": "Train/test/val splits and leakage"},
         {"title": "Loss functions and what they really mean"},
         {"title": "The bias-variance tradeoff in practice"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 4, 'Classical ML with Scikit-learn',
       'The models you should reach for first.',
       '[
         {"title": "Linear and logistic regression"},
         {"title": "Decision trees, random forests, gradient boosting"},
         {"title": "Pipelines and proper cross-validation"},
         {"title": "Evaluation metrics that match the business"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 5, 'Deep learning with PyTorch',
       'Neural networks from first principles.',
       '[
         {"title": "Tensors, autograd, and the training loop"},
         {"title": "Building MLPs and CNNs"},
         {"title": "Working with GPUs and mixed precision"},
         {"title": "Saving, loading, and deploying models"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 6, 'NLP fundamentals',
       'How machines read language.',
       '[
         {"title": "Tokenisation and embeddings"},
         {"title": "Recurrent and attention-based architectures"},
         {"title": "Sentiment, classification, and entity extraction"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 7, 'LLMs in practice',
       'Use modern large language models well.',
       '[
         {"title": "The transformer architecture in plain English"},
         {"title": "Prompt engineering and structured output"},
         {"title": "Fine-tuning vs in-context learning"},
         {"title": "Safety, evaluation, and red-teaming"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 8, 'Retrieval-Augmented Generation',
       'Build LLM apps grounded in your own data.',
       '[
         {"title": "Embedding pipelines"},
         {"title": "Vector databases (pgvector and friends)"},
         {"title": "Retrieval strategies and reranking"},
         {"title": "Evaluation of RAG systems"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 9, 'Deployment and MLOps',
       'Ship models the way a senior team does.',
       '[
         {"title": "Serving models with FastAPI"},
         {"title": "Monitoring drift and model decay"},
         {"title": "Re-training pipelines"},
         {"title": "Cost, latency, and the production reality"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai'
UNION ALL SELECT id, 10, 'Capstone',
       'Three projects — classical, deep, and LLM-powered.',
       '[
         {"title": "Classical ML capstone"},
         {"title": "Deep-learning capstone with PyTorch"},
         {"title": "RAG product capstone"},
         {"title": "Present to studio engineers"}
       ]'::jsonb
FROM courses WHERE slug = 'python-ml-ai';


-- =============================================================================
-- 3. Staff records (M6) — Highscore Tech's current four-person team.
-- =============================================================================
-- Idempotent upsert keyed by slug. Personal-email hash stays NULL until the
-- staff member completes the first-visit gate on /staff, at which point the
-- claim action writes the SHA-256+pepper hash so subsequent visits can
-- verify ownership of that personal email.

INSERT INTO staff
  (slug, full_name, role_title, department, salary_ngn, start_date, status, work_email)
VALUES
  ('olivia',   'Olivia Olije Amehs',  'Operations Manager',          'Operations',  70000,  '2026-06-01', 'active', 'olivia@highzcore.tech'),
  ('godswill', 'Godswill Okafor',     'Creative & Admin Officer',    'Operations',  70000,  '2026-06-01', 'active', 'godswill@highzcore.tech'),
  ('promise',  'Promise Friday',      'Mid Developer',               'Engineering', 200000, '2026-06-01', 'active', 'promise@highzcore.tech'),
  ('samuel',   'Samuel Toluwani',     'Junior Developer',            'Engineering', 100000, '2026-06-01', 'active', 'samuel@highzcore.tech'),
  ('vany',     'Vany Joseph',         'Senior Developer',            'Engineering', 700000, '2026-06-10', 'active', 'valiantjoee@gmail.com')
ON CONFLICT (slug) DO UPDATE SET
  full_name   = EXCLUDED.full_name,
  role_title  = EXCLUDED.role_title,
  department  = EXCLUDED.department,
  salary_ngn  = EXCLUDED.salary_ngn,
  start_date  = EXCLUDED.start_date,
  status      = EXCLUDED.status,
  work_email  = EXCLUDED.work_email,
  updated_at  = NOW();

-- Reports_to chain:
--   Godswill, Samuel  → Olivia (Ops Manager)
--   Promise           → CEO (out of band; tech lead)
--   Vany              → CEO (out of band; senior engineering)
--   Olivia            → CEO (out of band)
UPDATE staff SET reports_to = (SELECT id FROM staff WHERE slug = 'olivia')
WHERE slug IN ('godswill', 'samuel');
UPDATE staff SET reports_to = NULL WHERE slug IN ('olivia', 'promise', 'vany');


-- =============================================================================
-- 4. Admin promotion (run once, after you've signed up via /signup)
-- =============================================================================
-- STEP A — list users so you can find your row:
SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at ASC;

-- STEP B — uncomment + edit ONE of these, then re-run this file:
-- UPDATE users SET role = 'admin' WHERE email = 'valiantcodez@gmail.com';
-- UPDATE users SET role = 'admin' WHERE id    = 'paste-uuid-here';

-- STEP C — confirm:
SELECT id, email, role FROM users WHERE role = 'admin';
