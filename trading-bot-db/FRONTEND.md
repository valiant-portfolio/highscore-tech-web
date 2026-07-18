# Trading Bot — Frontend Integration Guide

Everything a separate frontend project needs to render a live dashboard of the
trading bot. The bot (a Python process) writes to Supabase; your frontend only
reads. Copy this file, `db/schema.sql`, and `db/frontend_read_policies.sql` into
the frontend repo and you have the full contract.

---

## 1. How it fits together

```
  Python bot (VM)  --writes-->  Supabase (Postgres)  <--reads--  Your frontend
   service_role key              bot_* tables                     anon key
```

- The bot upserts a live row per market every ~60s while it runs.
- The frontend reads those rows (and optionally trades/equity) with the **anon**
  key and can subscribe to realtime changes.
- The bot NEVER needs the frontend; the frontend NEVER writes.

---

## 2. One-time Supabase setup

Run these in the Supabase SQL editor, in order:

1. `db/schema.sql` — creates the `bot_*` tables (safe, additive, re-runnable).
2. `db/frontend_read_policies.sql` — grants the anon key **read** access to the
   dashboard tables. Without this the frontend sees nothing (RLS blocks it).

> The bot's own writes work without step 2 — it uses the service_role key which
> bypasses RLS. Step 2 is only for the browser to read.

---

## 3. Environment variables (frontend)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

Use the **anon / public** key here — never the service_role key in a browser.

---

## 4. The data — `bot_market_state`

The live dashboard table. **One row per market, upserted continuously.**

| column        | type        | meaning |
|---------------|-------------|---------|
| `symbol`      | text (PK)   | exact MT5 name, e.g. `Volatility 100 Index` |
| `alias`       | text        | short handle, e.g. `VOL100` |
| `timeframe`   | text        | entry timeframe, e.g. `H1` |
| `htf`         | text        | higher timeframe used to confirm, e.g. `D1` |
| `entry_trend` | text        | `uptrend` / `downtrend` / `no-trend` |
| `htf_trend`   | text        | same, on the higher timeframe |
| `state`       | text        | `watching` / `held` / `setup_ready` / `order` / `position` |
| `detail`      | text        | human-readable detail (e.g. `buy_limit waits for D1 to confirm`) |
| `price`       | float8      | latest close |
| `level`       | float8      | pending/entry level when relevant, else null |
| `pnl`         | float8      | floating P&L when a position is open, else null |
| `strategy`    | text        | strategy assigned to this market |
| `is_dry_run`  | bool        | true = demo/paper, false = armed |
| `updated_at`  | timestamptz | last write — use this to detect a stale/offline bot |

**State meanings:**
- `watching` — no setup; entry timeframe not trending.
- `held` — a setup exists but the higher timeframe doesn't confirm (top-down veto).
- `setup_ready` — trend + higher timeframe aligned; an order is imminent.
- `order` — a limit order is resting on the broker at `level`.
- `position` — a trade is open; `pnl` is live.

### Other tables (optional, for a fuller dashboard)
- `bot_trades` — closed/open trades (side, volume, prices, pnl, close_reason).
- `bot_equity_snapshots` — account equity curve over time.
- `bot_v_daily_pnl` — daily P&L rollup (view).
- `bot_v_open_positions` — currently open trades (view).

Full column definitions live in `db/schema.sql`.

---

## 5. Reading it (supabase-js)

```ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// initial fetch — all markets, ordered
export async function getMarketState() {
  const { data, error } = await supabase
    .from("bot_market_state")
    .select("*")
    .order("alias");
  if (error) throw error;
  return data;
}
```

### Live updates (realtime subscription)

```ts
export function subscribeMarketState(onChange: (rows: any[]) => void) {
  const channel = supabase
    .channel("market-state")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bot_market_state" },
      async () => onChange(await getMarketState())
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
```

> Enable Realtime for `bot_market_state` in Supabase: Database → Replication →
> add the table. Without it, poll `getMarketState()` on an interval instead.

---

## 6. TypeScript type

```ts
export type MarketState = {
  symbol: string;
  alias: string;
  timeframe: string;
  htf: string;
  entry_trend: "uptrend" | "downtrend" | "no-trend";
  htf_trend: "uptrend" | "downtrend" | "no-trend";
  state: "watching" | "held" | "setup_ready" | "order" | "position";
  detail: string;
  price: number | null;
  level: number | null;
  pnl: number | null;
  strategy: string | null;
  is_dry_run: boolean;
  updated_at: string; // ISO
};
```

---

## 7. Detecting an offline bot

The bot only writes while it runs. If it stops, rows go stale. Grey-out or flag
markets whose `updated_at` is older than a couple of minutes:

```ts
const isStale = (row: MarketState) =>
  Date.now() - new Date(row.updated_at).getTime() > 3 * 60_000; // > 3 min
```

---

## 8. Suggested UI

A table, one row per `alias`, with:
- a colored trend chip for `entry_trend` and `htf_trend` (green up / red down / grey none),
- a `state` badge (watching = grey, held = amber, setup_ready = blue, order = amber, position = green),
- `detail` as the description,
- `pnl` colored when in a position,
- a small "stale" indicator driven by `updated_at`.

That mirrors exactly what the bot's own terminal dashboard (`monitor.bat`) shows.
