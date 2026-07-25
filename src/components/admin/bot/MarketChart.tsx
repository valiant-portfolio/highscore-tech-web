'use client';

// Candlestick chart for one market, TradingView Lightweight Charts (MIT).
//
// Data (all admin-gated, server-read — nothing exposed to the browser via the
// anon key):
//   • history  → /api/admin/bot/chart  (bot_bars OHLCV + this market's trades)
//   • live      → /api/admin/bot/quote  polled ~1.5s (bot_quotes bid/ask)
//
// With no synced bars yet, the chart still comes alive: each quote builds the
// forming candle at the chosen timeframe, and a live price line tracks the bid.
// When the VM turns on H1 bar sync, real history loads automatically.

import { useEffect, useRef, useState } from 'react';
import {
  createChart, CandlestickSeries, LineStyle, createSeriesMarkers,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type Time,
  type SeriesMarker, type IPriceLine,
} from 'lightweight-charts';

const TF_SECONDS: Record<string, number> = { M1: 60, M5: 300, M15: 900, H1: 3600, H4: 14400, D1: 86400 };
const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] as const;

type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number };
interface Trade {
  id: string; side: string; open_ts: string; open_price: number;
  close_ts: string | null; close_price: number | null; sl: number | null; tp: number | null;
  pnl: number | null; close_reason: string | null;
}

const fmt = (n: number | null | undefined, digits: number) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toFixed(digits);

export function MarketChart({ markets }: { markets: { symbol: string; alias: string }[] }) {
  const [symbol, setSymbol] = useState(markets[0]?.symbol ?? '');
  const [tf, setTf] = useState<string>('M15');
  const [digits, setDigits] = useState(5);
  const [quote, setQuote] = useState<{ bid: number | null; ask: number | null; spread: number | null; updated_at: string | null } | null>(null);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const liveBar = useRef<Candle | null>(null);
  const priceLine = useRef<IPriceLine | null>(null);

  const alias = markets.find((m) => m.symbol === symbol)?.alias ?? symbol;

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
    return () => { chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, []);

  // ── Load history + trades when symbol/timeframe changes ───────────────
  useEffect(() => {
    if (!symbol) return;
    let alive = true;
    setLoading(true);
    liveBar.current = null;
    priceLine.current = null;

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
      if (bars.length) {
        liveBar.current = bars[bars.length - 1];
        chartRef.current?.timeScale().fitContent();
      }

      // Trade overlays: entry/exit markers + SL/TP lines on open trades.
      const trades: Trade[] = data.trades ?? [];
      const markers: SeriesMarker<Time>[] = [];
      for (const t of trades) {
        const buy = t.side === 'buy';
        markers.push({
          time: Math.floor(new Date(t.open_ts).getTime() / 1000) as UTCTimestamp,
          position: buy ? 'belowBar' : 'aboveBar',
          color: buy ? '#22c55e' : '#ef4444',
          shape: buy ? 'arrowUp' : 'arrowDown',
          text: `${t.side.toUpperCase()} ${fmt(t.open_price, data.digits ?? 5)}`,
        });
        if (t.close_ts) {
          markers.push({
            time: Math.floor(new Date(t.close_ts).getTime() / 1000) as UTCTimestamp,
            position: 'inBar', color: '#98A2B3', shape: 'circle',
            text: `close ${t.pnl != null ? (Number(t.pnl) >= 0 ? '+' : '') + Number(t.pnl).toFixed(2) : ''}`,
          });
        }
      }
      markers.sort((a, b) => (a.time as number) - (b.time as number));
      if (markers.length) createSeriesMarkers(series, markers);

      for (const t of trades.filter((x) => !x.close_ts)) {
        if (t.sl != null) series.createPriceLine({ price: Number(t.sl), color: '#ef4444', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'SL' });
        if (t.tp != null) series.createPriceLine({ price: Number(t.tp), color: '#22c55e', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'TP' });
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
      if (series && price != null && Number.isFinite(price)) {
        const secs = TF_SECONDS[tf] ?? 900;
        const bucket = (Math.floor(Date.now() / 1000 / secs) * secs) as UTCTimestamp;
        const lb = liveBar.current;
        if (!lb || (bucket as number) > (lb.time as number)) {
          liveBar.current = { time: bucket, open: price, high: price, low: price, close: price };
        } else {
          liveBar.current = { time: lb.time, open: lb.open, high: Math.max(lb.high, price), low: Math.min(lb.low, price), close: price };
        }
        series.update(liveBar.current);

        // A live price line that follows the bid.
        if (priceLine.current) series.removePriceLine(priceLine.current);
        priceLine.current = series.createPriceLine({ price, color: '#3b9de7', lineWidth: 1, lineStyle: LineStyle.Dotted, axisLabelVisible: true, title: '' });
      }
    };

    tick();
    const id = setInterval(tick, 1500);
    return () => { alive = false; clearInterval(id); };
  }, [symbol, tf]);

  const stale = quote?.updated_at ? Date.now() - new Date(quote.updated_at).getTime() > 60_000 : true;

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
          <span className="font-mono tabular">
            <span className="text-fg-subtle text-xs">BID </span><span className="font-bold text-fg">{fmt(quote?.bid, digits)}</span>
            <span className="text-fg-subtle text-xs ml-3">ASK </span><span className="font-bold text-fg">{fmt(quote?.ask, digits)}</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${stale ? 'text-danger' : 'text-success'}`}>
            <span className={`h-2 w-2 rounded-full ${stale ? 'bg-danger' : 'bg-success'}`} />{stale ? 'feed stale' : 'live'}
          </span>
        </div>
      </div>

      {hasHistory === false && !loading && (
        <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-fg-muted">
          No synced historical candles for {alias} yet — the chart is building live candles from the price feed.
          Enable H1 bar sync on the VM for full history (thousands of rows, safe on the free tier).
        </p>
      )}

      <div className="relative rounded-lg border border-border bg-bg-elevated overflow-hidden">
        <div ref={wrapRef} className="h-[440px] w-full" />
        {loading && <div className="absolute inset-0 flex items-center justify-center text-sm text-fg-muted">Loading {alias}…</div>}
      </div>
    </div>
  );
}
