// POST /api/cron/trading-bot-notify — emails the ops mailboxes when the bot
// places a new pending order, fills a position, or closes one.
//
// The bot only writes to Supabase; it doesn't call us. So we poll: point a cron
// service at this route every ~1 minute with `X-Cron-Secret: <CRON_SECRET>`.
// Each event is emailed exactly once — `bot_notify_log` records what's been sent
// (unique per event), so re-polling never double-sends.
//
// Latency is one poll interval, and an order that appears AND fills between two
// polls would only send the fill email. For most events (orders rest, positions
// live for minutes) a 1-min poll catches everything.

import { NextResponse } from 'next/server';
import { checkCronSecret } from '@/lib/cron/guard';
import { serviceClient } from '@/lib/supabase/service';
import { sendTradingBotAlert } from '@/lib/email/send-helpers';
import type { BotAlertKind } from '@/lib/email/templates/TradingBotAlertEmail';

export const runtime = 'nodejs';

const RECIPIENTS = ['admin@highzcore.tech', 'olivia@highzcore.tech'];
const RECENT_MS = 2 * 60 * 60 * 1000; // opens/closes within 2h are "recent"

function money(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  const x = Number(n);
  return `${x < 0 ? '−' : ''}$${Math.abs(x).toFixed(2)}`;
}
function px(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return '—';
  return String(Number(n));
}
function when(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
}

interface Candidate {
  kind: BotAlertKind;
  ref: string;
  subject: string;
  rows: { label: string; value: string }[];
}

export async function POST(req: Request) {
  const gate = checkCronSecret(req);
  if (!gate.ok) return gate.response;

  const admin = serviceClient();
  const cutoff = new Date(Date.now() - RECENT_MS).toISOString();

  const [markets, opens, closes] = await Promise.all([
    admin.from('bot_market_state').select('symbol, alias, state, detail, price, level, is_dry_run, updated_at').eq('state', 'order'),
    admin.from('bot_trades').select('id, symbol, side, volume, open_price, sl, tp, strategy, open_ts, is_dry_run').is('close_ts', null).gte('open_ts', cutoff),
    admin.from('bot_trades').select('id, symbol, side, volume, open_price, close_price, pnl, close_reason, close_ts, is_dry_run').not('close_ts', 'is', null).gte('close_ts', cutoff),
  ]);

  const candidates: Candidate[] = [];

  for (const m of markets.data ?? []) {
    const dry = m.is_dry_run ? ' [demo]' : '';
    candidates.push({
      kind: 'pending_order',
      ref: `order:${m.symbol}:${m.level ?? 'na'}`,
      subject: `Pending order · ${m.alias}${dry}`,
      rows: [
        { label: 'Market', value: `${m.alias} (${m.symbol})` },
        { label: 'Order level', value: px(m.level) },
        { label: 'Last price', value: px(m.price) },
        { label: 'Detail', value: m.detail ?? '—' },
        { label: 'Time', value: when(m.updated_at) },
      ],
    });
  }
  for (const t of opens.data ?? []) {
    candidates.push({
      kind: 'position_opened',
      ref: `open:${t.id}`,
      subject: `Position opened · ${t.symbol} ${String(t.side).toUpperCase()}${t.is_dry_run ? ' [demo]' : ''}`,
      rows: [
        { label: 'Market', value: t.symbol },
        { label: 'Side', value: String(t.side).toUpperCase() },
        { label: 'Volume', value: String(t.volume) },
        { label: 'Entry', value: px(t.open_price) },
        { label: 'Stop / Target', value: `${px(t.sl)} / ${px(t.tp)}` },
        { label: 'Strategy', value: t.strategy ?? '—' },
        { label: 'Opened', value: when(t.open_ts) },
      ],
    });
  }
  for (const t of closes.data ?? []) {
    const pnl = Number(t.pnl);
    candidates.push({
      kind: 'position_closed',
      ref: `close:${t.id}`,
      subject: `Position closed · ${t.symbol} ${money(t.pnl)}${t.is_dry_run ? ' [demo]' : ''}`,
      rows: [
        { label: 'Market', value: t.symbol },
        { label: 'Side', value: String(t.side).toUpperCase() },
        { label: 'Volume', value: String(t.volume) },
        { label: 'Entry → Exit', value: `${px(t.open_price)} → ${px(t.close_price)}` },
        { label: 'Result', value: `${Number.isFinite(pnl) && pnl >= 0 ? '+' : ''}${money(t.pnl)}` },
        { label: 'Reason', value: t.close_reason ?? '—' },
        { label: 'Closed', value: when(t.close_ts) },
      ],
    });
  }

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, sent: 0 });
  }

  // Claim each event atomically: INSERT ... ON CONFLICT DO NOTHING, returning
  // only the rows we actually inserted. Those are the genuinely-new events.
  const { data: claimed, error } = await admin
    .from('bot_notify_log')
    .upsert(
      candidates.map((c) => ({ kind: c.kind, ref: c.ref })),
      { onConflict: 'kind,ref', ignoreDuplicates: true },
    )
    .select('kind, ref');
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const claimedSet = new Set((claimed ?? []).map((r) => `${r.kind}|${r.ref}`));
  const toSend = candidates.filter((c) => claimedSet.has(`${c.kind}|${c.ref}`));

  let sent = 0;
  const failures: string[] = [];
  for (const c of toSend) {
    const res = await sendTradingBotAlert({ to: RECIPIENTS, kind: c.kind, subject: c.subject, rows: c.rows });
    if (res.ok) sent++;
    else {
      failures.push(`${c.ref}: ${res.error ?? 'send failed'}`);
      // Roll back the claim so a transient email failure retries next poll.
      await admin.from('bot_notify_log').delete().eq('kind', c.kind).eq('ref', c.ref);
    }
  }

  return NextResponse.json({ ok: true, checked: candidates.length, sent, failures });
}
