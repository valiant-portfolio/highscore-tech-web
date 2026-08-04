# Trading Bot — Backend Contract v7 (addendum): managing an open position

v7 answers the Open-positions requests of 4 Aug 2026. Two changes:

1. **`bot_commands` gained three actions** beyond `close` — take part of a position
   off, move the stop to break even, trail the stop — and a `payload` column to carry
   their arguments.
2. **`bot_market_state` gained `volume` and `opened_at`** so the dashboard can show a
   live position's lot size and how long it has been open for *every* position,
   including ones adopted from the broker.

Everything else in v1–v6 is unchanged. Read `BACKEND_V1.md` §5 for the command
lifecycle; only the set of commands grows here.

---

## Migration

`db/migrations/004_admin_position_actions.sql` — additive, safe to re-run:

```sql
alter table bot_commands     add column if not exists payload jsonb;
alter table bot_market_state add column if not exists volume double precision,
                             add column if not exists opened_at timestamptz;
```

Until it is applied, the three new commands fail with a database error and the two new
columns read as `null` (the dashboard falls back to `bot_trades`, as it did before).

---

## 1. The commands

Insert a row; the bot executes it within a poll cycle and writes `status`
(`done`/`failed`) and a human-readable `note` back to the same row. `ticket` targets one
position; **`ticket: null` applies to every open position on `symbol`** — same rule as
`close`.

| `command` | what it does | `payload` |
|---|---|---|
| `close` | closes the position(s) entirely | — |
| `partial_close` | closes part, leaves the rest running | `{"fraction": 0.5}` or `{"volume": 0.30}` |
| `breakeven` | moves the stop to the entry price | `{"buffer_pips": 0}` (optional) |
| `trail_sl` | trails the stop behind price | `{"distance_pips": 20}` |

`payload` is `jsonb`. Unknown keys are ignored, so arguments can be added without a
schema change. A malformed payload falls back to the defaults above rather than failing.

```ts
// bank half of a position
await supabase.from("bot_commands").insert({
  command: "partial_close", symbol: "XAUUSD", ticket: 9724250340,
  payload: { fraction: 0.5 }, created_by: "admin@fatsees",
});
```

### What each one guarantees

**`partial_close`** — the size is snapped **down** to the broker's `volume_step`, so it
never asks to close more than the position holds. If the remainder would fall below
`volume_min` the position is closed **outright** instead of stranding a stub the broker
can't hold; the note says so. The banked P&L is not lost from the record: MT5 keeps the
position ticket, and the bot sums every deal on that ticket when the trade finally
closes, so `bot_trades.pnl` still includes it. `bot_trades.volume` is rewritten to the
remaining size.

**`breakeven`** — the stop moves to `open_price`, or `buffer_pips` into profit if you
pass one (a pip or two covers the spread paid to exit). **Declined, not attempted**, in
two cases, each reported on the row: the stop is already at or better than break even,
or the trade has not moved far enough for the broker to accept a stop there (on a
losing trade that stop is the wrong side of the market). Nothing is changed when
declined.

**`trail_sl`** — arms a trail `distance_pips` behind price, applied immediately and then
ratcheted every bot cycle. One pip = ten broker points, so 5-digit FX = 0.0001, 3-digit
JPY = 0.01, a 2-digit metal = 0.1. `distance_pips: 0` disarms it.

> **The trail is process state, the stop is not.** Every stop the trail has already
> moved sits on the broker and keeps protecting the trade through anything — including
> the bot dying. What a restart loses is the *following*. Re-arm it from the dashboard
> after a restart; the UI says as much.

Stops only ever move in the trade's favour, whichever action asked. `breakeven` and
`trail_sl` will not loosen a stop the profit ladder has already ratcheted.

---

## 2. `bot_market_state.volume` / `.opened_at`

Both are published from the **broker** each cycle, for the same reason `sl`/`tp` are
(v3): a position the bot adopted has no `bot_trades` row to read them from, and a
partial close changes the size out from under one that does.

| column | type | meaning |
|---|---|---|
| `volume` | float8 | lots the broker currently holds. `null` when the market is flat |
| `opened_at` | timestamptz | when the **broker** opened the position. `null` when flat |

Read these first for an open position, and fall back to `bot_trades` only when they are
null:

```ts
const lots     = m.volume    ?? trade?.volume;
const openedAt = m.opened_at ?? trade?.open_ts;   // trade duration = now - openedAt
```

Related fix: `bot_trades.open_ts` for an **adopted** position used to be the moment the
bot noticed it, not the fill. It is now the broker's open time, so trade duration is
correct even for a position that filled while the bot was down.
