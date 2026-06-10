// M13 + M14 migration — audit_log table (append-only) + indexes.

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

console.log('• Creating audit_log table…');
await client.query(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email   TEXT,
    action        TEXT NOT NULL,
    target_type   TEXT,
    target_id     UUID,
    target_label  TEXT,
    diff          JSONB,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);
  CREATE INDEX IF NOT EXISTS audit_log_action_idx  ON audit_log (action);
  CREATE INDEX IF NOT EXISTS audit_log_actor_idx   ON audit_log (actor_user_id);
  CREATE INDEX IF NOT EXISTS audit_log_target_idx  ON audit_log (target_type, target_id);

  ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "audit_log admin read" ON audit_log;
  CREATE POLICY "audit_log admin read" ON audit_log FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
`);
console.log('  ✓ audit_log table ready (append-only — no UPDATE/DELETE policies).');

await client.end();
console.log('\n✓ M13/M14 migration done.');
