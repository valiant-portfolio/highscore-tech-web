// Read-only queries for the trading-bot monitor. The bot (a Python process)
// writes to the `bot_*` tables; the dashboard only reads. See
// trading-bot-db/FRONTEND.md for the contract.
//
// We read with the service client (bypasses RLS) because this is an admin-only
// page — the trading tables stay private to the browser (no anon read policy).

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export type BotTrend = 'uptrend' | 'downtrend' | 'no-trend' | string;
export type BotState = 'watching' | 'held' | 'setup_ready' | 'order' | 'position' | string;

export interface BotMarket {
  symbol: string;
  alias: string;
  timeframe: string | null;
  htf: string | null;
  entry_trend: BotTrend | null;
  htf_trend: BotTrend | null;
  state: BotState | null;
  detail: string | null;
  price: number | null;
  level: number | null;
  pnl: number | null;
  strategy: string | null;
  is_dry_run: boolean;
  updated_at: string;
}

export interface BotTrade {
  id: string;
  ticket: number | null;
  symbol: string;
  timeframe: string | null;
  strategy: string | null;
  side: 'buy' | 'sell' | string;
  volume: number;
  open_ts: string;
  open_price: number;
  close_ts: string | null;
  close_price: number | null;
  sl: number | null;
  tp: number | null;
  pnl: number | null;
  commission: number | null;
  swap: number | null;
  entry_spread: number | null;
  close_reason: string | null;
  is_dry_run: boolean;
}

export interface BotEquity {
  ts: string;
  balance: number;
  equity: number;
  margin: number | null;
  margin_free: number | null;
  open_positions: number;
  is_dry_run: boolean;
}

export interface BotPrediction {
  id: string;
  symbol: string;
  timeframe: string;
  ts: string;
  horizon_bars: number;
  direction: 'long' | 'short' | 'flat' | string;
  edge_bps: number | null;
  confidence: number | null;
  predicted_vol: number | null;
  acted_on: boolean;
  skip_reason: string | null;
  created_at: string;
}

export interface BotModelRun {
  id: string;
  symbol: string;
  model_type: string;
  timeframe: string | null;
  trained_at: string;
  oos_sharpe: number | null;
  oos_hit_rate: number | null;
  oos_profit_factor: number | null;
  oos_net_pnl: number | null;
  oos_max_dd_pct: number | null;
  n_oos_trades: number | null;
  buy_hold_pct: number | null;
  beats_buy_hold: boolean | null;
  passed_gate: boolean;
  gate_notes: string | null;
}

/** Admin-set lot sizing, one row per market (bot_symbol_config). */
export interface BotConfig {
  symbol: string;
  alias: string;
  lot_size: number | null; // null = broker minimum
  enabled: boolean;
  updated_at: string;
}

/** Broker contract limits used to validate a lot size (bot_symbols). */
export interface BotSymbolSpec {
  name: string;
  alias: string;
  digits: number;
  volume_min: number;
  volume_max: number;
  volume_step: number;
}

export interface BotOverview {
  markets: BotMarket[];
  configs: BotConfig[];
  specs: BotSymbolSpec[];
  openTrades: BotTrade[];
  /** Most recent closed trades for the Transactions tab (client filters/sorts). */
  closedTrades: BotTrade[];
  /** True total closed-trade count (V2) — independent of the fetch limit above. */
  closedCount: number;
  equity: BotEquity | null;
  equityCurve: BotEquity[];
  /** Newest market write across all symbols — drives the online/stale badge. */
  lastUpdate: string | null;
}

const TRADE_COLS =
  'id, ticket, symbol, timeframe, strategy, side, volume, open_ts, open_price, close_ts, close_price, sl, tp, pnl, commission, swap, entry_spread, close_reason, is_dry_run';

export async function getBotOverview(): Promise<BotOverview> {
  const admin = serviceClient();

  const [markets, configs, specs, openTrades, closedTrades, closedCountRes, equity, equityCurve] = await Promise.all([
    admin.from('bot_market_state').select('*').order('alias', { ascending: true }),
    admin.from('bot_symbol_config').select('symbol, alias, lot_size, enabled, updated_at'),
    admin.from('bot_symbols').select('name, alias, digits, volume_min, volume_max, volume_step'),
    admin.from('bot_trades').select(TRADE_COLS).is('close_ts', null).order('open_ts', { ascending: false }),
    admin.from('bot_trades').select(TRADE_COLS).not('close_ts', 'is', null).order('close_ts', { ascending: false }).limit(1000),
    admin.from('bot_trades').select('id', { count: 'exact', head: true }).not('close_ts', 'is', null),
    admin.from('bot_equity_snapshots').select('*').order('ts', { ascending: false }).limit(1),
    admin.from('bot_equity_snapshots').select('ts, equity, balance, open_positions, is_dry_run').order('ts', { ascending: false }).limit(500),
  ]);

  const marketRows = (markets.data ?? []) as BotMarket[];
  const lastUpdate = marketRows.reduce<string | null>(
    (max, m) => (!max || m.updated_at > max ? m.updated_at : max),
    null,
  );

  return {
    markets: marketRows,
    configs: (configs.data ?? []) as BotConfig[],
    specs: (specs.data ?? []) as BotSymbolSpec[],
    openTrades: (openTrades.data ?? []) as BotTrade[],
    closedTrades: (closedTrades.data ?? []) as BotTrade[],
    closedCount: closedCountRes.count ?? (closedTrades.data?.length ?? 0),
    equity: (equity.data?.[0] as BotEquity | undefined) ?? null,
    equityCurve: ((equityCurve.data ?? []) as BotEquity[]).slice().reverse(), // oldest → newest for a chart
    lastUpdate,
  };
}

export interface BotMarketDetail {
  market: BotMarket | null;
  trades: BotTrade[];
  predictions: BotPrediction[];
  modelRun: BotModelRun | null;
}

export async function getBotMarket(symbol: string): Promise<BotMarketDetail> {
  const admin = serviceClient();

  const [market, trades, predictions, modelRun] = await Promise.all([
    admin.from('bot_market_state').select('*').eq('symbol', symbol).maybeSingle(),
    admin.from('bot_trades').select(TRADE_COLS).eq('symbol', symbol).order('open_ts', { ascending: false }).limit(30),
    admin.from('bot_predictions')
      .select('id, symbol, timeframe, ts, horizon_bars, direction, edge_bps, confidence, predicted_vol, acted_on, skip_reason, created_at')
      .eq('symbol', symbol).order('ts', { ascending: false }).limit(25),
    admin.from('bot_model_runs')
      .select('id, symbol, model_type, timeframe, trained_at, oos_sharpe, oos_hit_rate, oos_profit_factor, oos_net_pnl, oos_max_dd_pct, n_oos_trades, buy_hold_pct, beats_buy_hold, passed_gate, gate_notes')
      .eq('symbol', symbol).order('trained_at', { ascending: false }).limit(1),
  ]);

  return {
    market: (market.data as BotMarket | null) ?? null,
    trades: (trades.data ?? []) as BotTrade[],
    predictions: (predictions.data ?? []) as BotPrediction[],
    modelRun: (modelRun.data?.[0] as BotModelRun | undefined) ?? null,
  };
}

/** All symbols the bot tracks — for detail links. */
export async function listBotSymbols(): Promise<string[]> {
  const admin = serviceClient();
  const { data } = await admin.from('bot_market_state').select('symbol');
  return (data ?? []).map((r: { symbol: string }) => r.symbol);
}
