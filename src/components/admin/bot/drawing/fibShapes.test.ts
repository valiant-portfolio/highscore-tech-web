import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFibGeometry, computeFibGeometries, fibHitTest, makeFibDrawing } from './fibonacci.ts';
import { FIB_SPEC_LIST } from './fibModel.ts';
import { FIB_BUILDERS } from './fibShapes.ts';
import type { FibVariant, FibDrawing } from './fibModel.ts';
import type { FibCtx, FibGeometry } from './fibGeometry.ts';

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

// --- pitchfan ---------------------------------------------------------------

test('pitchfan: median plus a ray each side per level', () => {
  const g = geo(makeFibDrawing('pitchfan', [A, { t: 12000, p: 300 }, { t: 12000, p: 100 }], 'p'));
  assert.equal(g.lines.length, 1 + 2 * 9);
  assert.ok(through(g.lines[0], 200, 800)); // median to M
  assert.deepEqual(g.connectors, [{ x1: 200, y1: 700, x2: 200, y2: 900 }]);
  // ratio .25: lines[1], [2] through (200, 800 +/- 25*... ) h = (0,100) -> (200,825) and (200,775)
  assert.ok(through(g.lines[1], 200, 825) && through(g.lines[2], 200, 775));
});
test('pitchfan: r=1 rays pass through P2 and P3', () => {
  const P2 = { t: 12000, p: 300 }; // (200,700)
  const P3 = { t: 12000, p: 100 }; // (200,900)
  const g = geo(makeFibDrawing('pitchfan', [A, P2, P3], 'p'));
  const ratios = [0.25, 0.382, 0.5, 0.618, 0.75, 1, 1.5, 1.75, 2];
  const i = 1 + 2 * ratios.indexOf(1);
  assert.ok(through(g.lines[i], 200, 900) && through(g.lines[i + 1], 200, 700));
});
// --- all ready variants ------------------------------------------------------

const ready = FIB_SPEC_LIST.filter((s) => s.ready);
const samplePts = [A, B, CC];

test('a spec is ready exactly when it has a builder', () => {
  for (const s of FIB_SPEC_LIST) assert.equal(Boolean(FIB_BUILDERS[s.variant]), s.ready, s.variant);
});

test('ready set is what Batches 0, A and B ship', () => {
  assert.deepEqual(ready.map((s) => s.variant), ['retracement', 'extension2', 'extension', 'fan', 'timezones', 'channel', 'srfan', 'trendtime', 'pitchfan']);
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
    for (const c of [...g.levels, ...g.lines, ...g.polys, ...g.texts]) assert.match(c.color, /^#[0-9A-Fa-f]{6}$/);
  });
  test(`${s.variant}: a drawing colour overrides the palette`, () => {
    const d = makeFibDrawing(s.variant, samplePts.slice(0, s.clicks), 'k');
    d.color = '#123456';
    const g = geo(d);
    // the srfan grid is a fixed neutral, not a level
    for (const c of [...g.levels, ...g.lines.filter((l) => l.dash !== '2 3'), ...g.polys, ...g.texts]) assert.equal(c.color, '#123456');
  });
}

test('computeFibGeometries skips an unknown variant', () => {
  const bad = { ...makeFibDrawing('retracement', [A, B], 'u'), variant: 'nope' as FibVariant };
  assert.equal(computeFibGeometries([bad, makeFibDrawing('retracement', [A, B], 'ok')], ctx).length, 1);
});
