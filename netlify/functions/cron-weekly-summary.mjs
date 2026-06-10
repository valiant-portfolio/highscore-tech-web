// Netlify Scheduled Function — every Friday 16:00 UTC.
//
// Proxies to the Next.js API route /api/cron/weekly-summary which composes
// + sends the CEO performance digest email. The schedule is set so the
// email lands at end-of-day Lagos (17:00 winter / 18:00 summer).

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
    const res = await fetch(`${baseUrl}/api/cron/weekly-summary`, {
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

// 0 16 * * 5  → every Friday at 16:00 UTC (17:00 Lagos)
export const config = {
  schedule: '0 16 * * 5',
};
