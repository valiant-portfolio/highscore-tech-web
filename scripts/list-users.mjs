// List all users currently in public.users + auth.users so we can see what
// signup actually created.

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

console.log('• public.users:');
const pub = await client.query('SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at ASC');
if (pub.rowCount === 0) {
  console.log('  (empty)');
} else {
  for (const row of pub.rows) {
    console.log(`  ${row.email.padEnd(40)}  role=${row.role}  name="${row.full_name ?? ''}"`);
  }
}

console.log('\n• auth.users (Supabase Auth):');
const auth = await client.query(`
  SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data->>'full_name' AS full_name
  FROM auth.users ORDER BY created_at ASC
`);
if (auth.rowCount === 0) {
  console.log('  (empty)');
} else {
  for (const row of auth.rows) {
    const confirmed = row.email_confirmed_at ? '✓ confirmed' : '○ unconfirmed';
    console.log(`  ${(row.email ?? '(no email)').padEnd(40)}  ${confirmed}  name="${row.full_name ?? ''}"`);
  }
}

await client.end();
