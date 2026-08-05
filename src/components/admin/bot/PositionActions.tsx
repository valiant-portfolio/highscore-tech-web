'use client';

// Per-position management control for the Open positions table.
//
// ONE action is offered, not a menu of four: which of move-to-break-even, partial
// close and trail-the-stop makes sense is decided by where the trade already is,
// so the caller derives that (manageStage) and passes it in. The exit sits beside
// it, always available. All the dialogs live here regardless of which button is
// showing — the stage picks the trigger, not the capability.
//
// Every action queues a row in bot_commands rather than touching the broker — the
// bot executes on its next poll and writes the outcome back. So the honest wording
// everywhere is "queued": the position stays exactly as it is until the bot
// reports done, which is a cycle away, not instant.

import { useEffect, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Scissors, ShieldCheck, MoveDownRight, ChevronDown, XCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  partialClosePositionAction, moveToBreakEvenAction, trailStopAction,
  closePositionAction,
} from '@/lib/admin/trading-bot-actions';
type Dialog = 'partial' | 'breakeven' | 'trail' | 'close' | null;

/**
 * Which single action this position is offered. Derived by the table from the
 * trade's own state (see manageStage there); `exit-only` means no stop move would
 * be accepted yet, so only the exit is shown.
 */
export type ManageStage = 'breakeven' | 'partial' | 'trail' | 'exit-only';

const SHARES = [25, 50, 75] as const;
const DEFAULT_TRAIL_PIPS = 20;

// Why a row can show no management action at all — the broker will not hold a stop
// at entry until the trade is in profit, so there is nothing to offer but the exit.
const EXIT_ONLY_HINT =
  'No stop move available yet — the trade has to be in profit before the broker will '
  + 'accept a stop at entry.';

/** Lots as traders write them, keeping a third decimal where the broker uses one. */
const lots = (n: number) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });

export function PositionActions({
  symbol,
  ticket,
  volume,
  stage,
}: {
  symbol: string;
  ticket: number | null;
  /** Lots currently open, for the partial-close preview. Null when unknown. */
  volume: number | null;
  /** Which action to offer. See ManageStage. */
  stage: ManageStage;
}) {
  const [menu, setMenu] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchor = useRef<HTMLDivElement>(null);

  // Measure on open. Fixed coordinates come from the button's own rect, and the
  // menu flips above when there is not room below - the last rows of a long
  // table would otherwise open off the bottom of the viewport.
  const openMenu = () => {
    const el = anchor.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const MENU_H = 96;
    const below = window.innerHeight - r.bottom;
    setPos({
      top: below < MENU_H ? Math.max(8, r.top - MENU_H) : r.bottom + 4,
      left: Math.max(8, Math.min(r.right - 180, window.innerWidth - 188)),
    });
    setMenu(true);
  };
  // The menu is fixed-positioned from coordinates measured when it opened, so
  // scrolling or resizing would leave it floating away from its own button.
  // Closing is better than re-measuring: it is one line, and a menu that chases
  // the cursor around a scrolling table is worse than one that just shuts.
  useEffect(() => {
    if (!menu) return;
    const shut = () => setMenu(false);
    window.addEventListener('scroll', shut, true);   // capture: catches inner scrollers too
    window.addEventListener('resize', shut);
    return () => {
      window.removeEventListener('scroll', shut, true);
      window.removeEventListener('resize', shut);
    };
  }, [menu]);

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

  // ONE button per row, opening a menu. Rendering the stage action and Close
  // side by side put a destructive control next to a routine one at every
  // glance; rendering only one of them meant a WINNING position could not be
  // closed from its own row while a losing one could — backwards, since taking
  // profit is the commoner reason to close by hand.
  const STAGE_LABEL: Record<string, string> = {
    breakeven: 'Move to break even',
    partial: 'Partial close',
    trail: 'Trail SL',
    'exit-only': 'Manage',
  };

  return (
    <div
      ref={anchor}
      className="relative inline-flex items-center"
      title={stage === 'exit-only' ? EXIT_ONLY_HINT : undefined}
    >
      <ActionButton onClick={() => (menu ? setMenu(false) : openMenu())} icon={<ChevronDown className="h-3.5 w-3.5" />}>
        {STAGE_LABEL[stage] ?? 'Manage'}
      </ActionButton>

      {/* PORTALLED to <body>, and positioned with fixed coordinates taken from
          the button. The row lives inside `overflow-x-auto` (the table) nested in
          `overflow-hidden` (AdminCard) — an absolutely-positioned menu is clipped
          by both, so it appeared cut off or not at all. Nothing rendered inside
          the cell can escape those, hence the portal. */}
      {menu && pos && createPortal(
        <>
          {/* Click-away. Sits under the menu so any outside click closes it
              without also triggering whatever was clicked. */}
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[90] cursor-default"
            onClick={() => setMenu(false)}
          />
          <div
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: 180 }}
            className="z-[100] overflow-hidden rounded-md border border-border bg-bg-elevated shadow-lg"
          >
            {stage === 'breakeven' && (
              <MenuItem onClick={() => { setMenu(false); setDialog('breakeven'); }}
                        icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                Move to break even
              </MenuItem>
            )}
            {stage === 'partial' && (
              <MenuItem onClick={() => { setMenu(false); setDialog('partial'); }}
                        icon={<Scissors className="h-3.5 w-3.5" />}>
                Partial close
              </MenuItem>
            )}
            {stage === 'trail' && (
              <MenuItem onClick={() => { setMenu(false); setDialog('trail'); }}
                        icon={<MoveDownRight className="h-3.5 w-3.5" />}>
                Trail SL
              </MenuItem>
            )}
            {/* Always present, and visually separated — closing is available on
                every position regardless of which stage it has reached. */}
            <div className="border-t border-border">
              <MenuItem onClick={() => { setMenu(false); setDialog('close'); }}
                        icon={<XCircle className="h-3.5 w-3.5" />} danger>
                Close position
              </MenuItem>
            </div>
          </div>
        </>,
        document.body,
      )}

      <ConfirmDialog
        open={dialog === 'close'}
        onClose={() => setDialog(null)}
        onConfirm={() => run(() => closePositionAction(symbol, ticket))}
        title={`Close ${symbol}?`}
        confirmLabel="Queue close"
        destructive
        description={
          <p>Closes the whole position at market on the bot next poll. This cannot be undone.</p>
        }
      />

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

/** One row of the actions menu. `danger` marks the destructive exit. */
function MenuItem({
  onClick, icon, children, danger = false,
}: {
  onClick: () => void; icon: React.ReactNode; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold whitespace-nowrap hover:bg-surface-hover ${
        danger ? 'text-danger' : 'text-fg-muted hover:text-fg'
      }`}
    >
      {icon} {children}
    </button>
  );
}
