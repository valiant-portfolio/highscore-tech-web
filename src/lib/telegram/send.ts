// Telegram sender for trading-bot alerts.
//
// Replaces the old email alerts (TradingBotAlertEmail / TradingBotDailyEmail).
// The bot itself also sends Telegram messages in-process, but only for events
// it can see from inside its own loop — this poller reads Supabase instead, so
// it keeps working when the bot process is dead. That is the whole reason it
// still exists: a crashed bot sends nothing, a poller notices the silence.
//
// When the token/chat aren't configured this no-ops and logs, matching the
// email helpers' behaviour so local dev keeps working.

import 'server-only';

const API = 'https://api.telegram.org';

export interface TelegramResult {
  ok: boolean;
  error?: string;
  skipped?: boolean;
}

/** Escape the five characters Telegram's HTML parse mode cares about. */
export function tgEscape(s: string | null | undefined): string {
  return String(s ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render a titled block of label/value rows the way the email template did:
 *
 *   🚀 Position opened · EURUSD BUY
 *   Market: EURUSD
 *   Entry:  1.15250
 */
export function tgBlock(title: string, rows: { label: string; value: string }[]): string {
  const body = rows.map((r) => `${tgEscape(r.label)}: <b>${tgEscape(r.value)}</b>`).join('\n');
  return `<b>${tgEscape(title)}</b>\n${body}`;
}

export async function sendTelegram(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID unset — skipping send:\n' + text);
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch(`${API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      // Never let a slow Telegram API hang a cron invocation.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, error: `telegram ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
