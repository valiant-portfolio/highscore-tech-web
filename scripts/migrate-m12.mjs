// M12 — admin staff management migration.
//  1. Add staff.photo_url
//  2. Create staff_reports table
//  3. Provision staff-photos storage bucket (public read)
//  4. Storage policies: admin writes/deletes, staff reads own photo

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
} catch {/* not fatal */}

if (!process.env.DATABASE_URL) { console.error('✗ DATABASE_URL required'); process.exit(1); }

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

console.log('• Adding staff.photo_url…');
await client.query(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS photo_url TEXT`);
console.log('  ✓ Column ready.');

console.log('• Creating staff_reports table…');
await client.query(`
  DO $$ BEGIN
    CREATE TYPE staff_report_kind AS ENUM ('sod', 'eod', 'general');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  CREATE TABLE IF NOT EXISTS staff_reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id      UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    kind          staff_report_kind NOT NULL DEFAULT 'general',
    report_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    content       TEXT NOT NULL,
    submitted_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    is_admin_override BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS staff_reports_staff_date_idx ON staff_reports (staff_id, report_date DESC);

  ALTER TABLE staff_reports ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "staff_reports admin all" ON staff_reports;
  CREATE POLICY "staff_reports admin all" ON staff_reports FOR ALL TO authenticated
    USING (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

  DROP POLICY IF EXISTS "staff_reports owner read" ON staff_reports;
  CREATE POLICY "staff_reports owner read" ON staff_reports FOR SELECT TO authenticated
    USING (
      EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_reports.staff_id AND staff.user_id = auth.uid())
    );

  DROP POLICY IF EXISTS "staff_reports owner insert" ON staff_reports;
  CREATE POLICY "staff_reports owner insert" ON staff_reports FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_reports.staff_id AND staff.user_id = auth.uid())
    );
`);
console.log('  ✓ staff_reports table + RLS.');

console.log('• Provisioning Storage bucket "staff-photos"…');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const { data: buckets } = await supabase.storage.listBuckets();
if (buckets?.some((b) => b.name === 'staff-photos')) {
  console.log('  · Bucket already exists.');
} else {
  const { error } = await supabase.storage.createBucket('staff-photos', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  });
  if (error) console.log(`  ✗ ${error.message}`);
  else console.log('  ✓ Bucket "staff-photos" created (public, 5MB, JPG/PNG/WebP).');
}

console.log('• Applying photo storage policies…');
await client.query(`
  DROP POLICY IF EXISTS "staff-photos admin write" ON storage.objects;
  DROP POLICY IF EXISTS "staff-photos public read" ON storage.objects;
  CREATE POLICY "staff-photos admin write" ON storage.objects FOR ALL TO authenticated
    USING (bucket_id = 'staff-photos' AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) = 'admin')
    WITH CHECK (bucket_id = 'staff-photos' AND (
      SELECT role FROM public.users WHERE id = auth.uid()
    ) = 'admin');
  CREATE POLICY "staff-photos public read" ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'staff-photos');
`);
console.log('  ✓ Policies applied.');

await client.end();
console.log('\n✓ M12 migration done.');
