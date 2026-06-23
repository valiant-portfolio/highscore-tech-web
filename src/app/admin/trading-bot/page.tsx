// /admin/trading-bot — live view of the forex bot: per-market performance +
// controls (lot size, enable/disable), recent signals, trades, the event log,
// and daily summaries. Data is written by the bot (forex-bot/) into Supabase.

import { Activity, LineChart, Radio, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { TradingBotControls } from '@/components/admin/TradingBotControls';
import { getTradingBot } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function dt(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function r(n: number | null): string {
  if (n == null) return '—';
  const x = Number(n);
  if (!Number.isFinite(x)) return '—';
  return `${x >= 0 ? '+' : ''}${x.toFixed(2)}R`;
}
function money(n: number | null): string {
  if (n == null) return '—';
  const x = Number(n);
  if (!Number.isFinite(x)) return '—';
  return `${x < 0 ? '−' : ''}$${Math.abs(x).toFixed(2)}`;
}
const resultTone: Record<string, string> = { win: 'text-success', loss: 'text-danger', breakeven: 'text-fg-muted' };

export default async function TradingBotPage() {
  const { markets, signals, trades, events, summaries, lastHeartbeat } = await getTradingBot();
  const fresh = lastHeartbeat ? (Date.now() - new Date(lastHeartbeat).getTime()) < 10 * 60 * 1000 : false;

  return (
    <>
      <PageHead
        title="Trading Bot"
        description="Live gold (XAUUSD) structure bot — signals, trades, performance and controls. The bot reads the lot size / enabled flags below and obeys them."
        actions={
          <span className={`inline-flex items-center gap-2 h-9 px-3 rounded-md text-xs font-bold ${fresh ? 'bg-success/15 text-success' : 'bg-fg-subtle/10 text-fg-muted'}`}>
            <Radio className="h-3.5 w-3.5" /> {fresh ? 'Bot online' : 'No recent activity'} · {timeAgo(lastHeartbeat)}
          </span>
        }
      />

      {/* Per-market performance + controls */}
      {markets.length === 0 ? (
        <AdminCard className="mb-6"><p className="p-6 text-sm text-fg-muted text-center">No markets configured yet.</p></AdminCard>
      ) : (
        <div className="space-y-4 mb-8">
          {markets.map((m) => {
            const decided = m.wins + m.losses;
            const winPct = decided > 0 ? Math.round((m.wins / decided) * 100) : 0;
            return (
              <AdminCard key={m.symbol}>
                <div className="p-5 md:p-6">
                  <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <h2 className="font-display text-lg md:text-xl font-bold text-fg inline-flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-brand" /> {m.symbol}
                      {m.note && <span className="text-xs font-medium text-fg-subtle">· {m.note}</span>}
                    </h2>
                    <TradingBotControls symbol={m.symbol} enabled={m.enabled} lotSize={Number(m.lot_size)} />
                  </header>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Kpi label="Record (W–L)" value={`${m.wins}–${m.losses}`} hint={`${winPct}% win · ${m.breakeven} BE`} />
                    <Kpi label="Net R" value={r(Number(m.net_r))} tone={Number(m.net_r) >= 0 ? 'success' : 'danger'} />
                    <Kpi label="Net P/L" value={money(Number(m.net_profit))} tone={Number(m.net_profit) >= 0 ? 'success' : 'danger'} />
                    <Kpi label="Lot size" value={Number(m.lot_size).toFixed(2)} hint={m.enabled ? 'trading enabled' : 'disabled'} tone={m.enabled ? 'brand' : 'default'} />
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent signals */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <header className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="font-display text-lg font-bold text-fg inline-flex items-center gap-2"><Activity className="h-5 w-5 text-brand" /> Recent signals</h2>
              <span className="text-xs text-fg-subtle">{signals.length}</span>
            </header>
            {signals.length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-6">No signals yet.</p>
            ) : (
              <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {signals.map((s) => (
                  <li key={s.id} className="rounded-md border border-border bg-surface/30 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold ${s.side === 'LONG' ? 'text-success' : 'text-danger'}`}>{s.state}</span>
                      <span className="text-xs text-fg-subtle">{dt(s.created_at)}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-fg-muted">
                      entry {s.entry ?? '—'} · SL {s.sl ?? '—'} · TP {s.tp ?? '—'} {s.rr ? `· 1:${Number(s.rr).toFixed(1)}` : ''}
                    </p>
                    {s.topdown && <p className="mt-0.5 text-[11px] text-fg-subtle">{s.topdown}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AdminCard>

        {/* Recent trades */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <header className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="font-display text-lg font-bold text-fg inline-flex items-center gap-2"><TrendingUp className="h-5 w-5 text-brand" /> Recent trades</h2>
              <span className="text-xs text-fg-subtle">{trades.length}</span>
            </header>
            {trades.length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-6">No trades yet.</p>
            ) : (
              <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {trades.map((t) => (
                  <li key={t.id} className="rounded-md border border-border bg-surface/30 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold ${t.side === 'LONG' ? 'text-success' : 'text-danger'}`}>{t.side} {t.lot}</span>
                      <span className={`font-mono font-bold ${t.result ? resultTone[t.result] ?? 'text-fg' : 'text-fg-muted'}`}>
                        {t.closed_at ? `${t.result ?? ''} ${r(t.r_multiple)} · ${money(t.profit)}` : 'open'}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-fg-muted">
                      entry {t.entry ?? '—'} → {t.exit_price ?? '…'} · {dt(t.opened_at)}
                    </p>
                    {t.close_reason && <p className="mt-0.5 text-[11px] text-fg-subtle">{t.close_reason}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AdminCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Event log */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <header className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="font-display text-lg font-bold text-fg inline-flex items-center gap-2"><Radio className="h-5 w-5 text-brand" /> Event log</h2>
              <span className="text-xs text-fg-subtle">{events.length}</span>
            </header>
            {events.length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-6">No events yet — run the bot.</p>
            ) : (
              <ul className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 font-mono text-xs">
                {events.map((e) => (
                  <li key={e.id} className={`flex items-start gap-2 ${e.level === 'error' ? 'text-danger' : 'text-fg-muted'}`}>
                    {e.level === 'error' && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                    <span className="text-fg-subtle shrink-0">{dt(e.created_at)}</span>
                    <span className="uppercase text-[10px] font-bold shrink-0 mt-0.5">{e.kind}</span>
                    <span className="break-all">{e.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AdminCard>

        {/* Daily summaries */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <header className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="font-display text-lg font-bold text-fg inline-flex items-center gap-2"><TrendingDown className="h-5 w-5 text-brand" /> Daily summaries</h2>
              <span className="text-xs text-fg-subtle">{summaries.length}</span>
            </header>
            {summaries.length === 0 ? (
              <p className="text-sm text-fg-muted text-center py-6">No daily summaries yet.</p>
            ) : (
              <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {summaries.map((s) => (
                  <li key={s.id} className="rounded-md border border-border bg-surface/30 p-3 flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-fg">{new Date(s.day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-fg-subtle">{s.symbol} · {s.trades} trades · {s.wins}W {s.losses}L</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className={`font-bold ${s.net_r >= 0 ? 'text-success' : 'text-danger'}`}>{r(s.net_r)}</p>
                      <p className="text-xs text-fg-muted">{money(s.net_profit)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
