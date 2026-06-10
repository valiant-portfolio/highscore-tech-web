// Shared HMAC-secret check used by every /api/cron/* route. The hosting
// service's cron facility sends X-Cron-Secret matching CRON_SECRET in
// .env.local. Without it, anyone discovering the URL could trigger expensive
// jobs.

import 'server-only';

export function checkCronSecret(req: Request): { ok: true } | { ok: false; response: Response } {
  const expected = process.env.CRON_SECRET ?? '';
  if (!expected) {
    return {
      ok: false,
      response: new Response('CRON_SECRET not configured.', { status: 503 }),
    };
  }
  const provided = req.headers.get('x-cron-secret') ?? '';
  if (provided !== expected) {
    return { ok: false, response: new Response('Forbidden.', { status: 403 }) };
  }
  return { ok: true };
}
