// Netlify Scheduled Function — daily at 21:00 UTC (22:00 Lagos), end of day.
//
// Proxies to /api/cron/trading-bot-daily, which emails the ops mailboxes a
// one-a-day trading digest (today's P&L, win rate, open positions, account).

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
    const res = await fetch(`${baseUrl}/api/cron/trading-bot-daily`, {
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

// 0 21 * * *  → daily at 21:00 UTC (22:00 Lagos)
export const config = {
  schedule: '0 21 * * *',
};
