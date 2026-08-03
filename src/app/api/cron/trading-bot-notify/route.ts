// POST /api/cron/trading-bot-notify — Telegram alert when the bot goes quiet.
//
// SCOPE, deliberately narrow: the bot sends its own alerts for placing, filling,
// profit-locking and closing, because it knows the instant those happen and this
// poller would only learn about them up to a minute later. Duplicating them here
// would mean two messages per event.
//
// What the bot CANNOT report is its own death — if the process is gone, nothing
// inside it runs. That is the one thing this route exists for. It reads Supabase,
// so it keeps working when the bot does not.
//
// Point a cron service at it every ~1 minute with `X-Cron-Secret: <CRON_SECRET>`.
// `bot_notify_log` records what has been sent so a bot that stays down alerts
// twice an hour rather than sixty times.

import { NextResponse } from 'next/server';
import { checkCronSecret } from '@/lib/cron/guard';
import { botServiceClient } from '@/lib/supabase/bot';
import { sendTelegram, tgBlock } from '@/lib/telegram/send';

export const runtime = 'nodejs';

type BotAlertKind = 'bot_offline';

// The bot writes market state every ~60s. Past this it is considered down.
const OFFLINE_MS = 5 * 60_000;
// Re-alert about an offline bot at most once per bucket, so a bot that stays
// down doesn't send one message every single poll.
const OFFLINE_BUCKET_MS = 30 * 60_000;

const ICON: Record<BotAlertKind, string> = {
  bot_offline: '🔴',
};

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

  const heartbeat = await admin
    .from('bot_market_state')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);

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
