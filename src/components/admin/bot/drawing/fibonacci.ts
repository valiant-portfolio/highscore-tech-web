// Fibonacci family: the drawing record helpers and the glue that turns a
// drawing into screen geometry. The model lives in fibModel.ts, the shared
// geometry types and helpers in fibGeometry.ts, one builder per variant in
// fibShapes.ts. Pure - the chart is reached only through the FibCtx callbacks
// (see fibChart.ts), so node can run the tests.

import type { BarLike } from './barTime.ts';
import { timeToLogical, logicalToTime } from './barTime.ts';
import type { FibDrawing, FibPoint, FibVariant } from './fibModel.ts';
import { FIB_SPECS } from './fibModel.ts';
import type { FibCtx, FibGeometry, Pt } from './fibGeometry.ts';
import { distToSeg, distToPolyline } from './fibGeometry.ts';
import { FIB_BUILDERS } from './fibShapes.ts';

export * from './fibModel.ts';
export * from './fibGeometry.ts';

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

const DASH: Record<string, string> = { solid: '', dashed: '6 4', dotted: '2 3' };

/** Null if any point fails to project, or the variant is unknown or has no
 *  builder yet. With fewer points than the tool needs (the rubber band) — from
 *  ONE point — only connectors and handles are returned. A level whose price fails to project
 *  is skipped on its own. */
export function computeFibGeometry(d: FibDrawing, ctx: FibCtx): FibGeometry | null {
  const spec = FIB_SPECS[d.variant];
  const build = FIB_BUILDERS[d.variant];
  if (!spec || !build || d.points.length < 1) return null;
  const pts: Pt[] = [];
  for (const pt of d.points) {
    const x = ctx.timeToX(pt.t);
    const y = ctx.priceToY(pt.p);
    if (x === null || y === null) return null;
    pts.push({ x, y });
  }
  const xs = pts.map((p) => p.x);
  const x1 = Math.min(...xs);
  const connectors: FibGeometry['connectors'] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    connectors.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[i + 1].x, y2: pts[i + 1].y });
  }
  const base: FibGeometry = {
    id: d.id, variant: d.variant,
    x1, x2: Math.max(Math.max(...xs), x1 + 1),
    levels: [], bands: [], connectors,
    handles: pts.map((p, i) => ({ id: `${d.id}:${i}`, x: p.x, y: p.y })),
    lines: [], curves: [], polys: [], texts: [],
    width: d.width ?? 1,
    dash: DASH[d.style ?? 'solid'] ?? '',
    color: d.color,
    label: d.label,
    labelX: pts[0].x,
    labelY: pts[0].y - 12,
  };
  if (pts.length < 2 || (pts.length < spec.clicks && !spec.partial)) return base;
  return { ...base, ...build(pts.slice(0, spec.clicks), d, ctx) };
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

/** Id of the first drawing with a level line, connector, line or curve within
 *  `hit` px. Fills never hit. */
export function fibHitTest(geoms: readonly FibGeometry[], x: number, y: number, hit: number): string | null {
  for (const g of geoms) {
    if (x >= g.x1 - hit && x <= g.x2 + hit && g.levels.some((l) => Math.abs(y - l.y) <= hit)) return g.id;
    if (g.connectors.some((c) => distToSeg(x, y, c.x1, c.y1, c.x2, c.y2) <= hit)) return g.id;
    if (g.lines.some((l) => distToSeg(x, y, l.x1, l.y1, l.x2, l.y2) <= hit)) return g.id;
    if (g.curves.some((c) => distToPolyline(x, y, c.pts, c.closed) <= hit)) return g.id;
  }
  return null;
}