// GET /api/admin/bot/chart?symbol=…&tf=M15 — candle history + this market's
// trades (for overlays) + digits, in one call. Admin (or trading-bot section)
// only; reads via the service client so the trading tables stay private to the
// browser. Fetched once when the symbol/timeframe changes.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

async function allowed(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('users').select('role, admin_sections').eq('id', user.id).maybeSingle();
  return data?.role === 'admin' || ((data?.admin_sections as string[] | null) ?? []).includes('trading-bot');
}

export async function GET(request: Request) {
  if (!(await allowed())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const tf = (searchParams.get('tf') || 'M15').toUpperCase();
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  const admin = serviceClient();
  const [barsRes, tradesRes, quoteRes] = await Promise.all([
    admin.from('bot_bars')
      .select('ts, open, high, low, close, tick_volume')
      .eq('symbol', symbol).eq('timeframe', tf)
      .order('ts', { ascending: true }).limit(1500),
    admin.from('bot_trades')
      .select('id, side, open_ts, open_price, close_ts, close_price, sl, tp, pnl, close_reason')
      .eq('symbol', symbol).order('open_ts', { ascending: true }).limit(300),
    admin.from('bot_quotes').select('digits').eq('symbol', symbol).maybeSingle(),
  ]);

  // Lightweight-Charts wants UTC seconds.
  const bars = (barsRes.data ?? []).map((b) => ({
    time: Math.floor(new Date(b.ts as string).getTime() / 1000),
    open: Number(b.open), high: Number(b.high), low: Number(b.low), close: Number(b.close),
    volume: b.tick_volume == null ? undefined : Number(b.tick_volume),
  }));

  return NextResponse.json({
    symbol,
    tf,
    digits: quoteRes.data?.digits ?? 5,
    bars,
    trades: tradesRes.data ?? [],
  });
}
