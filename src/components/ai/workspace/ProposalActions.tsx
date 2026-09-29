'use client';

// Approve or reject a setup — here, and nowhere else.
//
// This used to be a pair of buttons on the Telegram alert. It is not any more,
// and the reason is the whole point: a tap in a chat is attributable to a chat
// account at best, and shared phones and forwarded messages make even that
// soft. "Who approved this trade" has to be answerable by name weeks later, so
// the answer is given where there is a signed-in session behind it —
// decideProposalAction stamps decided_by with the account that clicked.
//
// It also shows the one thing that can kill a setup while it waits, BEFORE
// the button rather than as a failure afterwards: the shelf life. Twelve bars
// from the signal bar, and the bot marks it missed even if someone then says
// yes. Being told "too late" after pressing approve is what makes people stop
// trusting the flow.
//
// What it does NOT do is judge where price is relative to the level. A limit
// rests where price has not got to YET; that price traded there at some point
// in the past is how the level was found in the first place, not a fault. The
// distance is stated and the decision is left to the person making it.

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useNow } from '@/components/admin/bot/BotBits';
import { decideProposalAction } from '@/lib/admin/trading-bot-actions';

/** 12 bars of M15, mirroring PENDING_EXPIRY_BARS in the bot. Kept in sync by
 *  hand: the bot does not publish the deadline, so this is the one number here
 *  that could drift from it. */
const SHELF_LIFE_MS = 12 * 15 * 60_000;

export function ProposalActions({
  id, level, price, barTime,
}: {
  id: string;
  level: number | null;
  price: number | null;
  barTime: string | null;
}) {
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');

  // One ticking clock rather than Date.now() in render: the countdown has to
  // move on its own, and reading the wall clock while rendering makes the
  // output depend on when React happened to paint.
  const now = useNow(30_000);
  const age = barTime ? now - new Date(barTime).getTime() : 0;
  const expired = barTime != null && age > SHELF_LIFE_MS;
  const minsLeft = Math.max(0, Math.round((SHELF_LIFE_MS - age) / 60_000));

  // How far price is from the level, stated plainly. Which side of it price
  // sits on is information, not a verdict.
  const away = level != null && price != null ? Math.abs(price - level) : null;
  const dead = expired;

  const decide = (approved: boolean) => {
    setError(null);
    setBusy(approved ? 'approve' : 'reject');
    void decideProposalAction(id, approved, approved ? undefined : note.trim() || undefined)
      .then((res) => { if (!res.ok) setError(res.error); else setRejecting(false); })
      .finally(() => setBusy(null));
  };

  return (
    <div className="mt-2 rounded-sm border border-border bg-bg px-3 py-2.5">
      {dead ? (
        <p className="text-[11px] leading-relaxed text-warning">
          Past its shelf life — the bot will not place this now, even if approved.
        </p>
      ) : (
        <p className="text-[11px] text-fg-subtle">
          {minsLeft > 0 ? `${minsLeft} min left to answer` : 'answer now'}
          {away != null && (
            <span className="font-mono"> · {away.toFixed(away < 1 ? 5 : 3)} from the level</span>
          )}
        </p>
      )}

      {!dead && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy != null}
            onClick={() => decide(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-brand px-3 text-xs font-bold text-brand-fg hover:bg-brand-hover disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
            {busy === 'approve' ? 'Approving…' : 'Approve'}
          </button>
          <button
            type="button"
            disabled={busy != null}
            onClick={() => (rejecting ? decide(false) : setRejecting(true))}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-danger/40 px-3 text-xs font-bold text-danger hover:bg-danger/10 disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            {busy === 'reject' ? 'Rejecting…' : rejecting ? 'Confirm reject' : 'Reject'}
          </button>
        </div>
      )}

      {/* A reason is optional but asked for: "it bought into resistance at
          1.2840" is the shape that fixes the bot later; "no" teaches nobody. */}
      {rejecting && !dead && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why? (optional — it becomes the record)"
          className="mt-2 w-full rounded-sm border border-border bg-bg-elevated px-2.5 py-1.5 text-xs text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none"
        />
      )}

      <p className="mt-2 text-[10px] text-fg-subtle">
        Recorded against your account.
      </p>
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}
