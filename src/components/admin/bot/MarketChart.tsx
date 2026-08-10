'use client';

// Candlestick chart for one market, TradingView Lightweight Charts (MIT).
//
// Data is read STRAIGHT FROM SUPABASE in the browser — no Next.js API route, so
// no Netlify Function per tick. Access is gated by admin-only RLS
// (trading-bot-db/frontend_admin_read_policies.sql): only a logged-in admin or
// trading-bot staff can SELECT these tables; the anon key alone reads nothing.
//   • history  → bot_bars (OHLCV) + this market's bot_trades
//   • live     → bot_quotes (bid/ask) + bot_market_state (floating P&L), ~3s
//
// Overlays for an open position OR a resting PENDING order: a blue ENTRY line
// (solid once filled, dashed while the order is still pending) plus dashed SL/TP,
// all drawn by default. The selected market + timeframe persist across a refresh
// (localStorage). Client-side indicators (MA/EMA/Bollinger) and manual drawings
// (h-line/trend) are drawn on top.

import { useEffect, useRef, useState } from 'react';
import { createBotClient } from '@/lib/supabase/bot-client';
import { CandlestickChart, MousePointer2, Minus, PenLine, Eraser, Maximize2, Minimize2 } from 'lucide-react';
import {
  createChart, CandlestickSeries, LineSeries, LineStyle, createSeriesMarkers,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type Time,
  type SeriesMarker, type IPriceLine, type ISeriesMarkersPluginApi,
  type MouseEventParams,
} from 'lightweight-charts';

type Tool = 'cursor' | 'hline' | 'trend';

// One browser Supabase client for the module, pointed at the BOT project — the
// bot_* tables no longer live in the main app's database. There is no shared
// session across projects, so these reads are governed by the bot project's own
// RLS policies rather than by the logged-in user.
const supabase = createBotClient();

const STORE_KEY = 'bot-chart-selection'; // persists {symbol, tf} across a refresh

// v6: bot_bars now syncs 8 timeframes. The DB stores D1/W1 but Olivia's picker
// labels them Day1/WK1 — so keep label + value separate. M1 is deliberately NOT
// synced (Deriv caps its history); leaving it out avoids an empty chart.
// v7: bot_bars syncs ONLY M15 and H1 now — every other timeframe returns empty.
const TIMEFRAMES: { label: string; value: string }[] = [
  { label: 'M15', value: 'M15' },
  { label: 'H1', value: 'H1' },
];
const TF_VALUES = TIMEFRAMES.map((t) => t.value);
const TF_SECONDS: Record<string, number> = {
  M15: 900, H1: 3600,
};
// The live quote only rolls a brand-new forming candle for intraday buckets,
// where UTC-epoch alignment matches the broker's bars. For H4 and higher we just
// extend the last historical bar with the live price (epoch buckets wouldn't line
// up with the broker's week/month boundaries and would paint a spurious bar).
const INTRADAY_MAX_SECS = 3600;

type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number };

function utcTz(dateStrOrMs: string | number): UTCTimestamp {
  const ms = typeof dateStrOrMs === 'string' ? new Date(dateStrOrMs).getTime() : dateStrOrMs;
  return (Math.floor(ms / 1000) + new Date().getTimezoneOffset() * 60) as UTCTimestamp;
}
interface Trade {
  id: string; side: string; open_ts: string; open_price: number;
  close_ts: string | null; close_price: number | null; sl: number | null; tp: number | null;
  pnl: number | null; close_reason: string | null;
}

const fmt = (n: number | null | undefined, digits: number) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toFixed(digits);

interface Quote { bid: number | null; ask: number | null; spread: number | null; updated_at: string | null; pnl: number | null; state: string | null }

/* ── Indicators (computed client-side from the loaded candles) ─────────── */
type IndId = 'sma20' | 'sma50' | 'ema20' | 'boll';
const IND_META: { id: IndId; label: string; color: string; title: string }[] = [
  { id: 'sma20', label: 'MA20', color: '#f59e0b', title: 'Simple moving average (20)' },
  { id: 'sma50', label: 'MA50', color: '#a855f7', title: 'Simple moving average (50)' },
  { id: 'ema20', label: 'EMA20', color: '#06b6d4', title: 'Exponential moving average (20)' },
  { id: 'boll', label: 'BOLL', color: '#94a3b8', title: 'Bollinger Bands (20, 2σ)' },
];
type LinePt = { time: UTCTimestamp; value: number };

function sma(bars: Candle[], period: number): LinePt[] {
  const out: LinePt[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) sum -= bars[i - period].close;
    if (i >= period - 1) out.push({ time: bars[i].time, value: sum / period });
  }
  return out;
}
function ema(bars: Candle[], period: number): LinePt[] {
  const out: LinePt[] = [];
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < bars.length; i++) {
    const c = bars[i].close;
    prev = i === 0 ? c : c * k + prev * (1 - k);
    if (i >= period - 1) out.push({ time: bars[i].time, value: prev });
  }
  return out;
}
function bollinger(bars: Candle[], period: number, mult: number): { upper: LinePt[]; mid: LinePt[]; lower: LinePt[] } {
  const upper: LinePt[] = [], mid: LinePt[] = [], lower: LinePt[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += bars[j].close;
    const m = s / period;
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) { const d = bars[j].close - m; v += d * d; }
    const sd = Math.sqrt(v / period);
    const t = bars[i].time;
    mid.push({ time: t, value: m });
    upper.push({ time: t, value: m + mult * sd });
    lower.push({ time: t, value: m - mult * sd });
  }
  return { upper, mid, lower };
}

export function MarketChart({
  markets, openTrades = [],
}: {
  markets: { symbol: string; alias: string }[];
  openTrades?: { symbol: string; side: string }[];
}) {
  // A market's label reads "Alias — SYMBOL", but when the alias IS the symbol
  // (e.g. NZDUSD) that renders as "NZDUSD — NZDUSD". Show it once in that case.
  const label = (sym: string) => {
    const m = markets.find((x) => x.symbol === sym);
    const a = m?.alias;
    return a && a !== sym ? `${a} — ${sym}` : sym;
  };
  // Symbols that currently hold an open trade (deduped), with a side for the dot.
  const openBySymbol = new Map<string, string>();
  for (const t of openTrades) if (!openBySymbol.has(t.symbol)) openBySymbol.set(t.symbol, t.side);

  // Restore the last-viewed market + timeframe so a refresh keeps your place.
  const [symbol, setSymbol] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
        if (s.symbol && markets.some((m) => m.symbol === s.symbol)) return s.symbol as string;
      } catch { /* ignore */ }
    }
    return markets[0]?.symbol ?? '';
  });
  const [tf, setTf] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
        if (s.tf && TF_VALUES.includes(s.tf)) return s.tf as string;
      } catch { /* ignore */ }
    }
    return 'M15';
  });
  const [digits, setDigits] = useState(5);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [tool, setTool] = useState<Tool>('cursor');
  const [fs, setFs] = useState(false);
  const [inds, setInds] = useState<Set<IndId>>(new Set());

  const cardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const liveBar = useRef<Candle | null>(null);
  const overlayLines = useRef<IPriceLine[]>([]);          // entry / SL / TP (open or pending)
  const tradeSL = useRef<number | null>(null);
  const tradeTP = useRef<number | null>(null);
  const markersApi = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const activeSide = useRef<'buy' | 'sell' | null>(null); // side of the open trade, for the live P&L line
  // Drawings (manual annotations).
  const toolRef = useRef<Tool>('cursor');
  const drawHLines = useRef<IPriceLine[]>([]);
  const drawTrends = useRef<ISeriesApi<'Line'>[]>([]);
  const trendStart = useRef<{ time: Time; value: number } | null>(null);
  // Indicators.
  const barsRef = useRef<Candle[]>([]);
  const indsRef = useRef<Set<IndId>>(inds);
  const indSeries = useRef<ISeriesApi<'Line'>[]>([]);

  useEffect(() => { toolRef.current = tool; }, [tool]);

  const alias = markets.find((m) => m.symbol === symbol)?.alias ?? symbol;

  const clearDrawings = () => {
    drawHLines.current.forEach((l) => seriesRef.current?.removePriceLine(l));
    drawHLines.current = [];
    drawTrends.current.forEach((s) => chartRef.current?.removeSeries(s));
    drawTrends.current = [];
    trendStart.current = null;
  };

  // Draw the active indicators from the currently-loaded candles. Clear-then-draw
  // so it's idempotent: called both when the candles reload and when a toggle flips.
  const redrawIndicators = () => {
    const chart = chartRef.current;
    if (!chart) return;
    indSeries.current.forEach((s) => chart.removeSeries(s));
    indSeries.current = [];
    const bars = barsRef.current;
    if (!bars.length) return;
    const addLine = (data: LinePt[], color: string, dashed = false) => {
      const s = chart.addSeries(LineSeries, {
        color, lineWidth: dashed ? 1 : 2,
        lineStyle: dashed ? LineStyle.Dashed : LineStyle.Solid,
        priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
      });
      s.setData(data);
      indSeries.current.push(s);
    };
    for (const id of indsRef.current) {
      if (id === 'boll') {
        const { upper, mid, lower } = bollinger(bars, 20, 2);
        addLine(upper, '#94a3b8', true);
        addLine(mid, '#94a3b8', false);
        addLine(lower, '#94a3b8', true);
      } else if (id === 'sma20') {
        addLine(sma(bars, 20), '#f59e0b');
      } else if (id === 'sma50') {
        addLine(sma(bars, 50), '#a855f7');
      } else if (id === 'ema20') {
        addLine(ema(bars, 20), '#06b6d4');
      }
    }
  };

  const toggleInd = (id: IndId) => setInds((prev) => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  useEffect(() => { indsRef.current = inds; redrawIndicators(); }, [inds]);

  // Fullscreen (native) on the chart card.
  const toggleFullscreen = () => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  };
  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Persist the selection.
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ symbol, tf })); } catch { /* ignore */ }
  }, [symbol, tf]);

  // ── Create the chart once ─────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;
    const chart = createChart(wrapRef.current, {
      autoSize: true,
      layout: { background: { color: 'transparent' }, textColor: '#98A2B3', fontFamily: 'inherit' },
      grid: { vertLines: { color: 'rgba(255,255,255,0.05)' }, horzLines: { color: 'rgba(255,255,255,0.05)' } },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', downColor: '#ef4444', wickUpColor: '#22c55e', wickDownColor: '#ef4444',
      borderVisible: false,
    });
    chartRef.current = chart;
    seriesRef.current = series;

    // Drawing: a click places a horizontal line at the price, or the two ends of
    // a trend line. Reads the current tool from a ref so we subscribe only once.
    const onClick = (param: MouseEventParams) => {
      const t = toolRef.current;
      // Cursor is a plain crosshair now; SL/TP overlays are always drawn.
      if (t === 'cursor') return;
      if (!param.point || param.time === undefined) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price == null) return;
      if (t === 'hline') {
        drawHLines.current.push(series.createPriceLine({ price, color: '#94a3b8', lineWidth: 1, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: '' }));
      } else if (t === 'trend') {
        const pt = { time: param.time as Time, value: price };
        if (!trendStart.current) { trendStart.current = pt; return; }
        const line = chart.addSeries(LineSeries, { color: '#eab308', lineWidth: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
        const pts = [trendStart.current, pt].sort((a, b) => (a.time as number) - (b.time as number));
        line.setData(pts);
        drawTrends.current.push(line);
        trendStart.current = null;
      }
    };
    chart.subscribeClick(onClick);

    return () => { chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, []);

  // ── Load history + trades when symbol/timeframe changes ───────────────
  useEffect(() => {
    if (!symbol) return;
    let alive = true;
    setLoading(true);
    liveBar.current = null;
    clearDrawings(); // manual annotations don't carry across markets/timeframes

    (async () => {
      // Read straight from Supabase (admin-gated by RLS) — no Netlify Function.
      const [barsRes, tradesRes, quoteRes, stateRes] = await Promise.all([
        // Order DESCENDING then flip to ascending below: `.limit()` keeps the rows
        // the DB returns FIRST, so ascending+limit would hand back the OLDEST 1500
        // bars and cut off everything recent (the chart froze days in the past).
        supabase.from('bot_bars').select('ts,open,high,low,close')
          .eq('symbol', symbol).eq('timeframe', tf).order('ts', { ascending: false }).limit(1500),
        supabase.from('bot_trades').select('id,side,open_ts,open_price,close_ts,close_price,sl,tp,pnl,close_reason')
          .eq('symbol', symbol).order('open_ts', { ascending: false }).limit(300),
        supabase.from('bot_quotes').select('digits').eq('symbol', symbol).maybeSingle(),
        // bot_trades only carries orders the bot placed itself. A position it
        // adopted from the broker exists only here, as state='active'.
        supabase.from('bot_market_state').select('state,level,latest_signal,sl,tp')
          .eq('symbol', symbol).maybeSingle(),
      ]);
      if (!alive) return;
      const series = seriesRef.current;
      if (!series) return;

      const fetchedDigits = (quoteRes.data?.digits as number) ?? 5;
      setDigits(fetchedDigits);
      series.applyOptions({
        priceFormat: {
          type: 'price',
          precision: fetchedDigits,
          minMove: 1 / Math.pow(10, fetchedDigits),
        },
      });
      // Fetched newest-first; flip to oldest-first — lightweight-charts requires
      // ascending time order.
      const bars: Candle[] = (barsRes.data ?? []).map((b) => ({
        time: utcTz(b.ts as string),
        open: Number(b.open), high: Number(b.high), low: Number(b.low), close: Number(b.close),
      })).reverse();
      barsRef.current = bars;
      setHasHistory(bars.length > 0);
      series.setData(bars);
      redrawIndicators(); // recompute active indicators for the new candles

      // CLEAR every overlay from the previous market/timeframe first — otherwise
      // price lines (entry/SL/TP) and markers pile up on the axis and lines from
      // other markets linger. This was the "so many SL/TP" bug.
      overlayLines.current.forEach((l) => series.removePriceLine(l));
      overlayLines.current = [];
      activeSide.current = null;

      if (bars.length) {
        liveBar.current = bars[bars.length - 1];
        chartRef.current?.timeScale().fitContent();

        // If the timeframe is short enough, draw all historical trades as arrows on
        // the candles. (On H4/D1, zooming way out to see years of history means the
        // Also fetched newest-first; flip to oldest-first so trades[last] is the latest.
        const trades: Trade[] = ((tradesRes.data ?? []) as Trade[]).slice().reverse();

        // ONLY the latest trade is marked. Plotting every trade in history buried
        // the candles under BUY/SELL arrows — on an active market that is
        // hundreds of them, and the older ones tell you nothing about now.
        // Snap the trade's open time onto the candle it falls in, so the arrow
        // sits exactly on that bar. open_ts is the precise fill moment, not a bar
        // boundary, so without this the marker floats between candles.
        const snapToBar = (iso: string): UTCTimestamp => {
          const t = utcTz(iso) as number;
          let chosen = bars[0].time;
          for (const b of bars) { if ((b.time as number) <= t) chosen = b.time; else break; }
          return chosen;
        };
        const latest = trades.length ? [trades[trades.length - 1]] : [];
        const markers = latest.map((t) => {
          const buy = t.side === 'buy';
          return {
            time: snapToBar(t.open_ts),
            position: buy ? 'belowBar' : 'aboveBar',
            color: buy ? '#22c55e' : '#ef4444',
            shape: buy ? 'arrowUp' : 'arrowDown',
            text: buy ? 'BUY' : 'SELL',
          } as SeriesMarker<Time>;
        }).sort((a, b) => (a.time as number) - (b.time as number));
        if (markersApi.current) markersApi.current.setMarkers(markers);
        else markersApi.current = createSeriesMarkers(series, markers);

        // Entry / SL / TP overlay — for an OPEN position AND for a resting PENDING
        // order. bot_market_state is the authority: `level` is the entry (pending
        // or filled), and it stays correct for positions the bot adopted and after
        // the profit lock ratchets the stop. bot_trades is the fallback.
        const openRow = trades.find((t) => !t.close_ts);
        const live = stateRes.data as
          { state?: string; level?: number; latest_signal?: string; sl?: number | null; tp?: number | null } | null;

        const hasPosition = live?.state === 'active' || !!openRow;   // a trade is open
        const hasPending = live?.level != null && !hasPosition;      // limit order resting, not yet filled

        const entry = live?.level != null ? Number(live.level)
          : openRow ? Number(openRow.open_price) : null;
        const sl = live?.sl ?? openRow?.sl ?? null;
        const tp = live?.tp ?? openRow?.tp ?? null;
        tradeSL.current = sl != null ? Number(sl) : null;
        tradeTP.current = tp != null ? Number(tp) : null;

        if (entry != null && (hasPosition || hasPending)) {
          const sig = (live?.latest_signal ?? '').toUpperCase();
          activeSide.current = openRow
            ? (openRow.side === 'sell' ? 'sell' : 'buy')
            : (sig.startsWith('SHORT') || sig.startsWith('SELL') ? 'sell' : 'buy');
          const sideStr = activeSide.current === 'sell' ? 'SELL' : 'BUY';
          // Entry line: solid once filled, dashed while the order is still pending.
          overlayLines.current.push(series.createPriceLine({
            price: entry, color: '#3b9de7', lineWidth: 2,
            lineStyle: hasPending ? LineStyle.Dashed : LineStyle.Solid,
            axisLabelVisible: true, title: hasPending ? `${sideStr} · pending` : sideStr,
          }));
          // SL / TP are now drawn by default (pending and open alike) — no click needed.
          if (tradeSL.current != null) overlayLines.current.push(series.createPriceLine({ price: tradeSL.current, color: '#ef4444', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'SL' }));
          if (tradeTP.current != null) overlayLines.current.push(series.createPriceLine({ price: tradeTP.current, color: '#22c55e', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'TP' }));
        }
      }

      setLoading(false);
    })();

    return () => { alive = false; };
  }, [symbol, tf]);

  // ── Poll the live quote; move the forming candle + price line ─────────
  useEffect(() => {
    if (!symbol) return;
    let alive = true;

    const tick = async () => {
      // Live quote + floating P&L, read directly from Supabase (no Netlify Function).
      const [qRes, msRes] = await Promise.all([
        supabase.from('bot_quotes').select('bid,ask,spread,updated_at').eq('symbol', symbol).maybeSingle(),
        supabase.from('bot_market_state').select('pnl,state').eq('symbol', symbol).maybeSingle(),
      ]);
      if (!alive) return;
      const qd = qRes.data;
      const q: Quote = {
        bid: (qd?.bid as number) ?? null,
        ask: (qd?.ask as number) ?? null,
        spread: (qd?.spread as number) ?? null,
        updated_at: (qd?.updated_at as string) ?? null,
        pnl: (msRes.data?.pnl as number) ?? null,
        state: (msRes.data?.state as string) ?? null,
      };
      setQuote(q);
      const price = q.bid;
      const series = seriesRef.current;
      // Only move the chart when the quote is genuinely fresh — a stale feed
      const fresh = q.updated_at && Date.now() - new Date(q.updated_at).getTime() < 300_000;
      if (fresh && series && price != null && Number.isFinite(price)) {
        const secs = TF_SECONDS[tf] ?? 900;
        const lb = liveBar.current;
        const nowUtcSecs = Math.floor(Date.now() / 1000) + new Date().getTimezoneOffset() * 60;
        const bucket = (Math.floor(nowUtcSecs / secs) * secs) as UTCTimestamp;
        // Intraday: roll into a fresh bucket when the clock crosses it. H4+ : just
        // extend the last historical bar (epoch buckets don't match broker weeks/months).
        if (!lb) {
          liveBar.current = { time: bucket, open: price, high: price, low: price, close: price };
        } else if (secs <= INTRADAY_MAX_SECS && (bucket as number) > (lb.time as number)) {
          liveBar.current = { time: bucket, open: price, high: price, low: price, close: price };
        } else {
          liveBar.current = { time: lb.time, open: lb.open, high: Math.max(lb.high, price), low: Math.min(lb.low, price), close: price };
        }
        series.update(liveBar.current);
      }
    };

    tick();
    const id = setInterval(tick, 3000); // v7: 3s (was 1.5s) to stay under the free-tier request budget
    return () => { alive = false; clearInterval(id); };
  }, [symbol, tf]);

  const stale = quote?.updated_at ? Date.now() - new Date(quote.updated_at).getTime() > 300_000 : true;
  // Nothing to draw: no candle history AND no live feed to build one from.
  const showEmpty = hasHistory === false && stale && !loading;

  return (
    <div className="space-y-3">
      {/* Controls + ticker */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-fg outline-none focus:border-brand">
          {markets.map((m) => <option key={m.symbol} value={m.symbol}>{label(m.symbol)}{openBySymbol.has(m.symbol) ? '  ●' : ''}</option>)}
        </select>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {TIMEFRAMES.map((f) => (
            <button key={f.value} type="button" onClick={() => setTf(f.value)}
              className={`px-2.5 py-1.5 text-xs font-bold ${tf === f.value ? 'bg-brand text-brand-fg' : 'text-fg-muted hover:bg-surface-hover'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm">
          {quote?.pnl != null && (
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono tabular text-sm font-bold ${Number(quote.pnl) >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
              P/L {Number(quote.pnl) >= 0 ? '+' : ''}{Number(quote.pnl).toFixed(2)}
            </span>
          )}
          <span className="font-mono tabular">
            <span className="text-fg-subtle text-xs">BID </span><span className="font-bold text-fg">{fmt(quote?.bid, digits)}</span>
            <span className="text-fg-subtle text-xs ml-3">ASK </span><span className="font-bold text-fg">{fmt(quote?.ask, digits)}</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${stale ? 'text-danger' : 'text-success'}`}>
            <span className={`h-2 w-2 rounded-full ${stale ? 'bg-danger' : 'bg-success'}`} />{stale ? 'feed stale' : 'live'}
          </span>
        </div>
      </div>

      {/* Jump straight to a market that has an ongoing trade, then watch the
          candle move live with its entry/SL/TP overlaid. */}
      {openBySymbol.size > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-fg-subtle">Ongoing trades:</span>
          {[...openBySymbol.entries()].map(([sym, side]) => (
            <button key={sym} type="button" onClick={() => setSymbol(sym)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold transition-colors ${symbol === sym ? 'border-brand text-brand' : 'border-border text-fg-muted hover:text-fg hover:bg-surface-hover'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${side === 'sell' ? 'bg-danger' : 'bg-success'}`} />
              {label(sym)}
            </button>
          ))}
        </div>
      )}

      <div
        ref={cardRef}
        className={`relative flex flex-col rounded-lg border border-border bg-bg-elevated overflow-hidden ${fs ? 'h-screen rounded-none' : 'h-[560px] md:h-[680px]'}`}
      >
        {/* Chart toolbar: drawing tools · indicators (left) + fullscreen (right). */}
        <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
          <ToolBtn active={tool === 'cursor'} onClick={() => setTool('cursor')} title="Cursor"><MousePointer2 className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={tool === 'hline'} onClick={() => setTool('hline')} title="Horizontal line — click a price"><Minus className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={tool === 'trend'} onClick={() => setTool('trend')} title="Trend line — click two points"><PenLine className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={false} onClick={clearDrawings} title="Clear drawings"><Eraser className="h-4 w-4" /></ToolBtn>

          <span className="mx-1 h-5 w-px bg-border" />
          {/* The 4 indicators. */}
          {IND_META.map((m) => (
            <button key={m.id} type="button" onClick={() => toggleInd(m.id)} title={m.title}
              className={`inline-flex h-8 items-center rounded-md px-2 text-[11px] font-bold transition-colors ${inds.has(m.id) ? 'text-brand-fg' : 'text-fg-muted hover:text-fg hover:bg-surface-hover'}`}
              style={inds.has(m.id) ? { backgroundColor: m.color } : undefined}>
              {m.label}
            </button>
          ))}

          {tool === 'trend' && trendStart.current && <span className="ml-1 text-[11px] text-fg-subtle">click the second point…</span>}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={fs ? 'Exit full screen' : 'Full screen'}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover"
          >
            {fs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Canvas — fills remaining height; hidden behind the placeholder when empty. */}
        <div
          ref={wrapRef}
          className={`flex-1 w-full transition-opacity ${showEmpty ? 'opacity-0' : 'opacity-100'}`}
          style={tool !== 'cursor' ? { cursor: 'crosshair' } : undefined}
        />

        {loading && <div className="absolute inset-0 flex items-center justify-center text-sm text-fg-muted">Loading {alias}…</div>}

        {showEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
              <CandlestickChart className="h-6 w-6 text-fg-subtle" />
            </div>
            <p className="text-sm font-semibold text-fg">No candles for {alias}</p>
            <p className="max-w-md text-xs text-fg-muted leading-relaxed">
              No history in <code className="font-mono text-fg-subtle">bot_bars</code> for this market/timeframe.
              Candles are synced by <code className="font-mono text-fg-subtle">scripts.bar_sync</code> on the VM —
              if it isn’t running, history stops refreshing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${active ? 'bg-brand text-brand-fg' : 'text-fg-muted hover:text-fg hover:bg-surface-hover'}`}
    >
      {children}
    </button>
  );
}
