// List every public-schema table, type, and function so we can see what's
// legitimately part of the new schema vs left over from the old creator-
// growth platform.

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

// New schema's owned objects — anything outside this list is legacy.
const NEW_TABLES = new Set([
  'users', 'staff', 'courses', 'course_modules',
  'enrollments', 'installments', 'payments',
  'portfolio_projects', 'contact_messages',
]);
const NEW_TYPES = new Set([
  'user_role', 'staff_status', 'course_mode',
  'enrollment_status', 'pay_plan', 'installment_status',
  'payment_status', 'contact_status',
]);
const NEW_FUNCTIONS = new Set([
  'is_admin', 'set_updated_at', 'handle_new_user',
]);

console.log('═══ TABLES ═══');
const tables = await client.query(`
  SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
`);
for (const row of tables.rows) {
  const tag = NEW_TABLES.has(row.tablename) ? '✓' : '✗ LEGACY';
  console.log(`  ${tag.padEnd(10)} ${row.tablename}`);
}

console.log('\n═══ ENUMS / TYPES ═══');
const types = await client.query(`
  SELECT t.typname
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public' AND t.typtype = 'e'
  ORDER BY t.typname
`);
for (const row of types.rows) {
  const tag = NEW_TYPES.has(row.typname) ? '✓' : '✗ LEGACY';
  console.log(`  ${tag.padEnd(10)} ${row.typname}`);
}

console.log('\n═══ FUNCTIONS ═══');
const funcs = await client.query(`
  SELECT p.proname
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
  ORDER BY p.proname
`);
for (const row of funcs.rows) {
  const tag = NEW_FUNCTIONS.has(row.proname) ? '✓' : '✗ LEGACY';
  console.log(`  ${tag.padEnd(10)} ${row.proname}`);
}

console.log('\n═══ auth.users ═══');
const authUsers = await client.query(`SELECT email FROM auth.users ORDER BY created_at`);
console.log(`  ${authUsers.rowCount} accounts:`);
for (const row of authUsers.rows) console.log(`    - ${row.email}`);

await client.end();
