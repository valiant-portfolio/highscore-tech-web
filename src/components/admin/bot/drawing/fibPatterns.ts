// Pattern tools: XABCD, ABCD, Head & Shoulders, Elliott waves and the harmonic
// patterns. One builder draws all of them from a per-variant definition. Pure.
//
// Ported from LuxAlgo Vela (Apache-2.0), https://github.com/LuxAlgo/Vela:
// src/core/drawings/types/PatternDrawing.ts, XABCD.ts, ABCDPattern.ts,
// HeadShoulders.ts and src/renderers/native/drawings/DrawingPainter.ts
// (paintPattern).

import type { FibDrawing, FibVariant } from './fibModel.ts';
import { FIB_SPECS, PATTERN_LINE_COLOR, PATTERN_VALID, PATTERN_INVALID, PATTERN_TEXT } from './fibModel.ts';
import type { FibGeometry, FibLine, FibPoly, FibText, Pt } from './fibGeometry.ts';
import { lineSegmentIntersection } from './fibGeometry.ts';
import type { FibBuilder } from './fibShapes.ts';

export type PatternVariant =
  | 'xabcd' | 'abcd' | 'headshoulders' | 'elliottimpulse' | 'elliottcorrection'
  | 'gartley' | 'bat' | 'butterfly' | 'crab' | 'shark' | 'cypher';

interface Band { min: number; max: number }
interface PatternDef {
  labels: readonly string[];
  legRatios: boolean;
  fillTriangles: readonly (readonly [number, number, number])[];
  neckline: readonly [number, number] | null;
  name: string | null;
  bands?: { ab: Band; bc: Band; cd: Band; ad: Band };
  cypher?: true;
}

const XABCD_LABELS = ['X', 'A', 'B', 'C', 'D'] as const;
const XABCD_TRIANGLES = [[0, 1, 2], [2, 3, 4]] as const;
const b = (min: number, max: number): Band => ({ min, max });
const harmonic = (name: string, bands: PatternDef['bands'], cypher?: true): PatternDef => ({
  labels: XABCD_LABELS, legRatios: true, fillTriangles: XABCD_TRIANGLES, neckline: null, name, bands, cypher,
});

export const PATTERN_DEFS: Record<PatternVariant, PatternDef> = {
  xabcd: { labels: XABCD_LABELS, legRatios: true, fillTriangles: XABCD_TRIANGLES, neckline: null, name: null },
  abcd: { labels: ['A', 'B', 'C', 'D'], legRatios: true, fillTriangles: [], neckline: null, name: null },
  headshoulders: { labels: ['', 'LS', '', 'H', '', 'RS', ''], legRatios: false, fillTriangles: [], neckline: [2, 4], name: null },
  elliottimpulse: { labels: ['1', '2', '3', '4', '5'], legRatios: false, fillTriangles: [], neckline: null, name: null },
  elliottcorrection: { labels: ['A', 'B', 'C'], legRatios: false, fillTriangles: [], neckline: null, name: null },
  gartley: harmonic('Gartley', { ab: b(0.55, 0.68), bc: b(0.382, 0.886), cd: b(1.13, 1.618), ad: b(0.74, 0.83) }),
  bat: harmonic('Bat', { ab: b(0.382, 0.5), bc: b(0.382, 0.886), cd: b(1.618, 2.618), ad: b(0.84, 0.92) }),
  butterfly: harmonic('Butterfly', { ab: b(0.74, 0.83), bc: b(0.382, 0.886), cd: b(1.618, 2.618), ad: b(1.272, 1.618) }),
  crab: harmonic('Crab', { ab: b(0.382, 0.618), bc: b(0.382, 0.886), cd: b(2.618, 3.618), ad: b(1.55, 1.69) }),
  shark: harmonic('Shark', { ab: b(0.382, 0.618), bc: b(1.13, 1.618), cd: b(1.618, 2.24), ad: b(0.886, 1.13) }),
  cypher: harmonic('Cypher', { ab: b(0.382, 0.618), bc: b(0, 0), cd: b(0, 0), ad: b(0, 0) }, true),
};

const MIN_LEG = 1e-9;
const leg = (d: FibDrawing, i: number, j: number): number | null => {
  const a = d.points[i];
  const c = d.points[j];
  return a && c ? Math.abs(a.p - c.p) : null;
};
const ratio = (num: number | null, den: number | null): number | null =>
  num === null || den === null || den < MIN_LEG ? null : num / den;
const inBand = (v: number | null, band: Band): boolean => v !== null && v >= band.min && v <= band.max;

/** |p[i] - p[i-1]| / |p[i-1] - p[i-2]|, null when the previous leg is flat. */
export function patternRatioAt(d: FibDrawing, i: number): number | null {
  if (i < 2) return null;
  return ratio(leg(d, i, i - 1), leg(d, i - 1, i - 2));
}

/** The harmonic leg ratios: ab = AB/XA, bc = BC/AB, cd = CD/BC, ad = AD/XA. */
export function harmonicLeg(d: FibDrawing, name: 'ab' | 'bc' | 'cd' | 'ad'): number | null {
  if (name === 'ab') return ratio(leg(d, 2, 1), leg(d, 1, 0));
  if (name === 'bc') return ratio(leg(d, 3, 2), leg(d, 2, 1));
  if (name === 'cd') return ratio(leg(d, 4, 3), leg(d, 3, 2));
  return ratio(leg(d, 4, 1), leg(d, 1, 0));
}

/** Whether the ratio at point i sits in its band: true, false, or null when
 *  the pattern has no band for it. */
export function patternRatioOk(d: FibDrawing, i: number): boolean | null {
  const def = PATTERN_DEFS[d.variant as PatternVariant];
  if (!def?.bands) return null;
  if (def.cypher) return i === 2 ? inBand(harmonicLeg(d, 'ab'), def.bands.ab) : null;
  if (i === 2) return inBand(harmonicLeg(d, 'ab'), def.bands.ab);
  if (i === 3) return inBand(harmonicLeg(d, 'bc'), def.bands.bc);
  if (i === 4) return inBand(harmonicLeg(d, 'cd'), def.bands.cd);
  return null;
}

/** True when a harmonic's five points fit its bands, false when not, null when
 *  the pattern is not a harmonic or is unfinished. Shown, never enforced. */
export function patternValid(d: FibDrawing): boolean | null {
  const def = PATTERN_DEFS[d.variant as PatternVariant];
  if (!def?.bands || d.points.length < 5) return null;
  const { bands } = def;
  if (def.cypher) {
    return inBand(harmonicLeg(d, 'ab'), bands.ab)
      && inBand(ratio(leg(d, 3, 0), leg(d, 1, 0)), b(1.272, 1.414))
      && inBand(ratio(leg(d, 4, 3), leg(d, 3, 0)), b(0.74, 0.83));
  }
  return inBand(harmonicLeg(d, 'ab'), bands.ab) && inBand(harmonicLeg(d, 'bc'), bands.bc)
    && inBand(harmonicLeg(d, 'cd'), bands.cd) && inBand(harmonicLeg(d, 'ad'), bands.ad);
}

export const buildPattern: FibBuilder = (pts: Pt[], d: FibDrawing): Partial<FibGeometry> => {
  const def = PATTERN_DEFS[d.variant as PatternVariant];
  const n = pts.length;
  if (!def || n < 2) return { lines: [], polys: [], texts: [], connectors: [] };
  const line = d.color ?? PATTERN_LINE_COLOR;
  const valid = def.name ? patternValid(d) : null;
  const fillC = valid === null ? line : valid ? PATTERN_VALID : PATTERN_INVALID;
  const lines: FibLine[] = [];
  const polys: FibPoly[] = [];
  const texts: FibText[] = [];

  if (d.fill ?? FIB_SPECS[d.variant].fillDefault) {
    for (const [i, j, k] of def.fillTriangles) {
      if (pts[i] && pts[j] && pts[k]) polys.push({ pts: [pts[i], pts[j], pts[k]], color: fillC });
    }
  }
  for (let i = 0; i + 1 < n; i++) {
    lines.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[i + 1].x, y2: pts[i + 1].y, color: line });
  }
  if (def.neckline && pts[def.neckline[0]] && pts[def.neckline[1]]) {
    const pa = pts[def.neckline[0]];
    const pb = pts[def.neckline[1]];
    const L = lineSegmentIntersection(pa.x, pa.y, pb.x, pb.y, pts[0].x, pts[0].y, pts[1].x, pts[1].y) ?? pa;
    const R = lineSegmentIntersection(pa.x, pa.y, pb.x, pb.y, pts[n - 2].x, pts[n - 2].y, pts[n - 1].x, pts[n - 1].y) ?? pb;
    lines.push({ x1: L.x, y1: L.y, x2: R.x, y2: R.y, color: line, dash: '6 4' });
  }

  for (let i = 0; i < n && i < def.labels.length; i++) {
    if (!def.labels[i]) continue;
    const p = pts[i];
    const ny = ((pts[i - 1]?.y ?? p.y) + (pts[i + 1]?.y ?? p.y)) / 2;
    const above = p.y <= ny;
    texts.push({ x: p.x, y: above ? p.y - 7 : p.y + 16, text: def.labels[i], color: PATTERN_TEXT, anchor: 'middle', size: 12, bold: true });
  }
  if (def.legRatios) {
    for (let i = 2; i < n; i++) {
      const r = patternRatioAt(d, i);
      if (r === null) continue;
      const ok = patternRatioOk(d, i);
      const a = pts[i - 1];
      const c = pts[i];
      texts.push({
        x: (a.x + c.x) / 2 + 6, y: (a.y + c.y) / 2 + 3.5, text: r.toFixed(3),
        color: ok === true ? PATTERN_VALID : ok === false ? PATTERN_INVALID : PATTERN_TEXT, anchor: 'start',
      });
    }
  }
  if (def.name && n >= def.labels.length) {
    const D = pts[n - 1];
    const P = pts[n - 2];
    const above = D.y <= P.y;
    texts.push({
      x: D.x, y: above ? D.y - 22 : D.y + 31, text: `${def.name} ${valid ? '✓' : '✗'}`,
      color: valid === false ? PATTERN_INVALID : PATTERN_VALID, anchor: 'middle', size: 12, bold: true,
    });
  }
  return { lines, polys, texts, connectors: [] };
};

/** Only variants whose spec is ready have a builder, so the menu and the
 *  builder table cannot disagree. */
export const PATTERN_BUILDERS: Partial<Record<FibVariant, FibBuilder>> = Object.fromEntries(
  (Object.keys(PATTERN_DEFS) as PatternVariant[])
    .filter((v) => FIB_SPECS[v].ready)
    .map((v) => [v, buildPattern]),
);
