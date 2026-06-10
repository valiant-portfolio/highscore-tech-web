// Server-side ALATPay helpers — transaction verification only.
// Never import this file from anything marked 'use client'.
//
// This integration is frontend-callback-only — there is no webhook. When
// the inline SDK fires its `onTransaction` callback in the browser, the
// client POSTs to /api/alatpay/verify and we hit ALATPay's REST API from
// the server with the API key to confirm the transaction independently.

import {
  ALATPAY_API_BASE,
  ALATPAY_API_KEY,
  type VerificationResult,
} from '.';

// ALATPay exposes a verification endpoint that returns the latest known
// status for a transaction. Adjust ALATPAY_VERIFY_PATH if your account
// uses a different convention.
const ALATPAY_VERIFY_PATH = '/bank-transfer/api/v1/transactions';

export async function verifyAlatPayTransaction(reference: string): Promise<VerificationResult> {
  if (!ALATPAY_API_KEY) {
    return { status: 'failed', raw: { error: 'ALATPAY_API_KEY not set' } };
  }
  try {
    const res = await fetch(
      `${ALATPAY_API_BASE}${ALATPAY_VERIFY_PATH}/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': ALATPAY_API_KEY,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { status: 'failed', raw: body };
    }
    // ALATPay returns variations on { status: 'COMPLETED' | 'PENDING' | 'FAILED' }
    // or { data: { status: ... } }. Normalise robustly.
    const status =
      (body?.data?.status ?? body?.status ?? body?.transaction?.status ?? '')
        .toString()
        .toLowerCase();

    if (['completed', 'success', 'successful', 'paid'].includes(status)) {
      return { status: 'succeeded', raw: body };
    }
    if (['pending', 'processing', 'awaiting'].includes(status)) {
      return { status: 'pending', raw: body };
    }
    return { status: 'failed', raw: body };
  } catch (err) {
    return {
      status: 'failed',
      raw: { error: err instanceof Error ? err.message : 'unknown error' },
    };
  }
}
