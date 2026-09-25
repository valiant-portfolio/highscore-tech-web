'use client';

// Live market rows over Supabase Realtime.
//
// The numbers were never the stale part. quote_feed pushes floating P&L into
// bot_market_state every ~3 seconds, straight from the broker's view of the
// position — but the dashboard re-fetched on a 30-second timer, so a figure
// that was three seconds old could reach the screen twenty-seven seconds late.
//
// This subscribes instead of asking. The server still renders the first paint
// (so there is no empty dashboard while a socket connects), and every write
// after that arrives on its own.
//
// It changes nothing about how often the bot publishes. HS-BOT-v2 is explicit
// that the trading loop stays at 30s; this is about the browser's ears, not
// the bot's voice.

import { useEffect, useRef, useState } from 'react';
import { createBotClient } from '@/lib/supabase/bot-client';
import type { BotMarket } from '@/lib/admin/trading-bot-queries';

export interface LiveState {
  markets: BotMarket[];
  /** When this browser last heard from the database. Null until the first
   *  message — the server-rendered rows carry their own updated_at. */
  lastEvent: string | null;
  /** False while the socket is down. Worth showing: a dashboard that has
   *  quietly stopped listening looks exactly like a quiet market. */
  connected: boolean;
}

export function useLiveMarkets(initial: BotMarket[]): LiveState {
  const [markets, setMarkets] = useState<BotMarket[]>(initial);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // The server re-renders on navigation and on revalidate; adopt those rows
  // unless we have already heard something newer over the socket.
  const heard = useRef(false);
  useEffect(() => {
    if (!heard.current) setMarkets(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createBotClient();
    const channel = supabase
      .channel('bot-market-state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bot_market_state' },
        (payload) => {
          const row = payload.new as BotMarket | undefined;
          if (!row?.symbol) return;
          heard.current = true;
          setLastEvent(new Date().toISOString());
          // Merge rather than replace: the payload is one market, and the
          // bot writes them one row at a time.
          setMarkets((prev) => {
            const next = prev.slice();
            const at = next.findIndex((m) => m.symbol === row.symbol);
            if (at === -1) next.push(row);
            else next[at] = { ...next[at], ...row };
            return next;
          });
        },
      )
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { markets, lastEvent, connected };
}
