'use client';

// Editable lot-size cell for the Markets table. Writes bot_symbol_config via the
// server action, which validates against the broker's min/max/step — so what
// comes back (and what's shown) is exactly what the bot will trade. Empty = the
// broker minimum.

import { useEffect, useState, useTransition } from 'react';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { setLotSizeAction } from '@/lib/admin/trading-bot-actions';

export function LotSizeCell({
  symbol,
  lot,
  min,
  max,
  step,
}: {
  symbol: string;
  lot: number | null;
  min: number | null;
  max: number | null;
  step: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(lot == null ? '' : String(lot));
  const [current, setCurrent] = useState<number | null>(lot);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => { setCurrent(lot); setValue(lot == null ? '' : String(lot)); }, [lot]);

  const save = () => {
    setErr(null);
    const raw = value.trim();
    const parsed = raw === '' ? null : Number(raw);
    if (parsed != null && (!Number.isFinite(parsed) || parsed <= 0)) { setErr('Positive number, or blank for min.'); return; }
    start(async () => {
      const res = await setLotSizeAction(symbol, parsed);
      if (res.ok) { setCurrent(res.value ?? null); setValue(res.value == null ? '' : String(res.value)); setEditing(false); }
      else setErr(res.error);
    });
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-mono tabular hover:bg-surface-hover"
        title={min != null ? `min ${min} · max ${max} · step ${step}` : 'set lot size'}
      >
        <span className={current == null ? 'text-fg-subtle' : 'text-fg font-semibold'}>
          {current == null ? `min${min != null ? ` (${min})` : ''}` : current}
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
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
          placeholder={min != null ? `min ${min}` : 'lots'}
          inputMode="decimal"
          className="w-20 rounded-md border border-border bg-bg px-2 py-1 text-sm font-mono tabular text-fg outline-none focus:border-brand"
          disabled={pending}
        />
        <button type="button" onClick={save} disabled={pending} className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-fg disabled:opacity-50" aria-label="Save">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={() => { setEditing(false); setErr(null); }} disabled={pending} className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-fg-muted" aria-label="Cancel">
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
      {err && <span className="text-[11px] text-danger">{err}</span>}
    </span>
  );
}
