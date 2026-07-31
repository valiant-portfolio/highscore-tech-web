# Trading Bot — Backend Contract v6 (addendum): more chart timeframes

v6 expands the candle history in `bot_bars` from 3 timeframes to **8**. This is the
only backend change in this round — the other dashboard fixes raised alongside it
(duplicate symbol label, chart indicators, linking a chart to an open trade) are
**frontend** work and are covered in the note at the bottom. Read `BACKEND_V4.md` for
the charting model; only the list of available timeframes changes here.

---

## What changed since v4

| | v4 | v6 |
|---|---|---|
| `bot_bars` timeframes | `M15`, `H1`, `D1` | `M5`, `M15`, `M30`, `H1`, `H4`, `D1`, `W1`, `MN` |

The table shape, columns, primary key, and read query are all unchanged — there are
simply more `timeframe` values present now.

## Available timeframes (IMPORTANT — this supersedes the v4 table)

The `timeframe` column stores these exact string values. **Query with these, and show
these in the picker** (left = our value, right = the label the frontend requested):

| our `timeframe` value | frontend label | available | approx depth | approx span |
|-----------------------|----------------|-----------|--------------|-------------|
| `M5`  | M5    | ✅ | ~500 bars | ~1.7 days |
| `M15` | M15   | ✅ | ~500 bars | ~5 days |
| `M30` | M30   | ✅ | ~500 bars | ~10 days |
| `H1`  | H1    | ✅ | ~500 bars | ~3 weeks |
| `H4`  | H4    | ✅ | ~400 bars | ~9 weeks |
| `D1`  | Day1  | ✅ | ~365 bars | ~1 year |
| `W1`  | WK1   | ✅ | ~260 bars | ~5 years |
| `MN`  | MN    | ✅ | ~120 bars | ~10 years |
| `M1`  | M1    | ❌ **not synced** | — | see note |

> **`M1` is deliberately not synced.** Deriv silently caps M1 history and it is by far
> the heaviest series to store, for the least charting value on a database shared with
> the live app. If M1 is genuinely needed, ask — it's a one-flag change, but it's off
> on purpose. **Do not put `M1` in the picker** or it shows an empty chart.

Note the two label mismatches: the frontend calls them **Day1 / WK1**, but the values
in the database are **`D1` / `W1`**. Map accordingly in the picker.

`W1` and `MN` may be **thin or empty on the Volatility (synthetic) indices** — those
instruments don't have many years of history. Same rule as always: if a symbol+timeframe
returns no rows, show an empty state; it isn't an error.

## Fetch (unchanged from v3/v4)

```ts
const { data: bars } = await supabase.from("bot_bars")
  .select("ts,open,high,low,close")
  .eq("symbol", "XAUUSD")
  .eq("timeframe", "H4")        // any of: M5 M15 M30 H1 H4 D1 W1 MN
  .order("ts", { ascending: true })
  .limit(500);
```

Refresh cadence is unchanged: `scripts.bar_sync` on the VM refreshes every ~60s. If it
isn't running, existing history still loads and only the newest bar goes stale.

---

## The other fixes in this round are FRONTEND, not backend

Raised at the same time, confirmed against the database, and **not** backend work:

- **"NZDUSD-NZDUSD" showing doubled.** The backend stores exactly **one** `NZDUSD`
  (verified: `bot_quotes` and `bot_market_state` each hold 17 distinct symbols, one
  NZD). The doubled label is rendered frontend-side — fix it there.
- **The 4 "indicators".** Chart indicators (moving averages, RSI, etc.) are computed
  and drawn client-side. The backend does not serve indicator values. *(If instead you
  want the bot's own signals on the chart — trend bias, pending-order level, SL/TP —
  say so; that's a separate backend request, not part of v6.)*
- **Connect the chart to an ongoing trade.** All required data already exists:
  open trades with `symbol` + `entry_price` + `sl` + `tp` in `bot_trades`
  (`close_ts is null`), candles in `bot_bars`, live price in `bot_quotes`. Linking the
  open-trade row to its chart and overlaying entry/SL/TP is frontend work — no backend
  change needed.
