// What the bot's indicators read — one column for a live setup, two for a
// finished trade.
//
// Shared by the pending-order card and the trade post-mortem on purpose. These
// two readings get compared constantly ("it looked like this when it was
// placed, and like this when it closed"), and two separate renderers would
// drift until the comparison stopped being trustworthy.
//
// Every value may be null: the bot returns nothing rather than half-warmed
// numbers when a window has not filled. Those render as "—", never as zero.

import type { BotSnapshot } from '@/lib/admin/trading-bot-queries';

export const TREND_NAME: Record<number, string> = {
  2: 'Strong Up', 1: 'Weak Up', 0: 'Sideways', [-1]: 'Weak Down', [-2]: 'Strong Down',
};

/** A trend as the bot reports it, from either shape it arrives in: the market
 *  row publishes a word ('Uptrend'), a snapshot publishes -2..2. */
type Trend = number | string | null | undefined;

function trendLabel(t: Trend): string {
  if (t == null) return '—';
  if (typeof t === 'string') return t;
  return TREND_NAME[t] ?? '—';
}

/** -1, 0 or 1 — direction only, which is all the verdict needs. */
function trendSign(t: Trend): number | null {
  if (t == null) return null;
  if (typeof t === 'number') return Math.sign(t);
  const s = t.toLowerCase();
  if (s.includes('up')) return 1;
  if (s.includes('down')) return -1;
  return 0;                                   // 'Sideways'
}

/** Mirrors the bot's own wording (src/live/market_review.py) so the dashboard
 *  and the Telegram alert never describe the same trade differently. */
export function agreement(side: string | null | undefined, trend: Trend): string {
  const dir = trendSign(trend);
  if (dir == null || !side) return 'unknown';
  if (dir === 0) return 'no trend';
  const long = side.toLowerCase().startsWith('b') || side.toUpperCase().startsWith('LONG');
  return (long ? dir > 0 : dir < 0) ? 'with trend' : 'against trend';
}

export function agreementTone(verdict: string): string {
  return verdict === 'with trend' ? 'text-success'
    : verdict === 'against trend' ? 'text-danger' : 'text-fg-muted';
}

function num(n: number | null | undefined, dp = 2): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return Number(n).toFixed(dp);
}

function maState(s: BotSnapshot | null | undefined): string {
  if (!s || s.ema50 == null || s.ema200 == null) return '—';
  return s.ema50 > s.ema200 ? '50 > 200' : '50 < 200';
}

function di(s: BotSnapshot | null | undefined): string {
  if (!s || s.adx == null) return '—';
  return `${num(s.adx, 0)} (+${num(s.plus_di, 0)} / −${num(s.minus_di, 0)})`;
}

interface Row { label: string; now: string; then?: string; read: string }

interface Props {
  /** The live reading, or the exit reading on a finished trade. */
  snapshot: BotSnapshot | null;
  /** The entry reading. Given only for a closed trade, which turns the table
   *  into a before/after. */
  entry?: BotSnapshot | null;
  /** 'buy' / 'sell', for the with-or-against verdict. */
  side?: string | null;
  /** Trend on the higher timeframe, which lives outside the snapshot. Accepts
   *  the word the market row publishes or the integer a snapshot carries. */
  htfTrend?: Trend;
  entryHtfTrend?: Trend;
  timeframe?: string | null;
  htf?: string | null;
  digits?: number;
}

export function IndicatorTable({
  snapshot, entry, side, htfTrend, entryHtfTrend, timeframe, htf, digits = 5,
}: Props) {
  const compare = entry !== undefined;          // two columns only for a trade
  const px = (v: number | null | undefined) =>
    v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toFixed(digits);

  const rows: Row[] = [
    {
      label: `Trend (${timeframe ?? 'M15'})`,
      then: entry?.trend == null ? '—' : TREND_NAME[entry.trend] ?? '—',
      now: snapshot?.trend == null ? '—' : TREND_NAME[snapshot.trend] ?? '—',
      read: agreement(side, compare ? entry?.trend : snapshot?.trend),
    },
    {
      label: `Higher timeframe (${htf ?? 'H1'})`,
      then: trendLabel(entryHtfTrend),
      now: trendLabel(htfTrend),
      read: agreement(side, compare ? entryHtfTrend : htfTrend),
    },
    { label: 'EMA 50 / 200', then: maState(entry), now: maState(snapshot), read: '' },
    {
      label: 'RSI 14', then: num(entry?.rsi, 1), now: num(snapshot?.rsi, 1),
      read: snapshot?.rsi == null ? ''
        : snapshot.rsi >= 70 ? 'overbought' : snapshot.rsi <= 30 ? 'oversold' : 'neutral',
    },
    {
      label: 'MACD histogram', then: num(entry?.macd_hist, 5), now: num(snapshot?.macd_hist, 5),
      read: compare && entry?.macd_hist != null && snapshot?.macd_hist != null
        ? (Math.abs(snapshot.macd_hist) < Math.abs(entry.macd_hist) ? 'momentum faded' : 'momentum building')
        : snapshot?.macd_hist == null ? ''
          : snapshot.macd_hist > 0 ? 'momentum up' : 'momentum down',
    },
    {
      label: 'ADX (+DI / −DI)', then: di(entry), now: di(snapshot),
      read: snapshot?.adx == null ? ''
        : snapshot.adx < 20 ? 'ranging'
          : snapshot.adx >= 25 ? 'trending' : 'mixed',
    },
    {
      label: 'ATR 14', then: px(entry?.atr), now: px(snapshot?.atr),
      read: compare && entry?.atr && snapshot?.atr
        ? `volatility ${(((snapshot.atr - entry.atr) / Math.abs(entry.atr)) * 100).toFixed(0)}%`
        : '',
    },
    {
      label: 'Bollinger z', then: num(entry?.bb_z, 2), now: num(snapshot?.bb_z, 2),
      read: snapshot?.bb_z == null ? ''
        : Math.abs(snapshot.bb_z) >= 2 ? 'stretched'
          : Math.abs(snapshot.bb_z) >= 1 ? 'extended' : 'mid-band',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
          <tr>
            <th className="px-3 py-2.5 pl-4 text-left font-bold">Indicator</th>
            {compare && <th className="px-3 py-2.5 text-right font-bold">At entry</th>}
            <th className="px-3 py-2.5 text-right font-bold">{compare ? 'At exit' : 'Now'}</th>
            <th className="px-3 py-2.5 pr-4 text-left font-bold">Read</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.label} className="hover:bg-surface-hover/30">
              <td className="px-3 py-2.5 pl-4 text-fg">{r.label}</td>
              {compare && <td className="px-3 py-2.5 text-right tabular text-fg-muted">{r.then}</td>}
              <td className="px-3 py-2.5 text-right tabular text-fg">{r.now}</td>
              <td className={`px-3 py-2.5 pr-4 ${agreementTone(r.read)}`}>{r.read}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
