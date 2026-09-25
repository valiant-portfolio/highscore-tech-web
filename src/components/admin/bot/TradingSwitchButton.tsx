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

interface Props {
  enabled: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

export function TradingSwitchButton({ enabled, updatedAt, updatedBy }: Props) {
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
  const since = updatedAt
    ? new Date(updatedAt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : null;
  const provenance = since ? `${enabled ? 'On' : 'Off'} since ${since}${updatedBy ? ` · ${updatedBy}` : ''}` : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => (enabled ? apply(false).catch(() => {}) : setConfirming(true))}
        title={provenance ?? undefined}
        className={
          enabled
            ? 'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-hover/40 px-3 py-1.5 text-xs font-bold text-fg hover:bg-surface-hover disabled:opacity-40'
            : 'inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-bold text-success hover:bg-success/20 disabled:opacity-40'
        }
      >
        {enabled
          ? <><Pause className="h-4 w-4" /> Stop new trades</>
          : <><Play className="h-4 w-4" /> Trading is off</>}
      </button>

      {provenance && <span className="text-[10px] text-fg-subtle">{provenance}</span>}
      {error && <span className="text-[10px] text-danger">{error}</span>}

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
    </div>
  );
}
