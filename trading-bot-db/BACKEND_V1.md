# Trading Bot — Backend Contract v1

What the frontend can read and control via Supabase. The Python bot is the only
writer of trading data; the admin panel reads everything and issues a few controls
through dedicated tables. **The trading engine (entry/exit/trend logic) is not part
of this contract and is not exposed** — the admin controls sizing and can close
trades, nothing more.

Apply order in Supabase SQL editor: `db/schema.sql`, then
`db/frontend_read_policies.sql` (browser read access).

---

## What changed in v1 (the five fixes)

1. **Lot size is admin-set, never guessed.** Set per market in `bot_symbol_config`.
   Default is the broker's minimum. Any value is validated against the broker's
   min/max/step, so an impossible size can't be sent.
2. **Every close has a documented reason.** `bot_trades.close_reason` is always set
   (see the reason list below).
3. **Recent trades stay current.** The bot writes a `bot_trades` row when a position
   fills and updates it on close — so open and closed lists reflect reality.
4. **Live trades are visible.** Open positions are `bot_trades` rows with
   `close_ts = null`; also mirrored per-market in `bot_market_state`.
5. **Admin can close any trade** by inserting a row into `bot_commands`.

---

## 1. Lot size — `bot_symbol_config` (admin writes)

One row per market. The admin edits `lot_size`.

| column     | type   | meaning |
|------------|--------|---------|
| `symbol`   | text (PK) | exact MT5 name, e.g. `Volatility 100 Index` |
| `alias`    | text   | short handle, e.g. `VOL100` |
| `lot_size` | float8 | the lot to trade. **`null` = use the broker's minimum.** |
| `enabled`  | bool   | reserved; the bot trades markets assigned a strategy |
| `updated_at` | timestamptz | last edit |

**Validation the bot enforces** (so the UI can mirror it): the value is clamped to
`[volume_min, volume_max]` and snapped to `volume_step` from `bot_symbols`. A value
below the minimum becomes the minimum. So the admin **cannot** set a size the broker
rejects. The broker limits per market live in `bot_symbols`
(`volume_min`, `volume_max`, `volume_step`) — read those to build the input's bounds.

Set a lot:
```ts
await supabase.from("bot_symbol_config")
  .update({ lot_size: 2.0, updated_at: new Date().toISOString() })
  .eq("symbol", "Volatility 100 Index");
```
Back to broker minimum: set `lot_size` to `null`. The bot picks up changes within a
poll cycle (seconds) — no restart needed.

> Writing requires the service_role key (server-side admin route) or an RLS write
> policy for your admin role. The browser anon key is read-only by default.

---

## 2 & 3 & 4. Trades — `bot_trades` (bot writes, frontend reads)

| column        | type   | meaning |
|---------------|--------|---------|
| `id`          | uuid   | primary key |
| `ticket`      | bigint | broker position ticket (unique); null in dry-run |
| `symbol`      | text   | market |
| `side`        | text   | `buy` / `sell` |
| `volume`      | float8 | lots |
| `open_ts`     | timestamptz | fill time |
| `open_price`  | float8 | entry |
| `close_ts`    | timestamptz | **null while the trade is OPEN (live)** |
| `close_price` | float8 | exit |
| `pnl`         | float8 | realized P&L (incl. swap/commission) |
| `sl`, `tp`    | float8 | stop / target |
| `close_reason`| text   | why it closed (always set) — see below |
| `strategy`    | text   | e.g. `trend_pullback` |
| `is_dry_run`  | bool   | true = demo/paper |

**Live (open) trades:** `close_ts is null`.
```ts
const { data } = await supabase.from("bot_trades")
  .select("*").is("close_ts", null).order("open_ts", { ascending: false });
```

**Recent (closed) trades:**
```ts
const { data } = await supabase.from("bot_trades")
  .select("*").not("close_ts", "is", null).order("close_ts", { ascending: false }).limit(50);
```

**`close_reason` values:**

| value          | meaning |
|----------------|---------|
| `stop_loss`    | broker hit the stop |
| `take_profit`  | broker hit the target |
| `stop_out`     | margin stop-out (forced) |
| `momentum_fade`| bot banked a fading profit (active exit) |
| `admin_close`  | closed by an admin command |
| `manual_close` | closed by hand in the terminal / platform |
| `rollover` / `closed` | rollover, or an unclassified close |

---

## 5. Close a trade — `bot_commands` (admin writes, bot executes)

Insert a `close` command; the bot picks it up within a poll cycle, closes the
position, and writes the outcome back on the same row.

| column        | type   | meaning |
|---------------|--------|---------|
| `id`          | uuid   | primary key |
| `command`     | text   | `close` |
| `symbol`      | text   | market to close |
| `ticket`      | bigint | specific position; **null = all positions on `symbol`** |
| `status`      | text   | `pending` → `done` / `failed` (bot sets this) |
| `note`        | text   | result detail written by the bot |
| `created_by`  | text   | optional: who issued it |
| `created_at` / `processed_at` | timestamptz | queued / executed |

Close one position by ticket:
```ts
await supabase.from("bot_commands").insert({
  command: "close", symbol: "Volatility 100 Index", ticket: 9724250340,
  created_by: "admin@fatsees",
});
```
Close everything on a symbol: omit `ticket`.

Watch the result: poll or subscribe to the row and read `status` (`done`/`failed`)
and `note`. When it's `done`, the corresponding `bot_trades` row will show
`close_reason = admin_close`.

> Insert requires the service_role key (admin route) or an RLS insert policy for
> your admin role.

---

## 6. Live per-market view — `bot_market_state`

Unchanged from the earlier dashboard contract (see `docs/FRONTEND.md`), still the
one-row-per-market live snapshot: `entry_trend`, `htf_trend`, `state`
(`watching` / `setup_ready` / `order` / `position`), `detail`, `price`, `level`,
`pnl`, `updated_at`. Entry timeframe is **M15**, trend/bias timeframe is **H1**.

---

## Freshness / bot-online

Everything is written only while the bot runs. Use the newest `updated_at` in
`bot_market_state` as a heartbeat — older than ~2–3 minutes means the bot is
offline, so treat live data as stale.

---

## Security summary

- Bot: writes with the **service_role** key (bypasses RLS).
- Frontend reads: enable via `db/frontend_read_policies.sql` (anon key, read-only).
- Admin writes (`bot_symbol_config`, `bot_commands`): use the **service_role** key
  from a server-side admin route, or add an RLS write policy scoped to your admin
  role. Never expose service_role in the browser.
