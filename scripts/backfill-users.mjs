// Backfill public.users from auth.users for any rows that exist in Supabase
// Auth but missed the handle_new_user trigger (happens if auth signups
// pre-date the trigger creation, like rows left behind across a schema wipe).

import { Client } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL first.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const result = await client.query(`
  INSERT INTO public.users (id, email, full_name)
  SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', '')
  FROM auth.users au
  WHERE au.email IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
  RETURNING email, full_name
`);

if (result.rowCount === 0) {
  console.log('• No backfill needed — public.users is already in sync.');
} else {
  console.log(`✓ Backfilled ${result.rowCount} user(s) into public.users:`);
  for (const row of result.rows) {
    console.log(`  - ${row.email}  ("${row.full_name}")`);
  }
}

await client.end();
