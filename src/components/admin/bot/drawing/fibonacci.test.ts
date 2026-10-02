import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fibRetracementPrice, fibExtensionPrice, fibLevels, formatFibPct, formatFibLabel,
  makeFibDrawing, fibClicksNeeded, duplicateFib, shiftFib,
  computeFibGeometry, computeFibGeometries, fibHitTest, FIB_FALLBACK_COLOR,
} from './fibonacci.ts';
import type { FibCtx } from './fibonacci.ts';

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('fibRetracementPrice up-move', () => {
  const want: Record<number, number> = { 0: 200, 0.236: 176.4, 0.382: 161.8, 0.5: 150, 0.618: 138.2, 0.786: 121.4, 1: 100 };
  for (const [r, p] of Object.entries(want)) near(fibRetracementPrice(100, 200, Number(r)), p);
});
test('fibRetracementPrice down-move and a === b', () => {
  near(fibRetracementPrice(200, 100, 0.618), 161.8);
  for (const r of [0, 0.5, 1, 2]) near(fibRetracementPrice(150, 150, r), 150);
});
test('fibExtensionPrice', () => {
  const want: Record<number, number> = { 0: 150, 0.618: 211.8, 1: 250, 1.272: 277.2, 1.618: 311.8, 2: 350, 2.618: 411.8 };
  for (const [r, p] of Object.entries(want)) near(fibExtensionPrice(100, 200, 150, Number(r)), p);
  near(fibExtensionPrice(200, 100, 150, 1), 50);
});

test('fibLevels: defaults, levels, hidden, colour override, palette', () => {
  const d = makeFibDrawing('retracement', [{ t: 0, p: 100 }, { t: 60, p: 200 }], 'x');
  assert.equal(fibLevels(d).length, 7);
  assert.equal(fibLevels(d).find((l) => l.ratio === 0.5)?.color, '#4CAF50');
  d.levels = [0.5, 0.33];
  assert.deepEqual(fibLevels(d).map((l) => l.ratio), [0.5, 0.33]);
  assert.equal(fibLevels(d)[1].color, FIB_FALLBACK_COLOR);
  d.hidden = [0.5];
  assert.deepEqual(fibLevels(d).map((l) => l.ratio), [0.33]);
  d.color = '#123456';
  assert.equal(fibLevels(d)[0].color, '#123456');
  const e = makeFibDrawing('extension', [{ t: 0, p: 100 }, { t: 60, p: 200 }, { t: 120, p: 150 }], 'e');
  assert.equal(fibLevels(e).length, 7);
});

test('formatFibPct and formatFibLabel', () => {
  const want: [number, string][] = [[0, '0'], [0.236, '23.6'], [0.5, '50'], [1, '100'], [1.618, '161.8'], [2.618, '261.8']];
  for (const [r, s] of want) assert.equal(formatFibPct(r), s);
  assert.equal(formatFibLabel(0.618, 1.084321, 5), '61.8% 1.08432');
  assert.equal(formatFibLabel(0.618, 1.084321, 2), '61.8% 1.08');
});

test('fibClicksNeeded', () => {
  assert.equal(fibClicksNeeded('retracement'), 2);
  assert.equal(fibClicksNeeded('extension'), 3);
});

const ctx: FibCtx = { timeToX: (t) => t / 60, priceToY: (p) => 1000 - p, paneW: 800, paneH: 1000 };
const A = { t: 6000, p: 100 };
const B = { t: 12000, p: 200 };

test('computeFibGeometry: span, bands, handles', () => {
  const g = computeFibGeometry(makeFibDrawing('retracement', [B, A], 'r'), ctx)!;
  assert.equal(g.x1, 100);
  assert.equal(g.x2, 200);
  assert.equal(g.levels.length, 7);
  assert.equal(g.bands.length, 6);
  assert.equal(g.connectors.length, 1);
  assert.equal(g.handles.length, 2);
  near(g.levels[0].y, 1000 - 100); // r=0 is B = A-param here (100)
});
test('computeFibGeometry: extendRight, same bar, null on failed point, id passthrough', () => {
  const d = makeFibDrawing('retracement', [A, B], 'preview');
  d.extendRight = true;
  assert.equal(computeFibGeometry(d, ctx)!.x2, 800);
  assert.equal(computeFibGeometry(d, ctx)!.id, 'preview');
  const same = computeFibGeometry(makeFibDrawing('retracement', [A, { t: 6000, p: 150 }], 's'), ctx)!;
  assert.equal(same.x2, same.x1 + 1);
  assert.equal(computeFibGeometry(d, { ...ctx, timeToX: () => null }), null);
});
test('computeFibGeometry: level that fails to project is skipped; flat A===B has no NaN', () => {
  const g = computeFibGeometry(makeFibDrawing('retracement', [A, B], 'k'), { ...ctx, priceToY: (p) => (p === 200 ? null : 1000 - p) });
  assert.equal(g, null); // B itself fails
  const only = computeFibGeometry(makeFibDrawing('retracement', [A, B], 'k'), { ...ctx, priceToY: (p) => (p > 1000 || p === 138.2 ? null : 1000 - p) })!;
  assert.ok(only.levels.length < 7);
  const flat = computeFibGeometry(makeFibDrawing('retracement', [A, { t: 9000, p: 100 }], 'f'), ctx)!;
  assert.ok(flat.levels.every((l) => Number.isFinite(l.y)));
});
test('computeFibGeometry: extension, and a two-point extension preview has no levels', () => {
  const e = computeFibGeometry(makeFibDrawing('extension', [A, B, { t: 15000, p: 150 }], 'e'), ctx)!;
  assert.equal(e.connectors.length, 2);
  assert.equal(e.levels.length, 7);
  const half = computeFibGeometry(makeFibDrawing('extension', [A, B], 'e'), ctx)!;
  assert.equal(half.levels.length, 0);
  assert.equal(half.connectors.length, 1);
});
test('computeFibGeometries ignores non-fib and survives a throwing ctx', () => {
  const d = makeFibDrawing('retracement', [A, B], 'a');
  const bad = { ...ctx, timeToX: () => { throw new Error('x'); } };
  assert.equal(computeFibGeometries([{ kind: 'trend' }, d], ctx).length, 1);
  assert.equal(computeFibGeometries([d], bad).length, 0);
});

test('fibHitTest', () => {
  const d = makeFibDrawing('retracement', [A, B], 'h');
  d.levels = [0.5];
  const g = computeFibGeometry(d, ctx)!;
  const y = g.levels[0].y;
  assert.equal(fibHitTest([g], 190, y, 7), 'h');
  assert.equal(fibHitTest([g], 190, y + 8, 7), null);
  assert.equal(fibHitTest([g], 400, y, 7), null);
  // on the A->B connector, away from the level line
  const c = g.connectors[0];
  assert.equal(fibHitTest([g], c.x1 + 1, c.y1 - 1, 7), 'h');
});

test('shiftFib moves all points equally with integral times', () => {
  const bars = Array.from({ length: 20 }, (_, i) => ({ time: 1000 + i * 900 }));
  const d = makeFibDrawing('extension', [{ t: 1000, p: 1 }, { t: 1900, p: 2 }, { t: 3700, p: 3 }], 's');
  shiftFib(d, 2.5, 0.5, bars, 900);
  assert.deepEqual(d.points.map((p) => p.p), [1.5, 2.5, 3.5]);
  assert.deepEqual(d.points.map((p) => p.t), [3250, 4150, 5950]);
  assert.ok(d.points.every((p) => Number.isInteger(p.t)));
});

test('duplicateFib offsets prices and keeps the original', () => {
  const d = makeFibDrawing('retracement', [A, B], 'o');
  const c = duplicateFib(d, 'n');
  assert.equal(c.id, 'n');
  near(c.points[0].p, 100.05);
  assert.equal(d.points[0].p, 100);
});

test('fibHitTest: lines and curves, never fills', () => {
  const g = computeFibGeometry(makeFibDrawing('retracement', [A, B], 'g'), ctx)!;
  const shaped = {
    ...g, id: 'shape', levels: [], connectors: [], bands: [],
    lines: [{ x1: 100, y1: 100, x2: 300, y2: 100, color: '#000' }],
    curves: [{ pts: [{ x: 500, y: 500 }, { x: 600, y: 500 }, { x: 600, y: 600 }], color: '#000', closed: true }],
    polys: [{ pts: [{ x: 0, y: 700 }, { x: 100, y: 700 }, { x: 100, y: 800 }], color: '#000' }],
  };
  assert.equal(fibHitTest([shaped], 200, 104, 7), 'shape'); // on the line
  assert.equal(fibHitTest([shaped], 200, 120, 7), null);
  assert.equal(fibHitTest([shaped], 550, 503, 7), 'shape'); // on the curve
  assert.equal(fibHitTest([shaped], 550, 550, 7), 'shape'); // on the closing edge of the curve
  assert.equal(fibHitTest([shaped], 550, 580, 7), null);
  assert.equal(fibHitTest([shaped], 20, 710, 7), null); // inside a fill
});
