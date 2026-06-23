// Structure strategy — ported from the validated forex-bot/ Python (structure.py +
// signal.py). Multi-timeframe market structure + S/R clustering + candlestick
// confirmation + STRICT daily-trend filter + 1:3 targeting. Pure functions over
// candle arrays (oldest→newest). Scale-invariant (% of price + ATR) so it adapts
// to BTC — but RE-BACKTEST on crypto before trusting it.

import type { Candle } from './bybit';

const MIN_RR = 3.0;
const BODY_MIN = 0.6;

export interface Zone { price: number; low: number; high: number; touches: number }

export interface Signal {
  state: 'IGNORE' | 'WAIT' | 'ARM-LONG' | 'ARM-SHORT';
  price: number;
  side?: 'LONG' | 'SHORT';
  entry?: number;
  sl?: number;
  tp?: number;
  rr?: number;
  risk?: number;
  reason: string;
  topdown?: string;
  zone?: Zone;
  checks?: Record<string, unknown>;
}

// ── primitives ───────────────────────────────────────────────────────────────
function atr(h: number[], l: number[], c: number[], n = 14): number {
  const trs: number[] = [];
  for (let i = 1; i < h.length; i++) {
    trs.push(Math.max(h[i] - l[i], Math.abs(h[i] - c[i - 1]), Math.abs(l[i] - c[i - 1])));
  }
  const last = trs.slice(-n);
  return last.length ? last.reduce((a, b) => a + b, 0) / last.length : 0;
}

function sma(vals: number[], n: number): number {
  const last = vals.slice(-n);
  return last.length ? last.reduce((a, b) => a + b, 0) / last.length : 0;
}

function swings(h: number[], l: number[], k: number): { sh: number[]; sl: number[] } {
  const sh: number[] = [];
  const sl: number[] = [];
  for (let i = k; i < h.length - k; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = i - k; j <= i + k; j++) {
      if (h[j] > h[i]) isHigh = false;
      if (l[j] < l[i]) isLow = false;
    }
    if (isHigh) sh.push(i);
    if (isLow) sl.push(i);
  }
  return { sh, sl };
}

function dirOf(seq: number[], tol: number): 'up' | 'down' | 'flat' {
  if (seq.length < 2) return 'flat';
  const d = seq.slice(1).map((v, i) => v - seq[i]);
  if (d.every((x) => x > -tol) && seq[seq.length - 1] - seq[0] > tol) return 'up';
  if (d.every((x) => x < tol) && seq[0] - seq[seq.length - 1] > tol) return 'down';
  return 'flat';
}

function classify(h: number[], l: number[], sh: number[], sl: number[], tol: number): string {
  if (sh.length < 2 || sl.length < 2) return 'CHOPPY';
  const hi = dirOf(sh.slice(-3).map((i) => h[i]), tol);
  const lo = dirOf(sl.slice(-3).map((i) => l[i]), tol);
  if (hi === 'up' && lo === 'up') return 'TREND-UP';
  if (hi === 'down' && lo === 'down') return 'TREND-DOWN';
  if (hi === 'flat' && lo === 'flat') return 'RANGE';
  return 'CHOPPY';
}

function clusters(prices: number[], tol: number, minTouches = 2): Zone[] {
  if (!prices.length) return [];
  const sorted = [...prices].sort((a, b) => a - b);
  const groups: number[][] = [];
  let cur = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - cur[cur.length - 1] <= tol) cur.push(sorted[i]);
    else { groups.push(cur); cur = [sorted[i]]; }
  }
  groups.push(cur);
  return groups
    .filter((g) => g.length >= minTouches)
    .map((g) => ({
      price: g.reduce((a, b) => a + b, 0) / g.length,
      touches: g.length,
      low: Math.min(...g),
      high: Math.max(...g),
    }));
}

function clusterLevels(candles: Candle[], k: number, tol: number): Zone[] {
  if (candles.length < 50) return [];
  const h = candles.map((c) => c.high);
  const l = candles.map((c) => c.low);
  const { sh, sl } = swings(h, l, k);
  return clusters([...sh.map((i) => h[i]), ...sl.map((i) => l[i])], tol);
}

function biasOf(candles: Candle[], k: number): string {
  if (candles.length < 50) return '?';
  const h = candles.map((c) => c.high);
  const l = candles.map((c) => c.low);
  const c = candles.map((x) => x.close);
  const price = c[c.length - 1];
  const tol = Math.max(atr(h, l, c) * 0.5, price * 0.0035);
  const { sh, sl } = swings(h, l, k);
  return classify(h, l, sh, sl, tol);
}

/** STRICT daily filter: trade only WITH the daily trend (close vs 50-day SMA). */
function dailyTrend(daily: Candle[]): 'UP' | 'DOWN' | '?' {
  if (daily.length < 51) return '?';
  const closes = daily.map((c) => c.close).slice(0, -1); // drop the forming day
  return closes[closes.length - 1] > sma(closes, 50) ? 'UP' : 'DOWN';
}

type C4 = [number, number, number, number]; // open, high, low, close
function parts(o: number, h: number, l: number, c: number) {
  const rng = Math.max(h - l, 1e-9);
  const body = Math.abs(c - o);
  return { body, rng, up: h - Math.max(o, c), lo: Math.min(o, c) - l };
}
function bullPattern(prev: C4, cur: C4): [boolean, string] {
  const [po, , , pc] = prev;
  const [o, h, l, c] = cur;
  const { body, rng, up, lo } = parts(o, h, l, c);
  const strong = c > o && body / rng >= BODY_MIN;
  const engulf = c > o && pc < po && c >= po && o <= pc;
  const pin = lo >= 2 * body && up <= body && c >= o;
  return [strong || engulf || pin, engulf ? 'engulf' : pin ? 'pin' : strong ? 'strong' : '—'];
}
function bearPattern(prev: C4, cur: C4): [boolean, string] {
  const [po, , , pc] = prev;
  const [o, h, l, c] = cur;
  const { body, rng, up, lo } = parts(o, h, l, c);
  const strong = c < o && body / rng >= BODY_MIN;
  const engulf = c < o && pc > po && c <= po && o >= pc;
  const pin = up >= 2 * body && lo <= body && c <= o;
  return [strong || engulf || pin, engulf ? 'engulf' : pin ? 'pin' : strong ? 'strong' : '—'];
}

// ── detection ────────────────────────────────────────────────────────────────
export function detectSignal(tf: { work: Candle[]; h1: Candle[]; h4: Candle[]; daily: Candle[] }): Signal {
  const W = tf.work;
  if (W.length < 60) return { state: 'IGNORE', price: W.length ? W[W.length - 1].close : 0, reason: 'no data' };

  const h = W.map((c) => c.high);
  const l = W.map((c) => c.low);
  const c = W.map((x) => x.close);
  const price = c[c.length - 1];
  const a = atr(h, l, c);
  const tol = Math.max(a * 0.5, price * 0.0035);
  const buf = Math.max(a * 0.4, price * 0.0007);

  const work = clusterLevels(W, 5, tol);
  const big = clusterLevels(tf.h1, 5, Math.max(tol, price * 0.0035));
  const b1h = biasOf(tf.h1, 5);
  const b4h = biasOf(tf.h4, 4);
  const bd = biasOf(tf.daily, 4);
  const dtrend = dailyTrend(tf.daily);
  const topdown = `D:${bd} 4H:${b4h} 1H:${b1h} | dSMA50:${dtrend}`;

  const near = work.filter((z) => Math.abs(z.price - price) <= Math.max(price * 0.012, 3 * tol));
  if (!near.length) return { state: 'IGNORE', price, reason: 'no clear zone near price', topdown };
  const zone = near.reduce((best, z) => (z.touches > best.touches ? z : best));

  const last = W[W.length - 2]; // last CLOSED candle
  const prev = W[W.length - 3];
  const cur: C4 = [last.open, last.high, last.low, last.close];
  const prv: C4 = [prev.open, prev.high, prev.low, prev.close];
  const priorHi = Math.max(...h.slice(-12, -2));
  const priorLo = Math.min(...l.slice(-12, -2));

  const base = { price, zone, topdown };

  const upBrk = last.close > zone.high + buf;
  const [upCdl, upName] = bullPattern(prv, cur);
  const upStr = last.close >= priorHi;
  const upTd = b1h === 'TREND-UP' || b1h === 'RANGE';
  const upDaily = dtrend === 'UP';

  const dnBrk = last.close < zone.low - buf;
  const [dnCdl, dnName] = bearPattern(prv, cur);
  const dnStr = last.close <= priorLo;
  const dnTd = b1h === 'TREND-DOWN' || b1h === 'RANGE';
  const dnDaily = dtrend === 'DOWN';

  if (upBrk) {
    const checks = { break: upBrk, candle: `${upCdl}(${upName})`, structure: upStr, topdown: upTd, daily: dtrend };
    if (upCdl && upStr && upTd && upDaily) return arm('LONG', zone, big, buf, base, checks);
    return { ...base, state: 'WAIT', reason: !upDaily ? 'up-break against daily trend — skip' : 'up-break not fully confirmed', checks };
  }
  if (dnBrk) {
    const checks = { break: dnBrk, candle: `${dnCdl}(${dnName})`, structure: dnStr, topdown: dnTd, daily: dtrend };
    if (dnCdl && dnStr && dnTd && dnDaily) return arm('SHORT', zone, big, buf, base, checks);
    return { ...base, state: 'WAIT', reason: !dnDaily ? 'down-break against daily trend — skip' : 'down-break not fully confirmed', checks };
  }
  return { ...base, state: 'WAIT', reason: 'inside the zone — consolidating' };
}

function arm(
  side: 'LONG' | 'SHORT',
  zone: Zone,
  big: Zone[],
  buf: number,
  base: { price: number; zone: Zone; topdown: string },
  checks: Record<string, unknown>,
): Signal {
  let entry: number;
  let sl: number;
  let targets: Zone[];
  if (side === 'LONG') {
    entry = zone.high;
    sl = zone.low - buf;
    targets = big.filter((t) => t.price > entry + buf).sort((a, b) => a.price - b.price);
  } else {
    entry = zone.low;
    sl = zone.high + buf;
    targets = big.filter((t) => t.price < entry - buf).sort((a, b) => b.price - a.price);
  }
  const risk = Math.abs(entry - sl);
  const tp = targets.find((t) => risk > 0 && Math.abs(t.price - entry) / risk >= MIN_RR);
  const rr = tp && risk ? Math.abs(tp.price - entry) / risk : 0;
  const armed = !!tp;
  return {
    ...base,
    state: armed ? (side === 'LONG' ? 'ARM-LONG' : 'ARM-SHORT') : 'WAIT',
    side,
    reason: armed ? 'confirmed break' : 'confirmed but no target clears 1:3 — skip',
    checks,
    entry,
    sl,
    tp: tp ? tp.price : undefined,
    rr,
    risk,
  };
}
