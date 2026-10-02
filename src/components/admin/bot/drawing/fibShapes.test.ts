import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFibGeometry, computeFibGeometries, fibHitTest, makeFibDrawing } from './fibonacci.ts';
import { FIB_SPEC_LIST, ALL_SPEC_LIST } from './fibModel.ts';
import { FIB_BUILDERS, dedekindCentersInUnit } from './fibShapes.ts';
import type { FibVariant, FibDrawing } from './fibModel.ts';
import type { FibCtx, FibGeometry } from './fibGeometry.ts';
import { distToPolyline, distToSeg } from './fibGeometry.ts';

const ctx: FibCtx = { timeToX: (t) => t / 60, priceToY: (p) => 1000 - p, paneW: 800, paneH: 1000 };
const A = { t: 6000, p: 100 }; // (100, 900)
const B = { t: 12000, p: 200 }; // (200, 800)
const C = { t: 18000, p: 100 }; // (300, 900)
const near = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);
const geo = (d: FibDrawing, c: FibCtx = ctx): FibGeometry => computeFibGeometry(d, c)!;

// --- timezones --------------------------------------------------------------

test('timezones: lines at A + f*dx, off-pane ones omitted', () => {
  const g = geo(makeFibDrawing('timezones', [A, B], 'z'));
  assert.deepEqual(g.lines.map((l) => l.x1), [100, 200, 300, 400, 600]); // f=8 -> 900 > 808
  assert.deepEqual(g.texts.map((t) => t.text), ['0', '1', '2', '3', '5']);
  for (const l of g.lines) { assert.equal(l.y1, 0); assert.equal(l.y2, 1000); assert.equal(l.x1, l.x2); }
});
test('timezones: same bar is a one pixel interval, no NaN', () => {
  const g = geo(makeFibDrawing('timezones', [A, { t: 6000, p: 150 }], 'z'));
  assert.ok(g.lines.length > 5);
  assert.deepEqual(g.lines.slice(0, 3).map((l) => l.x1), [100, 101, 102]);
});
test('timezones: hit on a line only', () => {
  const g = geo(makeFibDrawing('timezones', [A, B], 'z'));
  assert.equal(fibHitTest([g], 300, 500, 7), 'z');
  assert.equal(fibHitTest([g], 350, 500, 7), null);
});
test('timezones: B left of A runs the intervals leftwards', () => {
  const g = geo(makeFibDrawing('timezones', [{ t: 24000, p: 100 }, { t: 18000, p: 100 }], 'z')); // 400 -> 300
  assert.deepEqual(g.lines.map((l) => l.x1).slice(0, 4), [400, 300, 200, 100]);
});

// --- trendtime --------------------------------------------------------------

test('trendtime: x_r = xC + r*dx, two dashed connectors', () => {
  const g = geo(makeFibDrawing('trendtime', [A, B, C], 't'));
  assert.equal(g.lines.length, 12);
  near(g.lines[0].x1, 300);
  near(g.lines[4].x1, 400); // r = 1
  near(g.lines[6].x1, 300 + 1.618 * 100);
  assert.equal(g.connectors.length, 2);
  assert.equal(g.texts[1].text, '38.2');
});
test('trendtime: two points is a rubber band with connectors only', () => {
  const g = geo(makeFibDrawing('trendtime', [A, B], 't'));
  assert.equal(g.lines.length, 0);
  assert.equal(g.connectors.length, 1);
});

// --- channel ----------------------------------------------------------------

const CC = { t: 9000, p: 100 }; // (150, 900); base line is at 850 there, so offset (0, 50)

test('channel: levels offset the base line towards C', () => {
  const g = geo(makeFibDrawing('channel', [A, B, CC], 'c'));
  assert.equal(g.lines.length, 11);
  const r1 = g.lines[6]; // ratio 1
  near(r1.x1, 100); near(r1.y1, 950); near(r1.x2, 200); near(r1.y2, 850);
  const r5 = g.lines[3]; // ratio .5
  near(r5.y1, 925); near(r5.y2, 825); // (the plan said 875; B + 0.5*o is 825)
  assert.equal(g.polys.length, 10);
  assert.equal(g.texts[3].text, '50');
  near(g.texts[3].x, 104); near(g.texts[3].y, 922);
});
test('channel: extendRight and extendLeft run off the pane', () => {
  const d = makeFibDrawing('channel', [A, B, CC], 'c');
  d.extendRight = true;
  const gr = geo(d);
  assert.ok(gr.lines.every((l) => l.x2 > 800));
  assert.ok(gr.lines.every((l) => l.x1 === 100));
  d.extendRight = false; d.extendLeft = true;
  const gl = geo(d);
  assert.ok(gl.lines.every((l) => l.x1 < 0));
  assert.ok(gl.lines.every((l) => l.x2 === 200));
});
test('channel: fill false removes the polys', () => {
  const d = makeFibDrawing('channel', [A, B, CC], 'c');
  d.fill = false;
  assert.equal(geo(d).polys.length, 0);
});
test('channel: vertical base line uses a horizontal offset, finite', () => {
  const g = geo(makeFibDrawing('channel', [A, { t: 6000, p: 200 }, CC], 'c'));
  assert.equal(g.lines.length, 11);
  const r1 = g.lines[6];
  near(r1.x1, 150); near(r1.x2, 150); // base at x=100, C at 150, ratio 1
  assert.ok(g.lines.every((l) => [l.x1, l.y1, l.x2, l.y2].every(Number.isFinite)));
});
test('channel: hit on the ratio-1 line', () => {
  const g = geo(makeFibDrawing('channel', [A, B, CC], 'c'));
  assert.equal(fibHitTest([g], 150, 900, 7), 'c');
  assert.equal(fibHitTest([g], 150, 700, 7), null);
});

// --- extension2 -------------------------------------------------------------

test('extension2: 0 at A, 100% at B, beyond B along the move', () => {
  const g = geo(makeFibDrawing('extension2', [A, B], 'x'));
  assert.equal(g.levels.length, 8);
  near(g.levels.find((l) => l.ratio === 1.618)!.y, 1000 - 261.8);
  near(g.levels.find((l) => l.ratio === 0)!.y, 900);
  near(g.levels.find((l) => l.ratio === 1)!.y, 800);
  assert.equal(g.bands.length, 7);
});
test('extension2: extendRight reaches the pane edge', () => {
  const d = makeFibDrawing('extension2', [A, B], 'x');
  d.extendRight = true;
  assert.equal(geo(d).x2, 800);
});
test('extension2: down move goes down', () => {
  const g = geo(makeFibDrawing('extension2', [B, A], 'x'));
  assert.ok(g.levels.find((l) => l.ratio === 1.618)!.y > 900);
});

// --- fan --------------------------------------------------------------------

const dirOf = (l: { x1: number; y1: number; x2: number; y2: number }) => ({ dx: l.x2 - l.x1, dy: l.y2 - l.y1 });
const through = (l: { x1: number; y1: number; x2: number; y2: number }, x: number, y: number) => {
  const { dx, dy } = dirOf(l);
  return Math.abs((x - l.x1) * dy - (y - l.y1) * dx) / Math.hypot(dx, dy) < 1e-6;
};

test('fan: rays from A through B\'s vertical', () => {
  const g = geo(makeFibDrawing('fan', [A, B], 'f'));
  assert.equal(g.lines.length, 7);
  const r5 = g.lines[3]; // ratio .5 through (200,850) and (300,800)
  assert.ok(through(r5, 200, 850) && through(r5, 300, 800));
  const r1 = g.lines[6]; // horizontal through A
  near(r1.y1, 900); near(r1.y2, 900);
  assert.ok(through(g.lines[0], 200, 800)); // ratio 0 is the trend line through B
  for (const l of g.lines) assert.ok(Math.hypot(l.x2 - l.x1, l.y2 - l.y1) >= ctx.paneW + ctx.paneH);
  assert.equal(g.polys.length, 6);
  assert.equal(g.texts[3].text, '50');
  near(g.texts[3].x, 204); near(g.texts[3].y, 847);
});
test('fan: fill false, and a hit on a ray', () => {
  const d = makeFibDrawing('fan', [A, B], 'f');
  d.fill = false;
  const g = geo(d);
  assert.equal(g.polys.length, 0);
  assert.equal(fibHitTest([g], 150, 850, 7), 'f'); // on the r=0 trend line (and r=.5 is at 875)
  assert.equal(fibHitTest([g], 150, 990, 7), null);
});

// --- srfan ------------------------------------------------------------------

test('srfan: 13 rays (r=1 and s=1 are one ray), 14 grid segments, 13 labels', () => {
  const g = geo(makeFibDrawing('srfan', [A, B], 's'));
  assert.equal(g.lines.length, 27);
  assert.equal(g.texts.length, 13);
  const grid = g.lines.filter((l) => l.dash === '2 3');
  assert.equal(grid.length, 14);
  assert.ok(grid.every((l) => l.color === '#787B86'));
  const h = grid.find((l) => l.y1 === 850 && l.y2 === 850)!; // price ratio .5
  near(h.x1, 100); near(h.x2, 200);
  const rays = g.lines.filter((l) => l.dash === undefined);
  assert.ok(rays.some((l) => through(l, 150, 800) && l.y1 === 900 && l.x1 === 100)); // time ray .5
});
test('srfan: grid false leaves only the rays', () => {
  const d = makeFibDrawing('srfan', [A, B], 's');
  d.grid = false;
  const g = geo(d);
  assert.equal(g.lines.length, 13);
  assert.equal(g.texts.length, 13);
});
test('srfan: time labels sit outside the box, whichever way B lies', () => {
  assert.equal(geo(makeFibDrawing('srfan', [A, B], 's')).texts.at(-1)!.y, 797); // B above A on screen
  assert.equal(geo(makeFibDrawing('srfan', [B, A], 's')).texts.at(-1)!.y, 912); // B below A
});

// --- circles ----------------------------------------------------------------

const P300 = { t: 18000, p: 300 }; // (300, 700)

test('circles: r=1 passes through A and B; r=.5 apex; closed; no duplicate closing point', () => {
  const g = geo(makeFibDrawing('circles', [A, P300], 'o'));
  assert.equal(g.curves.length, 10);
  const c1 = g.curves[5]; // ratio 1
  assert.equal(c1.closed, true);
  assert.ok(distToPolyline(100, 900, c1.pts, true) < 1);
  assert.ok(distToPolyline(300, 700, c1.pts, true) < 1);
  near(c1.pts[0].x, 200 + 141.4213562, 1e-4);
  const last = c1.pts.at(-1)!;
  assert.ok(Math.hypot(last.x - c1.pts[0].x, last.y - c1.pts[0].y) > 1e-3);
  const t = g.texts[2]; // ratio .5, label 3px above the apex
  assert.equal(t.anchor, 'middle');
  near(t.x, 200); near(t.y, 800 - 70.7106781 - 3, 1e-4);
});
test('circles: an ellipse that misses the pane is omitted; Connector A-B stays', () => {
  const far0 = geo(makeFibDrawing('circles', [{ t: 6000 * 20, p: 100 }, { t: 6000 * 20 + 600, p: 110 }], 'o'));
  assert.ok(far0.curves.length < 10);
  assert.equal(far0.texts.length, far0.curves.length);
  assert.equal(geo(makeFibDrawing('circles', [A, P300], 'o')).connectors.length, 1);
});
test('circles: hit on a ring', () => {
  const g = geo(makeFibDrawing('circles', [A, P300], 'o'));
  assert.equal(fibHitTest([g], 200 + 141.42, 800, 4), 'o');
});

// --- arcs -------------------------------------------------------------------

test('arcs: centre B with A below keeps every point at or below B; passes through A', () => {
  const g = geo(makeFibDrawing('arcs', [A, P300], 'a'));
  assert.equal(g.curves.length, 6);
  for (const c of g.curves) assert.ok(c.pts.every((p) => p.y >= 700 - 1e-9));
  const r1 = g.curves[5];
  assert.ok(distToPolyline(100, 900, r1.pts) < 1);
  assert.ok(!r1.closed);
  assert.equal(g.texts.length, 6);
  near(g.texts[5].x, 300); near(g.texts[5].y, 700 + 200 * Math.SQRT2 + 10, 1e-6);
});
test('arcs: A above B bulges upwards; fullCircle goes round and closes', () => {
  const up = geo(makeFibDrawing('arcs', [{ t: 6000, p: 300 }, { t: 18000, p: 100 }], 'a')); // A (100,700), B (300,900)
  for (const c of up.curves) assert.ok(c.pts.every((p) => p.y <= 900 + 1e-9));
  const d = makeFibDrawing('arcs', [A, P300], 'a');
  d.fullCircle = true;
  const full = geo(d);
  assert.ok(full.curves[5].pts.some((p) => p.y < 700));
  assert.equal(full.curves[5].closed, true);
});

// --- wedge ------------------------------------------------------------------

const P3 = { t: 18000, p: 100 }; // (300, 900)

test('wedge: arcs from the B edge to the C edge, two edge lines, sectors', () => {
  const g = geo(makeFibDrawing('wedge', [A, P300, P3], 'w'));
  assert.equal(g.curves.length, 6);
  assert.equal(g.lines.length, 2);
  assert.equal(g.polys.length, 6);
  assert.deepEqual(g.connectors, []);
  const r1 = g.curves[5].pts;
  assert.ok(distToPolyline(300, 700, r1) < 1e-6);
  assert.ok(distToPolyline(382.84271, 900, r1) < 1e-3);
  // sweep from -pi/4 to 0: a quarter of pi at most
  const ang = (p: { x: number; y: number }) => Math.atan2((p.y - 900) / 200, (p.x - 100) / 200);
  near(ang(r1[0]), -Math.PI / 4, 1e-9);
  near(ang(r1.at(-1)!), 0, 1e-9);
});
test('wedge: C at the B edge (zero sweep) is finite; fill false drops sectors', () => {
  const g = geo(makeFibDrawing('wedge', [A, P300, P300], 'w'));
  assert.ok(g.curves.every((c) => c.pts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))));
  const d = makeFibDrawing('wedge', [A, P300, P3], 'w');
  d.fill = false;
  assert.equal(geo(d).polys.length, 0);
});
test('wedge: the wrap picks the short way round (Δ = −π/2 through θ=π, not +3π/2 through 0)', () => {
  const g = geo(makeFibDrawing('wedge', [{ t: 18000, p: 100 }, { t: 12000, p: 200 }, { t: 12000, p: 0 }], 'w'));
  const r1 = g.curves[5].pts;
  near(r1[0].x, 200, 1e-9); near(r1[0].y, 800, 1e-9);
  near(r1.at(-1)!.x, 200, 1e-9); near(r1.at(-1)!.y, 1000, 1e-9);
  const ang = (p: { x: number; y: number }) => Math.atan2(p.y - 900, p.x - 300);
  let sweep = 0;
  for (let i = 1; i < r1.length; i++) {
    let d = ang(r1[i]) - ang(r1[i - 1]);
    if (d > Math.PI) d -= 2 * Math.PI; else if (d <= -Math.PI) d += 2 * Math.PI;
    sweep += d;
  }
  near(sweep, -Math.PI / 2, 1e-9);
  near(Math.min(...r1.map((p) => p.x)), 300 - 100 * Math.SQRT2, 0.02);
  assert.ok(r1.every((p) => p.x <= 300 + 1e-6));
});
// --- spiral -----------------------------------------------------------------

test('spiral: passes through B at t=0, grows, under 2000 points', () => {
  const g = geo(makeFibDrawing('spiral', [A, B], 'sp'));
  const pts = g.curves[0].pts;
  assert.ok(pts.length < 2000 && pts.length > 100);
  assert.ok(distToPolyline(200, 800, pts) < 1);
  const rad = (p: { x: number; y: number }) => Math.hypot(p.x - 100, p.y - 900);
  assert.ok(rad(pts.at(-1)!) > rad(pts[0]));
  assert.equal(g.connectors.length, 1);
});
test('spiral: ccw turns the other way and still passes through B', () => {
  const d = makeFibDrawing('spiral', [A, B], 'sp');
  const cw = geo(d).curves[0].pts;
  d.ccw = true;
  const ccw = geo(d).curves[0].pts;
  assert.ok(distToPolyline(200, 800, ccw) < 1);
  const turn = (pts: { x: number; y: number }[]) => {
    const i = 193; // just past t=0
    const v1 = { x: pts[i].x - 100, y: pts[i].y - 900 };
    const v2 = { x: pts[i + 1].x - pts[i].x, y: pts[i + 1].y - pts[i].y };
    return Math.sign(v1.x * v2.y - v1.y * v2.x);
  };
  assert.equal(turn(cw), -turn(ccw));
});
// --- all ready variants ------------------------------------------------------

const ready = FIB_SPEC_LIST.filter((s) => s.ready);
const samplePts = [A, B, CC];

test('a spec is ready exactly when it has a builder', () => {
  for (const s of FIB_SPEC_LIST) assert.equal(Boolean(FIB_BUILDERS[s.variant]), s.ready, s.variant);
});

test('ready set is what Batches 0, A, B and C ship', () => {
  assert.deepEqual(ready.map((s) => s.variant), ['retracement', 'extension2', 'extension', 'fan', 'timezones', 'channel', 'srfan', 'trendtime', 'circles', 'arcs', 'wedge', 'spiral']);
});

for (const s of ready) {
  test(`${s.variant}: one point short of the clicks draws only connectors and handles`, () => {
    const g = computeFibGeometry(makeFibDrawing(s.variant, samplePts.slice(0, s.clicks - 1), 'p'), ctx);
    if (s.clicks - 1 < 2) { assert.equal(g, null); return; }
    assert.ok(g);
    assert.equal(g.levels.length + g.bands.length + g.lines.length + g.curves.length + g.polys.length + g.texts.length, 0);
    assert.equal(g.handles.length, s.clicks - 1);
    assert.equal(g.connectors.length, s.clicks - 2);
  });
  test(`${s.variant}: coincident points give finite numbers`, () => {
    const same = [A, A, A].slice(0, s.clicks);
    const g = geo(makeFibDrawing(s.variant, same, 'k'));
    const bad: string[] = [];
    const walk = (v: unknown, path: string) => {
      if (typeof v === 'number') { if (!Number.isFinite(v)) bad.push(path); }
      else if (Array.isArray(v)) v.forEach((e, i) => walk(e, `${path}[${i}]`));
      else if (v && typeof v === 'object') for (const [k, e] of Object.entries(v)) walk(e, `${path}.${k}`);
    };
    walk(g, 'g');
    assert.deepEqual(bad, []);
  });
  test(`${s.variant}: every level and line colour is set`, () => {
    const g = geo(makeFibDrawing(s.variant, samplePts.slice(0, s.clicks), 'k'));
    for (const c of [...g.levels, ...g.lines, ...g.curves, ...g.polys, ...g.texts]) assert.match(c.color, /^#[0-9A-Fa-f]{6}$/);
  });
  test(`${s.variant}: a drawing colour overrides the palette`, () => {
    const d = makeFibDrawing(s.variant, samplePts.slice(0, s.clicks), 'k');
    d.color = '#123456';
    const g = geo(d);
    // the srfan grid is a fixed neutral, not a level
    for (const c of [...g.levels, ...g.lines.filter((l) => l.dash !== '2 3'), ...g.curves, ...g.polys, ...g.texts]) assert.equal(c.color, '#123456');
  });
}

test('computeFibGeometries skips an unknown variant', () => {
  const bad = { ...makeFibDrawing('retracement', [A, B], 'u'), variant: 'nope' as FibVariant };
  assert.equal(computeFibGeometries([bad, makeFibDrawing('retracement', [A, B], 'ok')], ctx).length, 1);
});


// --- Gann -------------------------------------------------------------------

test('gann fan: 9 rays through Q_r, labels, colours', () => {
  const g = geo(makeFibDrawing('gannfan', [A, B], 'g'));
  assert.equal(g.lines.length, 9);
  assert.equal(g.texts.length, 9);
  assert.equal(g.connectors.length, 0);
  const q = (i: number, y: number) => near(distToSeg(200, y, g.lines[i].x1, g.lines[i].y1, g.lines[i].x2, g.lines[i].y2), 0, 1e-6);
  q(4, 800); q(3, 850); q(8, 100); q(0, 887.5);
  near(g.lines[4].x2, 1726.35, 0.01);
  near(g.lines[4].y2, -726.35, 0.01);
  assert.equal(g.texts[4].text, '1/1');
  assert.equal(g.texts[4].x, 204);
  assert.equal(g.lines[4].color, '#b2b5be');
  assert.ok(g.lines.every((l) => l.x1 === 100 && l.y1 === 900));
});
test('gann fan: d.color overrides, A==B finite, B left of A mirrors labels, hit', () => {
  const d = makeFibDrawing('gannfan', [A, B], 'g');
  assert.ok(geo({ ...d, color: '#123456' }).lines.every((l) => l.color === '#123456'));
  const z = geo(makeFibDrawing('gannfan', [A, A], 'g'));
  for (const l of z.lines) for (const v of [l.x1, l.y1, l.x2, l.y2]) assert.ok(Number.isFinite(v));
  const l = geo(makeFibDrawing('gannfan', [B, A], 'g'));
  assert.equal(l.texts[0].anchor, 'end');
  assert.equal(l.texts[0].x, 96);
  const g = geo(d);
  assert.equal(fibHitTest([g], 150, 850, 7), 'g');
  assert.equal(fibHitTest([g], 150, 600, 7), null);
});

test('gann box: 16 lines, labelled grid, diagonals, hits lines only', () => {
  const g = geo(makeFibDrawing('gannbox', [A, B], 'b'));
  assert.equal(g.lines.length, 16);
  assert.deepEqual(g.texts.map((t) => t.text), ['0', '0.25', '0.382', '0.5', '0.618', '0.75', '1']);
  near(g.lines[2].y1, 861.8); near(g.lines[2].x1, 100); near(g.lines[2].x2, 200);
  near(g.lines[11].x1, 161.8); near(g.lines[11].y1, 800); near(g.lines[11].y2, 900);
  assert.deepEqual([g.lines[14].x1, g.lines[14].y1, g.lines[14].x2, g.lines[14].y2], [100, 800, 200, 900]);
  assert.deepEqual([g.lines[15].x1, g.lines[15].y1, g.lines[15].x2, g.lines[15].y2], [100, 900, 200, 800]);
  near(g.texts[1].x, 96); near(g.texts[1].y, 878.5);
  assert.equal(g.lines[2].color, '#ff9800');
  assert.equal(g.polys.length, 0);
  assert.equal(g.connectors.length, 0);
  assert.equal(fibHitTest([g], 150, 850, 7), 'b');
  assert.equal(fibHitTest([g], 112, 818, 3), null);
});

test('gann square: grid, fan, arcs', () => {
  const g = geo(makeFibDrawing('gannsquare', [A, B], 's'));
  assert.equal(g.lines.length, 19);
  assert.equal(g.curves.length, 4);
  assert.equal(g.texts.length, 12);
  const end = (i: number) => [g.lines[14 + i].x2, g.lines[14 + i].y2];
  const exp = [[200, 866.667], [200, 850], [200, 800], [150, 800], [133.333, 800]];
  exp.forEach((e, i) => { near(end(i)[0], e[0], 1e-3); near(end(i)[1], e[1], 1e-3); });
  assert.deepEqual(g.texts.slice(7).map((t) => t.text), ['3x1', '2x1', '1x1', '1x2', '1x3']);
  const c = g.curves[1];
  assert.equal(c.pts.length, 25);
  near(c.pts[0].x, 150); near(c.pts[0].y, 900);
  near(c.pts[24].x, 100); near(c.pts[24].y, 850);
  near(c.pts[12].x, 135.355, 1e-3); near(c.pts[12].y, 864.645, 1e-3);
  assert.equal(fibHitTest([g], 150, 850, 7), 's');
  assert.equal(fibHitTest([g], 170.71, 829.29, 3), 's');
});
test('gann square: flat box has no arcs and stays finite; d.color overrides', () => {
  const flat = geo(makeFibDrawing('gannsquare', [A, { t: 12000, p: 100 }], 's'));
  assert.equal(flat.curves.length, 0);
  for (const l of flat.lines) for (const v of [l.x1, l.y1, l.x2, l.y2]) assert.ok(Number.isFinite(v));
  const c = geo({ ...makeFibDrawing('gannsquare', [A, B], 's'), color: '#abcdef' });
  assert.ok(c.curves.every((k) => k.color === '#abcdef'));
  assert.ok(c.lines.slice(14).every((l) => l.color === '#abcdef'));
});

test('a spec is ready exactly when it has a builder (Elliott and Harmonic land in later batches)', () => {
  for (const s of ALL_SPEC_LIST) assert.equal(Boolean(FIB_BUILDERS[s.variant]), s.ready, s.variant);
});
// --- Mach family -------------------------------------------------------------

const MA = { t: 6000, p: 100 }; // (100, 900)
const MB = { t: 12000, p: 200 }; // (200, 800)
const R70 = Math.hypot(100, 100) / 2;
const finite = (g: FibGeometry) => {
  for (const l of g.lines) for (const v of [l.x1, l.y1, l.x2, l.y2]) assert.ok(Number.isFinite(v));
  for (const c of g.curves) for (const q of c.pts) assert.ok(Number.isFinite(q.x) && Number.isFinite(q.y));
};
const tangent = (g: FibGeometry, n: number) => {
  for (let k = 0; k < n; k++) {
    const c = g.curves[k].pts;
    const cx = c.reduce((s, q) => s + q.x, 0) / c.length;
    const cy = c.reduce((s, q) => s + q.y, 0) / c.length;
    const r = Math.hypot(c[0].x - cx, c[0].y - cy);
    for (const l of g.lines) near(distToSeg(cx, cy, l.x1, l.y1, l.x2, l.y2), r, 1e-6);
  }
};
const centre = (g: FibGeometry, k: number) => {
  const c = g.curves[k].pts;
  return { x: c.reduce((s, q) => s + q.x, 0) / c.length, y: c.reduce((s, q) => s + q.y, 0) / c.length };
};

test('sonic: 6 circles on a drifting centre, a wall, nose ring, labels', () => {
  const g = geo(makeFibDrawing('sonic', [MA, MB], 'm'));
  assert.equal(g.curves.length, 7);
  for (let k = 1; k <= 6; k++) {
    const c = centre(g, k - 1);
    near(c.x, 150 + 50 * (k - 1), 0.05); near(c.y, 850 - 50 * (k - 1), 0.05);
    near(Math.hypot(g.curves[k - 1].pts[0].x - c.x, g.curves[k - 1].pts[0].y - c.y), R70 * k, 1e-6);
  }
  const nose = centre(g, 6);
  near(nose.x, 100, 0.05); near(nose.y, 900, 0.05);
  assert.equal(g.lines.length, 1);
  const l = g.lines[0];
  const ends = [[l.x1, l.y1], [l.x2, l.y2]].sort((u, v) => u[0] - v[0]);
  near(ends[0][0], -300, 0.01); near(ends[0][1], 500, 0.01);
  near(ends[1][0], 500, 0.01); near(ends[1][1], 1300, 0.01);
  assert.deepEqual(g.texts.map((t) => t.text), ['1', '2', '3', '4', '5', '6']);
  near(g.texts[0].x, 204, 0.05); near(g.texts[0].y, 803.5, 0.05);
  assert.equal(g.connectors.length, 0);
  assert.equal(fibHitTest([g], 100, 900, 4), 'm');
});

test('supersonic: Mach 2 cone, tangent rays; mach 1.5 angle', () => {
  const g = geo(makeFibDrawing('supersonic', [MA, MB], 'm'));
  assert.equal(g.lines.length, 2);
  const nose = centre(g, 6);
  near(nose.x, 50, 0.05); near(nose.y, 950, 0.05);
  const c2 = centre(g, 1);
  near(c2.x, 250, 0.05); near(c2.y, 750, 0.05);
  const dirs = g.lines.map((l) => [(l.x2 - l.x1) / Math.hypot(l.x2 - l.x1, l.y2 - l.y1), (l.y2 - l.y1) / Math.hypot(l.x2 - l.x1, l.y2 - l.y1)]);
  near(dirs[0][0], 0.9659, 1e-4); near(dirs[0][1], -0.2588, 1e-4);
  near(dirs[1][0], 0.2588, 1e-4); near(dirs[1][1], -0.9659, 1e-4);
  for (const l of g.lines) { near(l.x1, 50, 1e-6); near(l.y1, 950, 1e-6); near(Math.hypot(l.x2 - l.x1, l.y2 - l.y1), 989.95, 0.01); }
  tangent(g, 6);
  const g15 = geo({ ...makeFibDrawing('supersonic', [MA, MB], 'm'), mach: 1.5 });
  tangent(g15, 6);
  const v = g15.lines[0];
  const ang = Math.atan2(-(v.y2 - v.y1), v.x2 - v.x1) - Math.PI / 4;
  near(Math.abs(ang), Math.asin(2 / 3), 1e-9);
});

test('golden sonic and supersonic: 11 circles', () => {
  const g = geo(makeFibDrawing('goldensonic', [MA, MB], 'm'));
  assert.equal(g.curves.length, 12);
  const s = centre(g, 0);
  near(s.x, 111.8, 0.05); near(s.y, 888.2, 0.05);
  near(Math.hypot(g.curves[0].pts[0].x - s.x, g.curves[0].pts[0].y - s.y), 16.688, 1e-3);
  const one = centre(g, 5); near(one.x, 150, 0.05); near(one.y, 850, 0.05);
  const phi = centre(g, 6); near(phi.x, 180.9, 0.05); near(phi.y, 819.1, 0.05);
  const nose = centre(g, 11); near(nose.x, 100, 0.05); near(nose.y, 900, 0.05);
  assert.equal(g.texts[0].text, '0.236');
  assert.equal(g.texts[10].text, '11.09');
  const l = g.lines[0];
  near(Math.hypot(l.x2 - l.x1, l.y2 - l.y1) / 2, 925.6, 0.1);
  const gs = geo(makeFibDrawing('goldensupersonic', [MA, MB], 'm'));
  assert.equal(gs.lines.length, 2);
  const n2 = centre(gs, 11); near(n2.x, 50, 0.05); near(n2.y, 950, 0.05);
  tangent(gs, 11);
});

test('mach: degenerate, showRatios false, d.color', () => {
  for (const v of ['sonic', 'supersonic', 'goldensonic', 'goldensupersonic'] as const) {
    const z = geo(makeFibDrawing(v, [MA, MA], 'm'));
    assert.equal(z.curves.length, 0); assert.equal(z.lines.length, 0);
    finite(geo(makeFibDrawing(v, [MA, MB], 'm')));
  }
  finite(geo({ ...makeFibDrawing('supersonic', [MA, MB], 'm'), mach: NaN }));
  const g = geo({ ...makeFibDrawing('sonic', [MA, MB], 'm'), showRatios: false });
  assert.equal(g.texts.length, 0);
  const c = geo({ ...makeFibDrawing('supersonic', [MA, MB], 'm'), color: '#abcdef' });
  assert.ok(c.curves.every((k) => k.color === '#abcdef'));
  assert.ok(c.lines.every((l) => l.color === '#abcdef'));
});
// --- Dedekind tessellation ---------------------------------------------------

test('dedekind centres in the unit interval', () => {
  const exp: Record<number, number[]> = { 1: [0], 2: [], 3: [1, 2], 4: [], 5: [1, 4], 8: [3, 5], 16: [7, 9], 24: [5, 11, 13, 19] };
  for (const n of Object.keys(exp)) assert.deepEqual(dedekindCentersInUnit(Number(n)), exp[Number(n)], `n=${n}`);
});

test('dedekind: maxCurvature 1 gives one vertical, a border and two exact arcs', () => {
  const g = geo({ ...makeFibDrawing('dedekind', [A, B], 'k'), maxCurvature: 1 });
  assert.equal(g.lines.length, 5);
  assert.equal(g.lines.filter((l) => l.dash === '3 3').length, 4);
  const v = g.lines.find((l) => !l.dash)!;
  near(v.x1, 150); near(v.y1, 900); near(v.y2, 800);
  assert.equal(g.curves.length, 2);
  const [c0, c1] = g.curves;
  near(c0.pts[0].x, 200); near(c0.pts[0].y, 900);
  near(c0.pts[c0.pts.length - 1].x, 100); near(c0.pts[c0.pts.length - 1].y, 800);
  near(c1.pts[0].x, 200); near(c1.pts[0].y, 800);
  near(c1.pts[c1.pts.length - 1].x, 100); near(c1.pts[c1.pts.length - 1].y, 900);
  assert.equal(g.connectors.length, 0);
});

test('dedekind: default curvature stays inside the box and finite; flat box is empty; d.color', () => {
  const g = geo(makeFibDrawing('dedekind', [A, B], 'k'));
  assert.ok(g.curves.length > 20);
  for (const c of g.curves) for (const q of c.pts) {
    assert.ok(Number.isFinite(q.x) && Number.isFinite(q.y));
    assert.ok(q.x >= 100 - 1e-6 && q.x <= 200 + 1e-6 && q.y >= 800 - 1e-6 && q.y <= 900 + 1e-6, `${q.x},${q.y}`);
  }
  const flat = geo(makeFibDrawing('dedekind', [A, { t: 12000, p: 100 }], 'k'));
  assert.equal(flat.curves.length, 0); assert.equal(flat.lines.length, 0);
  const col = geo({ ...makeFibDrawing('dedekind', [A, B], 'k'), color: '#abcdef' });
  assert.ok(col.curves.every((k) => k.color === '#abcdef') && col.lines.every((l) => l.color === '#abcdef'));
});
test('dedekind: verticals stay inside the box; a narrow box clips its arcs', () => {
  const wide = geo({ ...makeFibDrawing('dedekind', [A, { t: 18000, p: 200 }], 'k'), maxCurvature: 1 });
  assert.deepEqual(wide.lines.filter((l) => !l.dash).map((l) => l.x1), [150, 250]);
  assert.equal(wide.curves.length, 3);
  const g = geo({ ...makeFibDrawing('dedekind', [A, { t: 9000, p: 200 }], 'k'), maxCurvature: 1 });
  assert.equal(g.curves.length, 2);
  const [c0, c1] = g.curves;
  const y = 900 - 100 * Math.sin(Math.PI / 3);
  near(c0.pts[0].x, 150); near(c0.pts[0].y, y);
  near(c0.pts[c0.pts.length - 1].x, 100); near(c0.pts[c0.pts.length - 1].y, 800);
  near(c1.pts[0].x, 150); near(c1.pts[0].y, y);
  near(c1.pts[c1.pts.length - 1].x, 100); near(c1.pts[c1.pts.length - 1].y, 900);
});