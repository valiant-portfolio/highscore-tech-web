# Trading Bot — Backend Contract v4 (addendum): candle history is now live

v4 resolves the one open item left in v3. **`bot_bars` is now populated with real
MT5 candle history**, so the chart loads instantly instead of building forward from
the live quote stream. Read `BACKEND_V3.md` first — the table shape is unchanged;
only its status changes (it went from empty to populated).

---

## What changed since v3

| | v3 | v4 |
|---|---|---|
| `bot_bars` | empty — frontend told to build candles from the quote stream | **populated** with real MT5 candles |
| chart history | none; filled forward, slowly (an M15 candle = 15 min) | **loads immediately** from `bot_bars` |

Nothing about how the frontend *reads* `bot_bars` changed — the columns and the
query in v3 are exactly right. There is simply data there now.

**Action for the frontend:** you can **drop the quote-stream candle builder**. Load
history from `bot_bars`, then use the `bot_quotes` realtime channel only to nudge the
*current* (last) candle. That is the whole charting model:

- **candle body (history)** ← `bot_bars`
- **live candle (last price)** ← `bot_quotes` realtime

---

## `bot_bars` — available timeframes (IMPORTANT)

**Only three timeframes have data: `M15`, `H1`, `D1`.** These are the only values
the frontend's timeframe selector should offer. Requesting any other timeframe
returns an empty result.

> **Do NOT expose `M1`, `M5`, or `H4` in the chart's timeframe picker** — they are
> not synced and will show an empty chart. Show only **M15 / H1 / D1**. (If you need
> M5 or H4 added, ask — it's a one-line change to the sync; they are off by default
> to keep the shared database small.)

Rolling recent window per timeframe, for every one of the 17 markets, refreshed on
the VM (~every 60s) so the newest closed candle keeps appearing:

| timeframe | available | approx depth | approx span |
|-----------|-----------|--------------|-------------|
| `M15`     | ✅ yes    | ~500 bars    | ~5 days |
| `H1`      | ✅ yes    | ~500 bars    | ~3 weeks |
| `D1`      | ✅ yes    | ~365 bars    | ~1 year |
| `M1`      | ❌ no     | — | not synced |
| `M5`      | ❌ no     | — | not synced |
| `H4`      | ❌ no     | — | not synced |

This is a deliberate rolling window, not the full corpus — enough for a proper chart,
small enough to sit safely in the shared database.

Columns (unchanged from v3): `symbol`, `timeframe`, `ts` (bar OPEN, UTC),
`open`, `high`, `low`, `close`, `tick_volume`. Primary key `(symbol, timeframe, ts)`.

Fetch candles (unchanged from v3):
```ts
const { data: bars } = await supabase.from("bot_bars")
  .select("ts,open,high,low,close")
  .eq("symbol", "Volatility 25 Index")
  .eq("timeframe", "M15")
  .order("ts", { ascending: true })
  .limit(500);
```

### Keeping the last candle live

`bot_bars` gives closed candles; the newest bar only updates when the sync next runs
(~60s) or the bar closes. For a smoothly moving current candle, keep drawing the live
price from `bot_quotes` on top of the loaded history:

```ts
series.setData(bars.map(b => ({
  time: Math.floor(new Date(b.ts).getTime() / 1000),
  open: b.open, high: b.high, low: b.low, close: b.close,
})));

// live candle: update the last point's close from the quote stream
supabase.channel("q")
  .on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "bot_quotes" },
      ({ new: q }) => {
        if (q.symbol !== currentSymbol) return;
        series.update({ time: currentBarTime, close: q.bid });
      })
  .subscribe();
```

---

## Availability

`bot_bars` is filled by `scripts.bar_sync` on the VM. If that process isn't running,
the candles simply stop refreshing (existing history still loads; only the newest bar
goes stale). Same freshness rule as everything else: check the newest `ts` /
`ingested_at` against now, and treat old data as stale.

Read access for the browser (anon key) is granted in `db/frontend_read_policies.sql`
(`bot_bars_read`), applied on this project.

---

## Summary — the full charting data model (v3 + v4)

| chart element | Supabase source | live? |
|---|---|---|
| candle history | `bot_bars` | refreshed ~60s |
| current/live candle | `bot_quotes` | realtime (~1s) |
| price ticker / watchlist | `bot_quotes` | realtime |
| per-market bot state | `bot_market_state` | realtime |
| open trades | `bot_trades` (`close_ts is null`) | realtime |
| trade history | `bot_trades` (`close_ts not null`) | on read |

All read-only via the anon key.
