-- Trading bot schema — Highscore Tech.
--
-- IMPORTANT: this runs in a Supabase project that ALSO hosts a live application
-- (users / payments / staff). Two consequences shape everything below:
--
--   1. Every table is prefixed `bot_` so it cannot collide with an app table and
--      is obvious to anyone reading the database.
--   2. `bot_bars` is NOT populated by default. At M1 the corpus is ~2M rows and
--      the free tier is 500MB — filling it would take the LIVE APP down, not the
--      bot. Bars live in local Parquet; this table exists only if you explicitly
--      opt in via Store(sync_bars=True), and even then prefer H4/D1.
--
-- Everything here is ADDITIVE (create if not exists). It never alters or drops
-- an existing object.
--
-- Apply: Supabase dashboard > SQL editor > paste > run.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- bot_symbols: broker contract specs, snapshotted so a backtest can reconstruct
-- the cost model in force at the time rather than today's.
-- ---------------------------------------------------------------------------
create table if not exists bot_symbols (
    id            serial primary key,
    name          text not null unique,      -- exact MT5 name, e.g. 'Volatility 10 Index'
    alias         text not null unique,      -- short handle, e.g. 'VOL10'
    session_type  text not null check (session_type in ('continuous', 'market')),
    digits        int  not null,
    point         double precision not null,
    volume_min    double precision not null,
    volume_max    double precision not null,
    volume_step   double precision not null,
    contract_size double precision not null,
    tick_value    double precision not null,
    tick_size     double precision not null,
    updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- bot_model_runs: provenance. Which model, trained on what, scored how.
-- Out-of-sample metrics only — in-sample numbers are not decision-relevant.
-- ---------------------------------------------------------------------------
create table if not exists bot_model_runs (
    id                uuid primary key default uuid_generate_v4(),
    symbol            text not null,
    model_type        text not null,
    timeframe         text,
    trained_at        timestamptz not null default now(),
    train_start       timestamptz,
    train_end         timestamptz,
    test_start        timestamptz,
    test_end          timestamptz,
    n_train_rows      int,
    n_test_rows       int,
    hyperparams       jsonb,
    feature_names     text[],
    oos_ic            double precision,
    oos_sharpe        double precision,
    oos_deflated_sharpe double precision,
    oos_hit_rate      double precision,
    oos_max_dd_pct    double precision,
    oos_profit_factor double precision,
    oos_net_pnl       double precision,
    n_oos_trades      int,
    -- The benchmark that matters: a gold strategy returning +138% during a +118%
    -- gold bull market has produced nothing. Never store a return without it.
    buy_hold_pct      double precision,
    buy_hold_max_dd_pct double precision,
    beats_buy_hold    boolean,
    passed_gate       boolean not null default false,
    gate_notes        text,
    artifact_path     text,
    created_at        timestamptz not null default now()
);

create index if not exists bot_model_runs_symbol_idx on bot_model_runs (symbol, trained_at desc);

-- ---------------------------------------------------------------------------
-- bot_predictions: every model output, logged whether or not it became a trade.
-- Without the no-trade rows you cannot measure calibration honestly.
-- ---------------------------------------------------------------------------
create table if not exists bot_predictions (
    id            uuid primary key default uuid_generate_v4(),
    model_run_id  uuid references bot_model_runs(id) on delete set null,
    symbol        text not null,
    timeframe     text not null,
    ts            timestamptz not null,        -- the bar the prediction was made ON
    horizon_bars  int not null,
    direction     text not null check (direction in ('long', 'short', 'flat')),
    edge_bps      double precision,
    confidence    double precision check (confidence between 0 and 1),
    predicted_vol double precision,
    acted_on      boolean not null default false,
    skip_reason   text,                        -- why the risk engine vetoed it
    features      jsonb,
    created_at    timestamptz not null default now()
);

create index if not exists bot_predictions_symbol_ts_idx on bot_predictions (symbol, ts desc);

-- ---------------------------------------------------------------------------
-- bot_trades: full lifecycle, one row per position.
-- ---------------------------------------------------------------------------
create table if not exists bot_trades (
    id            uuid primary key default uuid_generate_v4(),
    prediction_id uuid references bot_predictions(id) on delete set null,
    model_run_id  uuid references bot_model_runs(id) on delete set null,
    ticket        bigint unique,               -- MT5 position ticket; null in dry-run
    symbol        text not null,
    timeframe     text,
    strategy      text,                        -- e.g. 'candlestick_bible'
    side          text not null check (side in ('buy', 'sell')),
    volume        double precision not null check (volume > 0),
    open_ts       timestamptz not null,
    open_price    double precision not null,
    close_ts      timestamptz,
    close_price   double precision,
    sl            double precision,
    tp            double precision,
    pnl           double precision,
    commission    double precision default 0,
    swap          double precision default 0,
    -- Realized entry spread. Recorded per-trade because it is the largest cost on
    -- the synthetic indices and must not be assumed constant.
    entry_spread  double precision,
    close_reason  text,
    is_dry_run    boolean not null default true,
    created_at    timestamptz not null default now()
);

create index if not exists bot_trades_symbol_open_idx on bot_trades (symbol, open_ts desc);
create index if not exists bot_trades_open_idx on bot_trades (close_ts) where close_ts is null;

-- ---------------------------------------------------------------------------
-- bot_equity_snapshots: account curve. Feeds drawdown limits and the kill switch.
-- ---------------------------------------------------------------------------
create table if not exists bot_equity_snapshots (
    id             bigserial primary key,
    ts             timestamptz not null default now(),
    balance        double precision not null,
    equity         double precision not null,
    margin         double precision,
    margin_free    double precision,
    open_positions int not null default 0,
    is_dry_run     boolean not null default true
);

create index if not exists bot_equity_ts_idx on bot_equity_snapshots (ts desc);

-- ---------------------------------------------------------------------------
-- bot_bars: OHLCV. OPT-IN ONLY — see the header. Left empty by default.
-- ---------------------------------------------------------------------------
create table if not exists bot_bars (
    symbol      text not null,
    timeframe   text not null,
    ts          timestamptz not null,
    open        double precision not null,
    high        double precision not null,
    low         double precision not null,
    close       double precision not null,
    tick_volume bigint,
    spread      int,
    real_volume bigint,
    ingested_at timestamptz not null default now(),
    primary key (symbol, timeframe, ts),
    -- Reject corrupt bars at the door; one bad bar poisons every feature window
    -- that touches it.
    constraint bot_bars_ohlc_ordered check (
        high >= low
        and high >= greatest(open, close)
        and low  <= least(open, close)
        and open > 0 and close > 0
    )
);

create index if not exists bot_bars_symbol_tf_ts_idx on bot_bars (symbol, timeframe, ts desc);

-- ---------------------------------------------------------------------------
-- bot_market_state: the live dashboard, one row per market, upserted each cycle.
-- This is what a web view reads to show "what's happening in every market now".
-- ---------------------------------------------------------------------------
create table if not exists bot_market_state (
    symbol      text primary key,           -- exact MT5 name
    alias       text not null,
    timeframe   text,
    htf         text,                        -- higher timeframe used for confirmation
    entry_trend text,                        -- up / down / none
    htf_trend   text,
    state       text,                        -- watching / held / setup_ready / order / position
    detail      text,
    price       double precision,
    level       double precision,            -- pending/entry level when relevant
    pnl         double precision,            -- floating P&L when a position is open
    strategy    text,
    is_dry_run  boolean not null default false,
    updated_at  timestamptz not null default now()
);

create index if not exists bot_market_state_updated_idx on bot_market_state (updated_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security.
-- The bot connects with the service_role key, which bypasses RLS. Enabling RLS
-- with no permissive policy means anon/authenticated keys (i.e. your web app's
-- browser clients) can read NOTHING from these tables. That is deliberate:
-- trading data must not be reachable from the app's front end.
-- ---------------------------------------------------------------------------
alter table bot_symbols          enable row level security;
alter table bot_bars             enable row level security;
alter table bot_predictions      enable row level security;
alter table bot_trades           enable row level security;
alter table bot_equity_snapshots enable row level security;
alter table bot_model_runs       enable row level security;
alter table bot_market_state     enable row level security;

-- ---------------------------------------------------------------------------
-- Views.
-- ---------------------------------------------------------------------------
create or replace view bot_v_daily_pnl as
select
    date_trunc('day', close_ts) as day,
    symbol,
    is_dry_run,
    count(*)   as n_trades,
    sum(pnl)   as net_pnl,
    avg(pnl)   as avg_pnl,
    sum(case when pnl > 0 then 1 else 0 end)::float
        / nullif(count(*), 0) as hit_rate,
    sum(case when pnl > 0 then pnl else 0 end)
        / nullif(abs(sum(case when pnl < 0 then pnl else 0 end)), 0) as profit_factor
from bot_trades
where close_ts is not null
group by 1, 2, 3
order by 1 desc;

create or replace view bot_v_open_positions as
select id, ticket, symbol, side, volume, open_ts, open_price, sl, tp,
       now() - open_ts as age, is_dry_run
from bot_trades
where close_ts is null
order by open_ts desc;
