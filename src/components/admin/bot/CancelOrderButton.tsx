'use client';

// The analyst's veto on a resting order.
//
// The routine is to read an order while it is still pending. This is what she
// can DO about a bad one — and it is deliberately next to the reading that
// prompted it, because the gap between "this is wrong" and being able to act
// on it is where bad trades get filled.
//
// Nothing has been risked at this point: the order has not filled, so
// cancelling costs nothing but the setup. It still confirms, because the
// setup may be the only one that market offers today.

import { useState, useTransition } from 'react';
import { XCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { cancelPendingAction } from '@/lib/admin/trading-bot-actions';

export function CancelOrderButton({
  symbol, alias, ticket, level,
}: {
  symbol: string;
  alias: string;
  ticket: number | null;
  level: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  const run = () =>
    new Promise<void>((resolve, reject) => {
      start(async () => {
        const res = await cancelPendingAction(symbol, ticket);
        if (res.ok) { setError(null); setOpen(false); resolve(); }
        else { setError(res.error); reject(new Error(res.error)); }
      });
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Cancel this order before it fills"
        className="inline-flex items-center gap-1.5 rounded-md border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10"
      >
        <XCircle className="h-4 w-4" /> Cancel order
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={run}
        destructive
        title={`Cancel the ${alias} order?`}
        description={
          <>
            The resting order{level != null ? <> at <span className="font-semibold text-fg">{level}</span></> : null}{' '}
            is removed from the broker on the bot&apos;s next cycle. It has not
            filled, so nothing is lost but the setup — and the bot will not
            replace it while the level stands.
          </>
        }
        confirmLabel="Cancel the order"
      />
    </>
  );
}
