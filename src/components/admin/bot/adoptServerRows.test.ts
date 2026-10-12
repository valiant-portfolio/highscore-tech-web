import test from 'node:test';
import assert from 'node:assert/strict';
import { adoptServerRows } from './adoptServerRows.ts';

interface Row { symbol: string; updated_at: string | null; state: string }
const row = (symbol: string, updated_at: string | null, state: string): Row => ({ symbol, updated_at, state });

test('a newer server row replaces a stale client row', () => {
  const out = adoptServerRows([row('EURUSD', '2026-01-01T10:00:00Z', 'active')], [row('EURUSD', '2026-01-01T10:05:00Z', 'monitoring')]);
  assert.equal(out[0].state, 'monitoring');
});

test('a newer client row is kept', () => {
  const out = adoptServerRows([row('EURUSD', '2026-01-01T10:05:00Z', 'active')], [row('EURUSD', '2026-01-01T10:00:00Z', 'monitoring')]);
  assert.equal(out[0].state, 'active');
});

test('equal timestamps take the server row', () => {
  const out = adoptServerRows([row('EURUSD', '2026-01-01T10:00:00Z', 'active')], [row('EURUSD', '2026-01-01T10:00:00Z', 'monitoring')]);
  assert.equal(out[0].state, 'monitoring');
});

test('a symbol absent from the server rows is removed', () => {
  const out = adoptServerRows([row('EURUSD', '2026-01-01T10:00:00Z', 'active'), row('GBPUSD', '2026-01-01T10:00:00Z', 'active')], [row('EURUSD', '2026-01-01T10:00:00Z', 'active')]);
  assert.deepEqual(out.map((m) => m.symbol), ['EURUSD']);
});

test('a symbol new in the server rows is added', () => {
  const out = adoptServerRows([row('EURUSD', '2026-01-01T10:00:00Z', 'active')], [row('EURUSD', '2026-01-01T10:00:00Z', 'active'), row('XAUUSD', '2026-01-01T10:00:00Z', 'ready')]);
  assert.deepEqual(out.map((m) => m.symbol), ['EURUSD', 'XAUUSD']);
});

test('a null or invalid client timestamp never beats the server row', () => {
  const server = row('EURUSD', '2026-01-01T10:00:00Z', 'monitoring');
  assert.equal(adoptServerRows([row('EURUSD', null, 'active')], [server])[0].state, 'monitoring');
  assert.equal(adoptServerRows([row('EURUSD', 'not a date', 'active')], [server])[0].state, 'monitoring');
});