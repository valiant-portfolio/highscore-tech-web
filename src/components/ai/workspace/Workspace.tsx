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

import { useState } from 'react';
import {
  Sparkles, CandlestickChart, ListFilter, Clock, Activity, History as HistoryIcon,
  FlaskConical, Bell, X, ChevronLeft, ChevronRight, Send, Plus, MoreHorizontal, ChevronDown,
} from 'lucide-react';
import { MarketChart } from '@/components/admin/bot/MarketChart';
import { TrendChip, TimeAgo } from '@/components/admin/bot/BotBits';
import type {
  BotMarket, BotTrade, BotEquity, BotSettings, BotProposal,
} from '@/lib/admin/trading-bot-queries';

type Section = 'scora' | 'chart' | 'markets' | 'pending' | 'active' | 'history' | 'backtests' | 'alerts';

const TITLES: Record<Section, string> = {
  scora: 'Scora', chart: 'Chart', markets: 'Markets', pending: 'Pending',
  active: 'Active', history: 'History', backtests: 'Backtests', alerts: 'Alerts',
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
  markets, closedTrades, equity, settings, proposals, user,
}: {
  markets: BotMarket[];
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const active = markets.filter((m) => m.state === 'active');
  const ready = markets.filter((m) => m.state === 'ready');
  const floating = markets.reduce((s, m) => s + (Number(m.pnl) || 0), 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = closedTrades
    .filter((t) => t.close_ts && t.close_ts.slice(0, 10) === todayKey)
    .reduce((s, t) => s + (Number(t.pnl) || 0), 0);

  const open = (s: Section) => { setSection(s); setPanelOpen(true); };

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
        { key: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4" />, count: ready.length + proposals.length },
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

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
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
                  className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    section === it.key && panelOpen
                      ? 'bg-surface-hover font-semibold text-fg'
                      : 'text-fg-muted hover:bg-surface-hover/60 hover:text-fg'
                  }`}
                >
                  <span className={section === it.key && panelOpen ? 'text-brand' : ''}>{it.icon}</span>
                  {railOpen && it.label}
                  {railOpen && it.count != null && it.count > 0 && (
                    <span className="ml-auto font-mono text-xs text-fg-subtle">{it.count}</span>
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

          <div className="min-h-0 flex-1 overflow-y-auto">
            {section === 'scora' && <ScoraPanel name={user.name} />}
            {section === 'chart' && <ChartPanel showGrid={showGrid} onGrid={setShowGrid} />}
            {section === 'markets' && <MarketList markets={markets} />}
            {section === 'pending' && <PendingList markets={ready} proposals={proposals} />}
            {section === 'active' && <ActiveList markets={active} />}
            {section === 'history' && <HistoryList trades={closedTrades} />}
            {section === 'backtests' && (
              <Soon title="Backtests" body="Run an idea against the stored history. Not built yet." />
            )}
            {section === 'alerts' && (
              <Soon title="Alerts" body="Alerts arrive in Telegram today. Bringing them onto this screen is not built yet." />
            )}
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

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <MarketChart
            markets={markets.map((m) => ({ symbol: m.symbol, alias: m.alias }))}
            showGrid={showGrid}
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
 * Grid works. Chart type, volume and support/resistance are drawn and
 * disabled: bot_bars carries no volume column, and nothing computes support or
 * resistance yet. A switch that lights up and changes nothing is worse than
 * one that admits it is not connected.
 */
function ChartPanel({ showGrid, onGrid }: { showGrid: boolean; onGrid: (v: boolean) => void }) {
  return (
    <div className="px-5 py-4">
      <Row label="Chart type">
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-fg">
          Candlesticks <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" />
        </span>
      </Row>

      <Row label="Grid">
        <Toggle on={showGrid} onClick={() => onGrid(!showGrid)} />
      </Row>

      <p className="pb-1 pt-5 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Indicators</p>

      <Row label="Volume">
        <Toggle on={false} disabled title="bot_bars stores no volume yet" />
      </Row>
      <Row label="Support / resistance">
        <Toggle on={false} disabled title="not computed yet" />
      </Row>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('resize'))}
        className="mt-6 w-full rounded-lg border border-border bg-bg-elevated py-2.5 text-sm text-fg hover:bg-surface-hover"
      >
        Reset view
      </button>
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
      className={`h-8 w-14 rounded-lg border text-xs font-semibold transition-colors ${
        on ? 'border-brand/40 bg-brand/15 text-brand' : 'border-border text-fg-subtle'
      } ${disabled ? 'opacity-50' : 'hover:bg-surface-hover'}`}
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

function MarketList({ markets, note }: { markets: BotMarket[]; note?: string }) {
  if (markets.length === 0) return <Empty>No markets yet.</Empty>;
  return (
    <>
      {note && <p className="px-5 py-3 text-[11px] text-fg-subtle">{note}</p>}
      <ul className="divide-y divide-border">
        {markets.map((m) => (
          <li key={m.symbol} className="px-5 py-3 hover:bg-surface-hover/40">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-fg">{m.alias}</span>
              <span className="ml-auto font-mono text-sm text-fg">{px(m.price)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <TrendChip trend={m.htf_trend} label="H1" />
              <TrendChip trend={m.entry_trend} label="M15" />
              <span className="ml-auto text-[11px] text-fg-subtle">{m.reason ?? m.state}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function PendingList({ markets, proposals }: { markets: BotMarket[]; proposals: BotProposal[] }) {
  if (markets.length === 0 && proposals.length === 0) return <Empty>Nothing pending.</Empty>;
  return (
    <>
      {proposals.length > 0 && (
        <>
          <p className="px-5 pt-4 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
            Waiting for you
          </p>
          <ul className="divide-y divide-border">
            {proposals.map((p) => (
              <li key={p.id} className="px-5 py-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-fg">{p.alias}</span>
                  <span className={`text-xs font-bold ${p.side === 'buy' ? 'text-brand' : 'text-danger'}`}>
                    {p.side.toUpperCase()}
                  </span>
                  <span className="ml-auto font-mono text-sm">{px(p.level)}</span>
                </div>
                <p className="mt-1 text-[11px] text-fg-subtle">
                  stop {px(p.sl)} · target {px(p.tp)} · asked <TimeAgo iso={p.created_at} />
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="px-5 pb-1 pt-4 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
        Resting and watching
      </p>
      <ul className="divide-y divide-border">
        {markets.map((m) => (
          <li key={m.symbol} className="px-5 py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-fg">{m.alias}</span>
              <span className="ml-auto font-mono text-sm">{px(m.level)}</span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-[11px] text-fg-subtle">
              {m.latest_signal ?? '—'}
              {/* A resting ORDER and a watched level look identical in a list
                  until you say which is which. Only the first can fill. */}
              {m.pending_ticket ? (
                <a href={`/trade/${m.pending_ticket}`} className="ml-auto font-mono text-brand hover:underline">
                  #{m.pending_ticket}
                </a>
              ) : (
                <span className="ml-auto">watching</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

function ActiveList({ markets }: { markets: BotMarket[] }) {
  if (markets.length === 0) return <Empty>Nothing open.</Empty>;
  return (
    <ul className="divide-y divide-border">
      {markets.map((m) => (
        <li key={m.symbol} className="px-5 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-fg">{m.alias}</span>
            <span className={`ml-auto font-mono text-sm font-bold ${tone(m.pnl)}`}>{signed(m.pnl)}</span>
          </div>
          <p className="mt-1 text-[11px] text-fg-subtle">
            {m.latest_signal ?? '—'} · {px(m.volume)} lots · stop {px(m.sl)} · target {px(m.tp)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function HistoryList({ trades }: { trades: BotTrade[] }) {
  const shown = trades.slice(0, 60);
  if (shown.length === 0) return <Empty>No closed trades yet.</Empty>;
  return (
    <ul className="divide-y divide-border">
      {shown.map((t) => (
        <li key={t.ticket} className="px-5 py-3 hover:bg-surface-hover/40">
          <div className="flex items-baseline gap-2">
            <a href={`/trade/${t.ticket}`} className="text-sm font-semibold text-fg hover:text-brand hover:underline">
              {t.symbol}
            </a>
            <span className={`text-xs font-bold ${t.side === 'buy' ? 'text-brand' : 'text-danger'}`}>
              {t.side.toUpperCase()}
            </span>
            <span className={`ml-auto font-mono text-sm font-bold ${tone(t.pnl)}`}>{signed(t.pnl)}</span>
          </div>
          <p className="mt-1 text-[11px] text-fg-subtle">
            {px(t.open_price)} → {px(t.close_price)} · closed <TimeAgo iso={t.close_ts} />
          </p>
        </li>
      ))}
    </ul>
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

function Soon({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-8 text-center">
      <p className="font-semibold text-fg">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{body}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="p-8 text-center text-sm text-fg-subtle">{children}</p>;
}
