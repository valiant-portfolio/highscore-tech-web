// One builder per Fibonacci variant: projected anchor pixels in, drawable
// shapes out. Line-based tools work in PIXEL space from the projected anchors
// (the price axis is linear and time is a linear logical index, so that is
// what TradingView does too). Price scale is assumed linear; a log scale would
// need the builders to work in price space.
//
// Builders never throw on degenerate input and never emit NaN.

import type { FibDrawing } from './fibModel.ts';
import { FIB_FALLBACK_COLOR, fibLevels, fibRatios, fibLevelColor, formatFibPct, FIB_SPECS } from './fibModel.ts';
import type { FibCtx, FibGeometry, Pt } from './fibGeometry.ts';
import { rayEnd } from './fibGeometry.ts';

export type FibBuilder = (pts: Pt[], d: FibDrawing, ctx: FibCtx) => Partial<FibGeometry>;

const fillOn = (d: FibDrawing): boolean => d.fill ?? FIB_SPECS[d.variant].fillDefault;
const ratioColor = (d: FibDrawing, r: number): string => d.color ?? fibLevelColor(r);

/** Horizontal price levels across the span of the anchors: retracement,
 *  extension and two-point extension. */
export function buildLevels(pts: Pt[], d: FibDrawing, ctx: FibCtx): Partial<FibGeometry> {
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
  if (fillOn(d)) {
    for (let i = 0; i + 1 < levels.length; i++) {
      bands.push({
        yTop: Math.min(levels[i].y, levels[i + 1].y),
        yBot: Math.max(levels[i].y, levels[i + 1].y),
        color: levels[i + 1].color,
      });
    }
  }
  return { x1, x2, levels, bands };
}

// --- vertical-line tools ---------------------------------------------------

/** Vertical line at each x (skipped when well off the pane), labelled. */
function verticals(xs: { x: number; text: string; color: string }[], ctx: FibCtx): Partial<FibGeometry> {
  const lines: FibGeometry['lines'] = [];
  const texts: FibGeometry['texts'] = [];
  for (const v of xs) {
    if (!Number.isFinite(v.x) || v.x < -8 || v.x > ctx.paneW + 8) continue;
    lines.push({ x1: v.x, y1: 0, x2: v.x, y2: ctx.paneH, color: v.color });
    texts.push({ x: v.x + 3, y: ctx.paneH - 4, text: v.text, color: v.color, anchor: 'start' });
  }
  return { lines, texts };
}

/** Interval between A and B in pixels, never zero. */
function interval(a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  return Math.abs(dx) < 1 ? (dx < 0 ? -1 : 1) : dx;
}

export const buildTimezones: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const dx = interval(a, b);
  const color = d.color ?? FIB_FALLBACK_COLOR;
  return verticals(fibRatios(d).map((f) => ({ x: a.x + f * dx, text: String(f), color })), ctx);
};

export const buildTrendtime: FibBuilder = (pts, d, ctx) => {
  const [a, b, c] = pts;
  const dx = interval(a, b);
  return verticals(fibRatios(d).map((r) => ({ x: c.x + r * dx, text: formatFibPct(r), color: ratioColor(d, r) })), ctx);
};

// --- channel ---------------------------------------------------------------

export const buildChannel: FibBuilder = (pts, d, ctx) => {
  const [a, b, c] = pts;
  // Offset that carries the base line (A-B) to the line through C.
  const dxAB = b.x - a.x;
  const o: Pt = dxAB === 0
    ? { x: c.x - a.x, y: 0 }
    : { x: 0, y: c.y - (a.y + ((c.x - a.x) * (b.y - a.y)) / dxAB) };

  const segs: { p: Pt; q: Pt; r: number }[] = [];
  for (const r of fibRatios(d)) {
    const s: Pt = { x: a.x + r * o.x, y: a.y + r * o.y };
    const e: Pt = { x: b.x + r * o.x, y: b.y + r * o.y };
    const [p, q] = s.x <= e.x ? [s, e] : [e, s];
    segs.push({ p: { ...p }, q: { ...q }, r });
  }
  const lines: FibGeometry['lines'] = [];
  const texts: FibGeometry['texts'] = [];
  for (const s of segs) {
    const color = ratioColor(d, s.r);
    let p = s.p;
    let q = s.q;
    // Extended ends along the line direction, off the pane.
    if (d.extendLeft) p = rayEnd(s.p, { x: s.p.x - (s.q.x - s.p.x), y: s.p.y - (s.q.y - s.p.y) }, ctx);
    if (d.extendRight) q = rayEnd(s.q, { x: s.q.x + (s.q.x - s.p.x), y: s.q.y + (s.q.y - s.p.y) }, ctx);
    lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y, color });
    texts.push({ x: s.p.x + 4, y: s.p.y - 3, text: formatFibPct(s.r), color, anchor: 'start' });
  }
  const polys: FibGeometry['polys'] = [];
  if (fillOn(d)) {
    for (let i = 0; i + 1 < segs.length; i++) {
      polys.push({
        pts: [segs[i].p, segs[i].q, segs[i + 1].q, segs[i + 1].p],
        color: ratioColor(d, segs[i + 1].r),
      });
    }
  }
  return { lines, texts, polys };
};

/** Variants with a builder. Variants missing here are not drawn. */
export const FIB_BUILDERS: Partial<Record<FibDrawing['variant'], FibBuilder>> = {
  retracement: buildLevels,
  extension: buildLevels,
  extension2: buildLevels,
  timezones: buildTimezones,
  trendtime: buildTrendtime,
  channel: buildChannel,
};
