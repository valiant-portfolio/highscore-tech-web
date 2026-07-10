// Portfolio image uploads: add portfolio_projects.images (text[]) and create a
// public 'portfolio' storage bucket so admins can upload up to 5 images per
// project from their device instead of pasting a URL. Idempotent.
// Run: node scripts/migrate-portfolio-images.mjs

import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';
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
  console.error('✗ DATABASE_URL required (highzcore/.env.local)');
  process.exit(1);
}

// 1. Column.
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('• Adding portfolio_projects.images…');
await client.query(`ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];`);

// Backfill: seed images[] from an existing cover so nothing already set is lost.
await client.query(`
  UPDATE portfolio_projects
     SET images = ARRAY[cover_image_url]
   WHERE cover_image_url IS NOT NULL
     AND (images IS NULL OR array_length(images, 1) IS NULL);
`);
const { rows } = await client.query(`SELECT COUNT(*)::int AS total FROM portfolio_projects`);
console.log(`  ✓ Column present. ${rows[0].total} projects.`);
await client.end();

// 2. Public storage bucket.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY;
if (!url || !serviceKey) {
  console.error('\n✗ Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to create the bucket.');
  console.error('  The column is done; create a PUBLIC bucket named "portfolio" in the Supabase dashboard if this step is skipped.');
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
console.log('• Creating public "portfolio" storage bucket…');
const { error } = await supabase.storage.createBucket('portfolio', {
  public: true,
  fileSizeLimit: '8MB',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
});
if (error && !/already exists/i.test(error.message)) {
  console.error('  ✗ Bucket creation failed:', error.message);
  process.exit(1);
}
console.log(error ? '  ✓ Bucket already exists.' : '  ✓ Bucket created.');

console.log('\n✓ Done.');
