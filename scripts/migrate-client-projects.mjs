// Client project tracking — 6 tables to record client jobs, payments
// received, expenses, milestones, assigned staff, and progress reports.

import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

try {
  const raw = await readFile('.env.local', 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
} catch { /* not fatal */ }

if (!process.env.DATABASE_URL) { console.error('✗ DATABASE_URL required'); process.exit(1); }

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

console.log('• Creating client_projects + related tables…');
await client.query(`
  CREATE TABLE IF NOT EXISTS client_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    client_name     TEXT NOT NULL,
    client_email    TEXT,
    client_phone    TEXT,
    description     TEXT,
    cost_ngn        NUMERIC NOT NULL CHECK (cost_ngn >= 0),
    status          TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    started_at      DATE,
    due_at          DATE,
    ended_at        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS client_projects_status_idx     ON client_projects (status);
  CREATE INDEX IF NOT EXISTS client_projects_created_at_idx ON client_projects (created_at DESC);

  CREATE TABLE IF NOT EXISTS client_project_payments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    amount_ngn    NUMERIC NOT NULL CHECK (amount_ngn > 0),
    received_at   DATE NOT NULL DEFAULT CURRENT_DATE,
    method        TEXT,
    reference     TEXT,
    notes         TEXT,
    recorded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS client_project_payments_project_idx ON client_project_payments (project_id, received_at DESC);

  CREATE TABLE IF NOT EXISTS client_project_expenses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    amount_ngn    NUMERIC NOT NULL CHECK (amount_ngn > 0),
    spent_at      DATE NOT NULL DEFAULT CURRENT_DATE,
    category      TEXT,
    reason        TEXT NOT NULL,
    notes         TEXT,
    recorded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS client_project_expenses_project_idx ON client_project_expenses (project_id, spent_at DESC);

  CREATE TABLE IF NOT EXISTS client_project_milestones (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
    due_date      DATE,
    completed_at  TIMESTAMPTZ,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS client_project_milestones_project_idx ON client_project_milestones (project_id, sort_order);

  CREATE TABLE IF NOT EXISTS client_project_assignments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    staff_id      UUID NOT NULL REFERENCES staff(id)            ON DELETE CASCADE,
    role          TEXT,
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, staff_id)
  );
  CREATE INDEX IF NOT EXISTS client_project_assignments_project_idx ON client_project_assignments (project_id);
  CREATE INDEX IF NOT EXISTS client_project_assignments_staff_idx   ON client_project_assignments (staff_id);

  CREATE TABLE IF NOT EXISTS client_project_reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    report_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    content       TEXT NOT NULL,
    submitted_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS client_project_reports_project_idx ON client_project_reports (project_id, report_date DESC);

  -- RLS — admin (and Olivia, slug check) read/write. Anon: no access.
  ALTER TABLE client_projects              ENABLE ROW LEVEL SECURITY;
  ALTER TABLE client_project_payments      ENABLE ROW LEVEL SECURITY;
  ALTER TABLE client_project_expenses      ENABLE ROW LEVEL SECURITY;
  ALTER TABLE client_project_milestones    ENABLE ROW LEVEL SECURITY;
  ALTER TABLE client_project_assignments   ENABLE ROW LEVEL SECURITY;
  ALTER TABLE client_project_reports       ENABLE ROW LEVEL SECURITY;

  -- For now: server-side actions use the service_role client, which
  -- bypasses RLS. Tighter per-row policies can come later if we expose
  -- project pages to staff.
`);
console.log('  ✓ Tables ready.');

await client.end();
console.log('\n✓ Done.');
