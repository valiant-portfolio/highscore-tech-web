// /admin/trading-bot — read-only live monitor of the forex bot.
//
// The bot (a Python process) writes to the bot_* tables every ~60s; this page
// only reads and auto-refreshes. One row per market with trend + state, the
// account line (equity/balance/open positions), open positions and recent
// closed trades. Click any market for the full detail view. Nothing here writes
// to the bot — the new contract is read-only (see trading-bot-db/FRONTEND.md).

import Link from 'next/link';
import { ChevronRight, Wallet, Layers, TrendingUp, TrendingDown, ShieldCheck, FlaskConical } from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { BotStatus, TrendChip, StateBadge, TimeAgo, Sparkline, STALE_MS } from '@/components/admin/bot/BotBits';
import { getBotOverview, type BotMarket, type BotTrade } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

function money(n: number | null | undefined, dp = 2): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  const x = Number(n);
  return `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}
function px(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 5 });
}
function pnlTone(n: number | null | undefined): string {
  if (n == null) return 'text-fg-muted';
  return Number(n) > 0 ? 'text-success' : Number(n) < 0 ? 'text-danger' : 'text-fg-muted';
}

export default async function TradingBotPage() {
  const { markets, openTrades, recentTrades, equity, equityCurve, lastUpdate } = await getBotOverview();

  const floating = markets.reduce((s, m) => s + (Number(m.pnl) || 0), 0);
  const inPosition = markets.filter((m) => m.state === 'position').length;
  const activeSetups = markets.filter((m) => m.state === 'setup_ready' || m.state === 'order').length;
  const anyArmed = markets.some((m) => !m.is_dry_run);
  const pnlUp = equity ? equity.equity >= equity.balance : true;

  return (
    <>
      <PageHead
        title="Trading bot"
        description="Live monitor of every market the bot is watching. Read-only — the bot trades autonomously."
        actions={<BotStatus lastUpdate={lastUpdate} />}
      />

      {/* ── Account line ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="Equity"
          value={equity ? money(equity.equity) : '—'}
          hint={equity ? <>Balance {money(equity.balance)}</> : 'no snapshot yet'}
          tone={pnlUp ? 'success' : 'danger'}
        />
        <Kpi
          label="Floating P&L"
          value={<span className={pnlTone(floating)}>{floating >= 0 ? '+' : ''}{money(floating)}</span>}
          hint="across open positions"
        />
        <Kpi label="Open positions" value={openTrades.length} hint={`${inPosition} market${inPosition === 1 ? '' : 's'} in position`} tone="brand" />
        <Kpi
          label="Mode"
          value={anyArmed ? 'Armed' : 'Demo'}
          hint={anyArmed ? 'trading real capital' : 'paper / dry-run'}
          tone={anyArmed ? 'danger' : 'default'}
        />
      </div>

      {/* ── Markets table ────────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-fg">Markets</h2>
          <p className="text-xs text-fg-subtle">
            {markets.length} tracked · {activeSetups} setup{activeSetups === 1 ? '' : 's'} forming
          </p>
        </div>

        <AdminCard>
          {markets.length === 0 ? (
            <Empty>No market data yet. Start the bot and it will appear here within a minute.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
                  <tr>
                    <Th className="text-left pl-4">Market</Th>
                    <Th className="text-left">Trend</Th>
                    <Th className="text-left">Higher TF</Th>
                    <Th className="text-left">State</Th>
                    <Th className="text-left">Detail</Th>
                    <Th className="text-right">Price</Th>
                    <Th className="text-right">Level</Th>
                    <Th className="text-right">P&L</Th>
                    <Th className="text-right pr-4">Updated</Th>
                    <Th className="pr-2"> </Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {markets.map((m) => <MarketRow key={m.symbol} m={m} />)}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>

      {/* ── Positions + account curve ────────────────────────────────── */}
      <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
        <AdminCard>
          <div className="p-5">
            <h3 className="font-semibold text-fg flex items-center gap-2"><Layers className="h-4 w-4 text-brand" /> Open positions</h3>
            {openTrades.length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">No positions open right now.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-fg-subtle">
                    <tr>
                      <Th className="text-left">Market</Th><Th className="text-left">Side</Th>
                      <Th className="text-right">Vol</Th><Th className="text-right">Entry</Th>
                      <Th className="text-right">P&L</Th><Th className="text-right">Opened</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {openTrades.map((t) => <PositionRow key={t.id} t={t} markets={markets} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-5">
            <h3 className="font-semibold text-fg flex items-center gap-2"><Wallet className="h-4 w-4 text-brand" /> Account</h3>
            {equity ? (
              <>
                <p className="mt-3 font-mono tabular text-2xl font-extrabold text-fg">{money(equity.equity)}</p>
                <p className="text-xs text-fg-muted">equity · balance {money(equity.balance)}</p>
                <div className="mt-4">
                  <Sparkline values={equityCurve.map((e) => Number(e.equity)).filter(Number.isFinite)} />
                </div>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-fg-subtle">
                  {equity.is_dry_run ? <FlaskConical className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {equity.is_dry_run ? 'Demo account' : 'Live account'} · <TimeAgo iso={equity.ts} />
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-fg-muted">No equity snapshot yet.</p>
            )}
          </div>
        </AdminCard>
      </div>

      {/* ── Recent closed trades ─────────────────────────────────────── */}
      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">Recent trades</h3>
        <AdminCard>
          {recentTrades.length === 0 ? (
            <Empty>No closed trades yet.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
                  <tr>
                    <Th className="text-left pl-4">Market</Th><Th className="text-left">Side</Th>
                    <Th className="text-right">Vol</Th><Th className="text-right">Entry</Th>
                    <Th className="text-right">Exit</Th><Th className="text-right">P&L</Th>
                    <Th className="text-left">Reason</Th><Th className="text-right pr-4">Closed</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-hover/30">
                      <Td className="pl-4 font-semibold text-fg">{t.symbol}{t.is_dry_run && <DryTag />}</Td>
                      <Td><SideTag side={t.side} /></Td>
                      <Td className="text-right tabular">{t.volume}</Td>
                      <Td className="text-right tabular">{px(t.open_price)}</Td>
                      <Td className="text-right tabular">{px(t.close_price)}</Td>
                      <Td className={`text-right tabular font-bold ${pnlTone(t.pnl)}`}>{t.pnl == null ? '—' : `${Number(t.pnl) >= 0 ? '+' : ''}${money(t.pnl)}`}</Td>
                      <Td className="text-fg-muted">{t.close_reason ?? '—'}</Td>
                      <Td className="text-right pr-4 text-fg-subtle"><TimeAgo iso={t.close_ts} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>
    </>
  );
}

/* ── Row + cell helpers ──────────────────────────────────────────────── */

function MarketRow({ m }: { m: BotMarket }) {
  const stale = m.updated_at ? Date.now() - new Date(m.updated_at).getTime() > STALE_MS : true;
  return (
    <tr className={`hover:bg-surface-hover/40 ${stale ? 'opacity-45' : ''}`}>
      <Td className="pl-4">
        <Link href={`/admin/trading-bot/${encodeURIComponent(m.symbol)}`} className="font-semibold text-fg hover:text-brand">
          {m.alias}
        </Link>
        <p className="text-[11px] text-fg-subtle">{m.symbol}{m.is_dry_run && <DryTag />}</p>
      </Td>
      <Td><TrendChip trend={m.entry_trend} /><span className="ml-1 text-[10px] text-fg-subtle">{m.timeframe}</span></Td>
      <Td><TrendChip trend={m.htf_trend} /><span className="ml-1 text-[10px] text-fg-subtle">{m.htf}</span></Td>
      <Td><StateBadge state={m.state} /></Td>
      <Td className="max-w-[240px] truncate text-fg-muted" title={m.detail ?? ''}>{m.detail ?? '—'}</Td>
      <Td className="text-right tabular">{px(m.price)}</Td>
      <Td className="text-right tabular text-fg-muted">{m.level == null ? '—' : px(m.level)}</Td>
      <Td className={`text-right tabular font-bold ${pnlTone(m.pnl)}`}>
        {m.pnl == null ? '—' : `${Number(m.pnl) >= 0 ? '+' : ''}${money(m.pnl)}`}
      </Td>
      <Td className="text-right pr-4 text-fg-subtle whitespace-nowrap"><TimeAgo iso={m.updated_at} /></Td>
      <Td className="pr-2 text-right">
        <Link href={`/admin/trading-bot/${encodeURIComponent(m.symbol)}`} className="inline-flex text-fg-subtle hover:text-brand" aria-label="View details">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Td>
    </tr>
  );
}

function PositionRow({ t, markets }: { t: BotTrade; markets: BotMarket[] }) {
  // Live P&L for an open trade lives on the market_state row, not the trade.
  const live = markets.find((m) => m.symbol === t.symbol)?.pnl ?? null;
  return (
    <tr className="hover:bg-surface-hover/30">
      <Td className="font-semibold text-fg">{t.symbol}{t.is_dry_run && <DryTag />}</Td>
      <Td><SideTag side={t.side} /></Td>
      <Td className="text-right tabular">{t.volume}</Td>
      <Td className="text-right tabular">{px(t.open_price)}</Td>
      <Td className={`text-right tabular font-bold ${pnlTone(live)}`}>{live == null ? '—' : `${Number(live) >= 0 ? '+' : ''}${money(live)}`}</Td>
      <Td className="text-right text-fg-subtle"><TimeAgo iso={t.open_ts} /></Td>
    </tr>
  );
}

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
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${buy ? 'text-success' : 'text-danger'}`}>
      <Icon className="h-3.5 w-3.5" /> {side.toUpperCase()}
    </span>
  );
}
function DryTag() {
  return <span className="ml-1.5 rounded bg-surface-hover px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-fg-subtle align-middle">demo</span>;
}
