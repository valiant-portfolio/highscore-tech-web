// Trading-bot email alerts: a dedupe log so each bot event (a new pending order,
// a position opening, a position closing) triggers exactly one email, no matter
// how often the notify cron polls. Idempotent.
// Run: node scripts/migrate-bot-notify-log.mjs

import { Client } from 'pg';
import { readFileSync, existsSync } from 'fs';

const env = '.env.local';
if (existsSync(env)) for (const l of readFileSync(env, 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
if (!process.env.DATABASE_URL) { console.error('✗ DATABASE_URL required (.env.local)'); process.exit(1); }

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
console.log('• Creating bot_notify_log…');
await c.query(`
  create table if not exists bot_notify_log (
    kind        text not null,   -- pending_order | position_opened | position_closed
    ref         text not null,   -- stable per-event key (order:sym:level, open:id, close:id)
    notified_at timestamptz not null default now(),
    primary key (kind, ref)
  );
  create index if not exists bot_notify_log_ts_idx on bot_notify_log (notified_at desc);
`);
const { rows: [{ n }] } = await c.query('select count(*)::int n from bot_notify_log');
console.log(`  ✓ bot_notify_log present (${n} rows).`);
await c.end();
console.log('\n✓ Done.');
