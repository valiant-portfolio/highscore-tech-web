'use client';

// "Close" control for an open position. Confirms, then queues a close command
// (bot_commands) via the server action. The bot executes on its next poll and
// writes the outcome back — so after confirming, the position lingers for a
// cycle until the bot reports done and the auto-refresh drops it.

import { useState, useTransition } from 'react';
import { XCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { closePositionAction } from '@/lib/admin/trading-bot-actions';

export function ClosePositionButton({
  symbol,
  ticket,
  label,
}: {
  symbol: string;
  ticket: number | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();

  const run = () =>
    new Promise<void>((resolve, reject) => {
      start(async () => {
        const res = await closePositionAction(symbol, ticket);
        if (res.ok) { setOpen(false); resolve(); }
        else reject(new Error(res.error));
      });
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-danger/5 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10"
      >
        <XCircle className="h-3.5 w-3.5" /> {label ?? 'Close'}
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={run}
        destructive
        title={ticket == null ? `Close all positions on ${symbol}?` : `Close this position?`}
        description={
          <>
            This queues a close command for <span className="font-semibold text-fg">{symbol}</span>
            {ticket != null ? <> (ticket {ticket})</> : ' (all open positions)'}. The bot executes it on
            its next poll — the position stays listed until it confirms.
          </>
        }
        confirmLabel="Queue close"
      />
    </>
  );
}
