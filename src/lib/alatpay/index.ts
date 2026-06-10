// ALATPay configuration + shared types.
//
// ALATPay's inline SDK signature is:
//
//   const popup = Alatpay.setup({
//     apiKey, businessId, email, phone, firstName, lastName,
//     metadata, currency: 'NGN', amount,
//     onTransaction(response) { ... },
//     onClose() { ... },
//   });
//   popup.show();
//
// Because the SDK is initialised in the browser, both apiKey and businessId
// are NEXT_PUBLIC_. The server-side verify endpoint reuses the same public
// API key against ALATPay's REST API.

export const ALATPAY_BUSINESS_ID =
  process.env.NEXT_PUBLIC_ALATPAY_BUSINESS_ID ?? '';

export const ALATPAY_API_KEY =
  process.env.NEXT_PUBLIC_ALATPAY_API_KEY ?? '';

export const ALATPAY_SDK_URL =
  process.env.NEXT_PUBLIC_ALATPAY_SDK_URL ??
  'https://payment-checkout.alatpay.ng/AlatPay.js';

// ALATPay REST base used by the server-side verifier. Override via env when
// pointing at the sandbox.
export const ALATPAY_API_BASE =
  process.env.ALATPAY_API_BASE ?? 'https://apibox.alatpay.ng';

// ── Types passed between client + server ──────────────────────────────────
export interface InitiatedTransaction {
  reference: string;
  enrollmentId: string;
  paymentId: string;
  amountNgn: number;
  customerEmail: string;
  customerName: string;
}

export type VerificationStatus = 'succeeded' | 'pending' | 'failed';

export interface VerificationResult {
  status: VerificationStatus;
  raw: unknown;
}
