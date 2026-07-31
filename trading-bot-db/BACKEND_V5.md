# Trading Bot — Backend Contract v5 (addendum): profit ladder

v5 changes only how winning trades are protected. The single profit-lock trigger from
v2 (`profit_protected`) is replaced by a **profit ladder** that ratchets the stop up in
steps. Nothing about how the frontend reads trades or quotes changes — this note exists
so the dashboard shows the right thing for the new close reason.

---

## What changed

**Before (v2):** the bot watched a winning trade and, once it had run ≥70% of the way
to target and then retraced, closed it itself with `close_reason = profit_protected`.

**Now (v5):** as the trade runs into profit the **stop loss is moved up on the broker**
to lock in gains at three tiers of the distance to take-profit:

| trade reaches | stop is moved to | profit locked |
|---------------|------------------|---------------|
| 30% of target | 30% level        | 30% can't be given back |
| 50% of target | 50% level        | 50% can't be given back |
| 70% of target | 70% level        | 70% can't be given back |

Take-profit still caps the top at 100%. The stop only ever moves in the trade's
favour, never against it, and a losing trade is never touched. Because the locked stop
lives **on the broker**, the profit is protected even if the bot process is offline.

### Why this is better than v2
- The lock is enforced by the broker, not by the bot polling — no gap where the bot is
  down and a winner round-trips to the original stop.
- Profit is banked in graduated steps instead of one all-or-nothing 70% trigger.

---

## Frontend impact

Almost none — but two things to reflect:

**1. New close reason `profit_locked`.** A trade closed by a ratcheted stop reports
`close_reason = profit_locked` (NOT `stop_loss`, even though the broker mechanism is a
stop). Its P&L is **positive**. Show it as a win, styled like a take-profit, not a loss.

**2. The stop loss on an open trade can move.** If the dashboard draws the SL line for a
live position, expect it to step up (long) / down (short) over the trade's life as tiers
lock. Read `sl` from `bot_trades` as usual — it's just no longer static.

`profit_protected` (the v2 reason) is retired: no new rows use it; any existing rows keep
it. Treat it identically to `profit_locked` (a win) in any historical view.

### `close_reason` — current values

| value               | meaning |
|---------------------|---------|
| `stop_loss`         | broker hit the stop, at a loss |
| `take_profit`       | broker hit the target |
| `profit_locked`     | ratcheted stop fired in profit (the profit ladder) |
| `stop_out`          | margin stop-out (forced) |
| `admin_close`       | closed by an admin command |
| `manual_close`      | closed by hand in the terminal / platform |
| `doji_p22`          | discretionary doji exit (book rule) |
| `rollover` / `closed` | rollover, or an unclassified close |
| `reconciled_closed` | orphan row closed from MT5 history |
| `reconciled_stale`  | orphan row with no ticket; P&L not recoverable |
| `profit_protected`  | **retired (v2)** — historical rows only, treat as a win |
| `momentum_fade`     | **retired (v1)** — historical rows only |
