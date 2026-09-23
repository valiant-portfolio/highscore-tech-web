// /admin/trading-bot/trade/[ticket] — the post-mortem for one trade.
//
// The P&L column says what happened. This page answers why: the chart of what
// price actually did, and what every indicator read at the entry bar versus the
// exit bar. Both come from the bot — the readings are the same strictly-causal
// indicators it trades on, snapshotted at the moment it acted, not recomputed
// here with hindsight.
//
// Keyed by broker TICKET, because that is what the Telegram alert, the MT5
// terminal and the log all call a trade. The "Open chart" button on an alert
// lands exactly here.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import TradeChart from '@/components/admin/bot/TradeChart';
import { getBotTrade, type BotSnapshot, type BotTrade } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

interface PageProps { params: Promise<{ ticket: string }> }

const TREND_NAME: Record<number, string> = {
  2: 'Strong Up', 1: 'Weak Up', 0: 'Sideways', [-1]: 'Weak Down', [-2]: 'Strong Down',
};

function money(n: number | null | undefined, dp = 2): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  const x = Number(n);
  return `${x < 0 ? '−' : ''}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}
function num(n: number | null | undefined, dp = 2): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return Number(n).toFixed(dp);
}
function pnlTone(n: number | null | undefined): string {
  if (n == null) return 'text-fg-muted';
  return Number(n) > 0 ? 'text-success' : Number(n) < 0 ? 'text-danger' : 'text-fg-muted';
}
function when(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  }) + ' UTC';
}

/** How the trade's direction sat against a trend reading. Mirrors the bot's own
 *  wording (src/live/market_review.py) so the page and the alert never disagree. */
function agreement(side: string, trend: number | null | undefined): string {
  if (trend == null) return 'unknown';
  if (trend === 0) return 'no trend';
  const aligned = side === 'buy' ? trend > 0 : trend < 0;
  return aligned ? 'with trend' : 'against trend';
}
function agreementTone(verdict: string): string {
  return verdict === 'with trend' ? 'text-success'
    : verdict === 'against trend' ? 'text-danger' : 'text-fg-muted';
}

export default async function BotTradePage({ params }: PageProps) {
  const { ticket } = await params;
  const n = Number(ticket);
  if (!Number.isFinite(n)) notFound();

  const { trade, bars, timeframe, digits } = await getBotTrade(n);
  if (!trade) notFound();

  const px = (v: number | null | undefined) =>
    v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toFixed(digits);

  const entry = trade.entry_snapshot;
  const exit = trade.exit_snapshot;
  const verdict = trade.trend_agreement ?? agreement(trade.side, trade.entry_trend);
  const isOpen = !trade.close_ts;

  return (
    <>
      <PageHead
        title={`${trade.side.toUpperCase()} ${trade.symbol}`}
        description={`Ticket ${trade.ticket} · ${trade.strategy ?? 'unknown strategy'} · ${trade.timeframe ?? timeframe}`}
        back={{ href: `/admin/trading-bot/${encodeURIComponent(trade.symbol)}`, label: 'Back to market' }}
      />

      {/* ── Result ───────────────────────────────────────────────────── */}
      <AdminCard>
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`font-bold ${trade.side === 'buy' ? 'text-success' : 'text-danger'}`}>
              {trade.side === 'buy' ? 'LONG' : 'SHORT'}
            </span>
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${agreementTone(verdict)} bg-surface-hover`}>
              {verdict}
            </span>
            {isOpen
              ? <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />Still open</span>
              : <span className="text-sm text-fg-muted">{trade.close_reason ?? 'closed'}</span>}
            {trade.is_dry_run && (
              <span className="rounded bg-surface-hover px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fg-subtle">Paper</span>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
            <Fact label="P&L" value={<span className={`tabular font-bold ${pnlTone(trade.pnl)}`}>{trade.pnl == null ? '—' : `${Number(trade.pnl) >= 0 ? '+' : ''}${money(trade.pnl)}`}</span>} />
            <Fact label="R multiple" value={<span className="tabular">{trade.r_multiple == null ? '—' : `${Number(trade.r_multiple) >= 0 ? '+' : ''}${num(trade.r_multiple)}R`}</span>} />
            <Fact label="Entry" value={<span className="tabular">{px(trade.open_price)}</span>} />
            <Fact label="Exit" value={<span className="tabular">{px(trade.close_price)}</span>} />
            <Fact label="Stop" value={<span className="tabular">{px(trade.sl)}</span>} />
            <Fact label="Target" value={<span className="tabular">{px(trade.tp)}</span>} />
          </dl>

          <dl className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
            <Fact label="Opened" value={<span className="text-sm">{when(trade.open_ts)}</span>} />
            <Fact label="Closed" value={<span className="text-sm">{when(trade.close_ts)}</span>} />
            <Fact label="Volume" value={<span className="tabular">{trade.volume}</span>} />
            <Fact label="Best in favour" value={<span className="tabular text-success">{trade.mfe == null ? '—' : `+${px(trade.mfe)}`}</span>} />
            <Fact label="Worst against" value={<span className="tabular text-danger">{trade.mae == null ? '—' : px(trade.mae)}</span>} />
            <Fact label="Entry spread" value={<span className="tabular">{trade.entry_spread == null ? '—' : px(trade.entry_spread)}</span>} />
          </dl>
        </div>
      </AdminCard>

      {/* ── How the market went ──────────────────────────────────────── */}
      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">
          How the market went
          <span className="text-xs font-normal text-fg-subtle"> · {timeframe} · entry, exit, stop and target marked</span>
        </h3>
        <AdminCard>
          <div className="p-3">
            <TradeChart
              bars={bars}
              side={trade.side}
              openTs={trade.open_ts}
              openPrice={trade.open_price}
              closeTs={trade.close_ts}
              closePrice={trade.close_price}
              sl={trade.sl}
              tp={trade.tp}
              digits={digits}
              timeframe={timeframe}
            />
          </div>
        </AdminCard>
      </div>

      {/* ── What the indicators said ─────────────────────────────────── */}
      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">
          What the indicators said
          <span className="text-xs font-normal text-fg-subtle"> · read at the entry bar and again at the exit</span>
        </h3>
        <AdminCard>
          {!entry && !exit ? (
            <div className="p-8 text-center text-sm text-fg-muted">
              No indicator snapshot for this trade. Only trades opened after the
              review shipped carry one, and it cannot be backfilled — it needs
              bars the terminal may no longer serve.
            </div>
          ) : (
            <Indicators trade={trade} entry={entry} exit={exit} digits={digits} />
          )}
        </AdminCard>
      </div>

      <p className="mt-4 text-xs text-fg-subtle">
        Readings come from the bot at the moment it acted, using the same
        strictly-causal indicators it trades on — not recomputed here.{' '}
        <Link className="underline" href={`/admin/trading-bot/${encodeURIComponent(trade.symbol)}`}>
          See every trade on {trade.symbol}
        </Link>.
      </p>
    </>
  );
}

/* ── indicator table ─────────────────────────────────────────────────── */

function Indicators({ trade, entry, exit, digits }: {
  trade: BotTrade;
  entry: BotSnapshot | null;
  exit: BotSnapshot | null;
  digits: number;
}) {
  const px = (v: number | null | undefined) =>
    v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toFixed(digits);
  const maState = (s: BotSnapshot | null) => {
    if (!s || s.ema50 == null || s.ema200 == null) return '—';
    return s.ema50 > s.ema200 ? '50 > 200' : '50 < 200';
  };
  const di = (s: BotSnapshot | null) => {
    if (!s || s.adx == null) return '—';
    return `${num(s.adx, 0)} (+${num(s.plus_di, 0)} / −${num(s.minus_di, 0)})`;
  };

  const rows: { label: string; entry: string; exit: string; read: string }[] = [
    {
      label: `Trend (${trade.timeframe ?? 'M15'})`,
      entry: trade.entry_trend == null ? '—' : TREND_NAME[trade.entry_trend] ?? '—',
      exit: trade.exit_trend == null ? '—' : TREND_NAME[trade.exit_trend] ?? '—',
      read: agreement(trade.side, trade.entry_trend),
    },
    {
      label: 'Higher timeframe',
      entry: trade.entry_htf_trend == null ? '—' : TREND_NAME[trade.entry_htf_trend] ?? '—',
      exit: trade.exit_htf_trend == null ? '—' : TREND_NAME[trade.exit_htf_trend] ?? '—',
      read: agreement(trade.side, trade.entry_htf_trend),
    },
    { label: 'EMA 50 / 200', entry: maState(entry), exit: maState(exit), read: '' },
    {
      label: 'RSI 14', entry: num(entry?.rsi, 1), exit: num(exit?.rsi, 1),
      read: exit?.rsi == null ? ''
        : exit.rsi >= 70 ? 'overbought' : exit.rsi <= 30 ? 'oversold' : 'neutral',
    },
    {
      label: 'MACD histogram', entry: num(entry?.macd_hist, 5), exit: num(exit?.macd_hist, 5),
      read: entry?.macd_hist == null || exit?.macd_hist == null ? ''
        : Math.abs(exit.macd_hist) < Math.abs(entry.macd_hist) ? 'momentum faded' : 'momentum building',
    },
    {
      label: 'ADX (+DI / −DI)', entry: di(entry), exit: di(exit),
      read: entry?.adx == null || exit?.adx == null ? ''
        : exit.adx < 20 ? 'ranging' : exit.adx > entry.adx ? 'trend strengthened' : 'trend weakened',
    },
    {
      label: 'ATR 14', entry: px(entry?.atr), exit: px(exit?.atr),
      read: entry?.atr && exit?.atr
        ? `volatility ${(((exit.atr - entry.atr) / Math.abs(entry.atr)) * 100).toFixed(0)}%` : '',
    },
    {
      label: 'Bollinger z', entry: num(entry?.bb_z, 2), exit: num(exit?.bb_z, 2),
      read: exit?.bb_z == null ? ''
        : Math.abs(exit.bb_z) >= 2 ? 'stretched' : Math.abs(exit.bb_z) >= 1 ? 'extended' : 'mid-band',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
        <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
          <tr>
            <th className="px-3 py-3 pl-4 text-left font-bold">Indicator</th>
            <th className="px-3 py-3 text-right font-bold">At entry</th>
            <th className="px-3 py-3 text-right font-bold">At exit</th>
            <th className="px-3 py-3 pr-4 text-left font-bold">Read</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.label} className="hover:bg-surface-hover/30">
              <td className="px-3 py-3 pl-4 text-fg">{r.label}</td>
              <td className="px-3 py-3 text-right tabular text-fg-muted">{r.entry}</td>
              <td className="px-3 py-3 text-right tabular text-fg">{r.exit}</td>
              <td className={`px-3 py-3 pr-4 ${agreementTone(r.read)}`}>{r.read}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-fg">{value}</dd>
    </div>
  );
}
