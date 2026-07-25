// GET /api/admin/bot/quote?symbol=… — the live bid/ask for one market. Tiny,
// polled ~every 1.5s by the chart to move the forming candle + the ticker.
// Admin/trading-bot gated; service-client read.

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
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  const admin = serviceClient();
  const { data } = await admin
    .from('bot_quotes')
    .select('bid, ask, spread, digits, updated_at')
    .eq('symbol', symbol)
    .maybeSingle();

  return NextResponse.json({
    bid: data?.bid ?? null,
    ask: data?.ask ?? null,
    spread: data?.spread ?? null,
    digits: data?.digits ?? 5,
    updated_at: data?.updated_at ?? null,
  });
}
