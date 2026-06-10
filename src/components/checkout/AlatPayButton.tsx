'use client';

// Inline ALATPay checkout launcher. Lazy-loads the ALATPay SDK on first
// click (saves the bundle until the user actually wants to pay), then
// opens the popup via `Alatpay.setup({...}).show()`.
//
// SDK signature reference:
//
//   const popup = Alatpay.setup({
//     apiKey, businessId, email, phone, firstName, lastName,
//     metadata, currency: 'NGN', amount,
//     onTransaction(response) { ... if (response.status === true) { ... } },
//     onClose() { ... },
//   });
//   popup.show();
//
// `metadata.merchantReference` carries OUR internal reference (HST-…) so
// the server-side verifier can look up the right payment row regardless of
// the ALATPay transaction id format. After `response.status === true` we
// POST to /api/alatpay/verify so the server re-confirms with ALATPay
// before flipping the payment to succeeded.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import {
  ALATPAY_API_KEY,
  ALATPAY_BUSINESS_ID,
  ALATPAY_SDK_URL,
} from '@/lib/alatpay';

export interface AlatPayButtonProps {
  reference: string;
  amountNgn: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description?: string;
  successHref?: string;
  children?: React.ReactNode;
}

interface AlatPaySetupOptions {
  apiKey: string;
  businessId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  metadata?: Record<string, unknown> | null;
  currency: string;
  amount: number;
  onTransaction: (response: { status?: boolean; [key: string]: unknown }) => void;
  onClose?: () => void;
}

interface AlatPayPopup {
  show: () => void;
}

declare global {
  interface Window {
    Alatpay?: {
      setup: (opts: AlatPaySetupOptions) => AlatPayPopup;
    };
  }
}

function loadAlatPayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Alatpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-alatpay]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('failed to load AlatPay')));
      return;
    }
    const s = document.createElement('script');
    s.src = ALATPAY_SDK_URL;
    s.async = true;
    s.dataset.alatpay = 'true';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('failed to load AlatPay'));
    document.body.appendChild(s);
  });
}

export function AlatPayButton({
  reference,
  amountNgn,
  customerEmail,
  customerName,
  customerPhone,
  description,
  successHref = '/profile?tab=payments&paid=ok',
  children,
}: AlatPayButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [firstName, ...rest] = customerName.split(/\s+/).filter(Boolean);
  const lastName = rest.join(' ') || firstName || '';

  const onClick = async () => {
    setError(null);
    setBusy(true);
    try {
      await loadAlatPayScript();
      if (!window.Alatpay) {
        throw new Error('ALATPay SDK not available.');
      }
      const popup = window.Alatpay.setup({
        apiKey: ALATPAY_API_KEY,
        businessId: ALATPAY_BUSINESS_ID,
        email: customerEmail,
        phone: customerPhone,
        firstName: firstName || customerEmail.split('@')[0],
        lastName,
        currency: 'NGN',
        amount: amountNgn,
        metadata: {
          merchantReference: reference,
          description: description ?? 'Highscore Tech Academy enrolment',
        },
        onTransaction: async (response) => {
          if (response?.status !== true) {
            setError('Payment was not successful.');
            setBusy(false);
            return;
          }
          try {
            await fetch('/api/alatpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference, sdkResponse: response }),
            });
          } catch {
            /* server-side sweep on /profile will retry */
          } finally {
            router.push(successHref);
            router.refresh();
          }
        },
        onClose: () => setBusy(false),
      });
      popup.show();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error.');
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        fullWidth
        loading={busy}
        onClick={onClick}
      >
        {children ?? 'Pay now'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
