'use client';

// Per-market on/off. Writes bot_symbol_config.enabled. Note: BACKEND_V1 marks
// `enabled` as reserved — the bot trades any market with a strategy today — so
// this records intent and takes effect once the engine honours the flag.

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { setMarketEnabledAction } from '@/lib/admin/trading-bot-actions';

export function MarketEnableToggle({ symbol, enabled }: { symbol: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [pending, start] = useTransition();

  const toggle = () => {
    const next = !on;
    setOn(next); // optimistic
    start(async () => {
      const res = await setMarketEnabledAction(symbol, next);
      if (!res.ok) setOn(!next); // revert on failure
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      disabled={pending}
      title={on ? 'Enabled — pause this market' : 'Paused — enable this market'}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${on ? 'bg-success' : 'bg-surface-hover'}`}
    >
      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`}>
        {pending && <Loader2 className="h-2.5 w-2.5 animate-spin text-fg-subtle" />}
      </span>
    </button>
  );
}
