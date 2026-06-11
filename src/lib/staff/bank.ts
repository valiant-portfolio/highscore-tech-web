// Nigerian commercial / merchant banks + the 3-month edit-lock helper.
// Kept here (not in a server-only file) so the dropdown can be rendered
// client-side without a round-trip.

export const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Keystone Bank',
  'Kuda Microfinance Bank',
  'Lotus Bank',
  'Moniepoint MFB',
  'Opay',
  'Optimus Bank',
  'Palmpay',
  'Parallex Bank',
  'Polaris Bank',
  'Premium Trust Bank',
  'Providus Bank',
  'Signature Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'TAJBank',
  'Titan Trust Bank',
  'Unity Bank',
  'United Bank for Africa (UBA)',
  'Union Bank of Nigeria',
  'Wema Bank',
  'Zenith Bank',
] as const;

export type NigerianBank = (typeof NIGERIAN_BANKS)[number];

export const BANK_EDIT_LOCK_DAYS = 90;

export type BankEditLock =
  | { allowed: true }
  | { allowed: false; nextAllowedAt: string; daysLeft: number };

/**
 * Staff may set their bank account once (first time, no constraint), then
 * may only change it again after a 90-day cool-off — a guard against
 * social-engineered payroll redirection.
 */
export function canUpdateBank(updatedAt: string | null): BankEditLock {
  if (!updatedAt) return { allowed: true };
  const last = new Date(updatedAt);
  const next = new Date(last);
  next.setDate(next.getDate() + BANK_EDIT_LOCK_DAYS);
  const msLeft = next.getTime() - Date.now();
  if (msLeft <= 0) return { allowed: true };
  return {
    allowed: false,
    nextAllowedAt: next.toISOString(),
    daysLeft: Math.ceil(msLeft / 86_400_000),
  };
}

/** Format an account number for display (xxx xxx xxxx) without altering value. */
export function formatAccountNumber(num: string | null): string {
  if (!num) return '—';
  const digits = num.replace(/\D/g, '');
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
