import test from 'node:test';
import assert from 'node:assert/strict';
import { inferBarSecs, timeToLogical, logicalToTime } from './barTime.ts';

const T0 = 1_700_000_000;
// 10 M15 bars, then a weekend-sized gap, then 5 more.
const bars = [
  ...Array.from({ length: 10 }, (_, i) => ({ time: T0 + i * 900 })),
  ...Array.from({ length: 5 }, (_, i) => ({ time: T0 + 9 * 900 + 172_800 + (i + 1) * 900 })),
];
const near = (a: number | null, b: number) => {
  assert.notEqual(a, null);
  assert.ok(Math.abs((a as number) - b) < 1e-9, `${a} != ${b}`);
};

test('inferBarSecs: regular M15', () => {
  assert.equal(inferBarSecs(bars.slice(0, 10)), 900);
});
test('inferBarSecs: weekend gap does not win', () => {
  assert.equal(inferBarSecs(bars), 900);
});
test('inferBarSecs: fewer than two bars uses the fallback', () => {
  assert.equal(inferBarSecs([]), 900);
  assert.equal(inferBarSecs([{ time: T0 }], 3600), 3600);
});

test('timeToLogical: exact bar is an integer', () => {
  near(timeToLogical(bars, 900, bars[0].time), 0);
  near(timeToLogical(bars, 900, bars[4].time), 4);
  near(timeToLogical(bars, 900, bars[14].time), 14);
});
test('timeToLogical: right of last is last + k', () => {
  near(timeToLogical(bars, 900, bars[14].time + 3 * 900), 17);
});
test('timeToLogical: left of first is negative', () => {
  near(timeToLogical(bars, 900, bars[0].time - 2 * 900), -2);
});
test('timeToLogical: inside a gap is fractional', () => {
  const mid = (bars[9].time + bars[10].time) / 2;
  near(timeToLogical(bars, 900, mid), 9.5);
});
test('timeToLogical: empty is null', () => {
  assert.equal(timeToLogical([], 900, T0), null);
  assert.equal(logicalToTime([], 900, 3), null);
});

test('logicalToTime inverts timeToLogical in every region', () => {
  const ts = [
    bars[0].time - 5 * 900, bars[0].time, bars[3].time + 450,
    bars[9].time, (bars[9].time + bars[10].time) / 2, bars[12].time,
    bars[14].time, bars[14].time + 7 * 900,
  ];
  for (const t of ts) {
    const L = timeToLogical(bars, 900, t) as number;
    near(logicalToTime(bars, 900, L), t);
  }
});
