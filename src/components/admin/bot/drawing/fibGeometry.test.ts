import test from 'node:test';
import assert from 'node:assert/strict';
import {
  distToSeg, distToPolyline, rayEnd, lineYAt, ellipsePoints, ellipseSamples, paneIntersects, far,
} from './fibGeometry.ts';
import type { FibCtx } from './fibGeometry.ts';

const ctx: FibCtx = { timeToX: (t) => t / 60, priceToY: (p) => 1000 - p, paneW: 800, paneH: 1000 };
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test('distToSeg clamps to the ends', () => {
  near(distToSeg(5, 3, 0, 0, 10, 0), 3);
  near(distToSeg(-4, 3, 0, 0, 10, 0), 5);
  near(distToSeg(1, 1, 2, 2, 2, 2), Math.SQRT2);
});

test('distToPolyline: on, near, far, closed', () => {
  const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
  near(distToPolyline(5, 0, sq), 0);
  near(distToPolyline(5, 2, sq), 2);
  near(distToPolyline(100, 100, sq), Math.hypot(90, 90));
  near(distToPolyline(0, 5, sq, true), 0); // the closing edge
  assert.ok(distToPolyline(0, 5, sq, false) > 4);
  assert.equal(distToPolyline(1, 1, []), Infinity);
});

test('rayEnd points the right way and ends off the pane', () => {
  const from = { x: 100, y: 900 };
  const e = rayEnd(from, { x: 200, y: 800 }, ctx);
  near((e.x - from.x) / (e.y - from.y), -1);
  assert.ok(e.x > from.x && e.y < from.y);
  assert.ok(Math.hypot(e.x - from.x, e.y - from.y) >= ctx.paneW + ctx.paneH);
  assert.ok(far(from, ctx) >= ctx.paneW + ctx.paneH);
  assert.deepEqual(rayEnd(from, { x: 100, y: 900 }, ctx), { x: 100, y: 900 });
});

test('lineYAt', () => {
  near(lineYAt({ x: 100, y: 900 }, { x: 200, y: 800 }, 150), 850);
  near(lineYAt({ x: 100, y: 900 }, { x: 100, y: 800 }, 300), 900); // vertical
});

test('ellipsePoints: inclusive ends and count', () => {
  const pts = ellipsePoints(10, 20, 4, 2, 0, Math.PI, 8);
  assert.equal(pts.length, 9);
  near(pts[0].x, 14); near(pts[0].y, 20);
  near(pts[8].x, 6); near(pts[8].y, 20, 1e-9);
  assert.equal(ellipseSamples(1, 1), 32);
  assert.equal(ellipseSamples(10000, 10000), 256);
});

test('paneIntersects', () => {
  assert.equal(paneIntersects({ x1: -50, y1: 10, x2: -1, y2: 20 }, ctx), false);
  assert.equal(paneIntersects({ x1: -50, y1: 10, x2: 5, y2: 20 }, ctx), true);
});
