// Netlify Scheduled Function — every Monday 08:00 UTC.
//
// Proxies to the Next.js API route /api/cron/installments using the
// internal CRON_SECRET. Sweeping overdue instalments + sending reminders
// is implemented there; this file is just the scheduler entry point.

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
    const res = await fetch(`${baseUrl}/api/cron/installments`, {
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

// Cron syntax: m h dom mon dow
// 0 8 * * 1  → every Monday at 08:00 UTC (09:00 Lagos in winter, 10:00 in summer)
export const config = {
  schedule: '0 8 * * 1',
};
