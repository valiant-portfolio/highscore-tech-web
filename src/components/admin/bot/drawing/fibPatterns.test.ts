import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFibGeometry, fibHitTest, makeFibDrawing } from './fibonacci.ts';
import type { FibCtx, FibGeometry } from './fibGeometry.ts';
import { lineSegmentIntersection } from './fibGeometry.ts';
import type { FibDrawing, FibPoint } from './fibModel.ts';
import { ALL_SPEC_LIST } from './fibModel.ts';
import { patternRatioAt, harmonicLeg, patternValid, buildPattern } from './fibPatterns.ts';

const ctx: FibCtx = { timeToX: (t) => t / 60, priceToY: (p) => 1000 - p, paneW: 800, paneH: 1000 };
const X: FibPoint = { t: 6000, p: 100 };
const A: FibPoint = { t: 12000, p: 200 };
const B: FibPoint = { t: 18000, p: 138.2 };
const C: FibPoint = { t: 24000, p: 180 };
const D: FibPoint = { t: 30000, p: 121.4 };
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
const geo = (d: FibDrawing): FibGeometry => computeFibGeometry(d, ctx)!;
const mk = (v: Parameters<typeof makeFibDrawing>[0], pts: FibPoint[]) => makeFibDrawing(v, pts, 'p');

test('xabcd: legs, fills, labels and leg ratios', () => {
  const g = geo(mk('xabcd', [X, A, B, C, D]));
  assert.equal(g.lines.length, 4);
  assert.deepEqual([g.lines[0].x1, g.lines[0].y1, g.lines[0].x2, g.lines[0].y2], [100, 900, 200, 800]);
  assert.equal(g.lines[0].color, '#38c0fd');
  assert.equal(g.polys.length, 2);
  assert.ok(g.polys.every((p) => p.color === '#38c0fd'));
  assert.equal(g.connectors.length, 0);
  assert.equal(g.handles.length, 5);
  assert.equal(g.texts.length, 8);
  const labels = g.texts.slice(0, 5);
  assert.deepEqual(labels.map((t) => t.text), ['X', 'A', 'B', 'C', 'D']);
  const ys = [916, 793, 877.8, 813, 894.6];
  labels.forEach((t, i) => {
    near(t.x, 100 * (i + 1)); near(t.y, ys[i], 1e-6);
    assert.equal(t.anchor, 'middle'); assert.equal(t.size, 12); assert.equal(t.bold, true); assert.equal(t.color, 'var(--fg)');
  });
  const ratios = g.texts.slice(5);
  assert.deepEqual(ratios.map((t) => t.text), ['0.618', '0.676', '1.402']);
  near(ratios[0].x, 256); near(ratios[0].y, 834.4, 1e-6);
  near(ratios[1].x, 356); near(ratios[1].y, 844.4, 1e-6);
  near(ratios[2].x, 456); near(ratios[2].y, 852.8, 1e-6);
  assert.ok(ratios.every((t) => t.color === 'var(--fg)' && t.anchor === 'start'));
});

test('xabcd: fill off, own colour, hit test', () => {
  const d = mk('xabcd', [X, A, B, C, D]);
  assert.equal(geo({ ...d, fill: false }).polys.length, 0);
  const c = geo({ ...d, color: '#abcdef' });
  assert.ok(c.lines.every((l) => l.color === '#abcdef') && c.polys.every((p) => p.color === '#abcdef'));
  assert.equal(fibHitTest([geo(d)], 150, 850, 7), 'p');
  assert.equal(fibHitTest([geo(d)], 150, 700, 7), null);
});

test('xabcd: partial previews, a single point draws nothing', () => {
  const g = geo(mk('xabcd', [X, A, B]));
  assert.equal(g.lines.length, 2);
  assert.equal(g.polys.length, 1);
  assert.deepEqual(g.texts.map((t) => t.text), ['X', 'A', 'B', '0.618']);
  const one = geo(mk('xabcd', [X]));
  assert.equal(one.lines.length + one.polys.length + one.texts.length, 0);
});

test('abcd: three legs, no fill, ratios at C and D', () => {
  const g = geo(mk('abcd', [A, B, C, D]));
  assert.equal(g.lines.length, 3);
  assert.equal(g.polys.length, 0);
  assert.deepEqual(g.texts.map((t) => t.text), ['A', 'B', 'C', 'D', '0.676', '1.402']);
});

const HS: FibPoint[] = [
  { t: 6000, p: 100 }, { t: 12000, p: 200 }, { t: 18000, p: 140 }, { t: 24000, p: 300 },
  { t: 30000, p: 160 }, { t: 36000, p: 210 }, { t: 42000, p: 100 },
];

test('head and shoulders: neckline clipped to the outer legs, three labels', () => {
  const g = geo(mk('headshoulders', HS));
  assert.equal(g.lines.length, 7);
  const n = g.lines[6];
  assert.equal(n.dash, '6 4');
  near(n.x1, 122.222, 1e-3); near(n.y1, 877.778, 1e-3); near(n.x2, 633.333, 1e-3); near(n.y2, 826.667, 1e-3);
  assert.deepEqual(g.texts.map((t) => t.text), ['LS', 'H', 'RS']);
  assert.deepEqual(g.texts.map((t) => [t.x, t.y]), [[200, 793], [400, 693], [600, 783]]);
  assert.equal(g.polys.length, 0);
});

test('head and shoulders: partial has no neckline; coincident first leg falls back finite', () => {
  const part = geo(mk('headshoulders', HS.slice(0, 4)));
  assert.equal(part.lines.length, 3);
  const flat = geo(mk('headshoulders', [HS[0], HS[0], ...HS.slice(2)]));
  const n = flat.lines[flat.lines.length - 1];
  assert.equal(n.x1, 300); // falls back to the first trough
  assert.ok([n.x1, n.y1, n.x2, n.y2].every(Number.isFinite));
});

test('elliott impulse and correction through the registry', () => {
  const imp = geo(mk('elliottimpulse', [X, A, B, C, D]));
  assert.equal(imp.lines.length, 4);
  assert.deepEqual(imp.texts.map((t) => t.text), ['1', '2', '3', '4', '5']);
  assert.equal(imp.polys.length, 0);
  const cor = geo(mk('elliottcorrection', [X, A, B]));
  assert.equal(cor.lines.length, 2);
  assert.deepEqual(cor.texts.map((t) => t.text), ['A', 'B', 'C']);
  const one = geo(mk('elliottcorrection', [X]));
  assert.equal(one.lines.length + one.polys.length + one.texts.length, 0);
});

test('harmonic shapes build when called directly (legacy)', () => {
  const pts = [X, A, B, C, D];
  const px = pts.map((p) => ({ x: p.t / 60, y: 1000 - p.p }));
  const gar = buildPattern(px, mk('gartley', pts), ctx);
  assert.equal(gar.texts!.length, 9);
  assert.equal(gar.polys![0].color, '#0ecb81');
  assert.equal(gar.texts![8].text, 'Gartley ✓');
  const part = buildPattern(px.slice(0, 4), mk('gartley', pts.slice(0, 4)), ctx);
  assert.equal(part.polys![0].color, '#38c0fd');
  assert.ok(part.texts!.every((t) => !t.text.startsWith('Gartley')));
});

test('ratios: flat previous leg gives null; harmonic ad is 0.786', () => {
  assert.equal(patternRatioAt(mk('xabcd', [X, { t: 12000, p: 100 }, B]), 2), null);
  near(harmonicLeg(mk('gartley', [X, A, B, C, D]), 'ad')!, 0.786, 1e-3);
});

test('lineSegmentIntersection', () => {
  assert.equal(lineSegmentIntersection(0, 0, 10, 0, 0, 5, 10, 5), null);
  assert.equal(lineSegmentIntersection(0, 0, 10, 0, 20, 2, 20, 5), null);
  assert.deepEqual(lineSegmentIntersection(0, 0, 10, 10, 10, 0, 0, 10), { x: 5, y: 5 });
});

const green = '#0ecb81';
const red = '#f6465d';
const B2: FibPoint = { t: 18000, p: 150 };
const C2: FibPoint = { t: 24000, p: 230 };
const D2: FibPoint = { t: 30000, p: 127.82 };

test('gartley valid: green badge, ratios and fills', () => {
  const g = geo(mk('gartley', [X, A, B, C, D]));
  assert.equal(g.texts.length, 9);
  const badge = g.texts[8];
  assert.equal(badge.text, 'Gartley \u2713');
  near(badge.x, 500); near(badge.y, 909.6, 1e-6);
  assert.equal(badge.color, green); assert.equal(badge.size, 12); assert.equal(badge.bold, true);
  assert.ok(g.texts.slice(5, 8).every((t) => t.color === green));
  assert.ok(g.polys.length === 2 && g.polys.every((p) => p.color === green));
});

test('bat: per-ratio colours, invalid badge, red fill', () => {
  const g = geo(mk('bat', [X, A, B, C, D]));
  assert.deepEqual(g.texts.slice(5, 8).map((t) => t.color), [red, green, red]);
  assert.equal(g.texts[8].text, 'Bat \u2717');
  assert.equal(g.texts[8].color, red);
  assert.ok(g.polys.every((p) => p.color === red));
});

test('butterfly, crab and shark are invalid on the fixture', () => {
  for (const [v, name] of [['butterfly', 'Butterfly'], ['crab', 'Crab'], ['shark', 'Shark']] as const) {
    const g = geo(mk(v, [X, A, B, C, D]));
    assert.equal(g.texts[8].text, `${name} \u2717`, v);
    assert.ok(g.polys.every((p) => p.color === red), v);
  }
});

test('cypher valid with its own rule', () => {
  const g = geo(mk('cypher', [X, A, B2, C2, D2]));
  assert.equal(g.texts[8].text, 'Cypher \u2713');
  assert.equal(g.texts[8].color, green);
  assert.deepEqual(g.texts.slice(5, 8).map((t) => t.color), [green, 'var(--fg)', 'var(--fg)']);
  assert.ok(g.polys.every((p) => p.color === green));
});

test('gartley with four points: no badge, unknown validity, line-coloured fill', () => {
  const d = mk('gartley', [X, A, B, C]);
  assert.equal(patternValid(d), null);
  const g = geo(d);
  assert.ok(g.texts.every((t) => !t.text.startsWith('Gartley')));
  assert.equal(g.polys[0].color, '#38c0fd');
});
test('every pattern variant builds finite geometry from coincident points', () => {
  for (const s of ALL_SPEC_LIST.filter((x) => x.family === 'pattern')) {
    const g = geo(mk(s.variant, Array.from({ length: s.clicks }, () => X)));
    const nums: number[] = [];
    for (const l of g.lines) nums.push(l.x1, l.y1, l.x2, l.y2);
    for (const p of g.polys) for (const q of p.pts) nums.push(q.x, q.y);
    for (const t of g.texts) nums.push(t.x, t.y);
    assert.ok(nums.every(Number.isFinite), s.variant);
  }
});