// Fibonacci retracement and trend-based extension: model, price maths and
// screen geometry. Pure - the chart is reached only through the FibCtx
// callbacks (see fibChart.ts), so node can run the tests.

import type { BarLike } from './barTime.ts';
import { timeToLogical, logicalToTime } from './barTime.ts';

export type FibVariant = 'retracement' | 'extension';
export interface FibPoint { t: number; p: number }

export interface FibDrawing {
  id: string;
  kind: 'fib';
  variant: FibVariant;
  /** Retracement [A, B]; extension [A, B, C], in click order. */
  points: FibPoint[];
  /** Absent means the defaults for the variant. */
  levels?: number[];
  extendRight?: boolean;
  fill?: boolean;
  /** Ratios to leave out. Model only, no UI in v1. */
  hidden?: number[];
  // Same names as the trend line so the style toolbar compiles unchanged.
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  label?: string;
}

export const DEFAULT_RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
export const DEFAULT_EXTENSION_LEVELS = [0, 0.618, 1, 1.272, 1.618, 2, 2.618];
export const FIB_LEVEL_COLORS: Record<string, string> = {
  '0': '#787B86', '0.236': '#F23645', '0.382': '#FF9800', '0.5': '#4CAF50',
  '0.618': '#089981', '0.786': '#00BCD4', '1': '#787B86', '1.272': '#9C27B0',
  '1.618': '#2962FF', '2': '#E91E63', '2.618': '#F23645',
};
export const FIB_FALLBACK_COLOR = '#2962FF';
export const fibLevelColor = (r: number): string => FIB_LEVEL_COLORS[String(r)] ?? FIB_FALLBACK_COLOR;

/** r = 0 is B, r = 1 is A, in either direction. */
export function fibRetracementPrice(a: number, b: number, r: number): number {
  return b - r * (b - a);
}

/** Trend-based: level r sits at C + r * (B - A). */
export function fibExtensionPrice(a: number, b: number, c: number, r: number): number {
  return c + r * (b - a);
}

export function fibClicksNeeded(variant: FibVariant): 2 | 3 {
  return variant === 'extension' ? 3 : 2;
}

function levelPrice(d: FibDrawing, r: number): number | null {
  const [a, b, c] = d.points;
  if (d.variant === 'extension') return a && b && c ? fibExtensionPrice(a.p, b.p, c.p, r) : null;
  return a && b ? fibRetracementPrice(a.p, b.p, r) : null;
}

export function fibLevels(d: FibDrawing): { ratio: number; price: number; color: string }[] {
  const base = d.levels ?? (d.variant === 'extension' ? DEFAULT_EXTENSION_LEVELS : DEFAULT_RETRACEMENT_LEVELS);
  const hidden = d.hidden ?? [];
  const out: { ratio: number; price: number; color: string }[] = [];
  for (const ratio of base) {
    if (hidden.includes(ratio)) continue;
    const price = levelPrice(d, ratio);
    if (price === null) continue;
    out.push({ ratio, price, color: d.color ?? fibLevelColor(ratio) });
  }
  return out;
}

export const formatFibPct = (r: number): string => Number((r * 100).toFixed(1)).toString();
export const formatFibLabel = (r: number, price: number, digits: number): string =>
  `${formatFibPct(r)}% ${price.toFixed(digits)}`;

export function makeFibDrawing(variant: FibVariant, points: FibPoint[], id: string): FibDrawing {
  return { id, kind: 'fib', variant, points: points.map((p) => ({ t: p.t, p: p.p })) };
}

export function duplicateFib(d: FibDrawing, id: string): FibDrawing {
  return { ...d, id, points: d.points.map((p) => ({ t: p.t, p: p.p * 1.0005 })) };
}

/** Moves every point by dLogical bars and dPrice. Times stay integral. */
export function shiftFib(d: FibDrawing, dLogical: number, dPrice: number, bars: readonly BarLike[], barSecs: number): void {
  d.points = d.points.map((pt) => {
    const L = timeToLogical(bars, barSecs, pt.t);
    const t = L === null ? null : logicalToTime(bars, barSecs, L + dLogical);
    return { t: t === null ? pt.t : Math.round(t), p: pt.p + dPrice };
  });
}

// --- screen geometry -------------------------------------------------------

export interface FibCtx {
  timeToX(t: number): number | null;
  priceToY(p: number): number | null;
  paneW: number;
  paneH: number;
}

export interface FibGeometry {
  id: string;
  x1: number;
  x2: number;
  levels: { ratio: number; price: number; y: number; color: string }[];
  bands: { yTop: number; yBot: number; color: string }[];
  connectors: { x1: number; y1: number; x2: number; y2: number }[];
  handles: { id: string; x: number; y: number }[];
  width: number;
  dash: string;
  /** The drawing's own colour, if set; connectors and handles fall back to neutral. */
  color?: string;
  label?: string;
  labelX: number;
  labelY: number;
}

const DASH: Record<string, string> = { solid: '', dashed: '6 4', dotted: '2 3' };

/** Null if any point fails to project. A level whose price fails to project is
 *  skipped on its own. An extension still waiting on its third point (the
 *  rubber band) gets only its A-B connector. */
export function computeFibGeometry(d: FibDrawing, ctx: FibCtx): FibGeometry | null {
  if (d.points.length < 2) return null;
  const pts: { x: number; y: number }[] = [];
  for (const pt of d.points) {
    const x = ctx.timeToX(pt.t);
    const y = ctx.priceToY(pt.p);
    if (x === null || y === null) return null;
    pts.push({ x, y });
  }
  const xs = pts.map((p) => p.x);
  const x1 = Math.min(...xs);
  const x2 = Math.max(d.extendRight ? ctx.paneW : Math.max(...xs), x1 + 1);

  const levels: FibGeometry['levels'] = [];
  for (const l of fibLevels(d)) {
    const y = ctx.priceToY(l.price);
    if (y === null) continue;
    levels.push({ ratio: l.ratio, price: l.price, y, color: l.color });
  }
  const bands: FibGeometry['bands'] = [];
  if (d.fill !== false) {
    for (let i = 0; i + 1 < levels.length; i++) {
      bands.push({
        yTop: Math.min(levels[i].y, levels[i + 1].y),
        yBot: Math.max(levels[i].y, levels[i + 1].y),
        color: levels[i + 1].color,
      });
    }
  }
  const connectors: FibGeometry['connectors'] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    connectors.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[i + 1].x, y2: pts[i + 1].y });
  }
  return {
    id: d.id, x1, x2, levels, bands, connectors,
    handles: pts.map((p, i) => ({ id: `${d.id}:${i}`, x: p.x, y: p.y })),
    width: d.width ?? 1,
    dash: DASH[d.style ?? 'solid'] ?? '',
    color: d.color,
    label: d.label,
    labelX: pts[0].x,
    labelY: pts[0].y - 12,
  };
}

export function computeFibGeometries(ds: readonly { kind: string }[], ctx: FibCtx): FibGeometry[] {
  const out: FibGeometry[] = [];
  for (const d of ds) {
    if (d.kind !== 'fib') continue;
    try {
      const g = computeFibGeometry(d as FibDrawing, ctx);
      if (g) out.push(g);
    } catch { /* one bad drawing must not take the rest off the chart */ }
  }
  return out;
}

function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Id of the first drawing with a level line or connector within `hit` px. */
export function fibHitTest(geoms: readonly FibGeometry[], x: number, y: number, hit: number): string | null {
  for (const g of geoms) {
    if (x >= g.x1 - hit && x <= g.x2 + hit && g.levels.some((l) => Math.abs(y - l.y) <= hit)) return g.id;
    if (g.connectors.some((c) => distToSeg(x, y, c.x1, c.y1, c.x2, c.y2) <= hit)) return g.id;
  }
  return null;
}
