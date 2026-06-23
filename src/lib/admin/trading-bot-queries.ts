// Server-only reads for the /admin/trading-bot dashboard. All five trading_bot_*
// tables are written by the forex bot (service-role) and read here via the same
// service client (bypasses RLS; the page itself is admin-gated by the layout).

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export interface BotMarket {
  symbol: string;
  enabled: boolean;
  lot_size: number;
  magic: number | null;
  note: string | null;
  wins: number;
  losses: number;
  breakeven: number;
  net_r: number;
  net_profit: number;
  updated_at: string;
}

export interface BotSignal {
  id: string;
  symbol: string;
  side: string | null;
  state: string | null;
  entry: number | null;
  sl: number | null;
  tp: number | null;
  rr: number | null;
  reason: string | null;
  topdown: string | null;
  created_at: string;
}

export interface BotTrade {
  id: string;
  symbol: string;
  ticket: number | null;
  side: string | null;
  lot: number | null;
  entry: number | null;
  sl: number | null;
  tp: number | null;
  opened_at: string;
  closed_at: string | null;
  exit_price: number | null;
  profit: number | null;
  r_multiple: number | null;
  result: string | null;
  close_reason: string | null;
  peak_r: number | null;
}

export interface BotEvent {
  id: string;
  symbol: string | null;
  level: string;
  kind: string;
  message: string | null;
  created_at: string;
}

export interface BotSummary {
  id: string;
  day: string;
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  net_r: number;
  net_profit: number;
  max_dd_r: number | null;
  created_at: string;
}

export interface TradingBotData {
  markets: BotMarket[];
  signals: BotSignal[];
  trades: BotTrade[];
  events: BotEvent[];
  summaries: BotSummary[];
  lastHeartbeat: string | null;
}

export async function getTradingBot(): Promise<TradingBotData> {
  const admin = serviceClient();
  const [markets, signals, trades, events, summaries, beat] = await Promise.all([
    admin.from('trading_bot_markets').select('*').order('symbol', { ascending: true }),
    admin.from('trading_bot_signals').select('*').order('created_at', { ascending: false }).limit(20),
    admin.from('trading_bot_trades').select('*').order('opened_at', { ascending: false }).limit(20),
    admin.from('trading_bot_events').select('*').order('created_at', { ascending: false }).limit(30),
    admin.from('trading_bot_daily_summary').select('*').order('day', { ascending: false }).limit(14),
    admin.from('trading_bot_events').select('created_at').order('created_at', { ascending: false }).limit(1),
  ]);

  return {
    markets: (markets.data ?? []) as BotMarket[],
    signals: (signals.data ?? []) as BotSignal[],
    trades: (trades.data ?? []) as BotTrade[],
    events: (events.data ?? []) as BotEvent[],
    summaries: (summaries.data ?? []) as BotSummary[],
    lastHeartbeat: ((beat.data ?? [])[0] as { created_at: string } | undefined)?.created_at ?? null,
  };
}
