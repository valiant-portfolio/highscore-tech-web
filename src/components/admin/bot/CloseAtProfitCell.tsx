'use client';

// Editable "close at $" cell for the Markets table (BACKEND_V9). Writes
// bot_symbol_config.close_at_profit via the server action.
//
// Two things make this different from the lot-size cell next to it, and both
// are worth saying in the UI rather than leaving an admin to discover:
//   1. It acts on trades that are ALREADY open, not just the next one.
//   2. The close is a market order, so the realised P&L lands near the target
//      rather than exactly on it — hence "≈ $10", never "$10".
// Blank = off; the trade then runs on its SL/TP and profit ladder as before.

import { useEffect, useState, useTransition } from 'react';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { setCloseAtProfitAction } from '@/lib/admin/trading-bot-actions';

export function CloseAtProfitCell({
  symbol,
  target,
}: {
  symbol: string;
  target: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(target == null ? '' : String(target));
  const [current, setCurrent] = useState<number | null>(target);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    setCurrent(target);
    setValue(target == null ? '' : String(target));
  }, [target]);

  const save = () => {
    setErr(null);
    const raw = value.trim();
    const parsed = raw === '' ? null : Number(raw);
    if (parsed != null && !Number.isFinite(parsed)) {
      setErr('Enter a dollar amount, or blank for off.');
      return;
    }
    start(async () => {
      const res = await setCloseAtProfitAction(symbol, parsed);
      if (res.ok) {
        setCurrent(res.value ?? null);
        setValue(res.value == null ? '' : String(res.value));
        setEditing(false);
      } else setErr(res.error);
    });
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-mono tabular hover:bg-surface-hover"
        title={
          current == null
            ? 'Off — the trade runs on its SL/TP and profit ladder'
            : `Closes at market once P&L reaches about $${current}. Applies to trades already open, within ~1 min.`
        }
      >
        <span className={current == null ? 'text-fg-subtle' : 'text-success font-semibold'}>
          {current == null ? 'off' : `≈ $${current}`}
        </span>
        <Pencil className="h-3 w-3 text-fg-subtle opacity-0 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
          placeholder="off"
          inputMode="decimal"
          className="w-20 rounded-md border border-border bg-bg px-2 py-1 text-sm font-mono tabular text-fg outline-none focus:border-brand"
          disabled={pending}
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-fg disabled:opacity-50"
          aria-label="Save"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setErr(null); }}
          disabled={pending}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-fg-muted"
          aria-label="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
      {err ? (
        <span className="text-[11px] text-danger">{err}</span>
      ) : (
        <span className="text-[11px] text-fg-subtle">Blank = off. Affects open trades.</span>
      )}
    </span>
  );
}
