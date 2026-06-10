'use client';

// Pay-plan picker for /enrol/[slug]. Lets the student pick between paying
// the full fee or splitting into 2 / 3 instalments, then triggers the
// enrolment server action and hands off to the ALATPay launcher.

import { useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { AlatPayButton } from './AlatPayButton';
import {
  initiateEnrollmentAction,
  type InitiateResult,
  type PayPlan,
} from '@/lib/enrollment/actions';
import { formatNgn } from '@/lib/academy/queries';
import { cn } from '@/lib/utils';

interface Props {
  courseSlug: string;
  courseTitle: string;
  totalNgn: number;
}

interface PlanOption {
  id: PayPlan;
  label: string;
  note: string;
  amounts: number[];
}

function splitAmount(total: number, n: number): number[] {
  const each = Math.floor(total / n);
  const parts = Array(n).fill(each);
  parts[n - 1] += total - each * n;
  return parts;
}

export function EnrolPlanPicker({ courseSlug, courseTitle, totalNgn }: Props) {
  const [plan, setPlan] = useState<PayPlan>('full');
  const [tx, setTx]     = useState<InitiateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const planOptions: PlanOption[] = [
    { id: 'full',           label: 'Pay in full',  note: 'One transaction. Lowest paperwork.',  amounts: [totalNgn] },
    { id: 'installment_2',  label: '2 instalments', note: 'Pay half now, half next month.',      amounts: splitAmount(totalNgn, 2) },
    { id: 'installment_3',  label: '3 instalments', note: 'Spread across three monthly payments.', amounts: splitAmount(totalNgn, 3) },
  ];

  const onConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await initiateEnrollmentAction(courseSlug, plan);
      if (!result.ok) {
        setError(result.message ?? 'Could not start enrolment.');
        return;
      }
      setTx(result);
    });
  };

  return (
    <div className="space-y-6">
      {/* Plan choices */}
      <div className="space-y-3">
        {planOptions.map((opt) => {
          const selected = plan === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!tx}
              onClick={() => setPlan(opt.id)}
              className={cn(
                'w-full text-left rounded-xl border-2 p-4 md:p-5 transition-all',
                selected
                  ? 'border-brand bg-brand-tint/30'
                  : 'border-border bg-surface/60 hover:bg-surface-hover',
                tx && 'opacity-60 cursor-not-allowed',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 h-5 w-5 rounded-full border-2 grid place-items-center shrink-0',
                    selected ? 'border-brand' : 'border-border',
                  )}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold text-fg">{opt.label}</p>
                    <p className="font-mono tabular text-sm font-bold text-fg">
                      {formatNgn(opt.amounts[0])}
                      {opt.amounts.length > 1 && <span className="text-fg-subtle"> first</span>}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">{opt.note}</p>
                  {opt.amounts.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {opt.amounts.map((amt, idx) => (
                        <span
                          key={idx}
                          className="inline-flex h-6 items-center px-2 rounded-md bg-surface-hover text-[11px] font-medium text-fg-muted font-mono tabular"
                        >
                          {idx + 1}. {formatNgn(amt)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{error}</p>
        </div>
      )}

      {/* CTA — either start enrolment, or render the ALATPay button */}
      {!tx ? (
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="inline-flex w-full h-14 items-center justify-center rounded-md px-8 text-base font-semibold bg-brand text-brand-fg hover:bg-brand-hover active:scale-[0.98] transition disabled:opacity-50"
        >
          {pending ? 'Preparing…' : 'Confirm and continue to payment'}
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-success/30 bg-success/5 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="text-fg font-semibold">Enrolment prepared — ready to pay.</p>
              <p className="mt-1 text-fg-muted">
                You'll pay <b>{formatNgn(tx.amountNgn ?? 0)}</b> now. Reference: <code className="font-mono text-xs text-brand">{tx.reference}</code>
              </p>
            </div>
          </div>
          <AlatPayButton
            reference={tx.reference!}
            amountNgn={tx.amountNgn!}
            customerEmail={tx.customerEmail!}
            customerName={tx.customerName!}
            description={`${courseTitle} — Highscore Tech Academy`}
            successHref="/profile?tab=payments&paid=ok"
          >
            Pay {formatNgn(tx.amountNgn ?? 0)} with ALATPay
          </AlatPayButton>
        </div>
      )}
    </div>
  );
}
