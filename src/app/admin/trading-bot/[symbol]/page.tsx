// /admin/trading-bot/[symbol] — full detail for one market: its live state,
// this market's trade history, recent model predictions (including vetoed ones),
// and the latest model run's out-of-sample scorecard. Read-only.

import { notFound } from 'next/navigation';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { BotStatus, TrendChip, StateBadge, TimeAgo } from '@/components/admin/bot/BotBits';
import { getBotMarket } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

interface PageProps { params: Promise<{ symbol: string }> }

function money(n: number | null | undefined, dp = 2): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  const x = Number(n);
  return `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}
function px(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 5 });
}
function pct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return `${(Number(n) * 100).toFixed(1)}%`;
}
function num(n: number | null | undefined, dp = 2): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return Number(n).toFixed(dp);
}
function pnlTone(n: number | null | undefined): string {
  if (n == null) return 'text-fg-muted';
  return Number(n) > 0 ? 'text-success' : Number(n) < 0 ? 'text-danger' : 'text-fg-muted';
}

export default async function BotMarketPage({ params }: PageProps) {
  const { symbol } = await params;
  const decoded = decodeURIComponent(symbol);
  const { market, trades, predictions, modelRun } = await getBotMarket(decoded);
  if (!market) notFound();

  return (
    <>
      <PageHead
        title={market.alias}
        description={market.symbol}
        back={{ href: '/admin/trading-bot', label: 'Back to monitor' }}
        actions={<BotStatus lastUpdate={market.updated_at} />}
      />

      {/* ── Live state ───────────────────────────────────────────────── */}
      <AdminCard>
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StateBadge state={market.state} />
            <TrendChip trend={market.entry_trend} label={`${market.timeframe ?? ''} `} />
            <TrendChip trend={market.htf_trend} label={`${market.htf ?? ''} `} />
            {market.is_dry_run && (
              <span className="rounded bg-surface-hover px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fg-subtle">Demo</span>
            )}
          </div>
          <p className="mt-4 text-fg">{market.detail ?? 'No detail reported.'}</p>

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
            <Fact label="Price" value={<span className="tabular">{px(market.price)}</span>} />
            <Fact label="Pending level" value={<span className="tabular">{market.level == null ? '—' : px(market.level)}</span>} />
            <Fact label="Floating P&L" value={<span className={`tabular font-bold ${pnlTone(market.pnl)}`}>{market.pnl == null ? '—' : `${Number(market.pnl) >= 0 ? '+' : ''}${money(market.pnl)}`}</span>} />
            <Fact label="Strategy" value={market.strategy ?? '—'} />
          </dl>
          <p className="mt-4 text-xs text-fg-subtle">Last update <TimeAgo iso={market.updated_at} /></p>
        </div>
      </AdminCard>

      {/* ── Model scorecard ──────────────────────────────────────────── */}
      {modelRun && (
        <div className="mt-6">
          <h3 className="mb-3 font-semibold text-fg">Model scorecard <span className="text-xs font-normal text-fg-subtle">· {modelRun.model_type}{modelRun.timeframe ? ` · ${modelRun.timeframe}` : ''} · out-of-sample</span></h3>
          <AdminCard>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
              <Fact label="Sharpe" value={num(modelRun.oos_sharpe)} />
              <Fact label="Hit rate" value={pct(modelRun.oos_hit_rate)} />
              <Fact label="Profit factor" value={num(modelRun.oos_profit_factor)} />
              <Fact label="Net P&L" value={<span className={`font-bold ${pnlTone(modelRun.oos_net_pnl)}`}>{money(modelRun.oos_net_pnl)}</span>} />
              <Fact label="Max drawdown" value={modelRun.oos_max_dd_pct == null ? '—' : `${num(modelRun.oos_max_dd_pct, 1)}%`} />
              <Fact label="OOS trades" value={modelRun.n_oos_trades ?? '—'} />
            </div>
            <div className="border-t border-border px-5 py-3 flex flex-wrap items-center gap-4 text-xs">
              <Verdict ok={modelRun.passed_gate} okText="Passed gate" noText="Failed gate" />
              {modelRun.beats_buy_hold != null && (
                <Verdict ok={modelRun.beats_buy_hold} okText="Beats buy & hold" noText="Below buy & hold" />
              )}
              {modelRun.buy_hold_pct != null && <span className="text-fg-subtle">Buy &amp; hold: {num(modelRun.buy_hold_pct, 1)}%</span>}
              <span className="text-fg-subtle ml-auto">Trained <TimeAgo iso={modelRun.trained_at} /></span>
            </div>
            {modelRun.gate_notes && <p className="px-5 pb-4 text-xs text-fg-muted">{modelRun.gate_notes}</p>}
          </AdminCard>
        </div>
      )}

      {/* ── Trades for this market ───────────────────────────────────── */}
      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">Trades</h3>
        <AdminCard>
          {trades.length === 0 ? (
            <div className="p-8 text-center text-sm text-fg-muted">No trades for this market yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
                  <tr>
                    <Th className="text-left pl-4">Opened</Th><Th className="text-left">Side</Th>
                    <Th className="text-right">Vol</Th><Th className="text-right">Entry</Th>
                    <Th className="text-right">Exit</Th><Th className="text-right">P&L</Th>
                    <Th className="text-left">Reason</Th><Th className="text-left pr-4">Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trades.map((t) => (
                    <tr key={t.id} className="hover:bg-surface-hover/30">
                      <Td className="pl-4 text-fg-muted whitespace-nowrap">{new Date(t.open_ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Td>
                      <Td className={`font-bold ${t.side === 'buy' ? 'text-success' : 'text-danger'}`}>{t.side.toUpperCase()}</Td>
                      <Td className="text-right tabular">{t.volume}</Td>
                      <Td className="text-right tabular">{px(t.open_price)}</Td>
                      <Td className="text-right tabular">{t.close_price == null ? '—' : px(t.close_price)}</Td>
                      <Td className={`text-right tabular font-bold ${pnlTone(t.pnl)}`}>{t.pnl == null ? '—' : `${Number(t.pnl) >= 0 ? '+' : ''}${money(t.pnl)}`}</Td>
                      <Td className="text-fg-muted">{t.close_reason ?? '—'}</Td>
                      <Td className="pr-4">
                        {t.close_ts
                          ? <span className="text-fg-subtle">Closed</span>
                          : <span className="inline-flex items-center gap-1.5 font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Open</span>}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>

      {/* ── Recent predictions ───────────────────────────────────────── */}
      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">Recent predictions <span className="text-xs font-normal text-fg-subtle">· includes signals the risk engine vetoed</span></h3>
        <AdminCard>
          {predictions.length === 0 ? (
            <div className="p-8 text-center text-sm text-fg-muted">No predictions logged for this market.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
                  <tr>
                    <Th className="text-left pl-4">Bar time</Th><Th className="text-left">Direction</Th>
                    <Th className="text-right">Edge</Th><Th className="text-right">Confidence</Th>
                    <Th className="text-left">Acted?</Th><Th className="text-left pr-4">Skip reason</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-hover/30">
                      <Td className="pl-4 text-fg-muted whitespace-nowrap">{new Date(p.ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Td>
                      <Td>
                        <span className={`font-bold ${p.direction === 'long' ? 'text-success' : p.direction === 'short' ? 'text-danger' : 'text-fg-muted'}`}>
                          {p.direction.toUpperCase()}
                        </span>
                      </Td>
                      <Td className="text-right tabular">{p.edge_bps == null ? '—' : `${num(p.edge_bps, 1)} bps`}</Td>
                      <Td className="text-right tabular">{p.confidence == null ? '—' : pct(p.confidence)}</Td>
                      <Td>{p.acted_on ? <span className="font-semibold text-success">Yes</span> : <span className="text-fg-subtle">No</span>}</Td>
                      <Td className="pr-4 text-fg-muted">{p.skip_reason ?? (p.acted_on ? '—' : '')}</Td>
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

/* ── bits ────────────────────────────────────────────────────────────── */

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-fg">{value}</dd>
    </div>
  );
}
function Verdict({ ok, okText, noText }: { ok: boolean; okText: string; noText: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${ok ? 'text-success' : 'text-danger'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-success' : 'bg-danger'}`} />
      {ok ? okText : noText}
    </span>
  );
}
function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-3 font-bold ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}
