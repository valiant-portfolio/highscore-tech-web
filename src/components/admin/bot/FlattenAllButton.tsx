'use client';

// Kill switch: queue a close for every open position at once. Only active when
// something is open. Each symbol gets a documented per-symbol close command.

import { useState, useTransition } from 'react';
import { ShieldAlert } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { closeAllPositionsAction } from '@/lib/admin/trading-bot-actions';

export function FlattenAllButton({ openCount }: { openCount: number }) {
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();

  const run = () =>
    new Promise<void>((resolve, reject) => {
      start(async () => {
        const res = await closeAllPositionsAction();
        if (res.ok) { setOpen(false); resolve(); }
        else reject(new Error(res.error));
      });
    });

  const disabled = openCount === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? 'No open positions' : 'Close every open position'}
        className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-danger/5 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShieldAlert className="h-4 w-4" /> Close all{openCount > 0 ? ` (${openCount})` : ''}
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={run}
        destructive
        title="Close every open position?"
        description={
          <>
            This queues a close for all <span className="font-semibold text-fg">{openCount}</span> open
            position{openCount === 1 ? '' : 's'} across every market. The bot executes on its next poll;
            positions stay listed until it confirms. Use this when you need to flatten fast.
          </>
        }
        confirmLabel="Flatten everything"
      />
    </>
  );
}
