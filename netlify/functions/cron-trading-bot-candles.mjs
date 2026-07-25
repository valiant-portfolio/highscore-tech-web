// Netlify Scheduled Function — every minute.
//
// Proxies to /api/cron/trading-bot-candles, which samples the live quote feed
// into highzcore's own OHLC table (bot_quote_bars) so the chart has history
// regardless of whether the bot syncs bot_bars. A no-op when the feed is stale.

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
    const res = await fetch(`${baseUrl}/api/cron/trading-bot-candles`, {
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

// Every minute — accrues one sample per candle bucket.
export const config = {
  schedule: '* * * * *',
};
