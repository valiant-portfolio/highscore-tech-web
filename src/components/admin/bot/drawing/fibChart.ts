// The only fib file that touches lightweight-charts: adapts a chart + series +
// candles to the pure FibCtx, and turns clicks and drags into fib points.
// Points are projected through LOGICAL indices (see barTime.ts) because
// timeToCoordinate / coordinateToTime return null right of the last candle.

import type { IChartApi, ISeriesApi, Logical } from 'lightweight-charts';
import { inferBarSecs, timeToLogical, logicalToTime } from './barTime.ts';
import type { BarLike } from './barTime.ts';
import type { FibCtx, FibPoint } from './fibonacci.ts';

export function makeFibCtx(
  chart: IChartApi | null,
  series: ISeriesApi<'Candlestick'> | null,
  bars: readonly BarLike[],
): FibCtx | null {
  if (!chart || !series || !bars.length) return null;
  const secs = inferBarSecs(bars);
  const size = chart.paneSize();
  const ts = chart.timeScale();
  const x0 = ts.logicalToCoordinate(0 as Logical);
  const x1 = ts.logicalToCoordinate(1 as Logical);
  return {
    timeToX: (t) => {
      const L = timeToLogical(bars, secs, t);
      if (L === null) return null;
      const x = chart.timeScale().logicalToCoordinate(L as Logical);
      return x === null ? null : Number(x);
    },
    priceToY: (p) => {
      const y = series.priceToCoordinate(p);
      return y === null ? null : Number(y);
    },
    paneW: size.width,
    paneH: size.height,
    barW: x0 === null || x1 === null ? 1 : Math.max(1, Number(x1) - Number(x0)),
  };
}

/** Snaps the click to the nearest bar slot, which may be beyond either end. */
export function clickToFibPoint(
  chart: IChartApi | null,
  series: ISeriesApi<'Candlestick'> | null,
  point: { x: number; y: number },
  bars: readonly BarLike[],
): FibPoint | null {
  if (!chart || !series || !bars.length) return null;
  const price = series.coordinateToPrice(point.y);
  const L = chart.timeScale().coordinateToLogical(point.x);
  if (price === null || L === null) return null;
  const t = logicalToTime(bars, inferBarSecs(bars), Math.round(L));
  return t === null ? null : { t: Math.round(t), p: Number(price) };
}

export function dragDeltaLogical(chart: IChartApi, x0: number, x1: number): number {
  const a = chart.timeScale().coordinateToLogical(x0);
  const b = chart.timeScale().coordinateToLogical(x1);
  return a === null || b === null ? 0 : Number(b) - Number(a);
}
