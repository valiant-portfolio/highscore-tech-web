// /trade/[ticket] on bot.highzcore.tech — the post-mortem for one trade.
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
import { TradeAnalysis } from '@/components/admin/bot/TradeAnalysis';
import { IndicatorTable, agreement, agreementTone } from '@/components/admin/bot/IndicatorTable';
import { CancelOrderButton } from '@/components/admin/bot/CancelOrderButton';
import { getBotTrade, getPendingOrder } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

interface PageProps { params: Promise<{ ticket: string }> }

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

export default async function BotTradePage({ params }: PageProps) {
  const { ticket } = await params;
  const n = Number(ticket);
  if (!Number.isFinite(n)) notFound();

  const { trade, analysis, bars, timeframe, digits } = await getBotTrade(n);
  // No trade row does not mean no such ticket. The bot writes a trade only on
  // the FILL, so an order still resting has its ticket on bot_market_state and
  // nowhere else — and that is exactly the alert that links here: "not yet
  // filled, this is the one to analyse". It used to 404.
  if (!trade) return <PendingOrderPage ticket={n} />;

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
        back={{ href: `/${encodeURIComponent(trade.symbol)}`, label: 'Back to market' }}
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
            <IndicatorTable
              snapshot={exit}
              entry={entry}
              side={trade.side}
              htfTrend={trade.exit_htf_trend}
              entryHtfTrend={trade.entry_htf_trend}
              timeframe={trade.timeframe}
              htf={timeframe === 'H1' ? 'D1' : 'H1'}
              digits={digits}
            />
          )}
        </AdminCard>
      </div>

      {/* ── The analyst's reading ────────────────────────────────────── */}
      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">
          What we saw
          <span className="text-xs font-normal text-fg-subtle"> · read while the order was pending, kept with the trade</span>
        </h3>
        <AdminCard>
          {/* Deliberately below the bot's reading: mark the chart first, read
              the bot second, write the gap third. The routine only works in
              that order — "once you have read what the bot thought, you
              cannot unsee it". */}
          <TradeAnalysis
            ticket={Number(trade.ticket)}
            symbol={trade.symbol}
            note={analysis?.note ?? null}
            imageUrl={analysis?.imageUrl ?? null}
            at={analysis?.updated_at ?? null}
            by={analysis?.created_by ?? null}
          />
        </AdminCard>
      </div>

      <p className="mt-4 text-xs text-fg-subtle">
        Readings come from the bot at the moment it acted, using the same
        strictly-causal indicators it trades on — not recomputed here.{' '}
        <Link className="underline" href={`/${encodeURIComponent(trade.symbol)}`}>
          See every trade on {trade.symbol}
        </Link>.
      </p>
    </>
  );
}


/**
 * The same page, for an order that has not filled.
 *
 * Deliberately not the post-mortem: there is no entry, no exit, no P&L and no
 * result to explain. There is a level, a reason, what every indicator reads
 * right now — and the two things that can still be done about it: write what
 * you see, or cancel it. "Issues are found during the pending order; when it
 * becomes a position we only monitor it."
 */
async function PendingOrderPage({ ticket }: { ticket: number }) {
  const { market, analysis, bars, timeframe, digits } = await getPendingOrder(ticket);
  if (!market) notFound();

  const px = (v: number | null | undefined) =>
    v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toFixed(digits);
  const side = (market.latest_signal ?? '').toUpperCase().startsWith('SELL')
    || (market.latest_signal ?? '').toUpperCase().startsWith('SHORT') ? 'sell' : 'buy';

  return (
    <>
      <PageHead
        title={`${market.alias} · order resting`}
        description={`Ticket ${ticket} · ${market.latest_signal ?? 'pending'} · not filled yet`}
        back={{ href: `/${encodeURIComponent(market.symbol)}`, label: 'Back to market' }}
        actions={<CancelOrderButton symbol={market.symbol} alias={market.alias} ticket={ticket} level={market.level} />}
      />

      <AdminCard>
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`font-bold ${side === 'buy' ? 'text-success' : 'text-danger'}`}>
              {side === 'buy' ? 'BUY LIMIT' : 'SELL LIMIT'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
              waiting to fill
            </span>
            {market.is_dry_run && (
              <span className="rounded bg-surface-hover px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fg-subtle">Paper</span>
            )}
            <span className="text-sm text-fg-muted">{market.reason ?? '—'}</span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
            <Fact label="Level" value={<span className="tabular">{px(market.level)}</span>} />
            <Fact label="Price now" value={<span className="tabular">{px(market.price)}</span>} />
            <Fact label="Stop" value={<span className="tabular">{px(market.sl)}</span>} />
            <Fact label="Target" value={<span className="tabular">{px(market.tp)}</span>} />
            <Fact label="Trend (H1)" value={<span className="text-sm">{market.htf_trend ?? '—'}</span>} />
            <Fact label={`Trend (${market.timeframe ?? 'M15'})`} value={<span className="text-sm">{market.entry_trend ?? '—'}</span>} />
          </dl>

          <p className="mt-5 text-xs text-fg-subtle">
            Nothing has been risked yet — the order has not filled. Cancelling
            costs the setup and nothing else.
          </p>
        </div>
      </AdminCard>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">
          How the market got here
          <span className="text-xs font-normal text-fg-subtle"> · {timeframe} · the run-up to the level</span>
        </h3>
        <AdminCard>
          <div className="p-3">
            <TradeChart
              bars={bars}
              side={side}
              openTs={null}
              openPrice={market.level}
              closeTs={null}
              closePrice={null}
              sl={market.sl}
              tp={market.tp}
              digits={digits}
              timeframe={timeframe}
            />
          </div>
        </AdminCard>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">
          What the indicators say
          <span className="text-xs font-normal text-fg-subtle"> · right now, on the market this order rests in</span>
        </h3>
        <AdminCard>
          {market.snapshot ? (
            <IndicatorTable
              snapshot={market.snapshot}
              side={side}
              htfTrend={market.htf_trend}
              timeframe={market.timeframe}
              htf={market.htf}
              digits={digits}
            />
          ) : (
            <div className="p-8 text-center text-sm text-fg-muted">
              No indicator reading yet. It arrives with the bot's next write.
            </div>
          )}
        </AdminCard>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-fg">
          What we see
          <span className="text-xs font-normal text-fg-subtle"> · written now, while it can still be acted on</span>
        </h3>
        <AdminCard>
          <TradeAnalysis
            ticket={ticket}
            symbol={market.symbol}
            note={analysis?.note ?? null}
            imageUrl={analysis?.imageUrl ?? null}
            at={analysis?.updated_at ?? null}
            by={analysis?.created_by ?? null}
            verdict={analysis?.verdict ?? null}
            issue={analysis?.issue ?? null}
            context={{ side: market.latest_signal, level: market.level, sl: market.sl, tp: market.tp }}
          />
        </AdminCard>
      </div>
    </>
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
