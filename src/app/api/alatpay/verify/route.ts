// POST /api/alatpay/verify
//
// Called from the client AlatPay onTransaction callback with a transaction
// reference. We re-verify against ALATPay's REST API (don't trust the
// client callback in isolation) and update the payment + enrollment rows.
// This is the ONLY confirmation path — there is no webhook for ALATPay on
// Highscore Tech.

import { NextResponse } from 'next/server';
import { verifyAlatPayTransaction } from '@/lib/alatpay/server';
import { markPaymentSucceededAction } from '@/lib/enrollment/actions';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let reference = '';
  let sdkResponse: unknown = null;
  try {
    const body = await req.json();
    reference   = String(body?.reference ?? '').trim();
    sdkResponse = body?.sdkResponse ?? null;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }
  if (!reference) {
    return NextResponse.json({ ok: false, error: 'missing_reference' }, { status: 400 });
  }

  // Belt + braces: hit ALATPay's REST API with our merchant reference.
  const result = await verifyAlatPayTransaction(reference);

  if (result.status === 'succeeded') {
    await markPaymentSucceededAction(reference, { remote: result.raw, sdk: sdkResponse });
    return NextResponse.json({ ok: true, status: 'succeeded' });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
