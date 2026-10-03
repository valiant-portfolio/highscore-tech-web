// One builder per Fibonacci variant: projected anchor pixels in, drawable
// shapes out. Line-based tools work in PIXEL space from the projected anchors
// (the price axis is linear and time is a linear logical index, so that is
// what TradingView does too). Price scale is assumed linear; a log scale would
// need the builders to work in price space.
//
// Builders never throw on degenerate input and never emit NaN.

import type { FibDrawing } from './fibModel.ts';
import { FIB_FALLBACK_COLOR, fibLevels, fibRatios, fibTimeRatios, fibLevelColor, formatFibPct, formatRatio, FIB_SPECS } from './fibModel.ts';
import type { FibCtx, FibGeometry, Pt } from './fibGeometry.ts';
import { rayEnd, ellipsePoints, ellipseSamples, paneIntersects } from './fibGeometry.ts';
import { PATTERN_BUILDERS } from './fibPatterns.ts';

export type FibBuilder = (pts: Pt[], d: FibDrawing, ctx: FibCtx) => Partial<FibGeometry>;

const fillOn = (d: FibDrawing): boolean => d.fill ?? FIB_SPECS[d.variant].fillDefault;
const ratioColor = (d: FibDrawing, r: number): string =>
  d.color ?? FIB_SPECS[d.variant].levelColors?.[String(r)] ?? fibLevelColor(r);

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

/** Interval between A and B in pixels, never shorter than a bar slot — or a
 *  pixel, when the context has no bar width. Clicks snap to bar slots, so
 *  the only short interval is the same bar twice. */
function interval(a: Pt, b: Pt, ctx: FibCtx): number {
  const dx = b.x - a.x;
  const min = ctx.barW ?? 1;
  return Math.abs(dx) < min ? (dx < 0 ? -min : min) : dx;
}

export const buildTimezones: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const dx = interval(a, b, ctx);
  const color = d.color ?? FIB_FALLBACK_COLOR;
  return verticals(fibRatios(d).map((f) => ({ x: a.x + f * dx, text: String(f), color })), ctx);
};

export const buildTrendtime: FibBuilder = (pts, d, ctx) => {
  const [a, b, c] = pts;
  const dx = interval(a, b, ctx);
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

// --- fans ------------------------------------------------------------------

const GRID_COLOR = '#787B86';

/** Fib fan: rays from A through points on B's vertical. */
export const buildFan: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const lines: FibGeometry['lines'] = [];
  const texts: FibGeometry['texts'] = [];
  const ends: { e: Pt; r: number }[] = [];
  for (const r of fibRatios(d)) {
    const q: Pt = { x: b.x, y: b.y - r * (b.y - a.y) };
    const e = rayEnd(a, q, ctx);
    const color = ratioColor(d, r);
    lines.push({ x1: a.x, y1: a.y, x2: e.x, y2: e.y, color });
    texts.push({ x: b.x + 4, y: q.y - 3, text: formatFibPct(r), color, anchor: 'start' });
    ends.push({ e, r });
  }
  const polys: FibGeometry['polys'] = [];
  if (fillOn(d)) {
    for (let i = 0; i + 1 < ends.length; i++) {
      polys.push({ pts: [{ ...a }, ends[i].e, ends[i + 1].e], color: ratioColor(d, ends[i + 1].r) });
    }
  }
  return { lines, texts, polys };
};

/** Speed resistance fan: a price x time grid in the A-B box with rays from A
 *  through the grid points on the far sides. */
export const buildSrfan: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const lines: FibGeometry['lines'] = [];
  const texts: FibGeometry['texts'] = [];
  const grid: FibGeometry['lines'] = [];
  const priceRatios = fibRatios(d);
  for (const r of priceRatios) {
    const y = a.y + r * (b.y - a.y);
    const color = ratioColor(d, r);
    const e = rayEnd(a, { x: b.x, y }, ctx);
    lines.push({ x1: a.x, y1: a.y, x2: e.x, y2: e.y, color });
    texts.push({ x: b.x < a.x ? b.x - 4 : b.x + 4, y: y - 3, text: formatFibPct(r), color, anchor: b.x < a.x ? 'end' : 'start' });
    if (d.grid !== false) grid.push({ x1: a.x, y1: y, x2: b.x, y2: y, color: GRID_COLOR, dash: '2 3' });
  }
  for (const s of fibTimeRatios(d)) {
    const x = a.x + s * (b.x - a.x);
    const color = ratioColor(d, s);
    // The s=1 time ray is the r=1 price ray: both run from A through B.
    if (s === 1 && priceRatios.includes(1)) {
      if (d.grid !== false) grid.push({ x1: x, y1: a.y, x2: x, y2: b.y, color: GRID_COLOR, dash: '2 3' });
      continue;
    }
    const e = rayEnd(a, { x, y: b.y }, ctx);
    lines.push({ x1: a.x, y1: a.y, x2: e.x, y2: e.y, color });
    texts.push({ x: x + 3, y: b.y > a.y ? b.y + 12 : b.y - 3, text: formatFibPct(s), color, anchor: 'start' });
    if (d.grid !== false) grid.push({ x1: x, y1: a.y, x2: x, y2: b.y, color: GRID_COLOR, dash: '2 3' });
  }
  return { lines: [...grid, ...lines], texts };
};

// --- curves ----------------------------------------------------------------
// Drawn in the "normalised box" frame: the A-B pixel box is the unit square,
// projected per render. Circles are round only while both axes are at the
// same scale; zooming one axis stretches them into ellipses, as in TradingView.
// Nothing about the viewport is stored.

const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;
const boxSize = (a: Pt, b: Pt): { W: number; H: number } => ({
  W: Math.max(Math.abs(b.x - a.x), 1),
  H: Math.max(Math.abs(b.y - a.y), 1),
});

/** A full ellipse as a closed polyline, without repeating the first point. */
function closedEllipse(cx: number, cy: number, rx: number, ry: number): Pt[] {
  const n = ellipseSamples(rx, ry);
  return ellipsePoints(cx, cy, rx, ry, 0, (TAU * (n - 1)) / n, n - 1);
}

const ellipseBox = (cx: number, cy: number, rx: number, ry: number) =>
  ({ x1: cx - rx, y1: cy - ry, x2: cx + rx, y2: cy + ry });

export const buildCircles: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const { W, H } = boxSize(a, b);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const curves: FibGeometry['curves'] = [];
  const texts: FibGeometry['texts'] = [];
  for (const r of fibRatios(d)) {
    const rx = r * (Math.SQRT2 / 2) * W;
    const ry = r * (Math.SQRT2 / 2) * H;
    if (!paneIntersects(ellipseBox(cx, cy, rx, ry), ctx)) continue;
    const color = ratioColor(d, r);
    curves.push({ pts: closedEllipse(cx, cy, rx, ry), color, closed: true });
    texts.push({ x: cx, y: cy - ry - 3, text: formatFibPct(r), color, anchor: 'middle' });
  }
  return { curves, texts };
};

export const buildArcs: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const { W, H } = boxSize(a, b);
  const down = a.y >= b.y; // A below B on screen: the arcs bulge downwards
  const curves: FibGeometry['curves'] = [];
  const texts: FibGeometry['texts'] = [];
  for (const r of fibRatios(d)) {
    const rx = r * Math.SQRT2 * W;
    const ry = r * Math.SQRT2 * H;
    if (!paneIntersects(ellipseBox(b.x, b.y, rx, ry), ctx)) continue;
    const color = ratioColor(d, r);
    if (d.fullCircle) {
      curves.push({ pts: closedEllipse(b.x, b.y, rx, ry), color, closed: true });
    } else {
      const th0 = down ? 0 : Math.PI;
      curves.push({ pts: ellipsePoints(b.x, b.y, rx, ry, th0, th0 + Math.PI, ellipseSamples(rx, ry)), color });
    }
    texts.push({
      x: b.x, y: down || d.fullCircle ? b.y + ry + 10 : b.y - ry - 3,
      text: formatFibPct(r), color, anchor: 'middle',
    });
  }
  return { curves, texts };
};

export const buildWedge: FibBuilder = (pts, d) => {
  const [a, b, c] = pts;
  const { W, H } = boxSize(a, b);
  const thB = Math.atan2((b.y - a.y) / H, (b.x - a.x) / W);
  const thC = Math.atan2((c.y - a.y) / H, (c.x - a.x) / W);
  let delta = thC - thB;
  while (delta > Math.PI) delta -= TAU;
  while (delta <= -Math.PI) delta += TAU;
  const edge = d.color ?? '#787B86';
  const lines: FibGeometry['lines'] = [
    { x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: edge },
    { x1: a.x, y1: a.y, x2: c.x, y2: c.y, color: edge },
  ];
  const arcs: { pts: Pt[]; r: number }[] = [];
  const texts: FibGeometry['texts'] = [];
  const curves: FibGeometry['curves'] = [];
  for (const r of fibRatios(d)) {
    const rx = r * Math.SQRT2 * W;
    const ry = r * Math.SQRT2 * H;
    const arc = ellipsePoints(a.x, a.y, rx, ry, thB, thB + delta, ellipseSamples(rx, ry));
    const color = ratioColor(d, r);
    arcs.push({ pts: arc, r });
    curves.push({ pts: arc, color });
    texts.push({ x: arc[0].x + 4, y: arc[0].y - 3, text: formatFibPct(r), color, anchor: 'start' });
  }
  const polys: FibGeometry['polys'] = [];
  if (fillOn(d)) {
    for (let i = 0; i < arcs.length; i++) {
      polys.push({
        pts: i === 0 ? [{ ...a }, ...arcs[0].pts] : [...arcs[i - 1].pts, ...[...arcs[i].pts].reverse()],
        color: ratioColor(d, arcs[i].r),
      });
    }
  }
  // The edges are lines already; the base's B-C connector means nothing here.
  return { lines, curves, texts, polys, connectors: [] };
};

export const buildSpiral: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const { W, H } = boxSize(a, b);
  const thB = Math.atan2((b.y - a.y) / H, (b.x - a.x) / W);
  const s = d.ccw ? -1 : 1;
  const limit = 4 * (ctx.paneW + ctx.paneH);
  const out: Pt[] = [];
  for (let t = -8 * Math.PI; t <= 4 * Math.PI + 1e-9; ) {
    const rho = Math.SQRT2 * Math.pow(PHI, t / (Math.PI / 2));
    const rpx = rho * Math.max(W, H);
    if (rpx > limit) break;
    const th = thB + s * t;
    out.push({ x: a.x + rho * W * Math.cos(th), y: a.y + rho * H * Math.sin(th) });
    // Chord error stays under half a pixel; coarser than 2pi/48 never.
    t += Math.min(TAU / 48, 2 * Math.acos(1 - 0.5 / Math.max(1, rpx)));
  }
  return { curves: [{ pts: out, color: d.color ?? FIB_FALLBACK_COLOR }] };
};

// --- Gann ------------------------------------------------------------------
// Ported from LuxAlgo Vela (Apache-2.0), https://github.com/LuxAlgo/Vela,
// src/core/drawings/types/GannFan.ts, GannBox.ts and GannSquare.ts. Deviations:
// fan rays run toward B's side (Vela always extends right); box and square are
// selected by their lines and curves only, not by clicking inside.

const ratioLabel = (d: FibDrawing, r: number): string => FIB_SPECS[d.variant].levelLabels?.[String(r)] ?? formatRatio(r);

/** Rays from A through (xB, yA + r*(yB-yA)). */
export const buildGannFan: FibBuilder = (pts, d, ctx) => {
  const [a, b] = pts;
  const lines: FibGeometry['lines'] = [];
  const texts: FibGeometry['texts'] = [];
  const left = b.x < a.x;
  for (const r of fibRatios(d)) {
    const q: Pt = { x: b.x, y: a.y + r * (b.y - a.y) };
    const e = rayEnd(a, q, ctx);
    const color = ratioColor(d, r);
    lines.push({ x1: a.x, y1: a.y, x2: e.x, y2: e.y, color });
    texts.push({ x: left ? b.x - 4 : b.x + 4, y: q.y + 3.5, text: ratioLabel(d, r), color, anchor: left ? 'end' : 'start' });
  }
  return { lines, texts, connectors: [] };
};

/** The ratio grid shared by the box and the square: horizontals (labelled)
 *  then verticals, both coloured by ratio. */
function gannGrid(a: Pt, b: Pt, d: FibDrawing): { lines: FibGeometry['lines']; texts: FibGeometry['texts'] } {
  const left = Math.min(a.x, b.x);
  const right = Math.max(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const bot = Math.max(a.y, b.y);
  const ratios = fibRatios(d);
  const lines: FibGeometry['lines'] = [];
  const texts: FibGeometry['texts'] = [];
  for (const r of ratios) {
    const y = a.y + r * (b.y - a.y);
    const color = ratioColor(d, r);
    lines.push({ x1: left, y1: y, x2: right, y2: y, color });
    texts.push({ x: left - 4, y: y + 3.5, text: formatRatio(r), color, anchor: 'end' });
  }
  for (const r of ratios) {
    const x = a.x + r * (b.x - a.x);
    lines.push({ x1: x, y1: top, x2: x, y2: bot, color: ratioColor(d, r) });
  }
  return { lines, texts };
}

export const buildGannBox: FibBuilder = (pts, d) => {
  const [a, b] = pts;
  const { lines, texts } = gannGrid(a, b, d);
  const left = Math.min(a.x, b.x);
  const right = Math.max(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const bot = Math.max(a.y, b.y);
  const color = ratioColor(d, 1);
  lines.push({ x1: left, y1: top, x2: right, y2: bot, color });
  lines.push({ x1: left, y1: bot, x2: right, y2: top, color });
  return { lines, texts, connectors: [] };
};

const GANN_SQUARE_FAN = [
  { label: '3x1', x: 3, y: 1, color: '#f23645' },
  { label: '2x1', x: 2, y: 1, color: '#ff9800' },
  { label: '1x1', x: 1, y: 1, color: '#b2b5be' },
  { label: '1x2', x: 1, y: 2, color: '#089981' },
  { label: '1x3', x: 1, y: 3, color: '#5b9cf6' },
];
const GANN_SQUARE_ARCS = [
  { k: 0.25, color: '#f23645' }, { k: 0.5, color: '#ff9800' },
  { k: 0.75, color: '#4caf50' }, { k: 1, color: '#089981' },
];

export const buildGannSquare: FibBuilder = (pts, d) => {
  const [a, b] = pts;
  const { lines, texts } = gannGrid(a, b, d);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  for (const f of GANN_SQUARE_FAN) {
    const end: Pt = f.x > f.y
      ? { x: a.x + dx, y: a.y + (f.y / f.x) * dy }
      : { x: a.x + (f.x / f.y) * dx, y: a.y + dy };
    const color = d.color ?? f.color;
    lines.push({ x1: a.x, y1: a.y, x2: end.x, y2: end.y, color });
    texts.push({ x: end.x + 4, y: end.y + 3.5, text: f.label, color, anchor: 'start' });
  }
  const curves: FibGeometry['curves'] = [];
  if (Math.abs(dx) >= 1 && Math.abs(dy) >= 1) {
    for (const arc of GANN_SQUARE_ARCS) {
      const pl: Pt[] = [];
      for (let i = 0; i <= 24; i++) {
        const t = (i / 24) * (Math.PI / 2);
        pl.push({ x: a.x + arc.k * dx * Math.cos(t), y: a.y + arc.k * dy * Math.sin(t) });
      }
      curves.push({ pts: pl, color: d.color ?? arc.color });
    }
  }
  return { lines, curves, texts, connectors: [] };
};
// --- Mach family -----------------------------------------------------------
// Ported from LuxAlgo Vela (Apache-2.0), https://github.com/LuxAlgo/Vela,
// src/core/drawings/types/MachFigure.ts and GoldenMach.ts: circles whose
// centres drift along the A-B axis at M times the radius growth, enclosed by
// the tangent "Mach cone" rays (a single wall at M = 1).

const machOf = (d: FibDrawing): number => {
  if (d.variant === 'sonic' || d.variant === 'goldensonic') return 1;
  const m = Number.isFinite(d.mach) ? d.mach! : 2;
  return Math.min(20, Math.max(1.01, m));
};

export const buildMach: FibBuilder = (pts, d) => {
  const [a, b] = pts;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const R = len / 2;
  if (R < 1) return {};
  const ratios = fibRatios(d).filter((r) => r > 0).sort((x, y) => x - y);
  if (ratios.length === 0) return {};
  const M = machOf(d);
  const c0: Pt = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const f: Pt = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
  const curves: FibGeometry['curves'] = [];
  const texts: FibGeometry['texts'] = [];
  for (const rho of ratios) {
    const r = rho * R;
    const cx = c0.x + M * (r - R) * f.x;
    const cy = c0.y + M * (r - R) * f.y;
    const color = ratioColor(d, rho);
    curves.push({ pts: closedEllipse(cx, cy, r, r), color, closed: true });
    if (d.showRatios !== false) {
      texts.push({ x: cx + f.x * r + 4, y: cy + f.y * r + 3.5, text: formatRatio(rho), color, anchor: 'start' });
    }
  }
  const nose: Pt = { x: c0.x - M * R * f.x, y: c0.y - M * R * f.y };
  const rayLen = M * ratios[ratios.length - 1] * R + 2 * R;
  const color = d.color ?? FIB_FALLBACK_COLOR;
  const lines: FibGeometry['lines'] = [];
  if (M <= 1 + 1e-9) {
    const p: Pt = { x: -f.y, y: f.x };
    lines.push({ x1: nose.x - p.x * rayLen, y1: nose.y - p.y * rayLen, x2: nose.x + p.x * rayLen, y2: nose.y + p.y * rayLen, color });
  } else {
    const mu = Math.asin(1 / M);
    const cs = Math.cos(mu);
    const sn = Math.sin(mu);
    const dirs: Pt[] = [
      { x: f.x * cs - f.y * sn, y: f.x * sn + f.y * cs },
      { x: f.x * cs + f.y * sn, y: -f.x * sn + f.y * cs },
    ];
    for (const v of dirs) lines.push({ x1: nose.x, y1: nose.y, x2: nose.x + v.x * rayLen, y2: nose.y + v.y * rayLen, color });
  }
  curves.push({ pts: closedEllipse(nose.x, nose.y, 3, 3), color, closed: true });
  return { lines, curves, texts, connectors: [] };
};

// --- Dedekind tessellation -------------------------------------------------
// Ported from LuxAlgo Vela (Apache-2.0), https://github.com/LuxAlgo/Vela,
// src/core/drawings/types/DedekindTessellation.ts: the semicircles of the
// modular group's fundamental domain tiling on the upper half plane, with the
// A-B box as the unit-height strip and its bottom edge as the real axis.

/** True when k/n (mod 1) is the centre of a semicircle of curvature n. */
export function isDedekindCenter(k: number, n: number): boolean {
  if (n % 2 === 1) return (k * k - 1) % n === 0;
  if (n % 8 === 0) return (k * k - 1) % n === 0 && ((k * k - 1) / n) % 2 !== 0;
  return false;
}

/** The k in [0, n) that are centres for curvature n. */
export function dedekindCentersInUnit(n: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < n; k++) if (isDedekindCenter(k, n)) out.push(k);
  return out;
}

export const buildDedekind: FibBuilder = (pts, d) => {
  const [a, b] = pts;
  const left = Math.min(a.x, b.x);
  const right = Math.max(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const bot = Math.max(a.y, b.y);
  const w = right - left;
  const h = bot - top;
  if (w < 1 || h < 1) return {};
  const color = d.color ?? FIB_FALLBACK_COLOR;
  const unitPx = h;
  const realSpan = w / h;
  const maxN = Math.min(64, Math.max(1, Math.round(d.maxCurvature ?? 24)));
  const xMin = -1 / maxN;
  const xMax = realSpan + 1 / maxN;
  const lines: FibGeometry['lines'] = [
    { x1: left, y1: top, x2: right, y2: top, color, dash: '3 3' },
    { x1: left, y1: bot, x2: right, y2: bot, color, dash: '3 3' },
    { x1: left, y1: top, x2: left, y2: bot, color, dash: '3 3' },
    { x1: right, y1: top, x2: right, y2: bot, color, dash: '3 3' },
  ];
  for (let k = Math.floor(2 * xMin); k <= Math.ceil(2 * xMax); k++) {
    if (Math.abs(k) % 2 !== 1) continue;
    const x = left + (k / 2) * unitPx;
    if (x < left || x > right) continue;
    lines.push({ x1: x, y1: bot, x2: x, y2: top, color });
  }
  const curves: FibGeometry['curves'] = [];
  for (let n = 1; n <= maxN; n++) {
    const rPx = unitPx / n;
    if (rPx < 0.75) continue;
    const centres = dedekindCentersInUnit(n);
    for (let t = Math.floor(xMin) - 1; t <= Math.ceil(xMax) + 1; t++) {
      for (const k of centres) {
        const c = k / n + t;
        if (c + 1 / n < xMin || c - 1 / n > xMax) continue;
        const cx = left + c * unitPx;
        if (cx + rPx < left - 1 || cx - rPx > right + 1) continue;
        const th0 = Math.acos(Math.min(1, Math.max(-1, (right - cx) / rPx)));
        const th1 = Math.acos(Math.min(1, Math.max(-1, (left - cx) / rPx)));
        if (th1 - th0 < 1e-6) continue;
        const steps = Math.max(4, Math.min(96, Math.round((rPx * (th1 - th0)) / 3)));
        curves.push({ pts: ellipsePoints(cx, bot, rPx, -rPx, th0, th1, steps), color });
      }
    }
  }
  return { lines, curves, connectors: [] };
};

/** Variants with a builder. Variants missing here are not drawn. */
export const FIB_BUILDERS: Partial<Record<FibDrawing['variant'], FibBuilder>> = {
  retracement: buildLevels,
  extension: buildLevels,
  extension2: buildLevels,
  timezones: buildTimezones,
  trendtime: buildTrendtime,
  channel: buildChannel,
  fan: buildFan,
  srfan: buildSrfan,
  circles: buildCircles,
  arcs: buildArcs,
  wedge: buildWedge,
  spiral: buildSpiral,
  gannfan: buildGannFan,
  gannbox: buildGannBox,
  gannsquare: buildGannSquare,
  sonic: buildMach,
  supersonic: buildMach,
  goldensonic: buildMach,
  goldensupersonic: buildMach,
  dedekind: buildDedekind,
  ...PATTERN_BUILDERS,
};
