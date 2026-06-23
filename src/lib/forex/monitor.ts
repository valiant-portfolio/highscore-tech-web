// Profit-secure monitor — ported from forex-bot/monitor.py. Protects an OPEN
// position so a big winner doesn't round-trip to zero: arm at +1R, then close on
// peak give-back, a hard floor, or a momentum flip. Also returns a broker-side
// SL "lock" level (Bybit setStops) as a backstop. Pure decision function.

import type { Candle } from './bybit';

const ARM_R = 1.0; // start protecting once +1R
const GIVEBACK = 0.4; // close if it gives back >40% of the peak
const LOCK_MIN_R = 0.3; // once armed, never let it fall below +0.3R
const EMA_FAST = 8; // M15 fast EMA for the momentum check
const BODY_MIN = 0.6; // a "strong" opposite candle = body >= 60% of range

export interface MonitorDecision {
  action: 'HOLD' | 'CLOSE';
  reason: string;
  profitR: number;
  peakR: number;
  lockSl?: number; // push the broker SL here while armed & holding
}

function ema(values: number[], period: number): number {
  const k = 2 / (period + 1);
  let e = values[0];
  for (let i = 1; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

function atr(candles: Candle[], n = 14): number {
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const p = candles[i - 1];
    trs.push(Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close)));
  }
  const last = trs.slice(-n);
  return last.length ? last.reduce((a, b) => a + b, 0) / last.length : 0;
}

function momentum(candles: Candle[]): { lastClose: number; fastEma: number; bodyDir: 'bull' | 'bear' | 'flat' } | null {
  if (candles.length < EMA_FAST + 5) return null;
  const closed = candles.slice(0, -1); // drop the forming candle
  const closes = closed.map((c) => c.close);
  const e = ema(closes.slice(-30), EMA_FAST);
  const last = closed[closed.length - 1];
  const rng = Math.max(last.high - last.low, 1e-9);
  const body = Math.abs(last.close - last.open);
  const bodyDir = body / rng >= BODY_MIN ? (last.close > last.open ? 'bull' : 'bear') : 'flat';
  return { lastClose: last.close, fastEma: e, bodyDir };
}

export function monitorDecision(opts: {
  side: 'LONG' | 'SHORT';
  entry: number;
  stopLoss: number;
  currentPrice: number;
  candles: Candle[]; // M15
  peakR: number; // persisted across cycles (from the DB)
}): MonitorDecision {
  const isLong = opts.side === 'LONG';
  let R = Math.abs(opts.entry - opts.stopLoss);
  if (!R) R = atr(opts.candles); // fallback if the trade has no SL
  const profitPrice = isLong ? opts.currentPrice - opts.entry : opts.entry - opts.currentPrice;
  const profitR = R ? profitPrice / R : 0;
  const peakR = Math.max(opts.peakR, profitR);

  if (peakR < ARM_R) {
    return { action: 'HOLD', reason: `not armed (peak ${peakR.toFixed(2)}R < ${ARM_R}R)`, profitR, peakR };
  }
  if (profitR <= LOCK_MIN_R) {
    return { action: 'CLOSE', reason: `FLOOR — fell to ${profitR.toFixed(2)}R (lock ${LOCK_MIN_R}R)`, profitR, peakR };
  }
  if (profitR <= peakR * (1 - GIVEBACK)) {
    return { action: 'CLOSE', reason: `GIVE-BACK — peak ${peakR.toFixed(2)}R → ${profitR.toFixed(2)}R`, profitR, peakR };
  }
  const mom = momentum(opts.candles);
  if (mom) {
    const lostLong = isLong && (mom.lastClose < mom.fastEma || mom.bodyDir === 'bear');
    const lostShort = !isLong && (mom.lastClose > mom.fastEma || mom.bodyDir === 'bull');
    if (lostLong || lostShort) {
      return {
        action: 'CLOSE',
        reason: `MOMENTUM lost — close ${mom.lastClose} vs EMA${EMA_FAST} ${mom.fastEma.toFixed(1)}, body ${mom.bodyDir} (${profitR.toFixed(2)}R)`,
        profitR,
        peakR,
      };
    }
  }
  // armed & holding → lock the broker SL at the give-back / floor level
  const lockR = Math.max(LOCK_MIN_R, peakR * (1 - GIVEBACK));
  const lockSl = isLong ? opts.entry + lockR * R : opts.entry - lockR * R;
  return { action: 'HOLD', reason: `armed, holding (${profitR.toFixed(2)}R, peak ${peakR.toFixed(2)}R)`, profitR, peakR, lockSl };
}
