// Promotes a single user to admin role. Usage:
//   DATABASE_URL=... node scripts/promote-admin.mjs <email>

import { Client } from 'pg';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/promote-admin.mjs <email>');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL first.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const result = await client.query(
  "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email, role",
  [email],
);

if (result.rowCount === 0) {
  console.log(`✗ No user found with email "${email}".`);
  console.log('  Sign up at /signup first, confirm your email, then re-run this.');
} else {
  console.log(`✓ Promoted: ${result.rows[0].email}  (role: ${result.rows[0].role})`);
}

const admins = await client.query("SELECT email FROM users WHERE role = 'admin'");
console.log(`  Total admins now: ${admins.rowCount} (${admins.rows.map((r) => r.email).join(', ') || '—'})`);

await client.end();
