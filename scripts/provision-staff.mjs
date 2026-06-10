// Provisions auth accounts for every active staff record that has a
// work_email but no linked user yet. Default password = `Highscore-<slug>`.
// Each staff member is told to change it from their settings on first login.
//
// Idempotent: re-running skips staff that are already linked.
//
// Usage:
//   DATABASE_URL=... node scripts/provision-staff.mjs
//   DATABASE_URL=... node scripts/provision-staff.mjs --rotate olivia
//     (the --rotate flag resets the password back to the default; useful
//      when a staff member forgets their password)

import { readFile } from 'node:fs/promises';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local ────────────────────────────────────────────────────────
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

const argv = process.argv.slice(2);
const rotateIdx = argv.indexOf('--rotate');
const rotateSlug = rotateIdx >= 0 ? argv[rotateIdx + 1] : null;

if (!process.env.DATABASE_URL) { console.error('✗ DATABASE_URL required'); process.exit(1); }
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required.'); process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Pull all active staff with a work_email.
const staffQuery = await client.query(
  `SELECT id, slug, full_name, work_email, user_id
     FROM staff
    WHERE status = 'active' AND work_email IS NOT NULL
    ORDER BY salary_ngn DESC`,
);

console.log(`• ${staffQuery.rowCount} active staff record(s) found.`);

let provisioned = 0, linked = 0, rotated = 0, skipped = 0;

for (const s of staffQuery.rows) {
  const password = `Highscore-${s.slug}`;

  if (rotateSlug && s.slug !== rotateSlug) continue;
  if (rotateSlug && s.slug === rotateSlug && s.user_id) {
    const { error } = await supabase.auth.admin.updateUserById(s.user_id, { password });
    if (error) {
      console.log(`  ✗ ${s.slug}: password reset failed — ${error.message}`);
    } else {
      console.log(`  ↻ ${s.slug}: password reset to "${password}"`);
      rotated++;
    }
    continue;
  }

  // Already linked? Skip.
  if (s.user_id) { console.log(`  · ${s.slug}: already linked to user ${s.user_id.slice(0, 8)}`); skipped++; continue; }

  // Does an auth user with this email already exist?
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users.find((u) => (u.email ?? '').toLowerCase() === s.work_email.toLowerCase());

  let authUserId;
  if (existing) {
    // Email already in Supabase Auth — just link.
    authUserId = existing.id;
    console.log(`  → ${s.slug}: auth account already exists (${s.work_email}). Linking.`);
    linked++;
  } else {
    // Create a fresh auth account with default password, auto-confirmed.
    const { data, error } = await supabase.auth.admin.createUser({
      email: s.work_email,
      password,
      email_confirm: true,
      user_metadata: { full_name: s.full_name },
    });
    if (error || !data?.user) {
      console.log(`  ✗ ${s.slug}: createUser failed — ${error?.message ?? 'unknown'}`);
      continue;
    }
    authUserId = data.user.id;
    console.log(`  ✓ ${s.slug}: created auth ${s.work_email} · default password "${password}"`);
    provisioned++;
  }

  // Ensure public.users mirror exists (trigger should have done it; backstop here too).
  await client.query(
    `INSERT INTO public.users (id, email, full_name, role)
     VALUES ($1, $2, $3, 'staff')
     ON CONFLICT (id) DO UPDATE SET role = 'staff'`,
    [authUserId, s.work_email, s.full_name],
  );
  // Link the staff row.
  await client.query('UPDATE staff SET user_id = $1 WHERE id = $2', [authUserId, s.id]);
}

await client.end();

console.log(`\n✓ Done. Provisioned: ${provisioned}  Linked: ${linked}  Rotated: ${rotated}  Skipped: ${skipped}`);
console.log('  Each staff logs in at /login with their work_email + Highscore-<slug>.');
