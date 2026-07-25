// Chart history that highzcore owns. The bot may or may not sync bot_bars; this
// table is built by our own cron sampling bot_quotes, so the chart always has
// candles as long as the quote feed runs. Idempotent.
// Run: node scripts/migrate-bot-quote-bars.mjs

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
console.log('• Creating bot_quote_bars…');
await c.query(`
  create table if not exists bot_quote_bars (
    symbol     text not null,
    timeframe  text not null,               -- M5 | M15 | H1 | H4 | D1
    ts         timestamptz not null,        -- bar open (UTC), aligned to timeframe
    open       double precision not null,
    high       double precision not null,
    low        double precision not null,
    close      double precision not null,
    ticks      int not null default 1,      -- how many samples fed this candle
    updated_at timestamptz not null default now(),
    primary key (symbol, timeframe, ts)
  );
  create index if not exists bot_quote_bars_sym_tf_ts_idx on bot_quote_bars (symbol, timeframe, ts desc);
`);
const { rows: [{ n }] } = await c.query('select count(*)::int n from bot_quote_bars');
console.log(`  ✓ bot_quote_bars present (${n} rows).`);
await c.end();
console.log('\n✓ Done.');
