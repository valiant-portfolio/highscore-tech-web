'use client';

// The candles in the product shot — a real TradingView chart, not a picture of
// one.
//
// Same engine as the trade pages (lightweight-charts v5, TradingView's own
// library), so the landing page shows the thing the app actually renders. When
// the Binance feed is wired this component takes bars as a prop and nothing
// else about it changes.
//
// The series is generated from a fixed seed rather than Math.random(): this
// tree renders on the server and again on the client, and a random walk would
// disagree with itself between the two.

import { useEffect, useRef } from 'react';
import {
  createChart, CandlestickSeries,
  type IChartApi, type ISeriesApi, type UTCTimestamp,
} from 'lightweight-charts';

/** Deterministic pseudo-random in [0,1) — a small LCG, seeded per call site. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function sampleBars(count: number, start: number) {
  const rand = rng(20260928);
  const out: { time: UTCTimestamp; open: number; high: number; low: number; close: number }[] = [];
  // One hour apart, ending at a fixed timestamp so the axis is stable.
  const end = 1790578800;
  let price = start;
  for (let i = 0; i < count; i++) {
    const drift = (rand() - 0.42) * start * 0.012;
    const open = price;
    const close = Math.max(start * 0.75, open + drift);
    const wick = start * 0.004 * (0.4 + rand());
    out.push({
      time: (end - (count - 1 - i) * 3600) as UTCTimestamp,
      open,
      close,
      high: Math.max(open, close) + wick,
      low: Math.min(open, close) - wick,
    });
    price = close;
  }
  return out;
}

export function HeroChart({ height = 160 }: { height?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(154,160,166,0.8)',
        attributionLogo: false,
        fontFamily: 'var(--font-mono)',
      },
      grid: {
        vertLines: { color: 'rgba(154,160,166,0.06)' },
        horzLines: { color: 'rgba(154,160,166,0.06)' },
      },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.15, bottom: 0.1 } },
      timeScale: { borderVisible: false, timeVisible: false },
      // Decoration on a marketing page: no crosshair to chase, and nothing to
      // drag. The real workspace is one click away and does all of that.
      crosshair: { mode: 0, vertLine: { visible: false }, horzLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });

    const series: ISeriesApi<'Candlestick'> = chart.addSeries(CandlestickSeries, {
      upColor: '#12B981', downColor: '#E5484D',
      borderUpColor: '#12B981', borderDownColor: '#E5484D',
      wickUpColor: 'rgba(18,185,129,0.6)', wickDownColor: 'rgba(229,72,77,0.6)',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    series.setData(sampleBars(64, 68420));
    chart.timeScale().fitContent();

    const resize = () => chart.applyOptions({ width: el.clientWidth });
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.remove();
    };
  }, [height]);

  return <div ref={boxRef} style={{ height }} className="w-full" />;
}
