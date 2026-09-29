'use client';

// The workspace — the trading desk in the Highscore AI shell.
//
// This is NOT a second bot. Every number here is the same bot_* data the
// existing dashboard reads: one source, two skins.
//
// Three columns, as designed. The rail chooses what the middle panel shows;
// the chart holds the right-hand side and never goes away, because the answer
// to "why is this trade open" is always on it. Closing the middle panel (✕)
// gives the chart the whole screen — the panel is a companion to the chart,
// not a page that replaces it.
//
// Sections the design calls for and we do not have yet (Scora, Backtests,
// Alerts) say so plainly rather than showing an empty panel that looks broken.

import { useEffect, useState, useTransition } from 'react';
import {
  Sparkles, CandlestickChart, ListFilter, Clock, Activity, History as HistoryIcon,
  FlaskConical, Bell, X, ChevronLeft, ChevronRight, Send, Plus, MoreHorizontal, ChevronDown,
  SlidersHorizontal, Minus, Loader2, BarChart3, TrendingUp, Receipt, Settings2,
} from 'lucide-react';
import { MarketChart } from '@/components/admin/bot/MarketChart';
import { TrendChip, StateBadge, TimeAgo, Duration, Sparkline } from '@/components/admin/bot/BotBits';
import { MarketEnableToggle } from '@/components/admin/bot/MarketEnableToggle';
import { TradingSwitchButton } from '@/components/admin/bot/TradingSwitchButton';
import { ApprovalModeToggle } from '@/components/admin/bot/ApprovalModeToggle';
import { FlattenAllButton } from '@/components/admin/bot/FlattenAllButton';
import { CancelOrderButton } from '@/components/admin/bot/CancelOrderButton';
import { setLotSizeAction, setCloseAtProfitAction } from '@/lib/admin/trading-bot-actions';
import type {
  BotMarket, BotTrade, BotEquity, BotSettings, BotProposal, BotConfig, BotSymbolSpec,
} from '@/lib/admin/trading-bot-queries';

type Section =
  | 'scora' | 'chart' | 'markets' | 'pending' | 'active' | 'history' | 'backtests' | 'alerts'
  | 'performance' | 'transactions' | 'settings';

/** How the desk was left: which section, and what was open. Per browser. */
const DESK_KEY = 'hs-workspace-desk';
type DeskState = {
  section: Section;
  panelOpen: boolean;
  railOpen: boolean;
  panelSide: 'left' | 'right';
};

const TITLES: Record<Section, string> = {
  scora: 'Scora', chart: 'Chart', markets: 'Markets', pending: 'Pending',
  active: 'Active', history: 'History', backtests: 'Backtests', alerts: 'Alerts',
  performance: 'Performance', transactions: 'Transactions', settings: 'Settings',
};

const money = (n: number | null | undefined, dp = 2) =>
  n == null || !Number.isFinite(Number(n))
    ? '—'
    : `${Number(n) < 0 ? '−' : ''}$${Math.abs(Number(n)).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
const signed = (n: number | null | undefined) =>
  n == null ? '—' : `${Number(n) >= 0 ? '+' : ''}${money(n)}`;
const tone = (n: number | null | undefined) =>
  n == null ? 'text-fg-muted' : Number(n) > 0 ? 'text-brand' : Number(n) < 0 ? 'text-danger' : 'text-fg-muted';
const px = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : String(n);

export function Workspace({
  markets, configs, specs, closedTrades, equity, equityCurve, settings, proposals, user,
}: {
  markets: BotMarket[];
  configs: BotConfig[];
  specs: BotSymbolSpec[];
  equityCurve: BotEquity[];
  closedTrades: BotTrade[];
  equity: BotEquity | null;
  settings: BotSettings | null;
  proposals: BotProposal[];
  user: { name: string; initials: string };
}) {
  const [section, setSection] = useState<Section>('scora');
  const [panelOpen, setPanelOpen] = useState(true);
  const [railOpen, setRailOpen] = useState(true);
  // The ... menu offers "Move to right", so the panel is a side, not a column.
  const [panelSide, setPanelSide] = useState<'left' | 'right'>('left');

  /* The desk remembers how you left it.
   *
   * Closing the panel used to last until the next reload, which put the Scora
   * welcome back in the middle of the screen every single time. Restored AFTER
   * mount, never in the state initialisers: localStorage does not exist during
   * SSR, and reading it there makes the server and the browser render
   * different markup. */
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(DESK_KEY) || '{}') as Partial<DeskState>;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (s.section && s.section in TITLES) setSection(s.section);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (typeof s.panelOpen === 'boolean') setPanelOpen(s.panelOpen);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (typeof s.railOpen === 'boolean') setRailOpen(s.railOpen);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (s.panelSide === 'left' || s.panelSide === 'right') setPanelSide(s.panelSide);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestored(true);
  }, []);

  useEffect(() => {
    // Don't write the defaults over the saved state before it is read back.
    if (!restored) return;
    try {
      localStorage.setItem(DESK_KEY, JSON.stringify({ section, panelOpen, railOpen, panelSide }));
    } catch { /* ignore */ }
  }, [restored, section, panelOpen, railOpen, panelSide]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const active = markets.filter((m) => m.state === 'active');
  const ready = markets.filter((m) => m.state === 'ready');
  const resting = ready.filter((m) => m.pending_ticket != null);
  const floating = markets.reduce((s, m) => s + (Number(m.pnl) || 0), 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = closedTrades
    .filter((t) => t.close_ts && t.close_ts.slice(0, 10) === todayKey)
    .reduce((s, t) => s + (Number(t.pnl) || 0), 0);

  // Which market the Markets panel is drilled into. It lives up here, not in
  // the panel, because Pending opens it too: the ⚙ on a pending card is the
  // same control as the one on a market card, and must land on the same screen.
  const [marketFocus, setMarketFocus] = useState<string | null>(null);

  const open = (s: Section) => { setSection(s); setPanelOpen(true); if (s === 'markets') setMarketFocus(null); };
  const openMarket = (symbol: string) => { setMarketFocus(symbol); setSection('markets'); setPanelOpen(true); };

  const NAV: { group: string | null; items: { key: Section; label: string; icon: React.ReactNode; count?: number }[] }[] = [
    {
      group: null,
      items: [
        { key: 'scora', label: 'Scora', icon: <Sparkles className="h-4 w-4" /> },
        { key: 'chart', label: 'Chart', icon: <CandlestickChart className="h-4 w-4" /> },
      ],
    },
    {
      group: 'Trading',
      items: [
        { key: 'markets', label: 'Markets', icon: <ListFilter className="h-4 w-4" />, count: markets.length },
        // Counts what can actually FILL: a resting order, or a setup waiting
        // on an answer. A watched level has nothing at the broker, and
        // counting it here read as "an order is live" while the desk was
        // stood down — which is exactly the question it prompted.
        { key: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4" />, count: resting.length + proposals.length },
        { key: 'active', label: 'Active', icon: <Activity className="h-4 w-4" />, count: active.length },
        { key: 'history', label: 'History', icon: <HistoryIcon className="h-4 w-4" /> },
      ],
    },
    {
      group: 'Research',
      items: [
        { key: 'backtests', label: 'Backtests', icon: <FlaskConical className="h-4 w-4" /> },
        { key: 'alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
      ],
    },
    {
      group: 'Account',
      items: [
        { key: 'performance', label: 'Performance', icon: <TrendingUp className="h-4 w-4" /> },
        { key: 'transactions', label: 'Transactions', icon: <Receipt className="h-4 w-4" /> },
        { key: 'settings', label: 'Settings', icon: <Settings2 className="h-4 w-4" /> },
      ],
    },
  ];

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* ── Rail ─────────────────────────────────────────────────────── */}
      <aside
        className={`relative flex shrink-0 flex-col border-r border-border transition-[width] duration-200 ${
          railOpen ? 'w-[232px]' : 'w-[64px]'
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <Sparkles className="h-4 w-4" />
          </span>
          {railOpen && (
            <span className="truncate text-[15px] font-bold tracking-tight text-fg">
              highscore<span className="text-brand">.ai</span>
            </span>
          )}
        </div>

        {/* scrollbar-none: eleven items overflow a short window, and Windows
            paints a full-width grey bar for it directly against the chart. The
            list still scrolls; the chrome is what goes. */}
        <nav className="scrollbar-none flex-1 overflow-y-auto px-3 pb-3">
          {NAV.map((block) => (
            <div key={block.group ?? 'top'}>
              {block.group && railOpen && (
                <p className="px-3 pb-1.5 pt-5 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
                  {block.group}
                </p>
              )}
              {block.group && !railOpen && <div className="my-3 border-t border-border" />}
              {block.items.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => open(it.key)}
                  title={railOpen ? undefined : it.label}
                  className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    section === it.key && panelOpen
                      ? 'bg-brand/15 font-semibold text-fg before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-brand'
                      : 'text-fg-muted hover:bg-brand/10 hover:text-fg'
                  }`}
                >
                  <span
                    className={
                      section === it.key && panelOpen
                        ? 'text-brand'
                        : 'transition-colors group-hover:text-brand'
                    }
                  >
                    {it.icon}
                  </span>
                  {railOpen && it.label}
                  {railOpen && it.count != null && it.count > 0 && (
                    <span className="ml-auto font-mono text-xs font-semibold text-brand">{it.count}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Who is at the desk. The design puts a credit meter here; we have no
            credits, and inventing a number on a screen full of real money is
            the one thing this page must not do. Account state instead. */}
        <div className="flex items-center gap-3 border-t border-border p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-bold text-fg">
            {user.initials}
          </span>
          {railOpen && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">{user.name}</p>
              <p className="text-[11px] text-fg-subtle">
                {equity?.is_dry_run ? 'Demo account' : 'Live account'}
                {settings && !settings.trading_enabled && <span className="text-warning"> · trading off</span>}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setRailOpen((v) => !v)}
          title={railOpen ? 'Collapse' : 'Expand'}
          className="absolute -right-3 top-[68px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-bg-elevated text-fg-muted hover:text-fg"
        >
          {railOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* ── Middle panel ─────────────────────────────────────────────── */}
      {panelOpen && (
        <section
          className={`hidden w-[420px] shrink-0 flex-col border-border lg:flex ${
            panelSide === 'left' ? 'border-r' : 'order-last border-l'
          }`}
        >
          <header className="relative flex h-16 items-center gap-2 px-5">
            <Sparkles className="h-4 w-4 text-brand" />
            <h2 className="text-[15px] font-semibold text-fg">{TITLES[section]}</h2>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              title="Panel options"
              className="ml-auto rounded p-1 text-fg-subtle hover:bg-surface-hover hover:text-fg"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              title="Close — the chart takes the whole screen"
              className="rounded p-1 text-fg-subtle hover:bg-surface-hover hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                {/* A backdrop, so clicking anywhere else dismisses it. */}
                <button
                  type="button"
                  aria-label="Dismiss menu"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute right-4 top-14 z-50 w-48 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setPanelSide((sd) => (sd === 'left' ? 'right' : 'left')); setMenuOpen(false); }}
                    className="block w-full border-b border-border px-4 py-3 text-left text-sm text-fg hover:bg-surface-hover"
                  >
                    Move to {panelSide === 'left' ? 'right' : 'left'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPanelOpen(false); setMenuOpen(false); }}
                    className="block w-full px-4 py-3 text-left text-sm text-fg hover:bg-surface-hover"
                  >
                    Close panel
                  </button>
                </div>
              </>
            )}
          </header>

          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
            {section === 'scora' && <ScoraPanel name={user.name} />}
            {section === 'chart' && <ChartPanel showGrid={showGrid} onGrid={setShowGrid} />}
            {section === 'markets' && (
              <MarketList
                markets={markets}
                configs={configs}
                specs={specs}
                focus={marketFocus}
                onFocus={setMarketFocus}
              />
            )}
            {section === 'pending' && (
              <PendingList
                markets={ready}
                proposals={proposals}
                allMarkets={markets}
                configs={configs}
                specs={specs}
                onOpenMarket={openMarket}
              />
            )}
            {section === 'active' && (
              <ActiveList markets={active} configs={configs} specs={specs} onOpenMarket={openMarket} />
            )}
            {section === 'history' && <HistoryList trades={closedTrades} />}
            {section === 'backtests' && (
              <Soon
                title="Backtests"
                body="Running an idea against the stored history is not built yet. The closed trades are the record we do have."
                action={{ label: 'Open History', onClick: () => open('history') }}
              />
            )}
            {section === 'alerts' && (
              <Soon
                title="Alerts"
                body="Alerts go to Telegram today. Nothing on this screen is fed by them yet — the bot keeps no record of what it sent."
                action={{ label: 'Open Pending', onClick: () => open('pending') }}
              />
            )}
            {section === 'performance' && (
              <PerformancePanel equity={equity} curve={equityCurve} trades={closedTrades} />
            )}
            {section === 'transactions' && <TransactionsPanel trades={closedTrades} />}
            {section === 'settings' && <SettingsPanel settings={settings} equity={equity} openCount={active.length} />}
          </div>
        </section>
      )}

      {/* ── Chart ────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-5 overflow-x-auto border-b border-border px-5">
          {!panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              {TITLES[section]}
            </button>
          )}
          <Figure label="Balance" value={money(equity?.balance)} />
          <Figure label="Equity" value={money(equity?.equity)} />
          <Figure label="Open P&L" value={signed(floating)} valueClass={tone(floating)} />
          <Figure label="Today" value={signed(today)} valueClass={tone(today)} />
          <span className="ml-auto shrink-0 text-[11px] text-fg-subtle">
            {equity ? <>updated <TimeAgo iso={equity.ts} /></> : 'no snapshot'}
          </span>
        </header>

        <div className="min-h-0 flex-1">
          <MarketChart
            chrome="workspace"
            markets={markets.map((m) => ({ symbol: m.symbol, alias: m.alias }))}
            showGrid={showGrid}
            focusSymbol={marketFocus}
            // Emerald up, the app's red down, muted text — the same values
            // as the tokens, spelled out because canvas cannot read a CSS
            // custom property.
            palette={{ up: '#12B981', down: '#E5484D', text: '#9AA0A6' }}
            openTrades={active.map((m) => ({
              symbol: m.symbol,
              side: (m.latest_signal ?? '').toUpperCase().startsWith('SELL')
                || (m.latest_signal ?? '').toUpperCase().startsWith('SHORT') ? 'sell' : 'buy',
            }))}
          />
        </div>

        <footer className="flex h-9 shrink-0 items-center gap-4 border-t border-border px-5 text-[11px] text-fg-subtle">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${settings?.trading_enabled ? 'bg-brand' : 'bg-warning'}`} />
            {settings?.trading_enabled ? 'Trading on' : 'Trading off'}
          </span>
          <span className="font-mono">{markets.length} markets · {active.length} open · {ready.length} pending</span>
        </footer>
      </div>
    </div>
  );
}

/* -- Panels ------------------------------------------------------------ */

/**
 * Chart settings, as designed.
 *
 * Grid works. Chart type, volume and support/resistance are drawn and disabled,
 * for two different reasons:
 *
 *   Volume — the data exists. bot_bars stores tick_volume/real_volume and
 *   bar_sync writes them; the chart's query simply selects ts,open,high,low,
 *   close and never asks for them, and there is no histogram series to put
 *   them in. Buildable today.
 *
 *   Support / resistance — the data does not exist here. The bot computes
 *   levels in-process (features/book_features.py) to make its decisions, but
 *   nothing persists them: no column in bot_market_state, no table of its own.
 *   The browser has nothing to read.
 *
 * A switch that lights up and changes nothing is worse than one that admits it
 * is not connected.
 */
function ChartPanel({ showGrid, onGrid }: { showGrid: boolean; onGrid: (v: boolean) => void }) {
  return (
    <div className="px-5 py-4">
      <Row label="Chart type">
        <ChartTypeSelect />
      </Row>

      <Row label="Grid">
        <Toggle on={showGrid} onClick={() => onGrid(!showGrid)} />
      </Row>

      <p className="pb-1 pt-5 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Indicators</p>

      <Row label="Volume">
        <Toggle on={false} disabled title="bot_bars has the volume; the chart does not read it yet" />
      </Row>
      <Row label="Support / resistance">
        <Toggle on={false} disabled title="the bot computes levels but never stores them" />
      </Row>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('resize'))}
        className="mt-6 w-full rounded-sm border border-border bg-bg-elevated py-2.5 text-sm text-fg transition-colors hover:border-brand/40 hover:bg-brand/10 hover:text-brand active:border-brand active:bg-brand/20 active:text-brand"
      >
        Reset view
      </button>
    </div>
  );
}

/**
 * Chart type.
 *
 * Deliberately NOT a native <select>. The browser paints an open <option> list
 * with the OS accent — the blue bar — and no CSS reliably repaints it, so the
 * one control on this panel would hover blue on a screen that hovers green.
 * A button + menu is ours to style, and matches the ... menu in the header.
 *
 * Only Candlesticks draws: MarketChart builds a candlestick series and hangs
 * its markers and price lines on it. Line and Area are listed because the
 * design lists them, and disabled because picking one would change nothing.
 */
const CHART_TYPES = [
  { key: 'candles', label: 'Candlesticks', ready: true },
  { key: 'line', label: 'Line', ready: false },
  { key: 'area', label: 'Area', ready: false },
] as const;

function ChartTypeSelect() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<(typeof CHART_TYPES)[number]['key']>('candles');
  const current = CHART_TYPES.find((t) => t.key === value) ?? CHART_TYPES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex w-[150px] items-center gap-2 rounded-sm border bg-bg-elevated px-3 py-2 text-sm transition-colors ${
          open ? 'border-brand/40 text-fg' : 'border-border text-fg hover:border-brand/40 hover:bg-brand/10'
        }`}
      >
        {current.label}
        <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-colors ${open ? 'text-brand' : 'text-fg-subtle'}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Dismiss chart type menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute right-0 top-[calc(100%+4px)] z-50 w-[150px] overflow-hidden rounded-sm border border-border bg-surface-raised py-1 shadow-xl"
          >
            {CHART_TYPES.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={t.key === value}
                  disabled={!t.ready}
                  title={t.ready ? undefined : 'not drawn yet — the chart builds candlesticks'}
                  onClick={() => { setValue(t.key); setOpen(false); }}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                    t.key === value ? 'bg-brand/15 font-semibold text-brand' : 'text-fg'
                  } ${t.ready ? 'hover:bg-brand/10 hover:text-brand' : 'cursor-not-allowed opacity-45'}`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4">
      <span className="text-sm text-fg">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ on, onClick, disabled, title }: { on: boolean; onClick?: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-10 w-10 rounded-sm border text-xs font-semibold transition-colors ${
        on ? 'border-brand/40 bg-brand/15 text-brand' : 'border-border text-fg-subtle'
      } ${disabled ? 'opacity-50' : 'hover:border-brand/40 hover:bg-brand/10 hover:text-brand'}`}
    >
      {on ? 'On' : 'Off'}
    </button>
  );
}

function ScoraPanel({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-fg">
          <Sparkles className="h-5 w-5" />
        </span>
        <p className="mt-5 text-xl font-semibold text-fg">Welcome back.</p>
        <p className="mt-0.5 text-xs text-fg-subtle">{name}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand/15 px-2.5 py-1 font-mono text-xs font-semibold text-brand">
          Scora v0.1 <ChevronDown className="h-3 w-3" />
        </span>
        <p className="mt-4 text-sm text-fg-muted">What would you like to explore today?</p>

        <div className="mt-6 w-full space-y-2.5">
          {['Analyze my portfolio', 'Find a setup'].map((s) => (
            <button
              key={s}
              type="button"
              disabled
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-left text-sm text-fg-muted disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-2.5">
          <Plus className="h-4 w-4 shrink-0 text-fg-subtle" />
          <input
            disabled
            placeholder="Ask Scora about this chart…"
            className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
          />
          <Send className="h-4 w-4 shrink-0 text-fg-subtle" />
        </div>
        {/* Disabled, and it says why. An input that swallows questions in
            silence is worse than one that admits it is not connected. */}
        <p className="mt-2 text-center text-[11px] text-fg-subtle">
          Scora answers once Qwen is connected. AI can make mistakes. Not financial advice.
        </p>
      </div>
    </div>
  );
}

/**
 * Markets — a card list that opens one market.
 *
 * Two views in one panel: the list, and the market itself. Drilling in does not
 * navigate, because the chart on the right must not blink while you read the
 * reasons a trade is or is not open.
 */
function MarketList({ markets, configs, specs, focus, onFocus, note }: {
  markets: BotMarket[];
  configs: BotConfig[];
  specs: BotSymbolSpec[];
  /** Which market is open. Owned by the workspace, because Pending and Active
   *  open this panel too. */
  focus: string | null;
  onFocus: (symbol: string | null) => void;
  note?: string;
}) {
  const selected = markets.find((m) => m.symbol === focus) ?? null;
  const cfgOf = (symbol: string) => configs.find((c) => c.symbol === symbol);

  if (markets.length === 0) return <Empty>No markets yet.</Empty>;

  if (selected) {
    return (
      <MarketDetail
        market={selected}
        enabled={cfgOf(selected.symbol)?.enabled ?? true}
        config={cfgOf(selected.symbol)}
        spec={specs.find((s) => s.name === selected.symbol)}
        onBack={() => onFocus(null)}
      />
    );
  }

  return (
    <div className="px-4 pb-6 pt-4">
      {note && <p className="px-1 pb-3 text-[11px] text-fg-subtle">{note}</p>}
      <div className="flex items-center gap-2 px-1 pb-3">
        <h3 className="text-[15px] font-semibold text-fg">Markets</h3>
        <span className="rounded-sm bg-surface-hover px-1.5 py-0.5 font-mono text-[11px] font-bold text-fg-muted">
          {markets.length}
        </span>
      </div>

      <ul className="space-y-2">
        {markets.map((m) => (
          <li key={m.symbol}>
            <button
              type="button"
              onClick={() => onFocus(m.symbol)}
              className="group block w-full rounded-sm border border-border bg-bg-elevated px-4 py-3 text-left transition-colors hover:border-brand/40 hover:bg-brand/5"
            >
              <div className="flex items-center gap-2">
                {/* Green = the bot is allowed to trade here. Not a trend, not a
                    P&L — the one thing you cannot read off the numbers. */}
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    (cfgOf(m.symbol)?.enabled ?? true) ? 'bg-brand' : 'bg-fg-subtle/40'
                  }`}
                  title={(cfgOf(m.symbol)?.enabled ?? true) ? 'Enabled' : 'Paused'}
                />
                <span className="text-sm font-bold text-fg">{m.alias}</span>
                <span className="ml-auto font-mono text-sm text-fg">{px(m.price)}</span>
                {/* Holds its width whether or not it is visible, so it can
                    never land on top of the price. */}
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                <TrendChip trend={m.htf_trend} />
                <StateBadge state={m.state} />
                <span className={`ml-auto font-mono text-xs font-bold ${tone(m.pnl)}`}>
                  {m.pnl == null ? '—' : signed(m.pnl)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One market: what the bot sees, and the settings that change it. */
function MarketDetail({ market, enabled, config, spec, onBack }: {
  market: BotMarket;
  enabled: boolean;
  config: BotConfig | undefined;
  spec: BotSymbolSpec | undefined;
  onBack: () => void;
}) {
  return (
    <div className="px-4 pb-8 pt-4">
      <div className="flex items-center gap-2 px-1 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 flex items-center gap-1 rounded-sm px-1 py-1 text-sm text-fg-muted transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4" />
          Markets
        </button>
        <span className="text-[15px] font-bold text-fg">{market.alias}</span>
        <span className="ml-auto">
          <MarketEnableToggle symbol={market.symbol} enabled={enabled} />
        </span>
      </div>

      <section className="rounded-sm border border-border bg-bg-elevated px-4 py-3">
        <h4 className="pb-1 text-sm font-bold text-fg">What the bot sees</h4>
        <Fact label="Trend (H1)" value={market.htf_trend ?? '—'} />
        <Fact label="Trend (M15)" value={market.entry_trend ?? '—'} />
        <Fact label="State" value={market.state ?? '—'} />
        <Fact label="Reason" value={market.reason ?? '—'} />
        <Fact label="Latest signal" value={market.latest_signal ?? '—'} />
        <Fact label="Price" value={px(market.price)} />
        <Fact label="Level" value={px(market.level)} />
        <Fact label="P&L" value={market.pnl == null ? '—' : signed(market.pnl)} valueClass={tone(market.pnl)} last />
      </section>

      <MarketSettings market={market} enabled={enabled} config={config} spec={spec} />
    </div>
  );
}

/**
 * The three things an admin can change about one market.
 *
 * The switch saves itself the moment it is flipped — it is a safety control,
 * and a safety control that waits for a second click is a trap. Lot size and
 * the profit target are typed, so they wait for Save; until then the button
 * stays grey, which is also how you can tell whether you have unsaved work.
 *
 * Both writes go through the same server actions the admin table uses, so the
 * broker's min/max/step still validates the lot size — what comes back is what
 * the bot will actually trade.
 */
function MarketSettings({ market, enabled, config, spec }: {
  market: BotMarket;
  enabled: boolean;
  config: BotConfig | undefined;
  spec: BotSymbolSpec | undefined;
}) {
  const min = spec?.volume_min ?? 0.01;
  const max = spec?.volume_max ?? null;
  const step = spec?.volume_step ?? 0.01;
  const dp = Math.max(0, (String(step).split('.')[1] ?? '').length);

  const savedLot = config?.lot_size ?? min;
  const savedTarget = config?.close_at_profit ?? null;

  const [lot, setLot] = useState<number>(savedLot);
  const [target, setTarget] = useState<string>(savedTarget == null ? '' : String(savedTarget));
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const parsedTarget = target.trim() === '' ? null : Number(target.trim());
  const dirty = lot !== savedLot || parsedTarget !== savedTarget;

  const bump = (dir: 1 | -1) => {
    setSaved(false);
    setLot((v) => {
      const next = Number((v + dir * step).toFixed(dp));
      if (next < min) return min;
      if (max != null && next > max) return max;
      return next;
    });
  };

  const save = () => {
    setErr(null);
    setSaved(false);
    if (parsedTarget != null && (!Number.isFinite(parsedTarget) || parsedTarget <= 0)) {
      setErr('Enter a dollar amount, or leave it blank for off.');
      return;
    }
    start(async () => {
      try {
        const [a, b] = await Promise.all([
          setLotSizeAction(market.symbol, lot),
          setCloseAtProfitAction(market.symbol, parsedTarget),
        ]);
        // The lot action clamps to the broker's step — show what it stored, not
        // what was typed, or the field lies about what will be traded.
        if (a.ok && a.value != null) setLot(a.value);
        if (!a.ok) { setErr(a.error); return; }
        if (!b.ok) { setErr(b.error); return; }
        setSaved(true);
      } catch {
        // Both actions call requireSection('trading-bot'), which THROWS. This
        // workspace has no sign-in yet, so a visitor without an admin session
        // lands here. Say that, rather than letting the rejection surface as a
        // blank error overlay on a page about real money.
        setErr('Not saved — you need to be signed in as an admin to change this market.');
      }
    });
  };

  return (
    <section className="mt-3 rounded-sm border border-border bg-bg-elevated px-4 py-4">
      <h4 className="text-sm font-bold text-fg">Settings</h4>

      <div className="mt-2">
        <MarketEnableToggle symbol={market.symbol} enabled={enabled} />
      </div>
      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] font-bold text-fg">
        {enabled ? 'Trading enabled' : 'Trading paused'}
      </p>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-fg-subtle">
        When off, no new trades open here. Open positions are still managed.
      </p>

      <hr className="my-4 border-border" />

      <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] font-bold text-fg">Lot size</p>
      <div className="mt-3 flex items-stretch overflow-hidden rounded-sm border border-border">
        <button
          type="button"
          onClick={() => bump(-1)}
          disabled={pending || lot <= min}
          aria-label="Smaller lot"
          className="flex w-12 shrink-0 items-center justify-center border-r border-border text-fg transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex flex-1 items-center justify-center py-3 font-mono tabular text-sm font-bold text-fg">
          {lot.toFixed(dp)}
        </span>
        <button
          type="button"
          onClick={() => bump(1)}
          disabled={pending || (max != null && lot >= max)}
          aria-label="Bigger lot"
          className="flex w-12 shrink-0 items-center justify-center border-l border-border text-fg transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {/* The mock reads "1 pip = $0.10 at this size". Nothing here stores a
          tick value, so that figure would be a guess on a screen about real
          money — the broker's own limits instead, which we do have. */}
      <p className="mt-2 text-center text-[11px] text-fg-subtle">
        Minimum {min}. Steps of {step}{max != null ? `, up to ${max}` : ''}.
      </p>

      <hr className="my-4 border-border" />

      <p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] font-bold text-fg">Close at profit</p>
      <input
        value={target}
        onChange={(e) => { setTarget(e.target.value); setSaved(false); }}
        inputMode="decimal"
        placeholder="off"
        disabled={pending}
        className="mt-3 w-full rounded-sm border border-border bg-bg px-4 py-3 font-mono tabular text-sm font-bold text-fg outline-none transition-colors placeholder:font-normal placeholder:text-fg-subtle hover:border-brand/40 focus:border-brand"
      />
      <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
        Closes at market once P&amp;L reaches about this. Applies to positions already
        open. Blank means off.
      </p>

      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className={`mt-5 flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm font-semibold transition-colors ${
          dirty && !pending
            ? 'bg-brand text-brand-fg hover:bg-brand-hover'
            : 'cursor-not-allowed bg-surface-hover text-fg-subtle'
        }`}
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? 'Saving…' : 'Save changes'}
      </button>

      {err && <p className="mt-2 text-center text-[11px] text-danger">{err}</p>}
      {saved && !dirty && !err && <p className="mt-2 text-center text-[11px] text-brand">Saved.</p>}
    </section>
  );
}

function Fact({ label, value, valueClass = 'text-fg', last }: {
  label: string; value: React.ReactNode; valueClass?: string; last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2.5 ${last ? '' : 'border-b border-border'}`}>
      <span className="text-sm text-fg-muted">{label}</span>
      <span className={`font-mono text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

/**
 * Performance — the account's record, measured on CLOSED trades only.
 *
 * Open positions are excluded on purpose: floating P&L is not a result, and a
 * win rate that counts a trade still running flatters itself.
 */
function PerformancePanel({ equity, curve, trades }: {
  equity: BotEquity | null;
  curve: BotEquity[];
  trades: BotTrade[];
}) {
  const settled = trades.filter((t) => t.pnl != null);
  const wins = settled.filter((t) => Number(t.pnl) > 0);
  const losses = settled.filter((t) => Number(t.pnl) < 0);
  const net = settled.reduce((s, t) => s + Number(t.pnl), 0);
  const grossWin = wins.reduce((s, t) => s + Number(t.pnl), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0));
  const winRate = settled.length ? (wins.length / settled.length) * 100 : null;
  const best = settled.reduce<number | null>((b, t) => (b == null || Number(t.pnl) > b ? Number(t.pnl) : b), null);
  const worst = settled.reduce<number | null>((w, t) => (w == null || Number(t.pnl) < w ? Number(t.pnl) : w), null);
  // Oldest → newest: the query hands them back newest first.
  const points = [...curve].reverse().map((e) => Number(e.equity)).filter(Number.isFinite);

  return (
    <div className="px-4 pb-8 pt-4">
      <section className="rounded-sm border border-border bg-bg-elevated px-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Equity</p>
        <p className="mt-1 font-mono text-2xl font-bold text-fg">{money(equity?.equity)}</p>
        <p className="mt-0.5 text-[11px] text-fg-subtle">
          Balance {money(equity?.balance)}
          {equity ? <> · updated <TimeAgo iso={equity.ts} /></> : null}
        </p>
        <div className="mt-3">
          {points.length >= 2
            ? <Sparkline values={points} responsive fill />
            : <p className="text-xs text-fg-subtle">Not enough snapshots to draw a curve yet.</p>}
        </div>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Net P&L" value={signed(net)} valueClass={tone(net)} />
        <Stat label="Win rate" value={winRate == null ? '—' : `${winRate.toFixed(0)}%`} />
        <Stat label="Wins" value={String(wins.length)} valueClass="text-brand" />
        <Stat label="Losses" value={String(losses.length)} valueClass="text-danger" />
        <Stat label="Best" value={best == null ? '—' : signed(best)} valueClass={tone(best)} />
        <Stat label="Worst" value={worst == null ? '—' : signed(worst)} valueClass={tone(worst)} />
      </div>

      <section className="mt-3 rounded-sm border border-border bg-bg-elevated px-4 py-3">
        <Fact label="Trades closed" value={String(settled.length)} />
        <Fact label="Gross profit" value={money(grossWin)} valueClass="text-brand" />
        <Fact label="Gross loss" value={money(grossLoss)} valueClass="text-danger" />
        <Fact
          label="Profit factor"
          value={grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : grossWin > 0 ? '∞' : '—'}
          last
        />
      </section>

      <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
        Closed trades only — {settled.length} of them. Open positions are left out: floating P&amp;L is
        not a result yet.
      </p>
    </div>
  );
}

function Stat({ label, value, valueClass = 'text-fg' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-sm border border-border bg-bg-elevated px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-fg-subtle">{label}</p>
      <p className={`mt-0.5 font-mono tabular text-sm font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

/**
 * Transactions — the money ledger, which is NOT the History list.
 *
 * History answers "what did the bot do". This answers "what reached the
 * account": gross, then the commission and swap that come off it, then the net
 * the balance actually moved by. Those fees are invisible everywhere else on
 * this screen.
 */
function TransactionsPanel({ trades }: { trades: BotTrade[] }) {
  const shown = trades.filter((t) => t.pnl != null).slice(0, 60);
  if (shown.length === 0) return <Empty>No settled trades yet.</Empty>;

  const fees = shown.reduce((s, t) => s + Number(t.commission ?? 0) + Number(t.swap ?? 0), 0);
  const net = shown.reduce((s, t) => s + Number(t.pnl), 0);

  return (
    <div className="px-4 pb-8 pt-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Net, last 60" value={signed(net)} valueClass={tone(net)} />
        <Stat label="Fees in that" value={money(fees)} valueClass={fees < 0 ? 'text-danger' : 'text-fg'} />
      </div>

      <ul className="mt-3 space-y-2">
        {shown.map((t) => {
          const fee = Number(t.commission ?? 0) + Number(t.swap ?? 0);
          return (
            <li key={t.id}>
              <a
                href={t.ticket ? `/trade/${t.ticket}` : undefined}
                className="block rounded-sm border border-border bg-bg-elevated px-4 py-3 transition-colors hover:border-brand/40"
              >
                <div className="flex items-center gap-2">
                  <SideBadge side={t.side === 'sell' ? 'sell' : 'buy'} />
                  <span className="text-sm font-bold text-fg">{t.symbol}</span>
                  <span className={`ml-auto font-mono tabular text-sm font-bold ${tone(t.pnl)}`}>
                    {signed(t.pnl)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 font-mono text-[11px] text-fg-subtle">
                  <span>{t.volume} lots · fees {fee === 0 ? '—' : money(fee)}</span>
                  <span className="ml-auto whitespace-nowrap">{closedAtLabel(t.close_ts)}</span>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Settings — the account-wide switches, as opposed to the per-market ones in
 * Markets. Both switches here are the admin dashboard's own components, so
 * there is exactly one implementation of "turn the bot off" in the codebase.
 */
function SettingsPanel({ settings, equity, openCount }: {
  settings: BotSettings | null; equity: BotEquity | null; openCount: number;
}) {
  if (!settings) return <Empty>No settings row yet.</Empty>;

  return (
    <div className="px-4 pb-8 pt-4">
      <section
        className={`rounded-sm border px-4 py-4 ${
          settings.trading_enabled ? 'border-border bg-bg-elevated' : 'border-warning/40 bg-warning/5'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${settings.trading_enabled ? 'bg-brand' : 'bg-warning'}`} />
          <h4 className="text-sm font-bold text-fg">
            {settings.trading_enabled ? 'Trading is on' : 'Trading is off'}
          </h4>
          <span className="ml-auto flex items-center gap-2">
            <TradingSwitchButton
              enabled={settings.trading_enabled}
              updatedAt={settings.updated_at}
              updatedBy={settings.updated_by}
              seenByBotAt={settings.seen_by_bot_at}
            />
            {/* Beside it deliberately: one stops NEW risk, the other gets out
                of the risk already carried. They are asked for together. */}
            <FlattenAllButton openCount={openCount} />
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
          {settings.trading_enabled
            ? 'The bot opens new trades on any enabled market.'
            : 'No new trades are being opened. Open positions and resting orders are still managed.'}
        </p>
        {/* A switch nobody has confirmed the bot READ is worse than none. */}
        <p className="mt-1 text-[11px] text-fg-subtle">
          {settings.seen_by_bot_at
            ? <>Bot last read this <TimeAgo iso={settings.seen_by_bot_at} /></>
            : 'The bot has never confirmed reading this flag.'}
        </p>
      </section>

      <section className="mt-3 rounded-sm border border-border bg-bg-elevated px-4 py-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-fg">
            {settings.require_approval ? 'Asks before trading' : 'Places its own orders'}
          </h4>
          <span className="ml-auto">
            <ApprovalModeToggle required={settings.require_approval} />
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
          {settings.require_approval
            ? 'It proposes setups and waits. Nothing reaches the broker until someone approves it, here or in Telegram.'
            : 'It finds a setup and places the order itself.'}
        </p>
      </section>

      <section className="mt-3 rounded-sm border border-border bg-bg-elevated px-4 py-3">
        <Fact label="Account" value={equity?.is_dry_run ? 'Demo' : 'Live'} valueClass={equity?.is_dry_run ? 'text-warning' : 'text-fg'} />
        <Fact label="Balance" value={money(equity?.balance)} />
        <Fact label="Equity" value={money(equity?.equity)} />
        <Fact label="Changed by" value={settings.updated_by ?? '—'} last />
      </section>
    </div>
  );
}

/** BUY/SELL pill — solid, because direction is the first thing you read. */
function SideBadge({ side }: { side: 'buy' | 'sell' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        side === 'buy' ? 'bg-brand text-brand-fg' : 'bg-danger text-white'
      }`}
    >
      {side}
    </span>
  );
}

/** A signal reads `SELL @ 1.32840` — the direction is its first word. */
const sideOf = (signal: string | null | undefined): 'buy' | 'sell' => {
  const s = (signal ?? '').toUpperCase();
  return s.startsWith('SELL') || s.startsWith('SHORT') ? 'sell' : 'buy';
};

/**
 * Pips between price and the level that would trigger.
 *
 * A pip is the fourth decimal on a 5-digit quote and the second on a 3-digit
 * one (JPY) — derived from the broker's own `digits`, never assumed, because
 * guessing it on USDJPY is wrong by a factor of 100.
 */
function pipsAway(price: number | null, level: number | null, digits: number | null): string | null {
  if (price == null || level == null || digits == null) return null;
  if (!Number.isFinite(price) || !Number.isFinite(level)) return null;
  const pip = digits >= 3 ? 10 ** -(digits - 1) : 10 ** -digits;
  const n = Math.abs(price - level) / pip;
  if (!Number.isFinite(n)) return null;
  return `${n < 10 ? n.toFixed(1) : Math.round(n)} pips away`;
}

/**
 * Pending — everything that would become a trade, and how far off it is.
 *
 * Two kinds of row share the list: a proposal, which needs a person to approve
 * it, and a resting level the bot is watching on its own. They are the same
 * shape on screen, so the approval one carries a tag — nothing else tells you
 * that one of these is waiting on you.
 */
function PendingList({ markets, proposals, allMarkets, configs, specs, onOpenMarket }: {
  markets: BotMarket[];
  proposals: BotProposal[];
  allMarkets: BotMarket[];
  configs: BotConfig[];
  specs: BotSymbolSpec[];
  onOpenMarket: (symbol: string) => void;
}) {
  if (markets.length === 0 && proposals.length === 0) return <Empty>Nothing pending.</Empty>;

  const specOf = (symbol: string) => specs.find((s) => s.name === symbol);
  const lotOf = (symbol: string) =>
    configs.find((c) => c.symbol === symbol)?.lot_size ?? specOf(symbol)?.volume_min ?? null;
  const priceOf = (symbol: string) => allMarkets.find((m) => m.symbol === symbol)?.price ?? null;

  const rows = [
    ...proposals.map((p) => ({
      key: `p:${p.id}`,
      symbol: p.symbol,
      label: p.alias ?? p.symbol,
      side: sideOf(p.side),
      level: p.level,
      needsApproval: true,
      ticket: null as number | null,
      alias: p.alias ?? p.symbol,
      note: <>asked <TimeAgo iso={p.created_at} /></>,
    })),
    ...markets.map((m) => ({
      key: `m:${m.symbol}`,
      symbol: m.symbol,
      label: m.alias,
      side: sideOf(m.latest_signal),
      level: m.level,
      needsApproval: false,
      // A resting ORDER and a watched level look identical until you say which
      // is which. Only the first can fill — and only the first can be
      // cancelled, which is why the ticket is carried through.
      ticket: m.pending_ticket ?? null,
      alias: m.alias,
      note: m.pending_ticket ? <span className="font-mono">#{m.pending_ticket}</span> : <>watching</>,
    })),
  ];

  return (
    <ul className="space-y-2 px-4 pb-6 pt-4">
      {rows.map((r) => {
        const lot = lotOf(r.symbol);
        const pips = pipsAway(priceOf(r.symbol), r.level, specOf(r.symbol)?.digits ?? null);
        return (
          <li key={r.key}>
            {/* The whole card is the target — the ⚙ is the affordance, not the
                only hit area, and a button inside a button is invalid HTML. */}
            <button
              type="button"
              onClick={() => onOpenMarket(r.symbol)}
              title={`Open ${r.label}`}
              className="group block w-full rounded-sm border border-border bg-bg-elevated px-4 py-3 text-left transition-colors hover:border-brand/40 hover:bg-brand/5"
            >
            <div className="flex items-center gap-2">
              <SideBadge side={r.side} />
              <span className="text-sm font-bold text-fg">{r.label}</span>
              {r.needsApproval && (
                <span className="rounded-sm bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
                  Needs approval
                </span>
              )}
              <span className="ml-auto font-mono tabular text-sm font-bold text-fg">
                {lot == null ? '—' : lot.toFixed(2)}
              </span>
              {/* Marks where the card leads: this symbol's settings, which is
                  where that lot size comes from. */}
              <SlidersHorizontal
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>

            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-fg-subtle">
              <span className="font-mono">Triggers at {px(r.level)}</span>
              <span className="ml-auto whitespace-nowrap font-mono">{pips ?? r.note}</span>
            </div>
            </button>

            {/* Outside the card, because a button inside a button is invalid
                HTML and because cancelling is not "open this market". */}
            {r.ticket != null && (
              <div className="mt-1.5 px-1">
                <CancelOrderButton
                  symbol={r.symbol} alias={r.alias}
                  ticket={r.ticket} level={r.level}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Active — what is open, and how far it has travelled.
 *
 * The bar along the bottom is entry → target, filled by where price is now and
 * coloured by the P&L. It is drawn ONLY when there is a real entry and a real
 * target to measure between; a bar with a guessed denominator would be a
 * picture of nothing on a screen about open money.
 */
function ActiveList({ markets, configs, specs, onOpenMarket }: {
  markets: BotMarket[];
  configs: BotConfig[];
  specs: BotSymbolSpec[];
  onOpenMarket: (symbol: string) => void;
}) {
  if (markets.length === 0) return <Empty>Nothing open.</Empty>;

  const lotOf = (m: BotMarket) =>
    m.volume
    ?? configs.find((c) => c.symbol === m.symbol)?.lot_size
    ?? specs.find((s) => s.name === m.symbol)?.volume_min
    ?? null;

  return (
    <ul className="space-y-2 px-4 pb-6 pt-4">
      {markets.map((m) => {
        const side = sideOf(m.latest_signal);
        const lot = lotOf(m);
        const entry = m.level;
        const span = entry != null && m.tp != null ? Math.abs(m.tp - entry) : null;
        const travelled = entry != null && m.price != null ? Math.abs(m.price - entry) : null;
        const progress = span != null && span > 0 && travelled != null
          ? Math.max(0, Math.min(1, travelled / span))
          : null;

        return (
          <li key={m.symbol}>
            <button
              type="button"
              onClick={() => onOpenMarket(m.symbol)}
              title={`Open ${m.alias}`}
              className="group relative block w-full overflow-hidden rounded-sm border border-border bg-bg-elevated px-4 pb-4 pt-3 text-left transition-colors hover:border-brand/40 hover:bg-brand/5"
            >
            <div className="flex items-center gap-2">
              <SideBadge side={side} />
              <span className="text-sm font-bold text-fg">{m.alias}</span>
              <span className={`ml-auto font-mono tabular text-sm font-bold ${tone(m.pnl)}`}>
                {signed(m.pnl)}
              </span>
              <SlidersHorizontal
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>

            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-fg-subtle">
              <span className="font-mono">
                Entry {px(entry)}{lot == null ? '' : ` · ${lot.toFixed(2)} lots`}
              </span>
              <span className="ml-auto whitespace-nowrap font-mono">
                {m.opened_at ? <Duration from={m.opened_at} /> : '—'}
              </span>
            </div>

            {progress != null && (
              <span
                aria-hidden
                title={`${Math.round(progress * 100)}% of the way from entry to target`}
                className={`absolute bottom-0 left-0 h-1 transition-[width] ${
                  Number(m.pnl) < 0 ? 'bg-danger' : 'bg-brand'
                }`}
                style={{ width: `${progress * 100}%` }}
              />
            )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** The bot's own close_reason codes (live/trader.py), in an admin's words. */
const CLOSE_REASON: Record<string, string> = {
  take_profit: 'Take profit',
  stop_loss: 'Stop loss',
  profit_locked: 'Profit locked',
  close_at_profit: 'Profit target',
  manual_close: 'Manual',
  admin_close: 'Manual',
  bot_close: 'Bot close',
  stop_out: 'Stop out',
  rollover: 'Rollover',
  reconciled_stale: 'Reconciled',
  reconciled_closed: 'Reconciled',
  closed: 'Closed',
};

const closeReasonLabel = (raw: string | null) => {
  if (!raw) return 'Closed';
  return CLOSE_REASON[raw] ?? raw.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
};

/**
 * Close time as a desk reads it: the clock always, the day only as far back as
 * it stays unambiguous — Yesterday, then the weekday inside a week, then the
 * date. Rendered client-side on purpose; the server's timezone is not the
 * viewer's, and a trade stamped an hour wrong is worse than no stamp.
 */
function closedAtLabel(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const clock = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const days = Math.floor((midnight.getTime() - d.getTime()) / 86_400_000) + 1;
  if (days <= 0) return `Today ${clock}`;
  if (days === 1) return `Yesterday ${clock}`;
  if (days < 7) return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${clock}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${clock}`;
}

type HistoryFilter = 'all' | 'wins' | 'losses';

function HistoryList({ trades }: { trades: BotTrade[] }) {
  const [filter, setFilter] = useState<HistoryFilter>('all');

  const shown = trades
    .filter((t) => (filter === 'all' ? true : filter === 'wins' ? Number(t.pnl) > 0 : Number(t.pnl) < 0))
    .slice(0, 60);

  const TABS: { key: HistoryFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'wins', label: 'Wins' },
    { key: 'losses', label: 'Losses' },
  ];

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border px-4 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`rounded-sm px-3 py-1.5 text-sm transition-colors ${
              filter === t.key
                ? 'bg-surface-hover font-semibold text-fg'
                : 'text-fg-muted hover:bg-brand/10 hover:text-brand'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty>
          {filter === 'all' ? 'No closed trades yet.' : `No ${filter} in the last ${trades.length} trades.`}
        </Empty>
      ) : (
        <ul className="space-y-2 px-4 pb-6 pt-3">
          {shown.map((t) => (
            <li key={t.id}>
              {/* The ticket page is the whole story of one trade — entry
                  readings, excursions, the analyst's note. Keep the card a
                  link to it. */}
              <a
                href={t.ticket ? `/trade/${t.ticket}` : undefined}
                className="block rounded-sm border border-border bg-bg-elevated px-4 py-3 transition-colors hover:border-brand/40"
              >
                <div className="flex items-center gap-2">
                  <SideBadge side={t.side === 'sell' ? 'sell' : 'buy'} />
                  <span className="text-sm font-bold text-fg">{t.symbol}</span>
                  <span className={`ml-auto font-mono tabular text-sm font-bold ${tone(t.pnl)}`}>
                    {signed(t.pnl)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded-sm bg-surface-hover px-2 py-0.5 text-[11px] text-fg-muted">
                    {closeReasonLabel(t.close_reason)}
                  </span>
                  <span className="ml-auto whitespace-nowrap font-mono text-[11px] text-fg-subtle">
                    {closedAtLabel(t.close_ts)}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ── Bits ─────────────────────────────────────────────────────────────── */

function Figure({ label, value, valueClass = 'text-fg' }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="shrink-0">
      <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-fg-subtle">{label}</p>
      <p className={`font-mono text-sm font-bold leading-tight ${valueClass}`}>{value}</p>
    </div>
  );
}

/**
 * A section the design has and the bot does not yet fill.
 *
 * The mock's line — "This workspace view is ready for your data" — describes
 * the screen, not the situation, and its button goes nowhere. Same layout,
 * honest words: what would be here, and the one place that answer lives today.
 */
function Soon({ title, body, action }: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-sm bg-brand/15 text-brand">
        <BarChart3 className="h-6 w-6" />
      </span>
      <p className="mt-5 text-lg font-semibold text-fg">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{body}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-sm bg-surface-hover px-4 py-2.5 text-sm text-fg transition-colors hover:bg-brand/15 hover:text-brand"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="p-8 text-center text-sm text-fg-subtle">{children}</p>;
}
