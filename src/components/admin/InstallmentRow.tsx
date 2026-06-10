'use client';

// Per-row "Mark paid" button. Server action with a small confirm so the
// admin doesn't fat-finger a payment.

import { useTransition } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { markInstallmentPaidAction } from '@/lib/admin/actions';

interface Props {
  installmentId: string;
  enrollmentId: string;
  isPaid: boolean;
}

export function MarkInstallmentPaidButton({ installmentId, enrollmentId, isPaid }: Props) {
  const [pending, startTransition] = useTransition();

  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
        <CheckCircle2 className="h-4 w-4" /> Paid
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Mark this instalment paid? This records a manual payment.')) return;
        startTransition(async () => {
          await markInstallmentPaidAction(installmentId, enrollmentId);
        });
      }}
      className="inline-flex h-8 items-center gap-1.5 px-3 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      Mark paid
    </button>
  );
}
