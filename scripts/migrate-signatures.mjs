// Add signature_url + nda_signed_at columns to staff. Provision a private
// signatures bucket with RLS: each staff member writes to their own folder,
// admin reads everywhere.

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

console.log('• Adding signature columns to staff…');
await client.query(`
  ALTER TABLE staff
    ADD COLUMN IF NOT EXISTS signature_url  TEXT,
    ADD COLUMN IF NOT EXISTS nda_signed_at  TIMESTAMPTZ;
`);
console.log('  ✓ Columns ready.');

console.log('• Provisioning Storage bucket "signatures"…');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const { data: buckets } = await supabase.storage.listBuckets();
if (buckets?.some((b) => b.name === 'signatures')) {
  console.log('  · Bucket already exists.');
} else {
  const { error } = await supabase.storage.createBucket('signatures', {
    public: false,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png'],
  });
  if (error) {
    console.log(`  ✗ Could not create bucket: ${error.message}`);
  } else {
    console.log('  ✓ Bucket "signatures" created (private, 8MB, JPEG/PNG).');
  }
}

console.log('• Applying signature storage policies…');
await client.query(`
  DROP POLICY IF EXISTS "signatures admin all"     ON storage.objects;
  DROP POLICY IF EXISTS "signatures owner read"    ON storage.objects;
  DROP POLICY IF EXISTS "signatures owner write"   ON storage.objects;
  CREATE POLICY "signatures admin all" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'signatures' AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) = 'admin')
    WITH CHECK (bucket_id = 'signatures' AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) = 'admin');
  CREATE POLICY "signatures owner read" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'signatures' AND (storage.foldername(name))[1] = auth.uid()::text);
  CREATE POLICY "signatures owner write" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'signatures' AND (storage.foldername(name))[1] = auth.uid()::text);
`);
console.log('  ✓ Policies applied.');

await client.end();
console.log('\n✓ Done.');
