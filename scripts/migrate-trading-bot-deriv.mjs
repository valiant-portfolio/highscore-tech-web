// Deriv pivot: extend the trading_bot_* tables to carry Deriv-multiplier config
// (stake / multiplier / deal cancellation / running switch / loginid) and the
// Deriv contract_id on trades. Idempotent. Run: node scripts/migrate-trading-bot-deriv.mjs

import { Client } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load highzcore/.env.local so plain `node scripts/...` picks up DATABASE_URL.
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
  console.error('✗ DATABASE_URL required (highzcore/.env.local — Supabase → Settings → Database → Session pooler URI)');
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

console.log('• Extending trading_bot_markets with Deriv config…');
await client.query(`
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS broker            TEXT    NOT NULL DEFAULT 'deriv';
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS deriv_symbol      TEXT;        -- e.g. frxXAUUSD
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS stake             NUMERIC NOT NULL DEFAULT 1;     -- USD per trade
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS multiplier        INTEGER NOT NULL DEFAULT 100;
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS deal_cancellation BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS running           BOOLEAN NOT NULL DEFAULT FALSE; -- master on/off (the dashboard start/stop)
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS account_mode      TEXT    NOT NULL DEFAULT 'demo'; -- demo | real (real gated separately)
  ALTER TABLE trading_bot_markets ADD COLUMN IF NOT EXISTS loginid           TEXT;        -- the Deriv account the bot trades (VRTC… on demo)
`);
console.log('  ✓ Done.');

console.log('• Extending trading_bot_trades with the Deriv contract id…');
await client.query(`
  ALTER TABLE trading_bot_trades ADD COLUMN IF NOT EXISTS contract_id BIGINT;
  CREATE UNIQUE INDEX IF NOT EXISTS trading_bot_trades_contract_open
    ON trading_bot_trades (contract_id) WHERE closed_at IS NULL AND contract_id IS NOT NULL;
`);
console.log('  ✓ Done.');

console.log('• Pointing the gold row at Deriv (frxXAUUSD) + sensible demo defaults…');
await client.query(`
  UPDATE trading_bot_markets
     SET broker = 'deriv', deriv_symbol = 'frxXAUUSD', account_mode = 'demo',
         note = 'Deriv gold (frxXAUUSD) — structure + strict daily filter (multipliers)'
   WHERE symbol = 'XAUUSD';
`);
console.log('  ✓ Done.');

console.log('\n✓ Done. Schema is Deriv-ready.');
await client.end();
