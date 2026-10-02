import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FIB_SPECS, FIB_SPEC_LIST, ALL_SPEC_LIST, FIB_TOOL_VARIANT, formatRatio, fibClicksNeeded, fibPrompt, fibExtension2Price, fibLevels,
} from './fibModel.ts';
import type { FibDrawing } from './fibModel.ts';

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('every spec has one prompt per click, a unique tool id and a round-trip variant', () => {
  assert.equal(FIB_SPEC_LIST.length, 12);
  const ids = new Set(FIB_SPEC_LIST.map((s) => s.toolId));
  assert.equal(ids.size, FIB_SPEC_LIST.length);
  for (const s of FIB_SPEC_LIST) {
    assert.equal(s.prompts.length, s.clicks, s.variant);
    assert.equal(FIB_TOOL_VARIANT[s.toolId], s.variant);
    assert.equal(FIB_SPECS[s.variant], s);
    assert.equal(fibClicksNeeded(s.variant), s.clicks);
  }
});

test('fibPrompt clamps to the last prompt', () => {
  assert.equal(fibPrompt('extension', 0), 'click the first point');
  assert.equal(fibPrompt('extension', 2), 'click the third point (projection anchor)');
  assert.equal(fibPrompt('retracement', 5), 'click the second point');
});

test('fibExtension2Price: 0 at A, 100% at B, beyond B in the move direction', () => {
  near(fibExtension2Price(100, 200, 0), 100);
  near(fibExtension2Price(100, 200, 1), 200);
  near(fibExtension2Price(100, 200, 1.618), 261.8);
  near(fibExtension2Price(200, 100, 1.618), 38.2);
});

test('fibLevels: extension2 has eight levels; an old-shaped record still gets seven', () => {
  const pts = [{ t: 0, p: 100 }, { t: 60, p: 200 }];
  const e2: FibDrawing = { id: 'x', kind: 'fib', variant: 'extension2', points: pts };
  assert.equal(fibLevels(e2).length, 8);
  const old = { id: 'o', kind: 'fib', variant: 'retracement', points: pts } as FibDrawing;
  assert.equal(fibLevels(old).length, 7);
  // variants without horizontal levels have none
  assert.equal(fibLevels({ ...e2, variant: 'timezones' }).length, 0);
});

test('a fill toggle defaults to the spec fillDefault', () => {
  for (const s of FIB_SPEC_LIST) {
    const t = s.toggles.find((x) => x.key === 'fill');
    if (t) assert.equal(t.default, s.fillDefault, s.variant);
  }
});

test('ALL_SPEC_LIST: 20 specs in three families, unique ids, round-trips', () => {
  assert.equal(ALL_SPEC_LIST.length, 20);
  const count = (f: string) => ALL_SPEC_LIST.filter((s) => s.family === f).length;
  assert.deepEqual([count('fib'), count('gann'), count('geometry')], [12, 3, 5]);
  assert.equal(new Set(ALL_SPEC_LIST.map((s) => s.toolId)).size, 20);
  for (const s of ALL_SPEC_LIST) {
    assert.equal(s.prompts.length, s.clicks, s.variant);
    assert.equal(FIB_TOOL_VARIANT[s.toolId], s.variant);
    assert.equal(FIB_SPECS[s.variant], s);
  }
  // geometry specs have no builder yet
  assert.ok(ALL_SPEC_LIST.filter((s) => s.family === 'geometry').every((s) => !s.ready));
});

test('formatRatio: up to three decimals, no trailing zeros', () => {
  assert.equal(formatRatio(0.25), '0.25');
  assert.equal(formatRatio(1), '1');
  assert.equal(formatRatio(0.382), '0.382');
  assert.equal(formatRatio(0.3333333), '0.333');
  assert.equal(formatRatio(11.09), '11.09');
  assert.equal(formatRatio(0), '0');
});