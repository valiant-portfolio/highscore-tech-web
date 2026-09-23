'use client';

// The chart of ONE trade: what price did before the bot entered, while it held,
// and after it got out.
//
// Deliberately not MarketChart. That one is a live workstation — timeframe
// picker, drawing tools, a 3s quote feed, state in localStorage. This is a
// record of something already finished, so it takes its bars as a prop, draws
// once, and has nothing to keep in sync. Nothing here polls.
//
// What it marks, and why each earns its place on a post-mortem:
//   ENTRY / EXIT  where the bot acted, as markers on the bars themselves
//   SL / TP       where the orders sat — the question "was it nearly stopped
//                 out" is answered by the distance between the stop line and
//                 the wicks, which no table conveys
//   shaded span   the holding period, so the trade is legible at a glance
//                 against the context bars either side

import { useEffect, useRef } from 'react';
import {
  createChart, CandlestickSeries, LineSeries, LineStyle, createSeriesMarkers,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type SeriesMarker, type Time,
} from 'lightweight-charts';

export interface TradeChartBar {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  bars: TradeChartBar[];
  side: 'buy' | 'sell' | string;
  openTs: string;
  openPrice: number;
  closeTs: string | null;
  closePrice: number | null;
  sl: number | null;
  tp: number | null;
  digits: number;
  timeframe: string;
}

// Lightweight Charts plots in local time; the bars are UTC. Shift so a bar
// stamped 09:15Z reads 09:15 on the axis wherever the reader happens to be —
// the alerts, the logs and the broker all speak UTC, and a chart that quietly
// disagreed with them by an hour would be worse than useless on a post-mortem.
function utcTz(iso: string | number): UTCTimestamp {
  const ms = typeof iso === 'string' ? new Date(iso).getTime() : iso;
  return (Math.floor(ms / 1000) + new Date().getTimezoneOffset() * 60) as UTCTimestamp;
}

export default function TradeChart({
  bars, side, openTs, openPrice, closeTs, closePrice, sl, tp, digits, timeframe,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boxRef.current || bars.length === 0) return;
    const el = boxRef.current;

    const chart: IChartApi = createChart(el, {
      width: el.clientWidth,
      height: 420,
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgb(148 163 184)',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(148,163,184,0.08)' },
        horzLines: { color: 'rgba(148,163,184,0.08)' },
      },
      rightPriceScale: { borderColor: 'rgba(148,163,184,0.2)' },
      timeScale: { borderColor: 'rgba(148,163,184,0.2)', timeVisible: true },
      crosshair: { mode: 0 },
    });

    const candles: ISeriesApi<'Candlestick'> = chart.addSeries(CandlestickSeries, {
      upColor: '#16a34a', downColor: '#dc2626',
      borderUpColor: '#16a34a', borderDownColor: '#dc2626',
      wickUpColor: '#16a34a', wickDownColor: '#dc2626',
      priceFormat: { type: 'price', precision: digits, minMove: 1 / 10 ** digits },
    });
    candles.setData(bars.map((b) => ({
      time: utcTz(b.ts), open: b.open, high: b.high, low: b.low, close: b.close,
    })));

    // Entry and exit, on the bars they happened on.
    const isLong = side === 'buy';
    const markers: SeriesMarker<Time>[] = [{
      time: utcTz(openTs),
      position: isLong ? 'belowBar' : 'aboveBar',
      color: '#3b82f6',
      shape: isLong ? 'arrowUp' : 'arrowDown',
      text: `${isLong ? 'BUY' : 'SELL'} ${openPrice.toFixed(digits)}`,
    }];
    if (closeTs && closePrice != null) {
      markers.push({
        time: utcTz(closeTs),
        position: isLong ? 'aboveBar' : 'belowBar',
        color: '#a855f7',
        shape: 'circle',
        text: `EXIT ${closePrice.toFixed(digits)}`,
      });
    }
    createSeriesMarkers(candles, markers);

    // Entry, stop and target as price lines. The stop is the one that matters:
    // how close the wicks came to it is the whole story of a lucky winner.
    candles.createPriceLine({
      price: openPrice, color: '#3b82f6', lineWidth: 1,
      lineStyle: LineStyle.Solid, axisLabelVisible: true, title: 'ENTRY',
    });
    if (sl) {
      candles.createPriceLine({
        price: sl, color: '#dc2626', lineWidth: 1,
        lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'SL',
      });
    }
    if (tp) {
      candles.createPriceLine({
        price: tp, color: '#16a34a', lineWidth: 1,
        lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'TP',
      });
    }

    // The holding period, drawn as a flat line along the entry price between
    // entry and exit. Lightweight Charts has no span/box primitive; a bounded
    // line is the cheapest honest way to show "this is the part we were in".
    const held = bars.filter((b) => {
      const t = new Date(b.ts).getTime();
      return t >= new Date(openTs).getTime()
        && t <= new Date(closeTs ?? Date.now()).getTime();
    });
    if (held.length > 1) {
      const span: ISeriesApi<'Line'> = chart.addSeries(LineSeries, {
        color: 'rgba(59,130,246,0.45)', lineWidth: 4,
        priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
      });
      span.setData(held.map((b) => ({ time: utcTz(b.ts), value: openPrice })));
    }

    chart.timeScale().fitContent();

    const resize = () => chart.applyOptions({ width: el.clientWidth });
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.remove();
    };
  }, [bars, side, openTs, openPrice, closeTs, closePrice, sl, tp, digits]);

  if (bars.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-fg-muted">
        No {timeframe} bars stored for this window — bot_bars keeps a rolling
        retention, and this trade has aged out of it. The indicator readings
        below were taken live and are unaffected.
      </div>
    );
  }

  return <div ref={boxRef} className="w-full" />;
}
