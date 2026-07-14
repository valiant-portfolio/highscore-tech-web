-- =============================================================================
-- Highscore Tech — Authoritative Schema (M0 scaffold, 2026-06-10)
-- =============================================================================
-- This file is the single source of truth for the database. Pre-launch we
-- wipe + reapply freely; post-launch changes go through numbered migrations.
--
-- Model overview:
--
--   users               ── one row per person, mirrors auth.users(id)
--   staff               ── employees (Olivia, Godswill, Promise, Samuel)
--   courses             ── academy course catalog
--   course_modules      ── ordered modules inside a course
--   enrollments         ── one row per (student × course) signup
--   installments        ── installment schedule for an enrollment
--   payments            ── individual ALATPay transactions
--   portfolio_projects  ── public portfolio of client work
--   contact_messages    ── /contact form submissions
--
-- Money:
--   - All amounts are Naira (NGN), stored as INTEGER (kobo would be more
--     precise but courses sell in whole-Naira amounts so we stay simple).
--
-- To apply: paste into Supabase SQL Editor and run. Idempotent: rebuilds
-- everything it owns.
-- =============================================================================


-- =============================================================================
-- 0. Reset — drop everything we own, in reverse-dependency order
-- =============================================================================

DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

DROP TABLE IF EXISTS contact_messages   CASCADE;
DROP TABLE IF EXISTS payments           CASCADE;
DROP TABLE IF EXISTS installments       CASCADE;
DROP TABLE IF EXISTS enrollments        CASCADE;
DROP TABLE IF EXISTS course_modules     CASCADE;
DROP TABLE IF EXISTS courses            CASCADE;
DROP TABLE IF EXISTS portfolio_projects CASCADE;
DROP TABLE IF EXISTS staff              CASCADE;
DROP TABLE IF EXISTS users              CASCADE;

DROP TYPE IF EXISTS user_role        CASCADE;
DROP TYPE IF EXISTS staff_status     CASCADE;
DROP TYPE IF EXISTS course_mode      CASCADE;
DROP TYPE IF EXISTS enrollment_status CASCADE;
DROP TYPE IF EXISTS pay_plan         CASCADE;
DROP TYPE IF EXISTS installment_status CASCADE;
DROP TYPE IF EXISTS payment_status   CASCADE;
DROP TYPE IF EXISTS contact_status   CASCADE;


-- =============================================================================
-- 1. Extensions
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- uuid helpers


-- =============================================================================
-- 2. Enums
-- =============================================================================

CREATE TYPE user_role         AS ENUM ('student', 'staff', 'admin');
CREATE TYPE staff_status      AS ENUM ('active', 'former');
CREATE TYPE course_mode       AS ENUM ('online', 'offline', 'hybrid');
CREATE TYPE enrollment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE pay_plan          AS ENUM ('full', 'installment');
CREATE TYPE installment_status AS ENUM ('pending', 'paid', 'overdue', 'waived');
CREATE TYPE payment_status    AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE contact_status    AS ENUM ('new', 'read', 'replied', 'archived');


-- =============================================================================
-- 3. Shared helpers (created BEFORE tables that reference them)
-- =============================================================================

-- updated_at trigger applied to every table that needs it.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- is_admin() is referenced inside many RLS policies. We use plpgsql so name
-- resolution is deferred to call time — the function compiles cleanly even
-- before public.users exists.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT (u.role = 'admin') INTO result
    FROM public.users u
   WHERE u.id = auth.uid();
  RETURN COALESCE(result, FALSE);
END;
$$;


-- =============================================================================
-- 4. users — mirrors auth.users(id)
-- =============================================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'student',
  -- Per-section admin access granted to a staff member by an admin. Holds a
  -- subset of the section keys in src/lib/admin/sections.ts (e.g. {portfolio,
  -- courses}). Empty = no admin access at all. The `admin` role ignores this
  -- and can reach everything. Only an admin may edit it.
  admin_sections TEXT[] NOT NULL DEFAULT '{}',
  -- Onboarding (M10) — collected on first login for students; pre-filled
  -- via admin import for staff. NULL onboarded_at = onboarding not done.
  date_of_birth     DATE,
  gender            TEXT,
  state_of_origin   TEXT,
  address_line      TEXT,
  city              TEXT,
  emergency_name    TEXT,
  emergency_phone   TEXT,
  emergency_relation TEXT,
  education_level   TEXT,
  occupation        TEXT,
  nin_doc_url       TEXT,            -- Supabase Storage path
  onboarded_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- New Supabase signups mirror into public.users. If the email matches a
-- staff.work_email, the user is auto-promoted to role='staff' and the
-- staff row is linked to the new user.id.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_staff_id UUID;
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-link staff records by work_email.
  SELECT id INTO matched_staff_id
    FROM public.staff
   WHERE work_email = NEW.email AND status = 'active'
   LIMIT 1;

  IF matched_staff_id IS NOT NULL THEN
    UPDATE public.users SET role = 'staff' WHERE id = NEW.id;
    UPDATE public.staff SET user_id  = NEW.id WHERE id = matched_staff_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- 5. staff — Highscore Tech employees
-- =============================================================================

CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  slug            TEXT UNIQUE NOT NULL,            -- e.g. 'olivia', 'godswill'
  full_name       TEXT NOT NULL,
  role_title      TEXT NOT NULL,                   -- 'Operations Manager', etc.
  department      TEXT,                            -- 'Operations', 'Engineering', etc.
  salary_ngn      INTEGER NOT NULL,
  reports_to      UUID REFERENCES staff(id) ON DELETE SET NULL,
  start_date      DATE,
  status          staff_status NOT NULL DEFAULT 'active',
  -- The email used to sign in. When a user signs up with this email, the
  -- handle_new_user trigger auto-promotes them to staff role and links
  -- staff.user_id → users.id.
  work_email      TEXT UNIQUE,
  -- Signature image path inside the 'signatures' storage bucket, written
  -- by /api/staff/.../signature upload. Used inside HR PDFs in place of
  -- the cursive Allura fallback once provided.
  signature_url   TEXT,
  -- Public photo path inside the 'staff-photos' storage bucket. Admin
  -- uploads via /admin/staff/[id]; goes on the ID card PDF + dashboard.
  photo_url       TEXT,
  -- When the staff member signed the offer letter. First step of the
  -- onboarding wizard (after uploading their signature).
  offer_signed_at TIMESTAMPTZ,
  -- When the staff member signed the NDA + employment contract. Recorded
  -- for HR compliance. Payday is the 15th of every month regardless.
  nda_signed_at   TIMESTAMPTZ,
  -- When the staff member signed the Company Policy & Staff Agreement
  -- (third + final onboarding document).
  policy_signed_at TIMESTAMPTZ,

  -- Payroll. Staff manages from their Settings tab; the 90-day edit lock
  -- is enforced by the server action (lib/staff/bank-actions.ts), not the
  -- database — easier to override from admin if a staff genuinely needs
  -- a faster change (e.g. lost / fraudulent account).
  bank_name            TEXT,
  bank_account_number  TEXT,
  bank_account_name    TEXT,
  bank_updated_at      TIMESTAMPTZ,
  -- Legacy cookie-gate hash. Kept for migration safety but no longer used —
  -- staff sign in via regular auth in M9+.
  personal_email_hash TEXT,
  -- Staff member's own personal email (they add it from their profile). Used
  -- as a send target when the admin messages or offboards them.
  personal_email TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX staff_slug_idx        ON staff (slug);
CREATE INDEX staff_user_id_idx     ON staff (user_id);
CREATE INDEX staff_work_email_idx  ON staff (work_email) WHERE work_email IS NOT NULL;
CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 6. courses + course_modules
-- =============================================================================

CREATE TABLE courses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,             -- 'frontend', 'backend', 'fullstack' etc.
  title            TEXT NOT NULL,
  summary          TEXT NOT NULL,                    -- card-sized blurb
  full_description TEXT,                             -- longer body, markdown
  price_ngn        INTEGER NOT NULL,
  duration_weeks   INTEGER,
  mode             course_mode NOT NULL DEFAULT 'hybrid',
  level            TEXT,                             -- 'Beginner', 'Intermediate', etc.
  outcomes         TEXT[] DEFAULT ARRAY[]::TEXT[],   -- what graduates can do
  prerequisites    TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url        TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  published        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX courses_published_idx ON courses (published, sort_order);
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE course_modules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sort_order   INTEGER NOT NULL,
  title        TEXT NOT NULL,
  summary      TEXT,
  -- lessons stored as ordered array of { title, summary }. Keeps the
  -- detail page render cheap (single row → all lessons).
  lessons      JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, sort_order)
);
CREATE INDEX course_modules_course_idx ON course_modules (course_id, sort_order);
CREATE TRIGGER trg_course_modules_updated_at BEFORE UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 7. enrollments + installments + payments
-- =============================================================================

CREATE TABLE enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  status       enrollment_status NOT NULL DEFAULT 'pending',
  pay_plan     pay_plan NOT NULL DEFAULT 'full',
  total_ngn    INTEGER NOT NULL,                    -- snapshot at signup time
  paid_ngn     INTEGER NOT NULL DEFAULT 0,
  enrolled_at  TIMESTAMPTZ,                         -- set when first payment lands
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);
CREATE INDEX enrollments_student_idx ON enrollments (student_id);
CREATE INDEX enrollments_course_idx  ON enrollments (course_id);
CREATE TRIGGER trg_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE installments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL,                   -- 1, 2, 3, …
  due_date      DATE NOT NULL,
  amount_ngn    INTEGER NOT NULL,
  status        installment_status NOT NULL DEFAULT 'pending',
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, sort_order)
);
CREATE INDEX installments_enrollment_idx ON installments (enrollment_id);
CREATE TRIGGER trg_installments_updated_at BEFORE UPDATE ON installments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id      UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  installment_id     UUID REFERENCES installments(id) ON DELETE SET NULL,
  alatpay_reference  TEXT UNIQUE,                   -- gateway ref / orderId
  amount_ngn         INTEGER NOT NULL,
  status             payment_status NOT NULL DEFAULT 'pending',
  raw_payload        JSONB,                         -- full webhook body for audit
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX payments_enrollment_idx  ON payments (enrollment_id);
CREATE INDEX payments_installment_idx ON payments (installment_id);
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 8. portfolio_projects — public client work showcase
-- =============================================================================

CREATE TABLE portfolio_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  client          TEXT,                              -- nullable for internal builds
  summary         TEXT NOT NULL,
  body_md         TEXT,                              -- full case study, markdown
  tech_stack      TEXT[] DEFAULT ARRAY[]::TEXT[],
  category        TEXT,                              -- 'AI', 'Software', 'Mobile', etc.
  cover_image_url TEXT,                               -- kept in sync with images[0]
  images          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- uploaded image URLs (public 'portfolio' bucket)
  video_url       TEXT,                               -- optional showcase clip (public 'portfolio' bucket, <=50MB)
  year            INTEGER,
  external_url    TEXT,                              -- live link if public
  sort_order      INTEGER NOT NULL DEFAULT 0,
  published       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX portfolio_published_idx ON portfolio_projects (published, sort_order);
CREATE TRIGGER trg_portfolio_updated_at BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 9a. audit_log — append-only record of every admin mutation (M14)
-- =============================================================================
-- No UPDATE / DELETE policies — rows are immutable once inserted.

CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_email   TEXT,
  action        TEXT NOT NULL,               -- 'staff.amend', 'enrollment.installment_marked_paid', …
  target_type   TEXT,                         -- 'staff', 'course', 'enrollment', 'contact_message'
  target_id     UUID,
  target_label  TEXT,
  diff          JSONB,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX audit_log_created_idx ON audit_log (created_at DESC);
CREATE INDEX audit_log_action_idx  ON audit_log (action);
CREATE INDEX audit_log_actor_idx   ON audit_log (actor_user_id);
CREATE INDEX audit_log_target_idx  ON audit_log (target_type, target_id);


-- =============================================================================
-- 9. contact_messages — /contact form inbox
-- =============================================================================

CREATE TABLE contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      contact_status NOT NULL DEFAULT 'new',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX contact_status_idx ON contact_messages (status, created_at DESC);
CREATE TRIGGER trg_contact_updated_at BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- 10. Row-Level Security
-- =============================================================================
-- Deny by default; admin role bypasses every policy. Each table opens up
-- just the access it needs.

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff              ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages   ENABLE ROW LEVEL SECURITY;

-- users — each row visible to itself; admins see all.
CREATE POLICY "users self read"   ON users
  FOR SELECT TO authenticated USING (id = auth.uid() OR is_admin());
CREATE POLICY "users self update" ON users
  FOR UPDATE TO authenticated USING (id = auth.uid() OR is_admin())
                              WITH CHECK (id = auth.uid() OR is_admin());

-- staff — admin-only. The /staff portal reads through a service-role API.
CREATE POLICY "staff admin all"   ON staff
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- courses — public read when published; admin full write.
CREATE POLICY "courses public read"  ON courses
  FOR SELECT TO anon, authenticated USING (published = TRUE OR is_admin());
CREATE POLICY "courses admin write" ON courses
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "course_modules public read" ON course_modules
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM courses c WHERE c.id = course_modules.course_id AND (c.published = TRUE OR is_admin()))
  );
CREATE POLICY "course_modules admin write" ON course_modules
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- enrollments — student sees own, admin sees all.
CREATE POLICY "enrollments self read"  ON enrollments
  FOR SELECT TO authenticated USING (student_id = auth.uid() OR is_admin());
CREATE POLICY "enrollments self insert" ON enrollments
  FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR is_admin());
CREATE POLICY "enrollments admin update" ON enrollments
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- installments — derived from enrollment ownership.
CREATE POLICY "installments owner read" ON installments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM enrollments e WHERE e.id = installments.enrollment_id
             AND (e.student_id = auth.uid() OR is_admin()))
  );
CREATE POLICY "installments admin write" ON installments
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- payments — same.
CREATE POLICY "payments owner read" ON payments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM enrollments e WHERE e.id = payments.enrollment_id
             AND (e.student_id = auth.uid() OR is_admin()))
  );
CREATE POLICY "payments admin write" ON payments
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- portfolio_projects — public read when published.
CREATE POLICY "portfolio public read" ON portfolio_projects
  FOR SELECT TO anon, authenticated USING (published = TRUE OR is_admin());
CREATE POLICY "portfolio admin write" ON portfolio_projects
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- contact_messages — anyone can submit, only admins can read.
CREATE POLICY "contact public insert" ON contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "contact admin read"   ON contact_messages
  FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "contact admin write"  ON contact_messages
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());


-- =============================================================================
-- 11. End — fresh database. Seeds live in seed.sql (run after this file).
-- =============================================================================
