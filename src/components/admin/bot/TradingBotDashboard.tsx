'use client';

// The trading-bot monitor, tabbed: Overview · Markets · Open positions ·
// Transactions. Server fetches everything and passes it in; this component owns
// the tab state, the interactive controls (lot size, close), and the
// transactions filter/sort. BotStatus auto-refreshes the server data every 30s.

import { useMemo, useState } from 'react';
import { LayoutGrid, ListTree, Layers, Receipt, BarChart3, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { AdminCard, Kpi } from '@/components/admin/AdminPage';
import { BotStatus, TrendChip, StateBadge, TimeAgo, Sparkline, STALE_MS } from './BotBits';
import { LotSizeCell } from './LotSizeCell';
import { ClosePositionButton } from './ClosePositionButton';
import { MarketEnableToggle } from './MarketEnableToggle';
import { FlattenAllButton } from './FlattenAllButton';
import type { BotMarket, BotTrade, BotConfig, BotSymbolSpec, BotEquity } from '@/lib/admin/trading-bot-queries';

type Tab = 'overview' | 'markets' | 'positions' | 'transactions' | 'performance';

const money = (n: number | null | undefined, dp = 2) =>
  n == null || !Number.isFinite(Number(n)) ? '—'
    : `${Number(n) < 0 ? '−' : ''}$${Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const px = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 5 });
const signed = (n: number | null | undefined) => (n == null ? '—' : `${Number(n) >= 0 ? '+' : ''}${money(n)}`);
const pnlTone = (n: number | null | undefined) => (n == null ? 'text-fg-muted' : Number(n) > 0 ? 'text-success' : Number(n) < 0 ? 'text-danger' : 'text-fg-muted');

export function TradingBotDashboard({
  markets, configs, specs, openTrades, closedTrades, equity, equityCurve, lastUpdate,
}: {
  markets: BotMarket[];
  configs: BotConfig[];
  specs: BotSymbolSpec[];
  openTrades: BotTrade[];
  closedTrades: BotTrade[];
  equity: BotEquity | null;
  equityCurve: BotEquity[];
  lastUpdate: string | null;
}) {
  const [tab, setTab] = useState<Tab>('overview');

  const cfgBySymbol = useMemo(() => new Map(configs.map((c) => [c.symbol, c])), [configs]);
  const specByName = useMemo(() => new Map(specs.map((s) => [s.name, s])), [specs]);
  const liveBySymbol = useMemo(() => new Map(markets.map((m) => [m.symbol, m])), [markets]);

  const floating = markets.reduce((s, m) => s + (Number(m.pnl) || 0), 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayRealized = closedTrades
    .filter((t) => t.close_ts && t.close_ts.slice(0, 10) === todayKey)
    .reduce((s, t) => s + (Number(t.pnl) || 0), 0);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutGrid className="h-4 w-4" /> },
    { key: 'markets', label: 'Markets', icon: <ListTree className="h-4 w-4" />, badge: markets.length },
    { key: 'positions', label: 'Open positions', icon: <Layers className="h-4 w-4" />, badge: openTrades.length },
    { key: 'transactions', label: 'Transactions', icon: <Receipt className="h-4 w-4" /> },
    { key: 'performance', label: 'Performance', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div>
      {/* Tab bar + kill switch */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 rounded-t-md px-3.5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-brand text-brand' : 'border-transparent text-fg-muted hover:text-fg'
            }`}
          >
            {t.icon}{t.label}
            {t.badge != null && t.badge > 0 && (
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.key ? 'bg-brand text-brand-fg' : 'bg-surface-hover text-fg-muted'}`}>{t.badge}</span>
            )}
          </button>
        ))}
        <div className="ml-auto pb-1"><FlattenAllButton openCount={openTrades.length} /></div>
      </div>

      {tab === 'overview' && (
        <Overview
          markets={markets} equity={equity} equityCurve={equityCurve}
          floating={floating} todayRealized={todayRealized}
        />
      )}
      {tab === 'markets' && <Markets markets={markets} cfgBySymbol={cfgBySymbol} specByName={specByName} />}
      {tab === 'positions' && <Positions openTrades={openTrades} liveBySymbol={liveBySymbol} floating={floating} />}
      {tab === 'transactions' && <Transactions closedTrades={closedTrades} markets={markets} />}
      {tab === 'performance' && <Performance closedTrades={closedTrades} equityCurve={equityCurve} />}
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────── */

const PIPELINE: { state: string; label: string; tone: string }[] = [
  { state: 'watching', label: 'Watching', tone: 'text-fg-muted' },
  { state: 'setup_ready', label: 'Setup ready', tone: 'text-brand' },
  { state: 'order', label: 'Order resting', tone: 'text-warning' },
  { state: 'position', label: 'In position', tone: 'text-success' },
];

function Overview({
  markets, equity, equityCurve, floating, todayRealized,
}: {
  markets: BotMarket[]; equity: BotEquity | null; equityCurve: BotEquity[]; floating: number; todayRealized: number;
}) {
  const byState = (s: string) => markets.filter((m) => (m.state ?? 'watching') === s);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="P&L today" value={<span className={pnlTone(todayRealized)}>{signed(todayRealized)}</span>} hint="realized, closed trades" tone={todayRealized >= 0 ? 'success' : 'danger'} />
        <Kpi label="Open P&L" value={<span className={pnlTone(floating)}>{signed(floating)}</span>} hint="floating on open positions" />
        <Kpi label="Balance" value={equity ? money(equity.balance) : '—'} hint={equity?.is_dry_run ? 'demo account' : 'live account'} />
        <Kpi label="Equity" value={equity ? money(equity.equity) : '—'} hint={equity ? <TimeAgo iso={equity.ts} /> : 'no snapshot'} tone="brand" />
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
            Entry timeframe M15, bias timeframe H1. A market moves left → right as a setup forms, an order rests, then fills into a position.
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
  if (markets.length === 0) return <AdminCard><Empty>No market data yet.</Empty></AdminCard>;
  return (
    <AdminCard>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <Th className="text-left pl-4">Market</Th><Th className="text-left">Trend</Th><Th className="text-left">Bias (H1)</Th>
              <Th className="text-left">State</Th><Th className="text-left">Detail</Th>
              <Th className="text-right">Price</Th><Th className="text-right">Level</Th>
              <Th className="text-right">P&L</Th><Th className="text-left">Lot size</Th>
              <Th className="text-center">On</Th><Th className="text-right pr-4">Updated</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {markets.map((m) => {
              const cfg = cfgBySymbol.get(m.symbol);
              const spec = specByName.get(m.symbol);
              const stale = m.updated_at ? Date.now() - new Date(m.updated_at).getTime() > STALE_MS : true;
              return (
                <tr key={m.symbol} className={`hover:bg-surface-hover/40 ${stale ? 'opacity-45' : ''}`}>
                  <Td className="pl-4"><span className="font-semibold text-fg">{m.alias}</span><p className="text-[11px] text-fg-subtle">{m.symbol}{m.is_dry_run && <DryTag />}</p></Td>
                  <Td><TrendChip trend={m.entry_trend} /></Td>
                  <Td><TrendChip trend={m.htf_trend} /></Td>
                  <Td><StateBadge state={m.state} /></Td>
                  <Td className="max-w-[220px] truncate text-fg-muted" title={m.detail ?? ''}>{m.detail ?? '—'}</Td>
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
                  <Td className="text-center"><MarketEnableToggle symbol={m.symbol} enabled={cfg?.enabled ?? true} /></Td>
                  <Td className="text-right pr-4 text-fg-subtle whitespace-nowrap"><TimeAgo iso={m.updated_at} /></Td>
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

function Positions({
  openTrades, liveBySymbol, floating,
}: {
  openTrades: BotTrade[]; liveBySymbol: Map<string, BotMarket>; floating: number;
}) {
  if (openTrades.length === 0) {
    return <AdminCard><Empty>No positions open right now.</Empty></AdminCard>;
  }
  return (
    <AdminCard>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <span className="text-sm text-fg-muted">{openTrades.length} open</span>
        <span className={`text-sm font-bold ${pnlTone(floating)}`}>Floating {signed(floating)}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <Th className="text-left pl-4">Market</Th><Th className="text-left">Side</Th>
              <Th className="text-right">Vol</Th><Th className="text-right">Entry</Th>
              <Th className="text-right">SL / TP</Th><Th className="text-right">Live P&L</Th>
              <Th className="text-right">Opened</Th><Th className="text-right pr-4">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {openTrades.map((t) => {
              const live = liveBySymbol.get(t.symbol)?.pnl ?? t.pnl ?? null;
              return (
                <tr key={t.id} className="hover:bg-surface-hover/30">
                  <Td className="pl-4 font-semibold text-fg">{t.symbol}{t.is_dry_run && <DryTag />}</Td>
                  <Td><SideTag side={t.side} /></Td>
                  <Td className="text-right tabular">{t.volume}</Td>
                  <Td className="text-right tabular">{px(t.open_price)}</Td>
                  <Td className="text-right tabular text-fg-muted">{px(t.sl)} / {px(t.tp)}</Td>
                  <Td className={`text-right tabular font-bold ${pnlTone(live)}`}>{live == null ? '—' : signed(live)}</Td>
                  <Td className="text-right text-fg-subtle"><TimeAgo iso={t.open_ts} /></Td>
                  <Td className="text-right pr-4"><ClosePositionButton symbol={t.symbol} ticket={t.ticket} /></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

/* ── Transactions ─────────────────────────────────────────────────────── */

function Transactions({ closedTrades, markets }: { closedTrades: BotTrade[]; markets: BotMarket[] }) {
  const [market, setMarket] = useState<string>('all');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');

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

  const total = rows.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const wins = rows.filter((t) => Number(t.pnl) > 0).length;

  const sel = 'rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-fg outline-none focus:border-brand';

  return (
    <AdminCard>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-fg-muted">
          Market
          <select value={market} onChange={(e) => setMarket(e.target.value)} className={sel}>
            <option value="all">All markets ({closedTrades.length})</option>
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
          {rows.length} trade{rows.length === 1 ? '' : 's'} · {wins} win{wins === 1 ? '' : 's'} ·{' '}
          <span className={pnlTone(total)}>{signed(total)}</span>
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
                <Th className="text-right">Vol</Th><Th className="text-right">Entry</Th><Th className="text-right">Exit</Th>
                <Th className="text-right">P&L</Th><Th className="text-left pr-4">Reason</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-surface-hover/30">
                  <Td className="pl-4 text-fg-muted whitespace-nowrap">{t.close_ts ? new Date(t.close_ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</Td>
                  <Td className="font-semibold text-fg">{t.symbol}{t.is_dry_run && <DryTag />}</Td>
                  <Td><SideTag side={t.side} /></Td>
                  <Td className="text-right tabular">{t.volume}</Td>
                  <Td className="text-right tabular">{px(t.open_price)}</Td>
                  <Td className="text-right tabular">{px(t.close_price)}</Td>
                  <Td className={`text-right tabular font-bold ${pnlTone(t.pnl)}`}>{t.pnl == null ? '—' : signed(t.pnl)}</Td>
                  <Td className="pr-4 text-fg-muted">{t.close_reason ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const s = useMemo(() => {
    const t = closedTrades;
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
  }, [closedTrades, equityCurve]);

  if (closedTrades.length === 0) return <AdminCard><Empty>No closed trades to analyse yet.</Empty></AdminCard>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
        <Breakdown title="P&L by market" groups={groupBy(closedTrades, (t) => t.symbol)} />
        <Breakdown title="P&L by strategy" groups={groupBy(closedTrades, (t) => t.strategy)} />
        <Breakdown title="P&L by close reason" groups={groupBy(closedTrades, (t) => t.close_reason)} />
      </div>
    </div>
  );
}

/* ── shared cells ─────────────────────────────────────────────────────── */

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-3 font-bold ${className}`}>{children}</th>;
}
function Td({ children, className = '', title }: { children: React.ReactNode; className?: string; title?: string }) {
  return <td className={`px-3 py-3 ${className}`} title={title}>{children}</td>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-10 text-center text-sm text-fg-muted">{children}</div>;
}
function SideTag({ side }: { side: string }) {
  const buy = side === 'buy';
  const Icon = buy ? TrendingUp : TrendingDown;
  return <span className={`inline-flex items-center gap-1 text-xs font-bold ${buy ? 'text-success' : 'text-danger'}`}><Icon className="h-3.5 w-3.5" /> {side.toUpperCase()}</span>;
}
function DryTag() {
  return <span className="ml-1.5 rounded bg-surface-hover px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-fg-subtle align-middle">demo</span>;
}

// Re-export so the page can render the live status badge in its header.
export { BotStatus };
