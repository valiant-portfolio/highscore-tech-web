// One-shot SQL applier — reads schema.sql + seed.sql and runs each against
// the Postgres connection at DATABASE_URL. Safe to re-run: both files use
// DROP / ON CONFLICT idempotence patterns.
//
// Usage:
//   DATABASE_URL="postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres" \
//     node scripts/apply-sql.mjs
//
// Optional: pass --schema or --seed to apply only one file.

import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

const argv = process.argv.slice(2);
const onlySchema = argv.includes('--schema');
const onlySeed = argv.includes('--seed');
const targets = onlySchema && onlySeed
  ? ['schema.sql', 'seed.sql']
  : onlySchema ? ['schema.sql']
  : onlySeed ? ['seed.sql']
  : ['schema.sql', 'seed.sql'];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('✗ DATABASE_URL not set.');
  console.error('  Supabase → Project Settings → Database → Connection string (URI)');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },   // Supabase requires SSL
  statement_timeout: 0,                  // schema is big; no timeout
  query_timeout: 0,
});

console.log('• Connecting…');
try {
  await client.connect();
} catch (err) {
  console.error('✗ Connection failed:', err.message);
  process.exit(1);
}
console.log('  ✓ Connected.');

for (const file of targets) {
  process.stdout.write(`• Applying ${file}… `);
  let sql;
  try {
    sql = await readFile(file, 'utf8');
  } catch (err) {
    console.error(`\n✗ Could not read ${file}:`, err.message);
    await client.end();
    process.exit(1);
  }
  try {
    await client.query(sql);
    console.log(`✓ (${sql.length.toLocaleString()} chars)`);
  } catch (err) {
    console.error(`\n✗ ${file} failed:`);
    console.error('  ', err.message);
    if (err.position) console.error('   position:', err.position);
    if (err.hint) console.error('   hint:', err.hint);
    await client.end();
    process.exit(1);
  }
}

console.log('• Verifying…');
const checks = await client.query(`
  SELECT 'users'              AS table_name, COUNT(*)::int AS rows FROM users
  UNION ALL SELECT 'staff',              COUNT(*)::int FROM staff
  UNION ALL SELECT 'portfolio_projects', COUNT(*)::int FROM portfolio_projects
  UNION ALL SELECT 'courses',            COUNT(*)::int FROM courses
  UNION ALL SELECT 'course_modules',     COUNT(*)::int FROM course_modules
`);
for (const row of checks.rows) {
  console.log(`  ${row.table_name.padEnd(20)} ${row.rows.toString().padStart(4)} rows`);
}

await client.end();
console.log('\n✓ Done.');
