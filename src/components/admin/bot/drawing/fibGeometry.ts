// Screen geometry for the Fibonacci family: the shapes the overlay draws, and
// the small pixel-space helpers the builders share. Pure.

export interface Pt { x: number; y: number }

export interface FibCtx {
  timeToX(t: number): number | null;
  priceToY(p: number): number | null;
  paneW: number;
  paneH: number;
  /** Pixels per bar slot; 1 when unknown. */
  barW?: number;
}

export interface FibLine { x1: number; y1: number; x2: number; y2: number; color: string; dash?: string }
export interface FibCurve { pts: Pt[]; color: string; closed?: boolean }
export interface FibPoly { pts: Pt[]; color: string }
export interface FibText { x: number; y: number; text: string; color: string; anchor: 'start' | 'middle' | 'end'; size?: number; bold?: boolean }

export interface FibGeometry {
  id: string;
  variant: string;
  x1: number;
  x2: number;
  /** Horizontal price levels (retracement, extension, extension2). */
  levels: { ratio: number; price: number; y: number; color: string }[];
  bands: { yTop: number; yBot: number; color: string }[];
  connectors: { x1: number; y1: number; x2: number; y2: number }[];
  handles: { id: string; x: number; y: number }[];
  /** Generic primitives, empty unless a variant uses them. */
  lines: FibLine[];
  curves: FibCurve[];
  polys: FibPoly[];
  texts: FibText[];
  width: number;
  dash: string;
  /** The drawing's own colour, if set; connectors and handles fall back to neutral. */
  color?: string;
  label?: string;
  labelX: number;
  labelY: number;
}

export function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function distToPolyline(px: number, py: number, pts: readonly Pt[], closed = false): number {
  if (pts.length === 0) return Infinity;
  if (pts.length === 1) return Math.hypot(px - pts[0].x, py - pts[0].y);
  let best = Infinity;
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    best = Math.min(best, distToSeg(px, py, a.x, a.y, b.x, b.y));
  }
  return best;
}

/** Distance guaranteed to put a ray's end off the pane from anywhere. */
export function far(p: Pt, ctx: FibCtx): number {
  return Math.hypot(p.x - ctx.paneW / 2, p.y - ctx.paneH / 2) + ctx.paneW + ctx.paneH;
}

/** Where a ray from `from` through `through` ends, off the pane. `through`
 *  itself if the two coincide. */
export function rayEnd(from: Pt, through: Pt, ctx: FibCtx): Pt {
  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return { x: through.x, y: through.y };
  const f = far(from, ctx);
  return { x: from.x + (dx / len) * f, y: from.y + (dy / len) * f };
}

/** Y of the line through a and b at x; a's y when the line is vertical. */
export function lineYAt(a: Pt, b: Pt, x: number): number {
  const dx = b.x - a.x;
  return dx === 0 ? a.y : a.y + ((x - a.x) * (b.y - a.y)) / dx;
}

export const ellipseSamples = (rx: number, ry: number): number =>
  Math.max(32, Math.min(256, Math.round((rx + ry) / 4)));

/** n + 1 points along an ellipse from th0 to th1 inclusive. */
export function ellipsePoints(cx: number, cy: number, rx: number, ry: number, th0: number, th1: number, n: number): Pt[] {
  const out: Pt[] = [];
  const steps = Math.max(1, Math.floor(n));
  for (let i = 0; i <= steps; i++) {
    const th = th0 + ((th1 - th0) * i) / steps;
    out.push({ x: cx + rx * Math.cos(th), y: cy + ry * Math.sin(th) });
  }
  return out;
}

export function paneIntersects(box: { x1: number; y1: number; x2: number; y2: number }, ctx: FibCtx): boolean {
  return box.x2 >= 0 && box.x1 <= ctx.paneW && box.y2 >= 0 && box.y1 <= ctx.paneH;
}

/** Where the segment a-b crosses the infinite line l1-l2, or null when they are
 *  parallel or the crossing is off the segment.
 *  Ported from LuxAlgo Vela (Apache-2.0), https://github.com/LuxAlgo/Vela,
 *  src/core/drawings/hittest.ts. */
export function lineSegmentIntersection(
  lx1: number, ly1: number, lx2: number, ly2: number,
  ax: number, ay: number, bx: number, by: number,
): Pt | null {
  const dx = lx2 - lx1;
  const dy = ly2 - ly1;
  const ex = bx - ax;
  const ey = by - ay;
  const denom = ex * dy - ey * dx;
  if (Math.abs(denom) < 1e-9) return null;
  const s = ((ay - ly1) * dx - (ax - lx1) * dy) / denom;
  if (s < 0 || s > 1) return null;
  return { x: ax + s * ex, y: ay + s * ey };
}
