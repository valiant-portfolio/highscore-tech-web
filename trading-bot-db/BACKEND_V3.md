# Trading Bot — Backend Contract v3 (addendum): live quotes + charting

v3 adds a **real-time price feed** so the frontend can chart the bot's markets.
Read `BACKEND_V1.md` and `BACKEND_V2.md` first — this only adds to them.

Apply order in Supabase (already done on this project): `db/schema.sql`, then
`db/frontend_read_policies.sql`.

---

## What's new

- **`bot_quotes`** — live bid/ask per market, overwritten ~1×/second by a separate
  process (`scripts.quote_feed`). This is the "current price" a chart's last candle
  tracks.
- **Realtime enabled** on `bot_quotes`, `bot_market_state`, and `bot_trades`, so the
  browser subscribes and updates the instant a row changes — no polling.
- **Historical candles** for a real chart come from `bot_bars` (OHLCV).

---

## Can we use TradingView? — read this first

Two honest points so you build the right thing:

1. **The free TradingView embed widget will NOT show these markets.** It only renders
   symbols from TradingView's own servers; Deriv's Volatility indices don't exist
   there. To chart *our* MT5 data you must supply a **custom datafeed**, which means
   one of:
   - **TradingView Charting Library** — full TradingView UI, free but license-gated
     (you already have `charting_library-master`). Feed it via its Datafeed API.
   - **Lightweight Charts** (TradingView, MIT licensed, no gate) — smaller, simplest
     path. Recommended if you don't need the full TradingView toolbar.

   Both take the same data below; only the adapter differs.

2. **Update rate.** The feed runs at 1s by default. The Volatility indices only tick
   every ~2s (a Deriv property), so faster just rewrites identical prices for them;
   real FX/metals move faster. The feed interval is configurable
   (`quote_feed --interval 0.5`) if you want 500ms — say so and it'll be set on the VM.

---

## `bot_quotes` — live price (realtime)

One row per market, overwritten each cycle (never grows).

| column       | type   | meaning |
|--------------|--------|---------|
| `symbol`     | text (PK) | exact MT5 name |
| `alias`      | text   | short handle (`VOL100`, `EURUSD`, …) |
| `bid`        | float8 | current bid |
| `ask`        | float8 | current ask |
| `spread`     | float8 | ask − bid |
| `digits`     | int    | decimal places — use for price formatting |
| `updated_at` | timestamptz | last tick time |

### Live subscription (the real-time part)

```ts
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(URL, ANON_KEY);

// initial snapshot
const { data: quotes } = await supabase.from("bot_quotes").select("*");

// realtime — fires on every price write (~1/s per market)
const channel = supabase
  .channel("quotes")
  .on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "bot_quotes" },
      (payload) => {
        const q = payload.new; // { symbol, alias, bid, ask, spread, digits, updated_at }
        updateTicker(q.alias, q.bid, q.ask);
        chart?.updateLastPrice(q.symbol, q.bid);   // move the current candle
      })
  .subscribe();
```

> Enable Realtime for the table in Supabase (Database → Replication) if it isn't
> already — on this project it's turned on in `db/schema.sql`.

Formatting: `price.toFixed(digits)` — e.g. EURUSD digits=5 → `1.13694`.

---

## `bot_bars` — historical candles (for the chart body)

OHLCV history. This draws the candles; `bot_quotes` moves the live one on top.

| column        | type   | meaning |
|---------------|--------|---------|
| `symbol`      | text   | exact MT5 name |
| `timeframe`   | text   | `M1` `M5` `M15` `H1` `H4` `D1` |
| `ts`          | timestamptz | bar OPEN time (UTC) |
| `open` `high` `low` `close` | float8 | OHLC |
| `tick_volume` | bigint | ticks in the bar |

Primary key `(symbol, timeframe, ts)`.

Fetch candles for a chart:
```ts
const { data: bars } = await supabase.from("bot_bars")
  .select("ts,open,high,low,close")
  .eq("symbol", "Volatility 100 Index")
  .eq("timeframe", "M15")
  .order("ts", { ascending: true })
  .limit(500);
```

### Adapter — TradingView Lightweight Charts

```ts
import { createChart } from "lightweight-charts";

const chart = createChart(el, { timeScale: { timeVisible: true } });
const series = chart.addCandlestickSeries();

// 1. history
series.setData(bars.map(b => ({
  time: Math.floor(new Date(b.ts).getTime() / 1000),   // UTC seconds
  open: b.open, high: b.high, low: b.low, close: b.close,
})));

// 2. live: nudge the last candle with each quote
supabase.channel("q")
  .on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "bot_quotes" },
      ({ new: q }) => {
        if (q.symbol !== currentSymbol) return;
        series.update({ time: nowBarTime(), close: q.bid });  // or maintain O/H/L yourself
      })
  .subscribe();
```

For the TradingView **Charting Library** instead, implement its Datafeed API:
`getBars()` → query `bot_bars`; `subscribeBars()` → the `bot_quotes` realtime channel
above. Same data, its interface.

> **Note on bar depth.** `bot_bars` is the local Parquet corpus mirrored only if bar
> sync is on. On this deployment the bot does NOT push M1/M5 bars to Supabase (they
> are millions of rows and share the app's database). For charting, either enable
> H1/D1 bar sync (thousands of rows, safe) or have the frontend keep its own candle
> history built from the `bot_quotes` stream. Tell me which and I'll wire it — this
> is the one open choice in v3.

---

## Putting it together (a market monitor page)

| element | source |
|---|---|
| live price ticker / watchlist | `bot_quotes` (realtime UPDATE) |
| candle chart | `bot_bars` (history) + `bot_quotes` (live candle) |
| per-market bot state (trend, setup, order, position) | `bot_market_state` (realtime) |
| open trades overlay | `bot_trades` where `close_ts is null` (realtime) |
| trade history | `bot_trades` where `close_ts is not null` |

All of it read-only via the anon key once `db/frontend_read_policies.sql` includes
`bot_quotes` (add it there — see below).

---

## One thing to run in Supabase for the frontend

`bot_quotes` needs a read policy for the browser, same as the other dashboard tables.
Add this (it's in the updated `db/frontend_read_policies.sql`):

```sql
drop policy if exists bot_quotes_read on bot_quotes;
create policy bot_quotes_read on bot_quotes for select using (true);
grant select on bot_quotes to anon, authenticated;
```

---

## Running the feed (VM)

The quote feed is a **separate process** from the bot, so its fast cadence never
touches trade logic:

```
python -m scripts.quote_feed --interval 1
```

On the VM, run it as a second service (or a second window) alongside `run.bat`. It
needs the same `.env` and a running MT5 terminal. If it's not running, `bot_quotes`
simply goes stale (`updated_at` stops advancing) — the chart's history still loads,
only the live price stops moving.
