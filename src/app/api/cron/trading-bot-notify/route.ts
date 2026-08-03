// POST /api/cron/trading-bot-notify — Telegram alert when the bot places a new
// pending order, fills a position, closes one, or goes quiet.
//
// The bot only writes to Supabase; it doesn't call us. So we poll: point a cron
// service at this route every ~1 minute with `X-Cron-Secret: <CRON_SECRET>`.
// Each event is sent exactly once — `bot_notify_log` records what's been sent
// (unique per event), so re-polling never double-sends.
//
// WHY THIS EXISTS ALONGSIDE THE BOT'S OWN TELEGRAM MESSAGES: the bot notifies
// from inside its trading loop, so if the process dies it goes silent — no
// alert, because there is nothing alive to send one. This poller reads the
// database instead, so it can notice the silence and say so (bot_offline).
// The bot keeps only `profit locked`, which is invisible from the database.
//
// Latency is one poll interval, and an order that appears AND fills between two
// polls would only send the fill alert. For most events (orders rest, positions
// live for minutes) a 1-min poll catches everything.

import { NextResponse } from 'next/server';
import { checkCronSecret } from '@/lib/cron/guard';
import { botServiceClient } from '@/lib/supabase/bot';
import { sendTelegram, tgBlock } from '@/lib/telegram/send';

export const runtime = 'nodejs';

type BotAlertKind = 'pending_order' | 'position_opened' | 'position_closed' | 'bot_offline';

const RECENT_MS = 2 * 60 * 60 * 1000; // opens/closes within 2h are "recent"

// The bot writes market state every ~60s. Past this it is considered down.
const OFFLINE_MS = 5 * 60_000;
// Re-alert about an offline bot at most once per bucket, so a bot that stays
// down doesn't send one message every single poll.
const OFFLINE_BUCKET_MS = 30 * 60_000;

const ICON: Record<BotAlertKind, string> = {
  pending_order: '⌛',
  position_opened: '🚀',
  position_closed: '🏁',
  bot_offline: '🔴',
};

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

  const admin = botServiceClient();
  const cutoff = new Date(Date.now() - RECENT_MS).toISOString();

  const [markets, opens, closes, heartbeat] = await Promise.all([
    admin.from('bot_market_state').select('symbol, alias, state, reason, latest_signal, price, level, is_dry_run, updated_at').eq('state', 'ready'),
    admin.from('bot_trades').select('id, symbol, side, volume, open_price, sl, tp, strategy, open_ts, is_dry_run').is('close_ts', null).gte('open_ts', cutoff),
    admin.from('bot_trades').select('id, symbol, side, volume, open_price, close_price, pnl, close_reason, close_ts, is_dry_run').not('close_ts', 'is', null).gte('close_ts', cutoff),
    admin.from('bot_market_state').select('updated_at').order('updated_at', { ascending: false }).limit(1),
  ]);

  const candidates: Candidate[] = [];

  // Bot heartbeat. This is the event the bot itself can never send — if the
  // process is dead, nothing in it runs. Bucketed so a bot that stays down
  // alerts twice an hour rather than sixty times.
  const lastWrite = heartbeat.data?.[0]?.updated_at as string | undefined;
  const silentFor = lastWrite ? Date.now() - new Date(lastWrite).getTime() : null;
  if (silentFor === null || silentFor > OFFLINE_MS) {
    const bucket = Math.floor(Date.now() / OFFLINE_BUCKET_MS);
    candidates.push({
      kind: 'bot_offline',
      ref: `offline:${bucket}`,
      subject: 'Bot offline — no market updates',
      rows: [
        { label: 'Last write', value: lastWrite ? when(lastWrite) : 'never' },
        { label: 'Silent for', value: silentFor === null ? 'n/a' : `${Math.floor(silentFor / 60_000)} min` },
        { label: 'Expected', value: 'a write every ~60s while running' },
      ],
    });
  }

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
        { label: 'Reason', value: m.reason ?? '—' },
        { label: 'Latest signal', value: m.latest_signal ?? '—' },
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
    // Reconciliation closes (V2) are backend catch-up on old orphans, not live
    // trading events — don't alert on them.
    if (t.close_reason === 'reconciled_stale' || t.close_reason === 'reconciled_closed') continue;
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
    const res = await sendTelegram(tgBlock(`${ICON[c.kind]} ${c.subject}`, c.rows));
    if (res.ok) sent++;
    else {
      failures.push(`${c.ref}: ${res.error ?? 'send failed'}`);
      // Roll back the claim so a transient Telegram failure retries next poll.
      await admin.from('bot_notify_log').delete().eq('kind', c.kind).eq('ref', c.ref);
    }
  }

  return NextResponse.json({ ok: true, checked: candidates.length, sent, failures });
}
