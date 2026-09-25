'use client';

// Whether the bot may place its own orders, or must ask first.
//
// ON:  it finds a setup and proposes it. Nothing reaches the broker until
//      someone approves — from here or from the Telegram alert.
// OFF: it places its own orders, as it always has.
//
// Both are right at different times. Asking first is the point of the analysis
// routine; placing its own is the only useful behaviour when nobody is at the
// desk to answer. So this is a switch, not a deploy.
//
// Turning it ON is one click — it can only reduce what the bot does on its
// own. Turning it OFF asks, because it hands the decision back to the bot.

import { useState, useTransition } from 'react';
import { UserCheck, Bot } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { setApprovalModeAction } from '@/lib/admin/trading-bot-actions';

export function ApprovalModeToggle({ required }: { required: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const apply = (next: boolean) =>
    new Promise<void>((resolve, reject) => {
      start(async () => {
        const res = await setApprovalModeAction(next);
        if (res.ok) { setError(null); setConfirming(false); resolve(); }
        else { setError(res.error); reject(new Error(res.error)); }
      });
    });

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => (required ? setConfirming(true) : apply(true).catch(() => {}))}
        title={required
          ? 'The bot is asking before it places. Click to let it place its own orders again.'
          : 'The bot places its own orders. Click to make it ask you first.'}
        className={
          'inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-bold disabled:opacity-40 '
          + (required
            ? 'border-brand/40 bg-brand/10 text-brand hover:bg-brand/20'
            : 'border-border text-fg-muted hover:bg-surface-hover')
        }
      >
        {required
          ? <><UserCheck className="h-3.5 w-3.5" /> Approval required</>
          : <><Bot className="h-3.5 w-3.5" /> Bot decides</>}
      </button>
      {error && <span className="text-[10px] text-danger">{error}</span>}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => apply(false)}
        title="Let the bot place orders without asking?"
        description={
          <>
            Setups will go straight to the broker again, without anyone reading
            them first. Anything currently waiting for approval stays waiting —
            this only changes what happens to the <span className="font-semibold text-fg">next</span> setup.
          </>
        }
        confirmLabel="Let the bot decide"
      />
    </>
  );
}
