// Trading-Bot dashboard schema: market config + signals + trades + events +
// daily summaries, for the /admin/trading-bot section. The forex bot writes via
// the service-role key (bypasses RLS); admins read/write via is_admin() RLS.
// Idempotent — safe to re-run. Requires DATABASE_URL. Run: node scripts/migrate-trading-bot.mjs

import { Client } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load highzcore/.env.local so plain `node scripts/...` picks up DATABASE_URL etc.
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
  console.error('✗ DATABASE_URL required. Add it to highzcore/.env.local —');
  console.error('  Supabase Dashboard → Project Settings → Database → Connection string → "Session pooler" (URI).');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

console.log('• Creating trading_bot tables…');
await client.query(`
  -- One row per market: live config (lot size / enabled) + running performance.
  CREATE TABLE IF NOT EXISTS trading_bot_markets (
    symbol       TEXT PRIMARY KEY,
    enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    lot_size     NUMERIC NOT NULL DEFAULT 0.01,
    magic        INTEGER,
    note         TEXT,
    wins         INTEGER NOT NULL DEFAULT 0,
    losses       INTEGER NOT NULL DEFAULT 0,
    breakeven    INTEGER NOT NULL DEFAULT 0,
    net_r        NUMERIC NOT NULL DEFAULT 0,
    net_profit   NUMERIC NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Every confirmed/armed setup the bot detects (whether or not it places an order).
  CREATE TABLE IF NOT EXISTS trading_bot_signals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol      TEXT NOT NULL,
    side        TEXT,                    -- LONG / SHORT
    state       TEXT,                    -- ARM-LONG / ARM-SHORT / WAIT…
    entry       NUMERIC,
    sl          NUMERIC,
    tp          NUMERIC,
    rr          NUMERIC,
    reason      TEXT,
    topdown     TEXT,                    -- e.g. "D:TREND-UP 4H:RANGE 1H:TREND-UP"
    placed      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Each demo/live trade from open to close.
  CREATE TABLE IF NOT EXISTS trading_bot_trades (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol       TEXT NOT NULL,
    ticket       BIGINT,                 -- MT5 position ticket
    side         TEXT,
    lot          NUMERIC,
    entry        NUMERIC,
    sl           NUMERIC,
    tp           NUMERIC,
    opened_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at    TIMESTAMPTZ,
    exit_price   NUMERIC,
    profit       NUMERIC,                -- account currency
    r_multiple   NUMERIC,                -- result in R
    result       TEXT,                   -- win / loss / breakeven
    close_reason TEXT,                   -- the monitor's reason
    peak_r       NUMERIC,
    signal_id    UUID REFERENCES trading_bot_signals(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS trading_bot_trades_ticket_open
    ON trading_bot_trades (ticket) WHERE closed_at IS NULL;

  -- Log feed: heartbeats, startups, errors, info.
  CREATE TABLE IF NOT EXISTS trading_bot_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol      TEXT,
    level       TEXT NOT NULL DEFAULT 'info',   -- info / warn / error
    kind        TEXT NOT NULL,                  -- signal / trade / error / heartbeat / daily_summary / startup
    message     TEXT,
    payload     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- One end-of-day roll-up per market.
  CREATE TABLE IF NOT EXISTS trading_bot_daily_summary (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day         DATE NOT NULL,
    symbol      TEXT NOT NULL,
    trades      INTEGER NOT NULL DEFAULT 0,
    wins        INTEGER NOT NULL DEFAULT 0,
    losses      INTEGER NOT NULL DEFAULT 0,
    net_r       NUMERIC NOT NULL DEFAULT 0,
    net_profit  NUMERIC NOT NULL DEFAULT 0,
    max_dd_r    NUMERIC,
    details     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (day, symbol)
  );

  CREATE INDEX IF NOT EXISTS trading_bot_signals_created  ON trading_bot_signals (created_at DESC);
  CREATE INDEX IF NOT EXISTS trading_bot_trades_opened    ON trading_bot_trades (opened_at DESC);
  CREATE INDEX IF NOT EXISTS trading_bot_events_created   ON trading_bot_events (created_at DESC);
  CREATE INDEX IF NOT EXISTS trading_bot_events_kind      ON trading_bot_events (kind);
`);
console.log('  ✓ Tables + indexes ready.');

console.log('• updated_at trigger on markets…');
await client.query(`
  DROP TRIGGER IF EXISTS trg_trading_bot_markets_updated_at ON trading_bot_markets;
  CREATE TRIGGER trg_trading_bot_markets_updated_at BEFORE UPDATE ON trading_bot_markets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`);
console.log('  ✓ Done.');

console.log('• Roll-up trigger: fold a closed trade into its market’s W/L + net…');
await client.query(`
  CREATE OR REPLACE FUNCTION trading_bot_apply_close()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $fn$
  BEGIN
    -- only when a trade first becomes closed (has a result)
    IF NEW.closed_at IS NOT NULL AND NEW.result IS NOT NULL
       AND (TG_OP = 'INSERT' OR OLD.closed_at IS NULL) THEN
      INSERT INTO trading_bot_markets (symbol) VALUES (NEW.symbol)
        ON CONFLICT (symbol) DO NOTHING;
      UPDATE trading_bot_markets SET
        wins       = wins       + (CASE WHEN NEW.result = 'win'       THEN 1 ELSE 0 END),
        losses     = losses     + (CASE WHEN NEW.result = 'loss'      THEN 1 ELSE 0 END),
        breakeven  = breakeven  + (CASE WHEN NEW.result = 'breakeven' THEN 1 ELSE 0 END),
        net_r      = net_r      + COALESCE(NEW.r_multiple, 0),
        net_profit = net_profit + COALESCE(NEW.profit, 0),
        updated_at = NOW()
      WHERE symbol = NEW.symbol;
    END IF;
    RETURN NEW;
  END;
  $fn$;

  DROP TRIGGER IF EXISTS trg_trading_bot_trade_close ON trading_bot_trades;
  CREATE TRIGGER trg_trading_bot_trade_close
    AFTER INSERT OR UPDATE ON trading_bot_trades
    FOR EACH ROW EXECUTE FUNCTION trading_bot_apply_close();
`);
console.log('  ✓ Done.');

console.log('• RLS — admins read/write; the bot writes via service-role (bypasses RLS)…');
for (const t of [
  'trading_bot_markets', 'trading_bot_signals', 'trading_bot_trades',
  'trading_bot_events', 'trading_bot_daily_summary',
]) {
  await client.query(`
    ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "${t} admin all" ON ${t};
    CREATE POLICY "${t} admin all" ON ${t}
      FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
  `);
}
console.log('  ✓ RLS enabled on all 5 tables.');

console.log('• Seeding the gold market row (XAUUSD)…');
await client.query(`
  INSERT INTO trading_bot_markets (symbol, enabled, lot_size, magic, note)
  VALUES ('XAUUSD', TRUE, 0.01, 770088, 'Deriv gold — structure + strict daily filter')
  ON CONFLICT (symbol) DO NOTHING;
`);
console.log('  ✓ Seeded.');

console.log('\n✓ Done. Trading-bot schema is live.');
await client.end();
