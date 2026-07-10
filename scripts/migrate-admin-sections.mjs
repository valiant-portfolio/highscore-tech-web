// Per-section admin access: add users.admin_sections (text[]) so an admin can
// grant individual sidebar areas to a staff member. Idempotent.
// Run: node scripts/migrate-admin-sections.mjs

import { Client } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load highzcore/.env.local so plain `node scripts/...` picks up DATABASE_URL.
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error('✗ DATABASE_URL required (highzcore/.env.local — Supabase → Settings → Database → Session pooler URI)');
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

console.log('• Adding users.admin_sections…');
await client.query(`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_sections TEXT[] NOT NULL DEFAULT '{}';
`);

// Verify + show the current grant state so we can eyeball it.
const { rows } = await client.query(`
  SELECT
    (SELECT COUNT(*)::int FROM users)                                          AS total_users,
    (SELECT COUNT(*)::int FROM users WHERE array_length(admin_sections, 1) > 0) AS with_sections
`);
const r = rows[0];
console.log(`  ✓ Column present. ${r.total_users} users, ${r.with_sections} with any granted section.`);

await client.end();
console.log('\n✓ Done.');
