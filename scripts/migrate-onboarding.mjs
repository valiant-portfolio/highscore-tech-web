// Add onboarding columns to users table + provision the NIN docs storage
// bucket if it doesn't exist. Idempotent.

import { readFile } from 'node:fs/promises';
import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

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

console.log('• Adding onboarding columns to users…');
await client.query(`
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS date_of_birth      DATE,
    ADD COLUMN IF NOT EXISTS gender             TEXT,
    ADD COLUMN IF NOT EXISTS state_of_origin    TEXT,
    ADD COLUMN IF NOT EXISTS address_line       TEXT,
    ADD COLUMN IF NOT EXISTS city               TEXT,
    ADD COLUMN IF NOT EXISTS emergency_name     TEXT,
    ADD COLUMN IF NOT EXISTS emergency_phone    TEXT,
    ADD COLUMN IF NOT EXISTS emergency_relation TEXT,
    ADD COLUMN IF NOT EXISTS education_level    TEXT,
    ADD COLUMN IF NOT EXISTS occupation         TEXT,
    ADD COLUMN IF NOT EXISTS nin_doc_url        TEXT,
    ADD COLUMN IF NOT EXISTS onboarded_at       TIMESTAMPTZ;
`);
console.log('  ✓ Columns ready.');

// Mark existing admin / staff as onboarded so the redirect doesn't trap them.
const { rowCount } = await client.query(`
  UPDATE users SET onboarded_at = NOW()
   WHERE onboarded_at IS NULL AND role IN ('admin', 'staff')
`);
console.log(`  ✓ Marked ${rowCount} admin/staff as onboarded.`);

// ── Provision the NIN docs storage bucket ─────────────────────────────────
console.log('• Provisioning Storage bucket "nin-docs"…');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const { data: existing } = await supabase.storage.listBuckets();
if (existing?.some((b) => b.name === 'nin-docs')) {
  console.log('  · Bucket already exists.');
} else {
  const { error } = await supabase.storage.createBucket('nin-docs', {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,                                  // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  });
  if (error) {
    console.log(`  ✗ Could not create bucket: ${error.message}`);
  } else {
    console.log('  ✓ Bucket "nin-docs" created (private, 5MB, JPEG/PNG/PDF).');
  }
}

// Bucket-level RLS via storage.objects policies — admin sees all, students
// see their own folder.
console.log('• Applying storage policies…');
await client.query(`
  DROP POLICY IF EXISTS "nin-docs admin all"      ON storage.objects;
  DROP POLICY IF EXISTS "nin-docs owner read"    ON storage.objects;
  DROP POLICY IF EXISTS "nin-docs owner upload"  ON storage.objects;
  CREATE POLICY "nin-docs admin all" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'nin-docs' AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) = 'admin')
    WITH CHECK (bucket_id = 'nin-docs' AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) = 'admin');
  CREATE POLICY "nin-docs owner read" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'nin-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
  CREATE POLICY "nin-docs owner upload" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'nin-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
`);
console.log('  ✓ Policies applied (admin sees all, students see own folder).');

await client.end();
console.log('\n✓ Migration done.');
