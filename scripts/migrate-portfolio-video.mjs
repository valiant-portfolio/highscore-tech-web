// Portfolio video: add portfolio_projects.video_url and widen the public
// 'portfolio' bucket to accept video (bigger size limit + video mime types) so
// a project can carry one showcase clip alongside its images. Idempotent.
// Run: node scripts/migrate-portfolio-video.mjs

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

if (!process.env.DATABASE_URL) { console.error('✗ DATABASE_URL required (.env.local)'); process.exit(1); }

// 1. Column.
const pg = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await pg.connect();
console.log('• Adding portfolio_projects.video_url…');
await pg.query(`ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS video_url TEXT;`);
console.log('  ✓ Column present.');
await pg.end();

// 2. Widen the bucket to accept video.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('\n✗ Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to update the bucket.'); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });
console.log('• Updating "portfolio" bucket (video allowed, 200MB limit)…');
const { error } = await supabase.storage.updateBucket('portfolio', {
  public: true,
  fileSizeLimit: '200MB',
  allowedMimeTypes: [
    'image/jpeg', 'image/png', 'image/webp', 'image/avif',
    'video/mp4', 'video/quicktime', 'video/webm',
  ],
});
if (error) { console.error('  ✗ Bucket update failed:', error.message); process.exit(1); }
console.log('  ✓ Bucket updated.');

console.log('\n✓ Done.');
