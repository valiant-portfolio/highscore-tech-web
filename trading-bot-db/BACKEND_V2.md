# Trading Bot — Backend Contract v2 (addendum to v1)

v2 fixes a data-consistency bug and clarifies how the frontend should read open vs
closed trades. Read `docs/BACKEND_V1.md` first — this only adds to it.

---

## The bug that was fixed: "5 open positions when there are none"

**Symptom.** The Open Positions tab showed 5 trades while the Overview showed
`IN POSITION: 0`, `Open P&L $0.00`, and equity == balance.

**Diagnosis — it was a backend data problem, not the frontend.** The two views read
different sources, and one was stale:

- Overview "in position" / open P&L reads `bot_market_state` — reflects the **live
  broker**, which had **0** open positions. Correct.
- Open Positions reads `bot_trades WHERE close_ts IS NULL` — had **5** rows. Stale.

Those 5 were positions that had actually closed on the broker days earlier, but
their close was never written back to `bot_trades` (they closed while the bot was
down / on older code), so they lingered with `close_ts = null`. The frontend was
displaying the table faithfully; the table was wrong.

**Fix (backend).** The bot now **reconciles orphaned open trades** against the
broker — on startup and every ~60s. Any `bot_trades` row marked open whose position
is not actually open gets its close written (real exit price, P&L, and reason pulled
from MT5 history). Genuinely-open positions are never touched. This self-heals, so
the open list can no longer drift from the broker.

The 5 stale rows have been closed. `bot_trades` open count is now 0, matching the
broker.

**One limitation, stated honestly.** Those 5 specific rows were logged by an old
code path *without* a broker ticket, so their exact historical P&L couldn't be
recovered — they're closed with `close_reason = reconciled_stale` and null P&L. This
only affected pre-v1 rows. Every trade logged from v1 onward carries its ticket and
reconciles with full close price, P&L, and reason.

---

## Open vs closed — the contract (unchanged, clarified)

- **Open (live) trade:** `bot_trades.close_ts IS NULL`.
- **Closed trade:** `bot_trades.close_ts IS NOT NULL`.

These now always match the broker within a poll cycle. The Overview's "in position"
count (from `bot_market_state`) and the Open Positions list (from `bot_trades`) will
agree.

---

## "Transactions not showing all"

The **backend holds every closed trade** — there is no cap. The number your
Transactions tab displays is set by the frontend query's `limit`. To show more,
raise or remove the limit:

```ts
const { data } = await supabase.from("bot_trades")
  .select("*").not("close_ts", "is", null)
  .order("close_ts", { ascending: false })
  .limit(200);   // was likely 10 — raise for a fuller history
```

For a running total/count independent of the list length:
```ts
const { count } = await supabase.from("bot_trades")
  .select("id", { count: "exact", head: true })
  .not("close_ts", "is", null);
```

---

## `close_reason` — additions in v2

Adds two reconciliation reasons to the v1 list:

| value               | meaning |
|---------------------|---------|
| `reconciled_closed` | orphan row closed from MT5 history (had a ticket, real P&L) |
| `reconciled_stale`  | orphan row with no ticket (pre-v1); closed, P&L not recoverable |

All v1 reasons still apply (`stop_loss`, `take_profit`, `stop_out`, `momentum_fade`,
`admin_close`, `manual_close`, `rollover`, `closed`).
