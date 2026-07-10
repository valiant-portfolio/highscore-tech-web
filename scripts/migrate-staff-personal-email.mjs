// Staff personal email: add staff.personal_email so a staff member can add
// their own personal address, and the admin can pick it (or the work email)
// when messaging or offboarding. Idempotent.
// Run: node scripts/migrate-staff-personal-email.mjs

import { Client } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

console.log('• Adding staff.personal_email…');
await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS personal_email TEXT;`);

const { rows } = await client.query(`
  SELECT COUNT(*)::int AS total, COUNT(personal_email)::int AS with_email FROM staff
`);
console.log(`  ✓ Column present. ${rows[0].total} staff, ${rows[0].with_email} with a personal email on file.`);

await client.end();
console.log('\n✓ Done.');
