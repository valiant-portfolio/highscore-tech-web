// Read-only queries for the trading-bot monitor. The bot (a Python process)
// writes to the `bot_*` tables; the dashboard only reads. See
// trading-bot-db/FRONTEND.md for the contract.
//
// These tables live in the BOT's own Supabase project, not the main app's —
// hence botServiceClient() rather than serviceClient(). Service role bypasses
// RLS, which is fine here: this is an admin-only page.

import 'server-only';
import { botServiceClient } from '@/lib/supabase/bot';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from '@supabase/supabase-js';

/** v7: three trend states only. htf_trend (H1) decides trades; entry_trend (M15)
 *  is context. `Sideways` = no trend. */
export type BotTrend = 'Uptrend' | 'Downtrend' | 'Sideways' | string;

export type BotState = 'monitoring' | 'ready' | 'active' | string;

/** Why the bot is in its current state — one of four fixed tags (v7). */
export type BotReason =
  | 'Awaiting Trend'
  | 'Pullback'
  | 'Entry ready'
  | 'Trend Confirmed'
  | string;

export interface BotMarket {
  symbol: string;
  alias: string;
  timeframe: string | null;
  htf: string | null;
  entry_trend: BotTrend | null;
  htf_trend: BotTrend | null;
  state: BotState | null;
  reason: BotReason | null;
  /** Latest signal, e.g. `BUY @ 1.15250`. Null when there is none. */
  latest_signal: string | null;
  price: number | null;
  level: number | null;
  pnl: number | null;
  /** Stop/target as the broker currently holds them — correct for adopted
   *  positions and after the profit lock ratchets the stop. Null when unset. */
  sl: number | null;
  tp: number | null;
  /** Lots the broker currently holds. Same reason as sl/tp: an adopted position
   *  has no bot_trades row, and a partial close changes the size. Null when flat. */
  volume: number | null;
  /** When the broker opened the live position — the clock for trade duration.
   *  Null when flat. */
  opened_at: string | null;
  strategy: string | null;
  is_dry_run: boolean;
  updated_at: string;
  /** What every indicator reads on this market right now (migration 012).
   *  Null until that migration is applied. This is the reading that decides
   *  whether a PENDING order should have been placed — the trade page's
   *  entry-vs-exit table only exists once a trade does. */
  snapshot: BotSnapshot | null;
  /** Ticket of whatever is live on this market — the resting order's, or the
   *  open position's. The same number across a fill in MT5, which is what lets
   *  an analyst's note survive the trigger. Null when the market is flat, and
   *  null everywhere until migration 007. */
  pending_ticket: number | null;
}

/** An analyst's reading of one order (bot_trade_analysis, migration 007).
 *  Written while the order is PENDING — that is when it is worth writing. */
export interface BotTradeAnalysis {
  ticket: number;
  symbol: string;
  note: string | null;
  image_path: string | null;
  side: string | null;
  level: number | null;
  sl: number | null;
  tp: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/** An analysis with its image already signed for display. */
export interface BotTradeAnalysisView extends BotTradeAnalysis {
  imageUrl: string | null;
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
  /** The trade review — what the indicators read at the entry bar and again at
   *  the exit bar. Written by the bot (db/migrations/005 in the bot repo); null
   *  on every trade that closed before that shipped, and not backfillable. */
  entry_snapshot: BotSnapshot | null;
  exit_snapshot: BotSnapshot | null;
  /** Trend as an integer, -2 (Strong Down) .. +2 (Strong Up). `htf` is the
   *  higher timeframe the bot confirms against — H1 when trading M15. */
  entry_trend: number | null;
  exit_trend: number | null;
  entry_htf_trend: number | null;
  exit_htf_trend: number | null;
  /** 'with trend' | 'against trend' | 'no trend', judged at entry. */
  trend_agreement: string | null;
  /** Best excursion in favour and worst against, in PRICE units, measured on
   *  bar extremes. mae is the one to lead with on a winner: "came within a hair
   *  of the stop" is the story the P&L column hides. */
  mfe: number | null;
  mae: number | null;
  /** Result as a multiple of the initial risk (entry → stop). */
  r_multiple: number | null;
}

/** One bar's indicator readings. Every value may be null where the terminal
 *  lacked the history to compute it — render those as "—", never as zero. */
export interface BotSnapshot {
  time: string | null;
  close: number | null;
  trend: number | null;
  ema50: number | null;
  ema200: number | null;
  rsi: number | null;
  macd: number | null;
  macd_hist: number | null;
  adx: number | null;
  plus_di: number | null;
  minus_di: number | null;
  atr: number | null;
  bb_z: number | null;
}

export interface BotBar {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
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
  /** BACKEND_V9: close an open trade once its floating P&L reaches this many
   *  dollars. null = off, and the trade runs on its SL/TP and profit ladder. */
  close_at_profit: number | null;
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

/** The trading switch (bot_settings, one row). Off = the bot opens nothing new;
 *  it keeps running and keeps managing everything already placed. */
export interface BotSettings {
  trading_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
  /** Trades before this date are the OLD strategy's record. Kept, not
   *  deleted — it is the evidence of what did not work — but filtered out of
   *  the dashboard by default so the new strategy is measured on its own.
   *  Null = no cutover set, show everything (migration 014). */
  cutover_at: string | null;
  /** When the bot last READ this flag (migration 013). Null means it never
   *  has — on older code, not running, or unable to reach Supabase. A switch
   *  that cannot be verified is worse than none, because you stop watching. */
  seen_by_bot_at: string | null;
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
  /** Analyst readings for the tickets currently live, keyed by ticket. Empty
   *  until migration 007. */
  analyses: Record<number, BotTradeAnalysisView>;
  /** The trading switch. Null when migration 006 has not been applied — the
   *  dashboard then hides the control rather than showing one the bot cannot
   *  read, which would be a button that silently does nothing. */
  settings: BotSettings | null;
}

// ONE string literal, deliberately: supabase-js parses this at the type level to
// infer the row shape, and it cannot see through a concatenation — splitting it
// for readability turns every result into GenericStringError[].
//
// The tail is the trade review (entry_snapshot onward), selected everywhere
// trades are listed so a row can say whether it was taken with or against the
// trend without a second round trip.
const TRADE_COLS =
  'id, ticket, symbol, timeframe, strategy, side, volume, open_ts, open_price, close_ts, close_price, sl, tp, pnl, commission, swap, entry_spread, close_reason, is_dry_run, entry_snapshot, exit_snapshot, entry_trend, exit_trend, entry_htf_trend, exit_htf_trend, trend_agreement, mfe, mae, r_multiple';

/**
 * Analyst readings for a set of tickets, with their images signed for display.
 *
 * Signed per render (ten minutes) rather than stored: the bucket is private,
 * and a URL that outlives the page it was shown on is a link anyone can keep.
 *
 * Returns {} rather than throwing when migration 007 has not been applied —
 * the dashboard then simply has no analysis to show, which is true.
 */
async function analysesFor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any>,
  tickets: number[],
): Promise<Record<number, BotTradeAnalysisView>> {
  if (tickets.length === 0) return {};
  const { data, error } = await admin
    .from('bot_trade_analysis')
    .select('ticket, symbol, note, image_path, side, level, sl, tp, created_at, updated_at, created_by')
    .in('ticket', tickets);
  if (error || !data) return {};

  const out: Record<number, BotTradeAnalysisView> = {};
  for (const row of data as BotTradeAnalysis[]) {
    let imageUrl: string | null = null;
    if (row.image_path) {
      const { data: signed } = await admin.storage
        .from('trade-analysis')
        .createSignedUrl(row.image_path, 600);
      imageUrl = signed?.signedUrl ?? null;
    }
    out[row.ticket] = { ...row, imageUrl };
  }
  return out;
}

export async function getBotOverview(): Promise<BotOverview> {
  const admin = botServiceClient();

  const [markets, configs, specs, openTrades, closedTrades, equity, equityCurve, settings] = await Promise.all([
    admin.from('bot_market_state').select('*').order('alias', { ascending: true }),
    admin.from('bot_symbol_config').select('symbol, alias, lot_size, close_at_profit, enabled, updated_at'),
    admin.from('bot_symbols').select('name, alias, digits, volume_min, volume_max, volume_step'),
    admin.from('bot_trades').select(TRADE_COLS).is('close_ts', null).order('open_ts', { ascending: false }),
    admin.from('bot_trades').select(TRADE_COLS).not('close_ts', 'is', null).order('close_ts', { ascending: false }).limit(1000),
    admin.from('bot_equity_snapshots').select('*').order('ts', { ascending: false }).limit(1),
    admin.from('bot_equity_snapshots').select('ts, equity, balance, open_positions, is_dry_run').order('ts', { ascending: false }).limit(500),
    admin.from('bot_settings').select('trading_enabled, updated_at, updated_by, seen_by_bot_at, cutover_at').eq('id', 1).maybeSingle(),
  ]);

  const marketRows = (markets.data ?? []) as BotMarket[];
  const lastUpdate = marketRows.reduce<string | null>(
    (max, m) => (!max || m.updated_at > max ? m.updated_at : max),
    null,
  );

  // Trades are shown only for markets the bot still trades. bot_market_state is
  // pruned to the enabled set each publish, so this needs no second list to
  // maintain — disable a market in config and its history leaves the dashboard
  // on the next cycle.
  //
  // FILTERED, NOT DELETED. Those trades really happened and are part of why the
  // balance is what it is, so the rows stay in bot_trades. Two consequences to
  // know about: Performance no longer reconciles with account equity (it now
  // describes the markets still traded, not the account), and the equity curve
  // still includes every market because it is account-level, not per-symbol.
  const liveSymbols = new Set(marketRows.map((m) => m.symbol));
  const onlyLive = (t: BotTrade) => liveSymbols.has(t.symbol);
  const closedLive = ((closedTrades.data ?? []) as BotTrade[]).filter(onlyLive);

  return {
    markets: marketRows,
    configs: (configs.data ?? []) as BotConfig[],
    specs: (specs.data ?? []) as BotSymbolSpec[],
    openTrades: ((openTrades.data ?? []) as BotTrade[]).filter(onlyLive),
    closedTrades: closedLive,
    // Count the filtered set, not the table: the header said "182 trades" while
    // the list showed 105, which reads as a broken page.
    closedCount: closedLive.length,
    equity: (equity.data?.[0] as BotEquity | undefined) ?? null,
    equityCurve: ((equityCurve.data ?? []) as BotEquity[]).slice().reverse(), // oldest → newest for a chart
    lastUpdate,
    settings: (settings.data as BotSettings | null) ?? null,
    // Only what is live: a note matters while the order it describes is still
    // resting or running. Closed trades read theirs on their own page.
    analyses: await analysesFor(
      admin,
      marketRows.map((m) => m.pending_ticket).filter((t): t is number => t != null),
    ),
  };
}

export interface BotMarketDetail {
  market: BotMarket | null;
  trades: BotTrade[];
  predictions: BotPrediction[];
  modelRun: BotModelRun | null;
}

export async function getBotMarket(symbol: string): Promise<BotMarketDetail> {
  const admin = botServiceClient();

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

export interface BotTradeDetail {
  trade: BotTrade | null;
  /** The analyst's reading of this ticket, image already signed. Written while
   *  the order was pending; it stays attached through the fill and the close. */
  analysis: BotTradeAnalysisView | null;
  /** Bars around the trade, for the chart. Empty when the window has aged out
   *  of bot_bars' retention — the page still renders, without the chart. */
  bars: BotBar[];
  timeframe: string;
  digits: number;
}

/** One trade, with the bars it lived through.
 *
 * Keyed by TICKET, not by row id: that is what the broker, the logs and the
 * Telegram alerts all name a trade by, so a deep link from any of them lands
 * here. Dry-run trades have no ticket and are not reachable this way.
 */
export async function getBotTrade(ticket: number): Promise<BotTradeDetail> {
  const admin = botServiceClient();

  const { data } = await admin.from('bot_trades').select(TRADE_COLS).eq('ticket', ticket).maybeSingle();
  const trade = (data as BotTrade | null) ?? null;
  if (!trade) return { trade: null, analysis: null, bars: [], timeframe: 'M15', digits: 5 };

  // bot_bars only syncs M15 and H1 (backend v7). Anything else recorded on the
  // trade would return an empty chart, so fall back rather than show nothing.
  const timeframe = trade.timeframe === 'H1' ? 'H1' : 'M15';
  const tfSeconds = timeframe === 'H1' ? 3600 : 900;

  // Context either side of the trade: 60 bars before the entry and 40 after the
  // exit, so the chart shows what price was doing BEFORE the bot acted — which
  // is the part that says whether the entry made sense.
  const openMs = new Date(trade.open_ts).getTime();
  const closeMs = trade.close_ts ? new Date(trade.close_ts).getTime() : Date.now();
  const from = new Date(openMs - 60 * tfSeconds * 1000).toISOString();
  const to = new Date(closeMs + 40 * tfSeconds * 1000).toISOString();

  const [bars, quote] = await Promise.all([
    admin.from('bot_bars').select('ts,open,high,low,close')
      .eq('symbol', trade.symbol).eq('timeframe', timeframe)
      .gte('ts', from).lte('ts', to).order('ts', { ascending: true }).limit(1000),
    admin.from('bot_quotes').select('digits').eq('symbol', trade.symbol).maybeSingle(),
  ]);

  return {
    trade,
    analysis: (await analysesFor(admin, [ticket]))[ticket] ?? null,
    bars: (bars.data ?? []) as BotBar[],
    timeframe,
    digits: (quote.data?.digits as number | undefined) ?? 5,
  };
}

/** All symbols the bot tracks — for detail links. */
export async function listBotSymbols(): Promise<string[]> {
  const admin = botServiceClient();
  const { data } = await admin.from('bot_market_state').select('symbol');
  return (data ?? []).map((r: { symbol: string }) => r.symbol);
}
