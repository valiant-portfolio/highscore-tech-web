// /api/forex-bot/tick — one bot cycle for the Bybit BTCUSDT futures bot.
// Triggered by cron (every minute) or manually. Secret-gated, TESTNET-locked.
//
//   ?secret=<CRON_SECRET>            run a normal cycle
//   &force=long | &force=short       (test) place a market trade now to validate plumbing
//
// Pipeline: candles -> detectSignal -> size by risk -> market entry (SL/TP) ->
// monitor open position (close on give-back/momentum, trail SL) -> log to Supabase.

import { NextRequest, NextResponse } from 'next/server';
import { serviceClient } from '@/lib/supabase/service';
import { BybitClient } from '@/lib/forex/bybit';
import { detectSignal } from '@/lib/forex/strategy';
import { monitorDecision } from '@/lib/forex/monitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYMBOL = 'BTCUSDT';
const DEFAULT_RISK_PCT = 2; // % of equity risked per trade
const DEFAULT_LEVERAGE = 5;

export async function GET(req: NextRequest) { return run(req); }
export async function POST(req: NextRequest) { return run(req); }

function roundTo(v: number, step: number) {
  const p = Math.round(v / step) * step;
  const dec = (String(step).split('.')[1] || '').length;
  return +p.toFixed(dec);
}
function floorTo(v: number, step: number) {
  const p = Math.floor(v / step) * step;
  const dec = (String(step).split('.')[1] || '').length;
  return +p.toFixed(dec);
}

async function run(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-cron-secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if ((process.env.BYBIT_TESTNET || 'true') === 'false') {
    return NextResponse.json({ ok: false, error: 'real-money trading is disabled (BYBIT_TESTNET=false). Refuse.' }, { status: 403 });
  }

  const db = serviceClient();
  const event = (level: string, kind: string, message: string, payload?: unknown) =>
    db.from('trading_bot_events').insert({ symbol: SYMBOL, level, kind, message, payload, created_at: new Date().toISOString() });

  try {
    const force = req.nextUrl.searchParams.get('force'); // 'long' | 'short' | null
    const bybit = new BybitClient(process.env.BYBIT_API_KEY!, process.env.BYBIT_API_SECRET!, true);

    // ── ensure a config row exists; honour running/enabled ──
    let { data: market } = await db.from('trading_bot_markets').select('*').eq('symbol', SYMBOL).maybeSingle();
    if (!market) {
      const ins = await db.from('trading_bot_markets')
        .insert({ symbol: SYMBOL, broker: 'bybit', enabled: true, running: true, note: 'Bybit BTC perp (testnet)' })
        .select('*').single();
      market = ins.data;
    }
    const riskPct = Number(market?.risk_pct ?? process.env.FOREX_RISK_PCT ?? DEFAULT_RISK_PCT);
    const leverage = Number(market?.leverage ?? process.env.FOREX_LEVERAGE ?? DEFAULT_LEVERAGE);
    if (!market?.running && !force) return NextResponse.json({ ok: true, status: 'stopped' });

    // ── market data ──
    const [work, h1, h4, daily] = await Promise.all([
      bybit.candles(SYMBOL, '15', 400),
      bybit.candles(SYMBOL, '60', 400),
      bybit.candles(SYMBOL, '240', 360),
      bybit.candles(SYMBOL, 'D', 300),
    ]);
    const price = work[work.length - 1].close;
    const inst = await bybit.instrument(SYMBOL);
    const qtyStep = +inst.lotSizeFilter.qtyStep;
    const minQty = +inst.lotSizeFilter.minOrderQty;
    const tick = +inst.priceFilter.tickSize;

    const pos = await bybit.position(SYMBOL);
    const { data: openTrade } = await db.from('trading_bot_trades').select('*').eq('symbol', SYMBOL).is('closed_at', null).order('opened_at', { ascending: false }).limit(1).maybeSingle();

    // ── manage an open position ──
    if (pos) {
      const side = pos.side === 'Buy' ? 'LONG' : 'SHORT';
      const entry = pos.avgPrice;
      const sl = pos.stopLoss || Number(openTrade?.sl ?? 0);
      const dec = monitorDecision({ side, entry, stopLoss: sl, currentPrice: price, candles: work, peakR: Number(openTrade?.peak_r ?? 0) });
      if (openTrade) await db.from('trading_bot_trades').update({ peak_r: dec.peakR }).eq('id', openTrade.id);

      if (dec.action === 'CLOSE') {
        await bybit.closePosition(SYMBOL, pos.side as 'Buy' | 'Sell', pos.size);
        const result = dec.profitR > 0 ? 'win' : dec.profitR < 0 ? 'loss' : 'breakeven';
        if (openTrade) {
          await db.from('trading_bot_trades').update({
            closed_at: new Date().toISOString(), exit_price: price, profit: pos.unrealisedPnl,
            r_multiple: Math.round(dec.profitR * 100) / 100, result, close_reason: dec.reason, peak_r: dec.peakR,
          }).eq('id', openTrade.id);
        }
        await event('info', 'trade', `CLOSED ${result} ${dec.profitR.toFixed(2)}R ($${pos.unrealisedPnl.toFixed(2)}) — ${dec.reason}`);
        return NextResponse.json({ ok: true, status: 'closed', reason: dec.reason });
      }

      if (dec.lockSl) {
        const improves = side === 'LONG' ? dec.lockSl > sl : sl === 0 || dec.lockSl < sl;
        if (improves) { try { await bybit.setStops(SYMBOL, { stopLoss: roundTo(dec.lockSl, tick) }); } catch { /* ignore */ } }
      }
      return NextResponse.json({ ok: true, status: 'holding', profitR: dec.profitR, peakR: dec.peakR });
    }

    // position closed since last cycle (SL/TP hit by broker) -> finalize the row
    if (openTrade) {
      await db.from('trading_bot_trades').update({ closed_at: new Date().toISOString(), exit_price: price, close_reason: openTrade.close_reason ?? 'SL/TP hit (broker)' }).eq('id', openTrade.id);
      await event('info', 'trade', 'position closed by broker SL/TP');
    }

    // ── flat: detect a setup (or forced test) ──
    const sig = detectSignal({ work, h1, h4, daily });
    if (!(sig.state.startsWith('ARM') && (market?.enabled ?? true)) && !force) {
      if (Math.floor(Date.now() / 60000) % 30 === 0) await event('info', 'heartbeat', `flat · ${sig.state} · ${price}`);
      return NextResponse.json({ ok: true, status: sig.state, reason: sig.reason, topdown: sig.topdown });
    }

    // entry params (forced test uses synthetic 1% SL / 3% TP around the market)
    const isLong = force ? force === 'long' : sig.side === 'LONG';
    const slPrice = force ? (isLong ? price * 0.99 : price * 1.01) : sig.sl!;
    const tpPrice = force ? (isLong ? price * 1.03 : price * 0.97) : sig.tp!;
    const sl = roundTo(slPrice, tick);
    const tp = roundTo(tpPrice, tick);

    const equity = await bybit.usdtBalance();
    const riskUsd = Math.max(equity * (riskPct / 100), 1);
    const slDist = Math.abs(price - sl) || price * 0.01;
    let qty = floorTo(riskUsd / slDist, qtyStep);
    if (qty < minQty) qty = minQty;

    const sigRow = await db.from('trading_bot_signals').insert({
      symbol: SYMBOL, side: isLong ? 'LONG' : 'SHORT', state: force ? `FORCED-${force.toUpperCase()}` : sig.state,
      entry: price, sl, tp, rr: sig.rr ?? null, reason: force ? 'forced test entry' : sig.reason, topdown: sig.topdown ?? null,
      created_at: new Date().toISOString(),
    }).select('id').single();

    await bybit.setLeverage(SYMBOL, leverage);
    await bybit.marketEntry({ symbol: SYMBOL, side: isLong ? 'Buy' : 'Sell', qty: String(qty), stopLoss: sl, takeProfit: tp });

    await db.from('trading_bot_trades').insert({
      symbol: SYMBOL, side: isLong ? 'LONG' : 'SHORT', lot: qty, entry: price, sl, tp,
      opened_at: new Date().toISOString(), signal_id: sigRow.data?.id ?? null, peak_r: 0,
    });
    await event('info', 'trade', `ENTER ${isLong ? 'LONG' : 'SHORT'} ${qty} @ ~${price} · SL ${sl} · TP ${tp}${force ? ' (forced test)' : ''}`);
    return NextResponse.json({ ok: true, status: 'entered', side: isLong ? 'LONG' : 'SHORT', qty, price, sl, tp });
  } catch (e: any) {
    await event('error', 'error', `tick error: ${e.message}`);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
