'use client';

// Per-position management controls for the Open positions table: take part of the
// trade off, move the stop to break even, trail the stop, or close out.
//
// Every one of these queues a row in bot_commands rather than touching the broker
// — the bot executes on its next poll and writes the outcome back. So the honest
// wording everywhere is "queued": the position stays exactly as it is until the
// bot reports done, which is a cycle away, not instant.
//
// Laid out as a 2x2 grid of labelled buttons rather than a dropdown on purpose:
// the table scrolls horizontally, and a menu panel would be clipped by that
// scroll container.

import { useState, useTransition } from 'react';
import { Scissors, ShieldCheck, MoveDownRight } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ClosePositionButton } from './ClosePositionButton';
import {
  partialClosePositionAction, moveToBreakEvenAction, trailStopAction,
} from '@/lib/admin/trading-bot-actions';

type Dialog = 'partial' | 'breakeven' | 'trail' | null;

const SHARES = [25, 50, 75] as const;
const DEFAULT_TRAIL_PIPS = 20;

/** Lots as traders write them, keeping a third decimal where the broker uses one. */
const lots = (n: number) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });

export function PositionActions({
  symbol,
  ticket,
  volume,
}: {
  symbol: string;
  ticket: number | null;
  /** Lots currently open, for the partial-close preview. Null when unknown. */
  volume: number | null;
}) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [share, setShare] = useState<number>(50);
  const [pips, setPips] = useState<string>(String(DEFAULT_TRAIL_PIPS));
  const [, start] = useTransition();

  // Server actions return {ok:false,error} rather than throwing; ConfirmDialog
  // surfaces a rejection inline and stays open, so map one onto the other.
  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>) =>
    new Promise<void>((resolve, reject) => {
      start(async () => {
        const res = await fn();
        if (res.ok) { setDialog(null); resolve(); }
        else reject(new Error(res.error));
      });
    });

  const trailPips = Number(pips);
  const partialLots = volume != null ? (volume * share) / 100 : null;

  return (
    <div className="inline-grid grid-cols-2 gap-1.5">
      <ActionButton onClick={() => setDialog('partial')} icon={<Scissors className="h-3.5 w-3.5" />}>
        Partial close
      </ActionButton>
      <ActionButton onClick={() => setDialog('breakeven')} icon={<ShieldCheck className="h-3.5 w-3.5" />}>
        Move to break even
      </ActionButton>
      <ActionButton onClick={() => setDialog('trail')} icon={<MoveDownRight className="h-3.5 w-3.5" />}>
        Trail SL
      </ActionButton>
      <ClosePositionButton symbol={symbol} ticket={ticket} />

      {/* ── Partial close ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={dialog === 'partial'}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => partialClosePositionAction(symbol, ticket, share / 100))}
        title={`Partially close ${symbol}?`}
        confirmLabel="Queue partial close"
        description={
          <>
            <p>How much of the position should be banked now? The rest keeps running
              with its existing stop and target.</p>
            <div className="mt-3 flex gap-2">
              {SHARES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShare(s)}
                  className={`h-9 flex-1 rounded-md border text-sm font-bold ${
                    share === s
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border text-fg-muted hover:text-fg'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-fg-subtle">
              {partialLots != null
                ? <>Closes about <span className="font-semibold text-fg">{lots(partialLots)} of {lots(volume ?? 0)} lots</span>. </>
                : null}
              The bot snaps that to the broker&apos;s lot step, and closes the position
              outright if the remainder would be too small for the broker to hold.
            </p>
          </>
        }
      />

      {/* ── Move to break even ────────────────────────────────────────── */}
      <ConfirmDialog
        open={dialog === 'breakeven'}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => moveToBreakEvenAction(symbol, ticket))}
        title={`Move ${symbol} to break even?`}
        confirmLabel="Queue break even"
        description={
          <>
            <p>Moves the stop to the entry price, so this trade can no longer lose.
              The target is left where it is.</p>
            <p className="mt-2 text-xs text-fg-subtle">
              Needs the trade to be far enough in profit for the broker to accept a
              stop at entry. If it isn&apos;t, the bot declines and says so on the
              command — nothing is changed.
            </p>
          </>
        }
      />

      {/* ── Trail SL ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={dialog === 'trail'}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => trailStopAction(symbol, ticket, trailPips))}
        title={`Trail the stop on ${symbol}?`}
        confirmLabel="Queue trailing stop"
        description={
          <>
            <p>Follows price with the stop, this far behind it. The stop only ever
              moves in the trade&apos;s favour.</p>
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-fg-muted">
              Distance
              <input
                type="number"
                min={1}
                step={1}
                value={pips}
                onChange={(e) => setPips(e.target.value)}
                className="h-9 w-24 rounded-md border border-border bg-bg px-2 text-right tabular text-fg outline-none focus:border-brand"
              />
              pips
            </label>
            <p className="mt-3 text-xs text-fg-subtle">
              The stop itself sits on the broker, so anything it locks in is safe even
              if the bot stops. The trailing does need the bot running — after a
              restart, re-arm it here.
            </p>
          </>
        }
      />
    </div>
  );
}

function ActionButton({
  onClick, icon, children,
}: {
  onClick: () => void; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-surface/60 px-2.5 py-1 text-xs font-semibold text-fg-muted hover:bg-surface-hover hover:text-fg"
    >
      {icon} {children}
    </button>
  );
}
