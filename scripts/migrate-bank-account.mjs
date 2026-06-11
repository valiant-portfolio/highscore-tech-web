// Add bank account fields to staff. Idempotent.

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

console.log('• Adding staff bank account columns…');
await client.query(`
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_name           TEXT;
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_account_name   TEXT;
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS bank_updated_at     TIMESTAMPTZ;
`);
console.log('  ✓ Columns ready.');

await client.end();
console.log('\n✓ Done.');
