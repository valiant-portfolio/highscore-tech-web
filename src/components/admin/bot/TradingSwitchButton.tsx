'use client';

// The trading switch: one global on/off the bot reads every cycle.
//
// Off means the bot opens NOTHING NEW. It keeps running, keeps publishing, and
// keeps managing everything already placed — positions stay under their stops
// and profit ladder, and orders already resting with the broker are left
// exactly where they are (Victor, 25 Sep 2026).
//
// Turning it OFF is the end-of-day routine, so it is one click: hesitating at
// a dialog when you are trying to stand the desk down is friction in the wrong
// direction. Turning it back ON asks first — that one commits money.
//
// The bot obeys within a cycle (~10s), not instantly, and the button says so
// rather than pretending the change has already taken effect.

import { useState, useTransition } from 'react';
import { Pause, Play } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { setTradingEnabledAction } from '@/lib/admin/trading-bot-actions';
import { useStale } from './BotBits';

interface Props {
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
  /** When the bot last read the flag. Null or stale means it is not obeying
   *  this button, and the button must say so rather than look like it works. */
  seenByBotAt: string | null;
}

// The bot stamps every minute. Three minutes allows for a slow cycle and a
// missed write without crying wolf; beyond that, something is actually wrong.
const STALE_AFTER_MS = 3 * 60_000;

export function TradingSwitchButton({ enabled, updatedAt, updatedBy, seenByBotAt }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const apply = (next: boolean) =>
    new Promise<void>((resolve, reject) => {
      start(async () => {
        const res = await setTradingEnabledAction(next);
        if (res.ok) { setError(null); setConfirming(false); resolve(); }
        else { setError(res.error); reject(new Error(res.error)); }
      });
    });

  // "When a day looks thin, the first question is whether the bot was allowed
  // to trade at all" — so the switch shows who moved it and when, and nobody
  // has to keep that in a notebook.
  // A switch nobody is reading is the one failure this control must never
  // hide: the desk stands down, the screen says "off", and the bot keeps
  // trading because it is on older code or not running at all.
  const obeyed = !useStale(seenByBotAt, STALE_AFTER_MS);

  const since = updatedAt
    ? new Date(updatedAt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : null;
  const provenance = since ? `${enabled ? 'On' : 'Off'} since ${since}${updatedBy ? ` · ${updatedBy}` : ''}` : null;

  return (
    // Just the control. The caption above it belongs to the whole group —
    // the switch and "Close all" sit side by side, and a caption attached to
    // one of them pushes the other out of line.
    <>
      <button
        type="button"
        disabled={pending || !obeyed}
        onClick={() => (enabled ? apply(false).catch(() => {}) : setConfirming(true))}
        title={
          // Spelled out because this sits beside "Close all", and the two do
          // opposite halves of the same job: one stops adding risk, the other
          // gets rid of the risk you already carry.
          enabled
            ? 'Open no new trades. Positions already open keep running and stay managed; nothing is closed.'
            : 'Let the bot open new trades again.'
        }
        className={
          'inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-bold disabled:opacity-40 '
          + (enabled
            ? 'border-border bg-surface-hover/40 text-fg hover:bg-surface-hover'
            : 'border-success/40 bg-success/10 text-success hover:bg-success/20')
        }
      >
        {enabled
          ? <><Pause className="h-4 w-4" /> Stop new trades</>
          : <><Play className="h-4 w-4" /> Trading is off</>}
      </button>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => apply(true)}
        title="Let the bot open new trades again?"
        description={
          <>
            The bot will start taking setups on its next cycle. Anything already
            open or resting has been managed throughout — this only lifts the
            block on <span className="font-semibold text-fg">new</span> trades.
          </>
        }
        confirmLabel="Start trading"
      />
    </>
  );
}
