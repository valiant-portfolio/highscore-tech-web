// 1. Fix all seeded staff start_dates from 2026-06-01 → 2026-06-11.
// 2. Add 'team_eod' to the staff_report_kind enum so Olivia can submit
//    the aggregated team report as a single row.

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

console.log('• Fixing seeded staff start_dates → 2026-06-11…');
const upd = await client.query(`
  UPDATE staff
  SET start_date = '2026-06-11'
  WHERE start_date = '2026-06-01'
  RETURNING slug
`);
console.log(`  ✓ updated ${upd.rowCount} rows: ${upd.rows.map((r) => r.slug).join(', ') || '(none)'}`);

console.log('• Adding team_eod to staff_report_kind enum…');
// IF NOT EXISTS support on enum values requires PG 12+, but Supabase is on
// a modern PG so this is safe. Wrap in a check to keep the script
// idempotent for older PG.
await client.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'staff_report_kind' AND e.enumlabel = 'team_eod'
    ) THEN
      ALTER TYPE staff_report_kind ADD VALUE 'team_eod';
    END IF;
  END $$;
`);
console.log('  ✓ team_eod available.');

await client.end();
console.log('\n✓ Done.');
