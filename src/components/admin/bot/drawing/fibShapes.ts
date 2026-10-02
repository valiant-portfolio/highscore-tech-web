// One builder per Fibonacci variant: projected anchor pixels in, drawable
// shapes out. Line-based tools work in PIXEL space from the projected anchors
// (the price axis is linear and time is a linear logical index, so that is
// what TradingView does too). Price scale is assumed linear; a log scale would
// need the builders to work in price space.
//
// Builders never throw on degenerate input and never emit NaN.

import type { FibDrawing } from './fibModel.ts';
import { fibLevels } from './fibModel.ts';
import type { FibCtx, FibGeometry, Pt } from './fibGeometry.ts';

export type FibBuilder = (pts: Pt[], d: FibDrawing, ctx: FibCtx) => Partial<FibGeometry>;

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
  if (d.fill !== false) {
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

/** Variants with a builder. Variants missing here are not drawn. */
export const FIB_BUILDERS: Partial<Record<FibDrawing['variant'], FibBuilder>> = {
  retracement: buildLevels,
  extension: buildLevels,
  extension2: buildLevels,
};
