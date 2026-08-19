// Highscore Studio — orders table.
//
//   node scripts/migrate-studio.mjs
//
// One row per order. Studio sells one deliverable per order (no instalments),
// so the payment lives ON the order rather than in a separate payments table —
// that also sidesteps payments.enrollment_id being NOT NULL.
//
// Money: we sell worldwide, so the order is priced in USD (amount_usd) and we
// snapshot the NGN amount actually charged through ALAT (amount_ngn) plus the
// rate used, so a receipt can always be reproduced exactly even after the rate
// moves.
//
// Access: orders are placed by GUESTS (no account), so ownership can't be
// auth.uid(). RLS is left closed — every read/write goes through the service
// role in server code, and a customer reaches their own order only via the
// unguessable reference in their URL.

import { Client } from 'pg';
import { readFileSync } from 'node:fs';

// Load .env.local without pulling in a dependency (same as the other scripts).
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* env may come from the shell instead */ }

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('✗ DATABASE_URL is not set (put it in .env.local).');
  process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

const SQL = `
CREATE TABLE IF NOT EXISTS studio_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference         TEXT UNIQUE NOT NULL,

  -- what they bought (priced server-side from the catalogue)
  package_key       TEXT NOT NULL,
  package_name      TEXT NOT NULL,
  amount_usd        NUMERIC(10,2) NOT NULL,
  amount_ngn        INTEGER,
  usd_ngn_rate      NUMERIC(10,2),

  -- the brief: branches by project type, so the answers are jsonb
  project_type      TEXT NOT NULL,
  brief             JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- who
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  country           TEXT NOT NULL,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,

  -- how the finished work reaches them
  delivery_channel  TEXT NOT NULL,
  delivery_handle   TEXT NOT NULL,
  needed_by         DATE,
  delivery_due      DATE,

  -- money in
  payment_method    TEXT NOT NULL,
  payment_reference TEXT UNIQUE,
  payment_status    TEXT NOT NULL DEFAULT 'pending',
  paid_at           TIMESTAMPTZ,
  raw_payload       JSONB,

  -- workflow
  status            TEXT NOT NULL DEFAULT 'awaiting_payment',
  admin_notes       TEXT,
  delivered_at      TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT studio_orders_payment_status_check
    CHECK (payment_status IN ('pending','succeeded','failed','refunded')),
  CONSTRAINT studio_orders_status_check
    CHECK (status IN ('awaiting_payment','paid','in_progress','delivered','cancelled')),
  CONSTRAINT studio_orders_method_check
    CHECK (payment_method IN ('alatpay','card','manual'))
);

-- We sell to Nigeria only, so orders are priced and charged in Naira. The USD
-- columns stay for the orders taken while the site was priced in dollars, but
-- new orders don't populate them.
ALTER TABLE studio_orders ALTER COLUMN amount_usd DROP NOT NULL;
ALTER TABLE studio_orders ADD COLUMN IF NOT EXISTS addons JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS studio_orders_status_idx     ON studio_orders (status);
CREATE INDEX IF NOT EXISTS studio_orders_created_idx    ON studio_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS studio_orders_email_idx      ON studio_orders (customer_email);
CREATE INDEX IF NOT EXISTS studio_orders_payref_idx     ON studio_orders (payment_reference);
CREATE INDEX IF NOT EXISTS studio_orders_user_idx       ON studio_orders (user_id);

DROP TRIGGER IF EXISTS trg_studio_orders_updated_at ON studio_orders;
CREATE TRIGGER trg_studio_orders_updated_at BEFORE UPDATE ON studio_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Closed by default: guests have no auth.uid() to match on, so nothing is
-- readable with the anon key. Server code uses the service role; the customer
-- reaches their own order through the unguessable reference in their URL.
ALTER TABLE studio_orders ENABLE ROW LEVEL SECURITY;

-- A signed-in customer may read the orders linked to their account.
DROP POLICY IF EXISTS "studio_orders self read" ON studio_orders;
CREATE POLICY "studio_orders self read" ON studio_orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "studio_orders admin write" ON studio_orders;
CREATE POLICY "studio_orders admin write" ON studio_orders
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- ── Portfolio ────────────────────────────────────────────────────────────
-- Finished work we show publicly. The media itself lives on Cloudinary (it
-- transcodes and serves the heavy video); we only keep the URLs.
CREATE TABLE IF NOT EXISTS studio_works (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  client         TEXT,
  project_type   TEXT,
  summary        TEXT,

  media_type     TEXT NOT NULL DEFAULT 'video',
  video_url      TEXT,
  audio_url      TEXT,
  poster_url     TEXT,
  cloudinary_id  TEXT,

  published      BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order     INTEGER NOT NULL DEFAULT 0,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT studio_works_media_type_check CHECK (media_type IN ('video','audio','image'))
);

CREATE INDEX IF NOT EXISTS studio_works_published_idx ON studio_works (published, sort_order);

DROP TRIGGER IF EXISTS trg_studio_works_updated_at ON studio_works;
CREATE TRIGGER trg_studio_works_updated_at BEFORE UPDATE ON studio_works
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE studio_works ENABLE ROW LEVEL SECURITY;

-- Published work is public (this is the shop window); everything else is admin.
DROP POLICY IF EXISTS "studio_works public read" ON studio_works;
CREATE POLICY "studio_works public read" ON studio_works
  FOR SELECT TO anon, authenticated
  USING (published = TRUE OR is_admin());

DROP POLICY IF EXISTS "studio_works admin write" ON studio_works;
CREATE POLICY "studio_works admin write" ON studio_works
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
`;

try {
  await client.connect();
  console.log('→ connected');
  await client.query(SQL);
  console.log('  ✓ studio_orders table, indexes, trigger and policies');
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'studio_orders' ORDER BY ordinal_position`,
  );
  console.log(`  ✓ ${rows.length} columns:`, rows.map((r) => r.column_name).join(', '));
  console.log('✓ studio migration complete');
} catch (err) {
  console.error('✗ migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
