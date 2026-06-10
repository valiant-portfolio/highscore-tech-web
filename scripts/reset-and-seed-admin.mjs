// Full reset:
//   1. Drop legacy mess: DROP SCHEMA public CASCADE; recreate; restore grants
//   2. Wipe Supabase Auth (auth.users)
//   3. Apply schema.sql (clean)
//   4. Apply seed.sql (portfolio + courses + modules + staff)
//   5. Create admin auth user via Supabase admin SDK (auto-confirmed)
//   6. Promote to admin in public.users
//
// Usage:
//   DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... \
//     node scripts/reset-and-seed-admin.mjs

import { readFile } from 'node:fs/promises';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

// ── Inline .env.local loader (dotenv defaults to .env) ─────────────────────
try {
  const raw = await readFile('.env.local', 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
} catch {
  /* not fatal — only needed for Supabase admin step */
}

const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'valiantcodez@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const ADMIN_NAME     = process.env.ADMIN_NAME     ?? 'Victor Otung';

if (!DATABASE_URL) { console.error('✗ DATABASE_URL required'); process.exit(1); }
if (!ADMIN_PASSWORD) { console.error('✗ ADMIN_PASSWORD required'); process.exit(1); }
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required (read from .env.local)');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 0,
  query_timeout: 0,
});
await client.connect();

// ── 1. Nuke public schema + auth.users ─────────────────────────────────────
console.log('• Step 1: dropping public schema + clearing auth.users…');
await client.query(`
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES    IN SCHEMA public TO postgres, anon, authenticated, service_role;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO postgres, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
`);
await client.query(`DELETE FROM auth.users`);
console.log('  ✓ public schema reset, auth.users cleared.');

// ── 2. Apply schema.sql ────────────────────────────────────────────────────
console.log('• Step 2: applying schema.sql…');
const schemaSql = await readFile('schema.sql', 'utf8');
await client.query(schemaSql);
console.log(`  ✓ schema.sql applied (${schemaSql.length.toLocaleString()} chars).`);

// ── 3. Apply seed.sql ──────────────────────────────────────────────────────
console.log('• Step 3: applying seed.sql…');
const seedSql = await readFile('seed.sql', 'utf8');
await client.query(seedSql);
console.log(`  ✓ seed.sql applied (${seedSql.length.toLocaleString()} chars).`);

// ── 4. Create admin auth user via Supabase admin API ───────────────────────
console.log(`• Step 4: provisioning auth user for ${ADMIN_EMAIL}…`);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
  user_metadata: { full_name: ADMIN_NAME },
});
if (createErr) {
  console.error('  ✗ createUser failed:', createErr.message);
  await client.end();
  process.exit(1);
}
console.log(`  ✓ auth.users row created (id ${created.user.id}).`);

// ── 5. Promote to admin ────────────────────────────────────────────────────
// handle_new_user trigger should already have written the public.users row.
console.log('• Step 5: promoting to admin…');
const { rowCount } = await client.query(
  "UPDATE users SET role = 'admin' WHERE email = $1",
  [ADMIN_EMAIL],
);
if (rowCount === 0) {
  // Fallback: trigger may not have fired (e.g. timing). Insert manually.
  await client.query(
    "INSERT INTO users (id, email, full_name, role) VALUES ($1, $2, $3, 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin'",
    [created.user.id, ADMIN_EMAIL, ADMIN_NAME],
  );
}
console.log('  ✓ Admin role assigned.');

// ── 6. Verify ──────────────────────────────────────────────────────────────
console.log('• Step 6: verifying…');
const counts = await client.query(`
  SELECT 'users'              AS table_name, COUNT(*)::int AS rows FROM users
  UNION ALL SELECT 'staff',              COUNT(*)::int FROM staff
  UNION ALL SELECT 'portfolio_projects', COUNT(*)::int FROM portfolio_projects
  UNION ALL SELECT 'courses',            COUNT(*)::int FROM courses
  UNION ALL SELECT 'course_modules',     COUNT(*)::int FROM course_modules
`);
for (const r of counts.rows) console.log(`    ${r.table_name.padEnd(20)} ${r.rows.toString().padStart(4)} rows`);
const adminRow = await client.query("SELECT email, role FROM users WHERE role = 'admin'");
console.log(`    Admins: ${adminRow.rows.map((r) => r.email).join(', ')}`);

await client.end();

console.log(`\n✓ Done. Log in at /login with:`);
console.log(`    Email:    ${ADMIN_EMAIL}`);
console.log(`    Password: (the one you supplied)`);
