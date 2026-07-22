// Netlify Scheduled Function — every minute.
//
// Proxies to /api/cron/trading-bot-notify, which emails the ops mailboxes when
// the bot places a new pending order, opens a position, or closes one. Runs
// often because trading events are time-sensitive; the route dedupes so a poll
// with nothing new is a cheap no-op.

export default async () => {
  const baseUrl =
    process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? 'http://localhost:8888';
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return new Response(
      JSON.stringify({ ok: false, error: 'CRON_SECRET not set in Netlify env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const res = await fetch(`${baseUrl}/api/cron/trading-bot-notify`, {
      method: 'POST',
      headers: { 'X-Cron-Secret': secret },
    });
    const text = await res.text();
    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, body: text }),
      { status: res.ok ? 200 : 502, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'unknown' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

// Every minute — trading events are time-sensitive.
export const config = {
  schedule: '* * * * *',
};
