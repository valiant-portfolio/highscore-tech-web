'use client';

// The trading-bot monitor, tabbed: Overview · Markets · Open positions ·
// Transactions. Server fetches everything and passes it in; this component owns
// the tab state, the interactive controls (lot size, close), and the
// transactions filter/sort. BotStatus auto-refreshes the server data every 30s.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Layers, Receipt, CandlestickChart, TrendingUp, TrendingDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminCard, Kpi } from '@/components/admin/AdminPage';
import { BotStatus, TrendChip, StateBadge, TimeAgo, Duration, AsOfTag, Sparkline, STALE_MS, useStale, useNow } from './BotBits';
import { LotSizeCell } from './LotSizeCell';
import { CloseAtProfitCell } from './CloseAtProfitCell';
import { PositionActions } from './PositionActions';
import { MarketEnableToggle } from './MarketEnableToggle';
import { FlattenAllButton } from './FlattenAllButton';
import { TradingSwitchButton } from './TradingSwitchButton';
import { TradeAnalysis } from './TradeAnalysis';
import { IndicatorTable } from './IndicatorTable';
import { CutoverBar } from './CutoverBar';
import { useLiveMarkets } from './useLiveMarkets';
import { MarketChart } from './MarketChart';
import type { BotMarket, BotTrade, BotConfig, BotSymbolSpec, BotEquity, BotSettings, BotTradeAnalysisView } from '@/lib/admin/trading-bot-queries';

// Four tabs, named for what you are DOING rather than which table you are
// reading. Desk is the screen you leave up; Pending is the analyst's daily job;
// Chart is the market; History is everything already decided.
type Tab = 'desk' | 'active' | 'pending' | 'chart' | 'history';

// Tabs were renamed; a saved value from the old set would leave the dashboard
// on a tab that no longer exists, showing nothing.
const OLD_TAB: Record<string, Tab> = {
  overview: 'desk', markets: 'desk', positions: 'active',
  transactions: 'history', performance: 'history', chart: 'chart',
};

const money = (n: number | null | undefined, dp = 2) =>
  n == null || !Number.isFinite(Number(n)) ? '—'
    : `${Number(n) < 0 ? '−' : ''}$${Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const px = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 5 });
const signed = (n: number | null | undefined) => (n == null ? '—' : `${Number(n) >= 0 ? '+' : ''}${money(n)}`);
const pnlTone = (n: number | null | undefined) => (n == null ? 'text-fg-muted' : Number(n) > 0 ? 'text-success' : Number(n) < 0 ? 'text-danger' : 'text-fg-muted');

/**
 * Which side a live position is on, from whichever source knows.
 *
 * bot_trades states it outright, but an adopted position may not have a row yet,
 * so fall back to the signal string the bot publishes, and finally to the target's
 * position relative to entry — a target above entry can only be a long.
 */
function positionSide(m: BotMarket, t: BotTrade | undefined): 'buy' | 'sell' | null {
  if (t?.side === 'buy' || t?.side === 'sell') return t.side;
  const sig = (m.latest_signal ?? '').toUpperCase();
  if (sig.startsWith('SHORT') || sig.startsWith('SELL')) return 'sell';
  if (sig.startsWith('LONG') || sig.startsWith('BUY')) return 'buy';
  const entry = m.level, tp = m.tp;
  if (entry != null && tp != null && tp !== entry) return tp > entry ? 'buy' : 'sell';
  return null;
}

/** The single management action offered on a position — see manageStage. */
export type ManageStage = 'breakeven' | 'partial' | 'trail' | 'exit-only';

/**
 * The one action worth taking on this position right now.
 *
 * Managing a winner runs in a fixed order — take the risk off, bank some, ride the
 * rest — so showing all four buttons at once asks the reader to work out which
 * stage the trade is at on every glance. This derives it instead, from state the
 * broker already reports:
 *
 *   stop still short of entry   the trade can still lose  -> move to break even
 *   stop at or beyond entry     risk is off, full size    -> partial close
 *   ...and the size is reduced  already banked some       -> trail the stop
 *
 * `exit-only` is the honest answer when no stop move would be accepted: with the
 * trade at or below water, a stop at entry sits on the wrong side of the market and
 * the broker rejects it. Offering a button the bot must decline is worse than
 * offering none, so that case shows only the exit.
 */
function manageStage({
  side, entry, sl, pnl, lots, openedLots,
}: {
  side: 'buy' | 'sell' | null;
  entry: number | null;
  sl: number | null;
  pnl: number | null;
  lots: number | null;
  openedLots: number | null;
}): ManageStage {
  // Manual overrides (breakeven, partial close, trail SL) have been disabled.
  // The bot fully automates these actions, so only manual exit is offered.
  return 'exit-only';
}

/** Lots, two decimals as traders write them — but never rounding away a third
 *  decimal on a broker whose volume step is 0.001. */
const lotsLabel = (n: number) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });

/**
 * What a stop or target is worth in money if it fills, at the position's current
 * size — the number a trader actually reads a level for.
 *
 * We have no contract size or tick value on the frontend, but we do have this
 * position's live P&L and how far price has travelled from entry. Their ratio is
 * the money per unit of price for this exact position, sign included (a short
 * gains as price falls, and the division carries that through). Multiply by the
 * distance from entry to the level and you have the money at that level.
 *
 * Needs a meaningful move to divide by: right after entry, price ≈ entry and the
 * ratio is noise, so return null and let the caller show the raw price instead.
 */
function moneyAtLevel(
  level: number | null | undefined,
  entry: number | null | undefined,
  price: number | null | undefined,
  pnl: number | null | undefined,
): number | null {
  if (level == null || entry == null || price == null || pnl == null) return null;
  const moved = Number(price) - Number(entry);
  // Below a tick of movement the ratio is dominated by rounding; 1e-6 is smaller
  // than any quoted point (5-digit FX = 1e-5) yet clear of float dust.
  if (!Number.isFinite(moved) || Math.abs(moved) < 1e-6) return null;
  const perUnit = Number(pnl) / moved;
  if (!Number.isFinite(perUnit) || perUnit === 0) return null;
  const at = perUnit * (Number(level) - Number(entry));
  return Number.isFinite(at) ? at : null;
}

/**
 * The active tab, kept in localStorage so a refresh leaves you where you were.
 *
 * An external store rather than state restored in an effect: the effect
 * version painted the Desk on every visit and then jumped, and React's own
 * guidance is that a value living outside React should be subscribed to, not
 * copied in after the fact.
 */
const TAB_KEY = 'bot-tab';
const tabStore = {
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    tabStore.listeners.add(listener);
    // Another tab of the same dashboard changing tabs should not be ignored.
    window.addEventListener('storage', listener);
    return () => {
      tabStore.listeners.delete(listener);
      window.removeEventListener('storage', listener);
    };
  },
  get(): Tab {
    try {
      const saved = localStorage.getItem(TAB_KEY);
      if (!saved) return 'desk';
      return (['desk', 'active', 'pending', 'chart', 'history'] as string[]).includes(saved)
        ? (saved as Tab)
        : OLD_TAB[saved] ?? 'desk';
    } catch {
      return 'desk';
    }
  },
  set(t: Tab) {
    try { localStorage.setItem(TAB_KEY, t); } catch { /* private mode */ }
    // localStorage does not notify the tab that wrote it.
    tabStore.listeners.forEach((l) => l());
  },
};

export function TradingBotDashboard({
  markets: initialMarkets, configs, specs, openTrades, closedTrades, closedCount, equity, equityCurve, lastUpdate, settings, analyses,
}: {
  markets: BotMarket[];
  configs: BotConfig[];
  specs: BotSymbolSpec[];
  openTrades: BotTrade[];
  closedTrades: BotTrade[];
  closedCount: number;
  equity: BotEquity | null;
  equityCurve: BotEquity[];
  lastUpdate: string | null;
  settings: BotSettings | null;
  analyses: Record<number, BotTradeAnalysisView>;
}) {
  // Floating P&L and market state arrive over Realtime; the server render is
  // only the first paint. Every number below reads from these rows, so the
  // P&L tile, the positions table and the pending cards all move together.
  const { markets, lastEvent, connected } = useLiveMarkets(initialMarkets);

  // The active tab, read straight from localStorage as an external store.
  //
  // Restoring it with useEffect+setState meant every visit painted the Desk
  // first and then jumped to wherever you actually were. Subscribing instead
  // renders the right tab on the first client paint, and the server snapshot
  // keeps the markup it rendered ('desk') so hydration still matches.
  const tab = useSyncExternalStore(tabStore.subscribe, tabStore.get, () => 'desk' as Tab);
  const selectTab = (t: Tab) => tabStore.set(t);

  // Jump to the chart focused on a market. MarketChart reads its selection from
  // this localStorage key on mount, and it remounts when we switch to the tab —
  // so writing the symbol (keeping the current timeframe) then switching lands
  // the trading view on that market. Used to click an ongoing trade → its chart.
  const openChartFor = (sym: string) => {
    try {
      const cur = JSON.parse(localStorage.getItem('bot-chart-selection') || '{}');
      localStorage.setItem('bot-chart-selection', JSON.stringify({ ...cur, symbol: sym }));
    } catch {
      try { localStorage.setItem('bot-chart-selection', JSON.stringify({ symbol: sym })); } catch { /* ignore */ }
    }
    selectTab('chart');
  };

  // Trades before the cutover belong to a previous strategy. They are kept —
  // that record is the evidence of what did not work — but measuring the
  // current strategy against them would describe neither.
  const [showAll, setShowAll] = useState(false);
  const cutoverMs = settings?.cutover_at ? new Date(settings.cutover_at).getTime() : null;
  const sinceCutover = useMemo(
    () => (cutoverMs == null
      ? closedTrades
      : closedTrades.filter((t) => new Date(t.close_ts ?? t.open_ts).getTime() >= cutoverMs)),
    [closedTrades, cutoverMs],
  );
  const historyTrades = showAll ? closedTrades : sinceCutover;
  // The equity curve is account-level, so it gets the same treatment: a curve
  // that starts before the strategy did makes the new one look like a dip in
  // the old one.
  const historyEquity = useMemo(
    () => (showAll || cutoverMs == null
      ? equityCurve
      : equityCurve.filter((e) => new Date(e.ts).getTime() >= cutoverMs)),
    [equityCurve, showAll, cutoverMs],
  );

  const cfgBySymbol = useMemo(() => new Map(configs.map((c) => [c.symbol, c])), [configs]);
  const specByName = useMemo(() => new Map(specs.map((s) => [s.name, s])), [specs]);
  const floating = markets.reduce((s, m) => s + (Number(m.pnl) || 0), 0);
  const liveCount = markets.filter((m) => m.state === 'active').length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRealized = closedTrades
    .filter((t) => t.close_ts && t.close_ts.slice(0, 10) === todayKey)
    .reduce((s, t) => s + (Number(t.pnl) || 0), 0);

  // Badges count from bot_market_state, not bot_trades — a position adopted
  // from the broker has no trade row, and that badge read 0 while a trade was
  // open. Pending carries a badge because an unread order is a job to do.
  const pendingCount = markets.filter((m) => m.state === 'ready').length;
  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'desk', label: 'Desk', icon: <LayoutGrid className="h-4 w-4" /> },
    { key: 'active', label: 'Active', icon: <TrendingUp className="h-4 w-4" />, badge: liveCount },
    { key: 'pending', label: 'Pending', icon: <Layers className="h-4 w-4" />, badge: pendingCount },
    { key: 'chart', label: 'Chart', icon: <CandlestickChart className="h-4 w-4" /> },
    { key: 'history', label: 'History', icon: <Receipt className="h-4 w-4" /> },
  ];

  return (
    <div>
      {/* Compact top: online dot + a horizontally-scrollable tab strip + kill
          switch. No page title/description — the tab content owns the space, and
          the strip swipes left/right on small screens instead of wrapping. */}
      <div className="mb-5 flex items-center gap-2 border-b border-border">
        <BotStatus lastUpdate={lastEvent ?? lastUpdate} compact />
        {/* A dashboard that has quietly stopped listening looks exactly like a
            quiet market, so say which it is. */}
        {!connected && (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-fg-subtle" title="Reconnecting to the live feed">
            offline
          </span>
        )}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto -mb-px [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => selectTab(t.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-t-md px-3 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key ? 'border-brand text-brand' : 'border-transparent text-fg-muted hover:text-fg'
              }`}
            >
              {t.icon}{t.label}
              {t.badge != null && t.badge > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.key ? 'bg-brand text-brand-fg' : 'bg-surface-hover text-fg-muted'}`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
        {/* The switch sits beside the kill switch: one stands the desk down,
            the other gets you out. Hidden when migration 006 has not been
            applied — a button the bot cannot read is worse than none. */}
        {/* Caption above, controls beneath: what the switch currently says,
            then the pair that changes it — stop adding risk, and get out of
            the risk already carried. The caption spans both so neither button
            is pushed out of line by it. */}
        <div className="flex shrink-0 flex-col items-end gap-1 pb-1.5 pl-2">
          {settings && <SwitchCaption settings={settings} />}
          <div className="flex items-center gap-2">
            {settings && (
              <TradingSwitchButton
                enabled={settings.trading_enabled}
                updatedAt={settings.updated_at}
                updatedBy={settings.updated_by}
                seenByBotAt={settings.seen_by_bot_at}
              />
            )}
            <FlattenAllButton openCount={liveCount} />
          </div>
        </div>
      </div>

      {/* Trading being off explains an otherwise inexplicable screen: setups
          appearing, nothing being taken. It is the first thing to check when a
          day looks thin, so it says so on every tab rather than hiding behind
          the button that set it. */}
      {settings && !settings.trading_enabled && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-surface-hover/40 px-4 py-3">
          <span className="text-sm font-bold text-fg">Trading is off</span>
          <span className="text-sm text-fg-muted">
            No new trades are being opened. Open positions and resting orders are still managed.
          </span>
          {settings.updated_at && (
            <span className="ml-auto text-[11px] text-fg-subtle">
              since {new Date(settings.updated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {settings.updated_by ? ` · ${settings.updated_by}` : ''}
            </span>
          )}
        </div>
      )}

      {/* Desk: the money and what the bot is watching. What is RUNNING has
          its own tab now — this is the standing picture, not the live one. */}
      {tab === 'desk' && (
        <div className="space-y-6">
          <Overview
            markets={markets} equity={equity} equityCurve={equityCurve}
            floating={floating} todayRealized={todayRealized}
          />
          <Markets markets={markets} cfgBySymbol={cfgBySymbol} specByName={specByName} />
        </div>
      )}

      {/* Active: what is carrying money right now. The table keeps the manage
          actions; the cards below carry each trade's reading and the analysis
          written while it was still pending — same ticket, same record. */}
      {tab === 'active' && (
        <div className="space-y-6">
          <OpenPositions
            markets={markets} openTrades={openTrades}
            floating={floating} onOpenChart={openChartFor}
          />
          <TradeCards mode="active" markets={markets} analyses={analyses} onOpenChart={openChartFor} />
        </div>
      )}
      {/* Ongoing-trade chips come from bot_market_state, not bot_trades: the bot
          only writes a trade row for orders it placed itself, so a position it
          adopted from the broker is state='active' with no row. Deriving from
          bot_trades hid live trades from the chart. */}
      {tab === 'chart' && (
        <MarketChart
          markets={markets.map((m) => ({ symbol: m.symbol, alias: m.alias }))}
          openTrades={markets
            .filter((m) => m.state === 'active')
            .map((m) => ({
              symbol: m.symbol,
              side: (m.latest_signal ?? '').toUpperCase().startsWith('SHORT') || (m.latest_signal ?? '').toUpperCase().startsWith('SELL')
                ? 'sell'
                : 'buy',
            }))}
        />
      )}
      {tab === 'pending' && (
        <TradeCards mode="pending" markets={markets} analyses={analyses} onOpenChart={openChartFor} />
      )}
      {/* History: what has already been decided — the trades, then what they
          add up to. Filtered to the current strategy by default; the previous
          record is kept, not deleted, and is one click away. */}
      {tab === 'history' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-fg">
            History <span className="text-sm font-normal text-fg-muted">· what has already been decided</span>
          </h2>
          <CutoverBar
            cutoverAt={settings?.cutover_at ?? null}
            showingAll={showAll}
            onToggle={setShowAll}
            sinceCount={sinceCutover.length}
            totalCount={closedTrades.length}
          />
          <Transactions
            closedTrades={historyTrades} markets={markets}
            total={showAll ? closedCount : sinceCutover.length}
          />
          <h3 className="pt-2 font-semibold text-fg">
            Performance <span className="text-sm font-normal text-fg-muted">· what those trades add up to</span>
          </h3>
          <Performance closedTrades={historyTrades} equityCurve={historyEquity} />
        </div>
      )}
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────── */

const PIPELINE: { state: string; label: string; tone: string }[] = [
  { state: 'monitoring', label: 'Monitoring', tone: 'text-fg-muted' },
  { state: 'ready', label: 'Ready', tone: 'text-brand' },
  { state: 'active', label: 'Active', tone: 'text-success' },
];

function Overview({
  markets, equity, equityCurve, floating, todayRealized,
}: {
  markets: BotMarket[]; equity: BotEquity | null; equityCurve: BotEquity[]; floating: number; todayRealized: number;
}) {
  const byState = (s: string) => markets.filter((m) => (m.state ?? 'monitoring') === s);
  return (
    <div className="space-y-6">
      {/* Open P&L gets the whole first column: it is the one number that moves
          while you are looking at it, and the only one arriving live. The rest
          are context and can share the row. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <LivePnl value={floating} />
        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-3">
          <Kpi label="P&L today" value={<span className={pnlTone(todayRealized)}>{signed(todayRealized)}</span>} hint="realized, closed trades" tone={todayRealized >= 0 ? 'success' : 'danger'} />
          <Kpi label="Balance" value={equity ? money(equity.balance) : '—'} hint={equity?.is_dry_run ? 'demo account' : 'live account'} />
          <Kpi label="Equity" value={equity ? money(equity.equity) : '—'} hint={equity ? <TimeAgo iso={equity.ts} /> : 'no snapshot'} tone="brand" />
        </div>
      </div>

      {/* Flow chart — how markets move through the bot's decision pipeline. */}
      <div>
        <h3 className="mb-3 font-semibold text-fg">Decision flow</h3>
        <AdminCard>
          <div className="p-5 flex flex-col lg:flex-row lg:items-stretch gap-3">
            {PIPELINE.map((stage, i) => {
              const list = byState(stage.state);
              return (
                <div key={stage.state} className="flex-1 flex items-stretch gap-3">
                  <div className="flex-1 rounded-lg border border-border bg-surface/40 p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-fg-subtle">{stage.label}</span>
                      <span className={`font-mono tabular text-2xl font-extrabold ${stage.tone}`}>{list.length}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {list.length === 0
                        ? <span className="text-xs text-fg-subtle">—</span>
                        : list.slice(0, 8).map((m) => (
                            <span key={m.symbol} className="rounded bg-surface-hover px-1.5 py-0.5 text-[11px] font-semibold text-fg-muted">{m.alias}</span>
                          ))}
                      {list.length > 8 && <span className="text-[11px] text-fg-subtle">+{list.length - 8}</span>}
                    </div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="hidden lg:flex items-center text-fg-subtle"><ArrowRight className="h-5 w-5" /></div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t border-border px-5 py-3 text-xs text-fg-subtle">
            Entry timeframe M15, bias timeframe H1. A market moves left → right: monitoring while it waits for a trend, ready once an entry level is set or an order rests, active once a trade is open.
          </div>
        </AdminCard>
      </div>

      {/* Equity curve */}
      <div>
        <h3 className="mb-3 font-semibold text-fg">Equity</h3>
        <AdminCard>
          <div className="p-5">
            {equity ? (
              <>
                <p className="font-mono tabular text-3xl font-extrabold text-fg">{money(equity.equity)}</p>
                <p className="text-xs text-fg-muted">equity now · balance {money(equity.balance)} · {equity.open_positions} open</p>
                <div className="mt-4"><Sparkline values={equityCurve.map((e) => Number(e.equity)).filter(Number.isFinite)} width={520} height={72} /></div>
              </>
            ) : <p className="text-sm text-fg-muted">No equity snapshot yet.</p>}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

/* ── Markets ──────────────────────────────────────────────────────────── */

function Markets({
  markets, cfgBySymbol, specByName,
}: {
  markets: BotMarket[]; cfgBySymbol: Map<string, BotConfig>; specByName: Map<string, BotSymbolSpec>;
}) {
  // One clock for the whole table — a hook per row is not possible, and each
  // row is asking the same question anyway.
  const now = useNow();
  if (markets.length === 0) return <AdminCard><Empty>No market data yet.</Empty></AdminCard>;
  return (
    <AdminCard>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <Th className="text-left pl-4">Market</Th><Th className="text-left">Trend (H1)</Th><Th className="text-left">M15</Th>
              <Th className="text-left">State</Th><Th className="text-left">Reason</Th><Th className="text-left">Latest signal</Th>
              <Th className="text-right">Price</Th><Th className="text-right">Level</Th>
              <Th className="text-right">P&L</Th><Th className="text-left">Lot size</Th><Th className="text-left">Close at $</Th>
              <Th className="text-center">On</Th><Th className="text-right pr-4">Updated</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {markets.map((m) => {
              const cfg = cfgBySymbol.get(m.symbol);
              const spec = specByName.get(m.symbol);
              const stale = m.updated_at ? now - new Date(m.updated_at).getTime() > STALE_MS : true;
              return (
                <tr key={m.symbol} className="hover:bg-surface-hover/40">
                  <Td className="pl-4"><span className="font-semibold text-fg">{m.alias}</span><p className="text-[11px] text-fg-subtle">{m.symbol}{m.is_dry_run && <DryTag />}</p></Td>
                  <Td><TrendChip trend={m.htf_trend} /></Td>
                  <Td><TrendChip trend={m.entry_trend} /></Td>
                  <Td><StateBadge state={m.state} /></Td>
                  <Td className="text-fg-muted whitespace-nowrap">{m.reason ?? '—'}</Td>
                  <Td className="tabular text-fg-muted whitespace-nowrap">{m.latest_signal ?? '—'}</Td>
                  <Td className="text-right tabular">{px(m.price)}</Td>
                  <Td className="text-right tabular text-fg-muted">{m.level == null ? '—' : px(m.level)}</Td>
                  <Td className={`text-right tabular font-bold ${pnlTone(m.pnl)}`}>{m.pnl == null ? '—' : signed(m.pnl)}</Td>
                  <Td>
                    <LotSizeCell
                      symbol={m.symbol}
                      lot={cfg?.lot_size ?? null}
                      min={spec ? Number(spec.volume_min) : null}
                      max={spec ? Number(spec.volume_max) : null}
                      step={spec ? Number(spec.volume_step) : null}
                    />
                  </Td>
                  <Td>
                    <CloseAtProfitCell symbol={m.symbol} target={cfg?.close_at_profit ?? null} />
                  </Td>
                  <Td className="text-center"><MarketEnableToggle symbol={m.symbol} enabled={cfg?.enabled ?? true} /></Td>
                  {/* Staleness is flagged here rather than by dimming the row: the
                      numbers stay fully legible, but an hour-old price never reads
                      as live. A market goes stale when the bot stops writing. */}
                  <Td className="text-right pr-4 whitespace-nowrap">
                    {stale ? (
                      <span
                        className="inline-flex items-center gap-1.5 font-semibold text-warning"
                        title="No update in over 3 minutes — the bot may not be running"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                        <TimeAgo iso={m.updated_at} />
                      </span>
                    ) : (
                      <span className="text-fg-subtle"><TimeAgo iso={m.updated_at} /></span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

/* ── Open positions ───────────────────────────────────────────────────── */

function OpenPositions({
  markets, openTrades, floating, onOpenChart,
}: {
  markets: BotMarket[]; openTrades: BotTrade[]; floating: number;
  onOpenChart: (symbol: string) => void;
}) {
  // bot_market_state is the authority on what is live at the broker. The bot
  // adopts positions it finds there, but only writes a bot_trades row for orders
  // it placed itself — so a position opened before the bot was pointed at this
  // database has state='active' and no trade row. Driving off market_state keeps
  // this tab agreeing with the Open P&L tile, which reads the same source.
  const ongoing = markets.filter((m) => m.state === 'active');
  const pending = markets.filter((m) => m.state === 'ready');
  const tradeBySymbol = new Map(openTrades.map((t) => [t.symbol, t]));

  // Newest write across all markets — how current this whole view is.
  const asOf = markets.reduce<string | null>(
    (max, m) => (!max || m.updated_at > max ? m.updated_at : max),
    null,
  );

  if (ongoing.length === 0 && pending.length === 0) {
    return <AdminCard><Empty>No ongoing trades or pending orders right now.</Empty></AdminCard>;
  }

  return (
    <div className="space-y-6">
      {/* ── Ongoing trades ─────────────────────────────────────────────── */}
      <AdminCard>
        {/* "As of" is not decoration here. A browser throttles setInterval in a
            backgrounded tab, so the 30s auto-refresh can silently stop and leave a
            closed trade on screen as though it were still open — i.e. showing
            exposure that no longer exists. Stamp the age so that is obvious. */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <span className="text-sm font-semibold text-fg">
            Ongoing trades <span className="font-normal text-fg-muted">· {ongoing.length} open</span>
            <AsOfTag iso={asOf} />
          </span>
          <span className={`text-sm font-bold ${pnlTone(floating)}`}>Floating {signed(floating)}</span>
        </div>
        {ongoing.length === 0 ? (
          <Empty>No ongoing trades.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
                <tr>
                  <Th className="text-left pl-4">Market</Th><Th className="text-left">Signal</Th>
                  <Th className="text-left">Trend</Th>
                  <Th className="text-right">Lot size</Th><Th className="text-right">Entry</Th>
                  <Th className="text-right">Live P&L</Th>
                  <Th className="text-right">Trade duration</Th><Th className="text-right pr-4">Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ongoing.map((m) => {
                  const t = tradeBySymbol.get(m.symbol);
                  // Prefer market_state throughout: it is what the broker holds right
                  // now, so it is present for adopted positions (no bot_trades row at
                  // all) and correct after a partial close or a ratcheted stop.
                  const lots = m.volume ?? (t ? Number(t.volume) : null);
                  const entry = m.level ?? (t ? Number(t.open_price) : null);
                  const sl = m.sl ?? t?.sl ?? null;
                  const tp = m.tp ?? t?.tp ?? null;
                  // One figure, never two. A trade is either up or down, so show the
                  // level it is heading for and what that level is worth: losing,
                  // the stop and what it costs; winning, the target and what it
                  // pays. Both at once puts a gain and a loss side by side and
                  // leaves the reader to work out which is the trade's situation.
                  const atRisk = m.pnl != null && m.pnl < 0;
                  const level = atRisk ? sl : tp;
                  const atLevel = moneyAtLevel(level, entry, m.price, m.pnl);
                  const stage = manageStage({
                    side: positionSide(m, t), entry, sl, pnl: m.pnl,
                    lots, openedLots: t ? Number(t.volume) : null,
                  });
                  return (
                    <tr
                      key={m.symbol}
                      onClick={() => onOpenChart(m.symbol)}
                      title="Open this market in the chart"
                      className="cursor-pointer hover:bg-surface-hover/30"
                    >
                      <Td className="pl-4 font-semibold text-fg">
                        <span className="inline-flex items-center gap-1.5">
                          <CandlestickChart className="h-3.5 w-3.5 text-fg-subtle" />
                          {m.alias}{m.is_dry_run && <DryTag />}
                        </span>
                      </Td>
                      <Td>{t ? <SideTag side={t.side} /> : <span className="tabular text-fg-muted">{m.latest_signal ?? '—'}</span>}</Td>
                      <Td><TrendChip trend={m.entry_trend} /></Td>
                      <Td className="text-right tabular">{lots == null ? '—' : lotsLabel(lots)}</Td>
                      <Td className="text-right tabular">{px(entry)}</Td>
                      <Td className={`text-right tabular font-bold ${pnlTone(m.pnl)}`}>{m.pnl == null ? '—' : signed(m.pnl)}</Td>
                      <Td className="text-right tabular text-fg-subtle">
                        <Duration from={m.opened_at ?? t?.open_ts} />
                      </Td>
                      {/* stop the row click so managing a position doesn't also navigate */}
                      <Td className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <PositionActions
                          symbol={m.symbol} ticket={t?.ticket ?? null}
                          volume={lots} stage={stage}
                        />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

    </div>
  );
}

/* ── Live trades and pending orders — the analyst's cards ────────────── */

function TradeCards({
  mode, markets, analyses, onOpenChart,
}: {
  /** 'active' = filled and carrying money; 'pending' = resting, still the
   *  thing to analyse. Same card either way: the ticket does not change when
   *  an order becomes a position, so neither does its record. */
  mode: 'active' | 'pending';
  markets: BotMarket[];
  analyses: Record<number, BotTradeAnalysisView>;
  onOpenChart: (symbol: string) => void;
}) {
  const pending = markets.filter((m) => m.state === 'ready');
  // Live trades get the same card. The analysis written while the order was
  // pending carries over on the ticket, so this is where you check what was
  // said before it filled — and add to it now that it is running.
  const active = markets.filter((m) => m.state === 'active');
  // Collapsed by default. Each order carries a full indicator table and an
  // analysis form, and three of those open at once is a wall of numbers to
  // scroll past looking for the one you came to read. One line each until you
  // choose one.
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (symbol: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol); else next.add(symbol);
      return next;
    });

  const card = (m: BotMarket, live: boolean) => {
    const expanded = open.has(m.symbol);
    return (
      <div key={m.symbol}>
        <button
          type="button"
          onClick={() => toggle(m.symbol)}
          aria-expanded={expanded}
          className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-left hover:bg-surface-hover/30"
        >
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-fg-subtle transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
          <span className="font-semibold text-fg">{m.alias}{m.is_dry_run && <DryTag />}</span>
          <span className="tabular text-sm text-fg-muted">{m.latest_signal ?? '—'}</span>
          {live && m.pnl != null && (
            <span className={`tabular text-sm font-bold ${pnlTone(m.pnl)}`}>{signed(m.pnl)}</span>
          )}
          <TrendChip trend={m.htf_trend} label={`${m.htf ?? 'H1'} `} />
          <TrendChip trend={m.entry_trend} label={`${m.timeframe ?? 'M15'} `} />
          {/* An order nobody has read yet is the job; say so on the line. */}
          {m.pending_ticket && !analyses[m.pending_ticket] && (
            <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
              unread
            </span>
          )}
          <span className="ml-auto text-[11px] text-fg-subtle"><TimeAgo iso={m.updated_at} /></span>
        </button>

        {expanded && (
          <div className="border-t border-border">
            <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                <Mini label={live ? 'Entry' : 'Entry level'} value={px(m.level)} />
                <Mini label="Price now" value={px(m.price)} />
                <Mini label="Stop" value={px(m.sl)} />
                <Mini label="Target" value={px(m.tp)} />
              </dl>
              <button
                type="button"
                onClick={() => onOpenChart(m.symbol)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-fg-muted hover:bg-surface-hover"
              >
                <CandlestickChart className="h-4 w-4" /> Open chart
              </button>
            </div>

            {m.snapshot ? (
              <div className="border-t border-border">
                <IndicatorTable
                  snapshot={m.snapshot}
                  side={m.latest_signal}
                  htfTrend={m.htf_trend}
                  timeframe={m.timeframe}
                  htf={m.htf}
                />
              </div>
            ) : (
              <p className="border-t border-border px-5 py-3 text-xs text-fg-subtle">
                Indicator readings appear once db/migrations/012 is applied and
                the bot has published a cycle.
              </p>
            )}

            {m.pending_ticket ? (
              <TradeAnalysis
                ticket={m.pending_ticket}
                symbol={m.symbol}
                note={analyses[m.pending_ticket]?.note ?? null}
                imageUrl={analyses[m.pending_ticket]?.imageUrl ?? null}
                at={analyses[m.pending_ticket]?.updated_at ?? null}
                by={analyses[m.pending_ticket]?.created_by ?? null}
                context={{ side: m.latest_signal, level: m.level, sl: m.sl, tp: m.tp }}
              />
            ) : (
              <p className="px-5 pb-4 text-xs text-fg-subtle">
                {live
                  ? 'No ticket on this position yet — the bot publishes one each cycle.'
                  : 'No order at the broker to attach an analysis to. The bot found this level '
                    + 'but has not placed on it, usually because price had already reached it. '
                    + 'Once it places, this becomes the order you read.'}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const rows = mode === 'active' ? active : pending;

  return (
    <div className="space-y-6">
      <AdminCard>
        <div className="border-b border-border px-5 py-3">
          <span className="text-sm font-semibold text-fg">
            {mode === 'active' ? 'Live trades' : 'Pending orders'}
            <span className="font-normal text-fg-muted">
              {mode === 'active' ? ` · ${rows.length} running` : ` · ${rows.length} waiting to fill`}
            </span>
          </span>
          <p className="mt-1 text-xs text-fg-subtle">
            {mode === 'active'
              ? 'The reading each trade was taken on, and what was said about it before it filled.'
              : 'Mark the chart yourself first, then open one to read what the bot saw.'}
          </p>
        </div>
        {rows.length === 0 ? (
          <Empty>{mode === 'active' ? 'Nothing open right now.' : 'No pending orders.'}</Empty>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((m) => card(m, mode === 'active'))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}

/* ── Transactions ─────────────────────────────────────────────────────── */

const PAGE_SIZE = 15;

function Transactions({ closedTrades, markets, total }: { closedTrades: BotTrade[]; markets: BotMarket[]; total: number }) {
  // Rows navigate on tap — the date link alone was too small a target on a
  // phone, which is where these get read.
  const router = useRouter();
  const capped = total > closedTrades.length;
  const [market, setMarket] = useState<string>('all');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  // Every market the bot tracks appears in the filter — not only ones that have
  // closed a trade — so it's clear the tab covers all of them. Count per market
  // shows which have activity yet.
  const marketOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of closedTrades) counts.set(t.symbol, (counts.get(t.symbol) ?? 0) + 1);
    const known = markets.map((m) => ({ symbol: m.symbol, alias: m.alias, count: counts.get(m.symbol) ?? 0 }));
    // Include any traded symbol that isn't in the current market list (defensive).
    for (const [symbol, count] of counts) {
      if (!known.some((k) => k.symbol === symbol)) known.push({ symbol, alias: symbol, count });
    }
    return known.sort((a, b) => a.alias.localeCompare(b.alias));
  }, [closedTrades, markets]);

  const rows = useMemo(() => {
    let r = market === 'all' ? closedTrades : closedTrades.filter((t) => t.symbol === market);
    r = [...r].sort((a, b) => {
      const ta = a.close_ts ? new Date(a.close_ts).getTime() : 0;
      const tb = b.close_ts ? new Date(b.close_ts).getTime() : 0;
      return order === 'newest' ? tb - ta : ta - tb;
    });
    return r;
  }, [closedTrades, market, order]);

  const sumPnl = rows.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const wins = rows.filter((t) => Number(t.pnl) > 0).length;

  // Paginate, 15 per view. Reset to page 1 whenever the filter/sort changes the
  // result set, and clamp if the current page fell off the end.
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  // Adjusted during render rather than in an effect: React re-runs this
  // component before touching the DOM, so the page never paints at the wrong
  // number. An effect would paint page 9 of a 2-page result first, then
  // correct itself.
  const filterKey = `${market}|${order}`;
  const [prevFilter, setPrevFilter] = useState(filterKey);
  if (filterKey !== prevFilter) {
    setPrevFilter(filterKey);
    setPage(1);
  }
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const firstShown = rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(safePage * PAGE_SIZE, rows.length);

  const sel = 'rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-fg outline-none focus:border-brand';

  return (
    <AdminCard>
      {/* Named, because the tab holds two sections and an unlabelled table
          opening straight into dropdowns reads as a control panel. */}
      <div className="border-b border-border px-5 py-3">
        <span className="text-sm font-semibold text-fg">
          Trade history <span className="font-normal text-fg-muted">· every trade the bot has closed</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-fg-muted">
          Market
          <select value={market} onChange={(e) => setMarket(e.target.value)} className={sel}>
            <option value="all">All markets ({total})</option>
            {marketOptions.map((o) => (
              <option key={o.symbol} value={o.symbol}>{o.alias} ({o.count})</option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-fg-muted">
          Sort
          <select value={order} onChange={(e) => setOrder(e.target.value as 'newest' | 'oldest')} className={sel}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <span className="ml-auto text-xs text-fg-muted">
          {market === 'all' && capped && <span className="text-fg-subtle">latest {closedTrades.length} of {total} · </span>}
          {rows.length} trade{rows.length === 1 ? '' : 's'} · {wins} win{wins === 1 ? '' : 's'} ·{' '}
          <span className={pnlTone(sumPnl)}>{signed(sumPnl)}</span>
        </span>
      </div>

      {rows.length === 0 ? (
        <Empty>{market === 'all' ? 'No closed trades yet.' : 'This market hasn’t closed a trade yet.'}</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
              <tr>
                <Th className="text-left pl-4">Closed</Th><Th className="text-left">Market</Th><Th className="text-left">Side</Th>
                <Th className="text-right">Lot size</Th><Th className="text-right">Entry</Th><Th className="text-right">Exit</Th>
                <Th className="text-right">P&L</Th><Th className="text-left">Reason</Th>
                <Th className="text-left pr-4">Trend</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.map((t) => (
                // The whole row links to the trade's post-mortem — the chart of
                // what price did, and what the indicators read at entry vs exit.
                // Only trades with a broker ticket have a page; a dry-run trade
                // has none, so it stays a plain row rather than a dead link.
                <tr
                  key={t.id}
                  onClick={t.ticket ? () => router.push(`/admin/trading-bot/trade/${t.ticket}`) : undefined}
                  className={`hover:bg-surface-hover/30 ${t.ticket ? 'cursor-pointer' : ''}`}
                >
                  {/* The date stays a plain date. The ROW is the target — a
                      whole row is easier to hit than a few words, and there is
                      no hover on the phone this gets read on. */}
                  <Td className="pl-4 text-fg-muted whitespace-nowrap">
                    {t.close_ts ? new Date(t.close_ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </Td>
                  <Td className="font-semibold text-fg">{t.symbol}{t.is_dry_run && <DryTag />}</Td>
                  <Td><SideTag side={t.side} /></Td>
                  <Td className="text-right tabular">{t.volume}</Td>
                  <Td className="text-right tabular">{px(t.open_price)}</Td>
                  <Td className="text-right tabular">{px(t.close_price)}</Td>
                  <Td className={`text-right tabular font-bold ${pnlTone(t.pnl)}`}>{t.pnl == null ? '—' : signed(t.pnl)}</Td>
                  <Td className="text-fg-muted">{t.close_reason ?? '—'}</Td>
                  <Td className="pr-4"><TrendAgreement verdict={t.trend_agreement} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <span className="text-xs text-fg-subtle">Showing {firstShown}–{lastShown} of {rows.length}</span>
          <div className="flex items-center gap-2">
            <PagerBtn onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} label="Previous"><ChevronLeft className="h-4 w-4" /></PagerBtn>
            <span className="text-xs font-semibold text-fg-muted tabular">Page {safePage} / {pageCount}</span>
            <PagerBtn onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount} label="Next"><ChevronRight className="h-4 w-4" /></PagerBtn>
          </div>
        </div>
      )}
    </AdminCard>
  );
}

/* ── Performance ──────────────────────────────────────────────────────── */

interface Group { key: string; count: number; net: number; wins: number }

function groupBy(trades: BotTrade[], keyFn: (t: BotTrade) => string | null): Group[] {
  const m = new Map<string, Group>();
  for (const t of trades) {
    const k = keyFn(t) || '—';
    const g = m.get(k) ?? { key: k, count: 0, net: 0, wins: 0 };
    g.count++; g.net += Number(t.pnl) || 0; if (Number(t.pnl) > 0) g.wins++;
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => b.net - a.net);
}

function Breakdown({ title, groups }: { title: string; groups: Group[] }) {
  const scale = Math.max(1, ...groups.map((g) => Math.abs(g.net)));
  return (
    <AdminCard>
      <div className="p-5">
        <h4 className="text-sm font-semibold text-fg mb-4">{title}</h4>
        {groups.length === 0 ? (
          <p className="text-sm text-fg-muted">No data.</p>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => {
              const w = (Math.abs(g.net) / scale) * 100;
              const pos = g.net >= 0;
              return (
                <div key={g.key}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-fg truncate">{g.key}</span>
                    <span className={`tabular font-bold ${pnlTone(g.net)}`}>{signed(g.net)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-surface-hover overflow-hidden">
                      <div className={`h-full rounded-full ${pos ? 'bg-success' : 'bg-danger'}`} style={{ width: `${w}%` }} />
                    </div>
                    <span className="text-[10px] text-fg-subtle whitespace-nowrap">{g.count}t · {Math.round((g.wins / g.count) * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminCard>
  );
}

function Performance({ closedTrades, equityCurve }: { closedTrades: BotTrade[]; equityCurve: BotEquity[] }) {
  // Analyse only trades with a known P&L. Reconciled-stale rows (pre-v1 orphans
  // closed with no recoverable P&L) carry null and would distort every stat.
  const measured = useMemo(() => closedTrades.filter((t) => t.pnl != null), [closedTrades]);
  const excluded = closedTrades.length - measured.length;

  const s = useMemo(() => {
    const t = measured;
    const pnls = t.map((x) => Number(x.pnl) || 0);
    const wins = pnls.filter((p) => p > 0);
    const losses = pnls.filter((p) => p < 0);
    const grossProfit = wins.reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
    const net = pnls.reduce((a, b) => a + b, 0);
    const decided = wins.length + losses.length;

    // Max drawdown from the equity curve (oldest → newest).
    let peak = -Infinity, maxDD = 0, ddPct = 0;
    for (const e of equityCurve) {
      const v = Number(e.equity);
      if (!Number.isFinite(v)) continue;
      peak = Math.max(peak, v);
      const dd = peak - v;
      if (dd > maxDD) { maxDD = dd; ddPct = peak > 0 ? (dd / peak) * 100 : 0; }
    }

    return {
      count: t.length,
      net,
      winRate: decided ? (wins.length / decided) * 100 : 0,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0),
      expectancy: t.length ? net / t.length : 0,
      avgWin: wins.length ? grossProfit / wins.length : 0,
      avgLoss: losses.length ? grossLoss / losses.length : 0,
      best: pnls.length ? Math.max(...pnls) : 0,
      worst: pnls.length ? Math.min(...pnls) : 0,
      maxDD, ddPct,
      wins: wins.length, losses: losses.length,
    };
  }, [measured, equityCurve]);

  if (measured.length === 0) return <AdminCard><Empty>No closed trades with P&L to analyse yet.</Empty></AdminCard>;

  return (
    <div className="space-y-6">
      {/* 3 across rather than 6: six monospaced currency values in one row leaves
          each tile too narrow for a six-figure number. */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Kpi label="Net P&L" value={<span className={pnlTone(s.net)}>{signed(s.net)}</span>} hint={`${s.count} trades`} tone={s.net >= 0 ? 'success' : 'danger'} />
        <Kpi label="Win rate" value={`${s.winRate.toFixed(0)}%`} hint={`${s.wins}W · ${s.losses}L`} />
        <Kpi label="Profit factor" value={Number.isFinite(s.profitFactor) ? s.profitFactor.toFixed(2) : '∞'} hint="gross win / gross loss" tone={s.profitFactor >= 1 ? 'success' : 'danger'} />
        <Kpi label="Expectancy" value={<span className={pnlTone(s.expectancy)}>{signed(s.expectancy)}</span>} hint="avg per trade" />
        <Kpi label="Max drawdown" value={s.maxDD ? `${money(s.maxDD)}` : '—'} hint={s.ddPct ? `${s.ddPct.toFixed(1)}% of peak` : 'equity curve'} tone={s.maxDD ? 'danger' : 'default'} />
        <Kpi label="Avg win / loss" value={<span className="text-base"><span className="text-success">{money(s.avgWin)}</span> / <span className="text-danger">{money(s.avgLoss)}</span></span>} hint={`best ${money(s.best)} · worst ${money(s.worst)}`} />
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-fg">Equity curve</h3>
        <AdminCard>
          <div className="p-5">
            <Sparkline values={equityCurve.map((e) => Number(e.equity)).filter(Number.isFinite)} width={640} height={80} />
            <p className="mt-2 text-xs text-fg-subtle">{equityCurve.length} snapshots</p>
          </div>
        </AdminCard>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Breakdown title="P&L by market" groups={groupBy(measured, (t) => t.symbol)} />
        <Breakdown title="P&L by strategy" groups={groupBy(measured, (t) => t.strategy)} />
        <Breakdown title="P&L by close reason" groups={groupBy(measured, (t) => t.close_reason)} />
      </div>

      {excluded > 0 && (
        <p className="text-xs text-fg-subtle">
          {excluded} reconciled trade{excluded === 1 ? '' : 's'} excluded from these stats — closed during a
          backend reconciliation with no recoverable P&L. They still appear in Transactions.
        </p>
      )}
    </div>
  );
}

/* ── shared cells ─────────────────────────────────────────────────────── */

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-3 font-bold ${className}`}>{children}</th>;
}
function Td({ children, className = '', title, onClick }: { children: React.ReactNode; className?: string; title?: string; onClick?: React.MouseEventHandler<HTMLTableCellElement> }) {
  return <td className={`px-3 py-3 ${className}`} title={title} onClick={onClick}>{children}</td>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-10 text-center text-sm text-fg-muted">{children}</div>;
}
function PagerBtn({ onClick, disabled, label, children }: { onClick: () => void; disabled: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
function SideTag({ side }: { side: string }) {
  const buy = side === 'buy';
  const Icon = buy ? TrendingUp : TrendingDown;
  return <span className={`inline-flex items-center gap-1 text-xs font-bold ${buy ? 'text-success' : 'text-danger'}`}><Icon className="h-3.5 w-3.5" /> {side.toUpperCase()}</span>;
}
function DryTag() {
  return <span className="ml-1.5 rounded bg-surface-hover px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-fg-subtle align-middle">demo</span>;
}
// Whether the bot took the trade with the trend, against it, or into a range —
// judged at ENTRY, by the bot itself. Blank for trades that closed before the
// review shipped; those cannot be backfilled.
function TrendAgreement({ verdict }: { verdict: string | null }) {
  if (!verdict) return <span className="text-fg-subtle">—</span>;
  const tone = verdict === 'with trend' ? 'text-success'
    : verdict === 'against trend' ? 'text-danger' : 'text-fg-muted';
  return <span className={`text-xs font-semibold ${tone}`}>{verdict}</span>;
}

// Re-export so the page can render the live status badge in its header.
export { BotStatus };

/** Label over value, for the compact facts on a pending-order card. */
function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] font-bold text-fg-subtle">{label}</dt>
      <dd className="tabular text-fg">{value}</dd>
    </div>
  );
}

/**
 * Floating P&L, the one number on this screen that moves while you watch it.
 *
 * It arrives over Realtime roughly every three seconds, so it gets a tick of
 * emphasis when it changes — enough to catch the eye of someone half-watching,
 * short enough not to strobe on a busy market. Nothing flashes on first paint:
 * arriving at a red number and having it flash tells you nothing.
 */
function LivePnl({ value }: { value: number }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (prev.current !== null && prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 450);
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  const up = value >= 0;
  return (
    <AdminCard>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Open P&amp;L</span>
          <span className={`h-1.5 w-1.5 rounded-full ${flash ? (up ? 'bg-success' : 'bg-danger') : 'bg-fg-subtle/40'} transition-colors`} />
        </div>
        <p className={`mt-2 font-mono tabular text-4xl font-extrabold transition-opacity ${up ? 'text-success' : 'text-danger'} ${flash ? 'opacity-100' : 'opacity-95'}`}>
          {signed(value)}
        </p>
        <p className="mt-1 text-xs text-fg-subtle">floating on open positions · live</p>
      </div>
    </AdminCard>
  );
}

/**
 * What the switch currently says, above the controls.
 *
 * "When a day looks thin, the first question is whether the bot was allowed to
 * trade at all" — so this states it plainly, with who decided and when, and
 * nobody has to keep that in a notebook.
 *
 * When the bot has not read the flag recently it says THAT instead, because a
 * switch nobody is obeying is the one thing this line must never let look
 * normal.
 */
function SwitchCaption({ settings }: { settings: BotSettings }) {
  const unread = useStale(settings.seen_by_bot_at, 3 * 60_000);
  if (unread) {
    return (
      <span className="text-[11px] font-semibold text-danger">
        {settings.seen_by_bot_at ? 'the bot is not reading this switch' : 'the bot has never read this switch'}
      </span>
    );
  }
  const when = new Date(settings.updated_at).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  return (
    <span className="text-[11px] text-fg-subtle">
      {settings.trading_enabled ? 'On' : 'Off'} since {when}
      {settings.updated_by ? ` · ${settings.updated_by}` : ''}
    </span>
  );
}
