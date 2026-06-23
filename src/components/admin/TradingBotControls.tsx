'use client';

// Per-market controls on the trading-bot dashboard: enable/disable the market
// and set its lot size. Both call admin server actions; the bot obeys them.

import { useState, useTransition } from 'react';
import { Power, PowerOff, Check, Loader2 } from 'lucide-react';
import { setLotSizeAction, setMarketEnabledAction } from '@/lib/admin/trading-bot-actions';
import { cn } from '@/lib/utils';

export function TradingBotControls({
  symbol, enabled, lotSize,
}: { symbol: string; enabled: boolean; lotSize: number }) {
  const [lot, setLot] = useState(String(lotSize));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      const r = await setMarketEnabledAction(symbol, !enabled);
      setMsg(r.ok ? null : r.message ?? 'Failed');
    });

  const saveLot = () =>
    start(async () => {
      const r = await setLotSizeAction(symbol, Number(lot));
      setMsg(r.ok ? 'Lot saved' : r.message ?? 'Failed');
      if (r.ok) setTimeout(() => setMsg(null), 1500);
    });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          'inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-bold transition-colors disabled:opacity-50',
          enabled
            ? 'bg-success/15 text-success hover:bg-success/25'
            : 'bg-danger/15 text-danger hover:bg-danger/25',
        )}
      >
        {enabled ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
        {enabled ? 'Enabled' : 'Disabled'}
      </button>

      <div className="inline-flex items-center gap-1.5">
        <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-fg-subtle">Lot</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={lot}
          onChange={(e) => setLot(e.target.value)}
          className="w-20 h-9 px-2 rounded-md border border-border bg-surface/40 text-sm font-mono text-fg focus:outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={saveLot}
          disabled={pending || Number(lot) === lotSize}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-md text-xs font-bold bg-brand-tint text-brand hover:bg-brand/20 transition-colors disabled:opacity-40"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save
        </button>
      </div>

      {msg && <span className="text-xs text-fg-muted">{msg}</span>}
    </div>
  );
}
