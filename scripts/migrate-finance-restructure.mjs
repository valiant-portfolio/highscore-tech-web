// Finance restructure:
//   1. Projects can be type 'client' or 'internal'; cost is nullable
//      (internal projects don't have a client cost), and gets a URL.
//   2. Expenses become COMPANY-wide instead of per-project. New
//      `company_expenses` table replaces `client_project_expenses`,
//      with `project_id` now NULLABLE so unrelated overheads (rent,
//      hosting, subscriptions, etc.) can live alongside project-specific
//      spend.

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

console.log('• Adding project_type / project_url to client_projects…');
await client.query(`
  ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS project_type TEXT NOT NULL DEFAULT 'client'
      CHECK (project_type IN ('client', 'internal'));
  ALTER TABLE client_projects
    ALTER COLUMN cost_ngn DROP NOT NULL;
  ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS project_url TEXT;
`);
console.log('  ✓ project_type + nullable cost + project_url ready.');

console.log('• Creating company_expenses…');
await client.query(`
  CREATE TABLE IF NOT EXISTS company_expenses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount_ngn    NUMERIC NOT NULL CHECK (amount_ngn > 0),
    spent_at      DATE NOT NULL DEFAULT CURRENT_DATE,
    category      TEXT,
    reason        TEXT NOT NULL,
    notes         TEXT,
    project_id    UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    recorded_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS company_expenses_spent_at_idx ON company_expenses (spent_at DESC);
  CREATE INDEX IF NOT EXISTS company_expenses_project_idx  ON company_expenses (project_id) WHERE project_id IS NOT NULL;
  ALTER TABLE company_expenses ENABLE ROW LEVEL SECURITY;
`);
console.log('  ✓ company_expenses ready.');

console.log('• Migrating any existing client_project_expenses → company_expenses…');
const mig = await client.query(`
  INSERT INTO company_expenses (id, amount_ngn, spent_at, category, reason, notes, project_id, recorded_by, created_at)
  SELECT id, amount_ngn, spent_at, category, reason, notes, project_id, recorded_by, created_at
  FROM client_project_expenses
  ON CONFLICT DO NOTHING
  RETURNING id
`);
console.log(`  ✓ migrated ${mig.rowCount} rows.`);

console.log('• Dropping legacy client_project_expenses…');
await client.query(`DROP TABLE IF EXISTS client_project_expenses;`);
console.log('  ✓ dropped.');

await client.end();
console.log('\n✓ Done.');
