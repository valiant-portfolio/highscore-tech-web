// POST /api/cron/trading-bot-candles — build highzcore's own chart history from
// the live quote feed. Runs every minute: reads bot_quotes, and for each market
// with a FRESH quote, folds the current bid into the open candle of each
// timeframe (open kept, high=max, low=min, close=latest). Old candles are pruned
// per timeframe so the table stays small.
//
// Why: bot_bars may never be synced by the bot. This makes charting
// self-sufficient — as long as scripts.quote_feed runs on the VM, we accumulate
// candles here regardless. A stale quote (feed down) is skipped, so we never
// fabricate flat candles.

import { NextResponse } from 'next/server';
import { checkCronSecret } from '@/lib/cron/guard';
import { serviceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

const FRESH_MS = 2 * 60 * 1000;
// timeframe → { seconds, retentionDays }
const TFS: Record<string, { secs: number; keepDays: number }> = {
  M5:  { secs: 300,   keepDays: 3 },
  M15: { secs: 900,   keepDays: 14 },
  H1:  { secs: 3600,  keepDays: 90 },
  H4:  { secs: 14400, keepDays: 365 },
  D1:  { secs: 86400, keepDays: 365 },
};

export async function POST(req: Request) {
  const gate = checkCronSecret(req);
  if (!gate.ok) return gate.response;

  const admin = serviceClient();
  const now = Date.now();

  const { data: quotes } = await admin.from('bot_quotes').select('symbol, bid, updated_at');
  const fresh = (quotes ?? []).filter(
    (q) => q.updated_at && now - new Date(q.updated_at as string).getTime() <= FRESH_MS && Number.isFinite(Number(q.bid)),
  );

  if (fresh.length === 0) {
    return NextResponse.json({ ok: true, fresh: 0, note: 'quote feed stale or down — nothing to sample' });
  }

  const nowSec = Math.floor(now / 1000);
  let written = 0;

  for (const [tf, { secs, keepDays }] of Object.entries(TFS)) {
    const bucketIso = new Date(Math.floor(nowSec / secs) * secs * 1000).toISOString();

    // Current-bucket rows for this timeframe (same bucket across all symbols).
    const { data: existing } = await admin
      .from('bot_quote_bars')
      .select('symbol, open, high, low, ticks')
      .eq('timeframe', tf)
      .eq('ts', bucketIso);
    const bySymbol = new Map((existing ?? []).map((r) => [r.symbol as string, r]));

    const rows = fresh.map((q) => {
      const price = Number(q.bid);
      const e = bySymbol.get(q.symbol as string);
      return {
        symbol: q.symbol,
        timeframe: tf,
        ts: bucketIso,
        open: e ? Number(e.open) : price,
        high: e ? Math.max(Number(e.high), price) : price,
        low: e ? Math.min(Number(e.low), price) : price,
        close: price,
        ticks: e ? Number(e.ticks) + 1 : 1,
        updated_at: new Date(now).toISOString(),
      };
    });

    const { error } = await admin.from('bot_quote_bars').upsert(rows, { onConflict: 'symbol,timeframe,ts' });
    if (!error) written += rows.length;

    // Prune this timeframe's old candles.
    const cutoff = new Date(now - keepDays * 86400 * 1000).toISOString();
    await admin.from('bot_quote_bars').delete().eq('timeframe', tf).lt('ts', cutoff);
  }

  return NextResponse.json({ ok: true, fresh: fresh.length, timeframes: Object.keys(TFS).length, written });
}
