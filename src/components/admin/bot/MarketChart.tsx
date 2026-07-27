'use client';

// Candlestick chart for one market, TradingView Lightweight Charts (MIT).
//
// Data (all admin-gated, server-read — nothing exposed to the browser via the
// anon key):
//   • history  → /api/admin/bot/chart  (bot_bars OHLCV + this market's trades)
//   • live     → /api/admin/bot/quote   polled ~1.5s (bid/ask + floating P&L)
//
// Overlays for the ACTIVE (open) trade only: a blue ENTRY line, dashed SL/TP,
// and a live current-price line carrying the position's P&L. The selected market
// + timeframe persist across a refresh (localStorage).

import { useEffect, useRef, useState } from 'react';
import { CandlestickChart, MousePointer2, Minus, PenLine, Eraser, Maximize2, Minimize2 } from 'lucide-react';
import {
  createChart, CandlestickSeries, LineSeries, LineStyle, createSeriesMarkers,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type Time,
  type SeriesMarker, type IPriceLine, type ISeriesMarkersPluginApi,
  type MouseEventParams,
} from 'lightweight-charts';

type Tool = 'cursor' | 'hline' | 'trend';

const STORE_KEY = 'bot-chart-selection'; // persists {symbol, tf} across a refresh

// v4: only M15 / H1 / D1 are synced into bot_bars. Do NOT offer M1/M5/H4 — they
// return empty. (One-line VM change to add more, per the backend contract.)
const TF_SECONDS: Record<string, number> = { M15: 900, H1: 3600, D1: 86400 };
const TIMEFRAMES = ['M15', 'H1', 'D1'] as const;

type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number };
interface Trade {
  id: string; side: string; open_ts: string; open_price: number;
  close_ts: string | null; close_price: number | null; sl: number | null; tp: number | null;
  pnl: number | null; close_reason: string | null;
}

const fmt = (n: number | null | undefined, digits: number) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toFixed(digits);

interface Quote { bid: number | null; ask: number | null; spread: number | null; updated_at: string | null; pnl: number | null; state: string | null }

export function MarketChart({ markets }: { markets: { symbol: string; alias: string }[] }) {
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
        if (s.tf && (TIMEFRAMES as readonly string[]).includes(s.tf)) return s.tf as string;
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

  const cardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const liveBar = useRef<Candle | null>(null);
  const priceLine = useRef<IPriceLine | null>(null);     // live current-price line
  const overlayLines = useRef<IPriceLine[]>([]);          // entry / SL / TP (active trade)
  const markersApi = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const activeSide = useRef<'buy' | 'sell' | null>(null); // side of the open trade, for the live P&L line
  // Drawings (manual annotations).
  const toolRef = useRef<Tool>('cursor');
  const drawHLines = useRef<IPriceLine[]>([]);
  const drawTrends = useRef<ISeriesApi<'Line'>[]>([]);
  const trendStart = useRef<{ time: Time; value: number } | null>(null);

  useEffect(() => { toolRef.current = tool; }, [tool]);

  const alias = markets.find((m) => m.symbol === symbol)?.alias ?? symbol;

  const clearDrawings = () => {
    drawHLines.current.forEach((l) => seriesRef.current?.removePriceLine(l));
    drawHLines.current = [];
    drawTrends.current.forEach((s) => chartRef.current?.removeSeries(s));
    drawTrends.current = [];
    trendStart.current = null;
  };

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
      if (t === 'cursor' || !param.point || param.time === undefined) return;
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
    priceLine.current = null;
    clearDrawings(); // manual annotations don't carry across markets/timeframes

    (async () => {
      const res = await fetch(`/api/admin/bot/chart?symbol=${encodeURIComponent(symbol)}&tf=${tf}`);
      if (!alive) return;
      const data = await res.json();
      const series = seriesRef.current;
      if (!series) return;

      setDigits(data.digits ?? 5);
      const bars: Candle[] = (data.bars ?? []).map((b: Candle) => ({ ...b, time: b.time as UTCTimestamp }));
      setHasHistory(bars.length > 0);
      series.setData(bars);

      // CLEAR every overlay from the previous market/timeframe first — otherwise
      // price lines (entry/SL/TP) and markers pile up on the axis and lines from
      // other markets linger. This was the "so many SL/TP" bug.
      overlayLines.current.forEach((l) => series.removePriceLine(l));
      overlayLines.current = [];
      if (priceLine.current) { series.removePriceLine(priceLine.current); priceLine.current = null; }
      activeSide.current = null;

      if (bars.length) {
        liveBar.current = bars[bars.length - 1];
        chartRef.current?.timeScale().fitContent();

        const trades: Trade[] = data.trades ?? [];

        // Markers for every trade (entry arrows) — updated in place, not stacked.
        const markers = trades.map((t) => {
          const buy = t.side === 'buy';
          return {
            time: Math.floor(new Date(t.open_ts).getTime() / 1000) as UTCTimestamp,
            position: buy ? 'belowBar' : 'aboveBar',
            color: buy ? '#22c55e' : '#ef4444',
            shape: buy ? 'arrowUp' : 'arrowDown',
            text: buy ? 'BUY' : 'SELL',
          } as SeriesMarker<Time>;
        }).sort((a, b) => (a.time as number) - (b.time as number));
        if (markersApi.current) markersApi.current.setMarkers(markers);
        else markersApi.current = createSeriesMarkers(series, markers);

        // Entry / SL / TP — ONLY for the active (open) trade on this market.
        const open = trades.find((t) => !t.close_ts);
        if (open) {
          activeSide.current = open.side === 'sell' ? 'sell' : 'buy';
          overlayLines.current.push(series.createPriceLine({ price: Number(open.open_price), color: '#3b9de7', lineWidth: 2, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: 'ENTRY' }));
          if (open.sl != null) overlayLines.current.push(series.createPriceLine({ price: Number(open.sl), color: '#ef4444', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'SL' }));
          if (open.tp != null) overlayLines.current.push(series.createPriceLine({ price: Number(open.tp), color: '#22c55e', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'TP' }));
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
      const res = await fetch(`/api/admin/bot/quote?symbol=${encodeURIComponent(symbol)}`);
      if (!alive) return;
      const q = await res.json();
      setQuote(q);
      const price = q.bid;
      const series = seriesRef.current;
      // Only move the chart when the quote is genuinely fresh — a stale feed
      // (bot's quote_feed not running) must not paint a lone candle/line.
      const fresh = q.updated_at && Date.now() - new Date(q.updated_at).getTime() < 60_000;
      if (fresh && series && price != null && Number.isFinite(price)) {
        const secs = TF_SECONDS[tf] ?? 900;
        const bucket = (Math.floor(Date.now() / 1000 / secs) * secs) as UTCTimestamp;
        const lb = liveBar.current;
        if (!lb || (bucket as number) > (lb.time as number)) {
          liveBar.current = { time: bucket, open: price, high: price, low: price, close: price };
        } else {
          liveBar.current = { time: lb.time, open: lb.open, high: Math.max(lb.high, price), low: Math.min(lb.low, price), close: price };
        }
        series.update(liveBar.current);

        // The live current-price line, carrying the position's P&L when one is
        // open (green in profit, red in loss); plain blue otherwise.
        if (priceLine.current) series.removePriceLine(priceLine.current);
        const pl = activeSide.current && q.pnl != null ? Number(q.pnl) : null;
        priceLine.current = series.createPriceLine({
          price,
          color: pl == null ? '#3b9de7' : pl >= 0 ? '#22c55e' : '#ef4444',
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: pl == null ? 'PRICE' : `P/L ${pl >= 0 ? '+' : ''}${pl.toFixed(2)}`,
        });
      }
    };

    tick();
    const id = setInterval(tick, 1500);
    return () => { alive = false; clearInterval(id); };
  }, [symbol, tf]);

  const stale = quote?.updated_at ? Date.now() - new Date(quote.updated_at).getTime() > 60_000 : true;
  // Nothing to draw: no candle history AND no live feed to build one from.
  const showEmpty = hasHistory === false && stale && !loading;

  return (
    <div className="space-y-3">
      {/* Controls + ticker */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-fg outline-none focus:border-brand">
          {markets.map((m) => <option key={m.symbol} value={m.symbol}>{m.alias} — {m.symbol}</option>)}
        </select>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {TIMEFRAMES.map((f) => (
            <button key={f} type="button" onClick={() => setTf(f)}
              className={`px-2.5 py-1.5 text-xs font-bold ${tf === f ? 'bg-brand text-brand-fg' : 'text-fg-muted hover:bg-surface-hover'}`}>
              {f}
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

      <div
        ref={cardRef}
        className={`relative flex flex-col rounded-lg border border-border bg-bg-elevated overflow-hidden ${fs ? 'h-screen rounded-none' : 'h-[560px] md:h-[680px]'}`}
      >
        {/* Chart toolbar: drawing tools (left) + fullscreen (right). */}
        <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
          <ToolBtn active={tool === 'cursor'} onClick={() => setTool('cursor')} title="Cursor"><MousePointer2 className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={tool === 'hline'} onClick={() => setTool('hline')} title="Horizontal line — click a price"><Minus className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={tool === 'trend'} onClick={() => setTool('trend')} title="Trend line — click two points"><PenLine className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={false} onClick={clearDrawings} title="Clear drawings"><Eraser className="h-4 w-4" /></ToolBtn>
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
