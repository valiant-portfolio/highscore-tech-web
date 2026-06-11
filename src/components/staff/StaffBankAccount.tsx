'use client';

// Bank account self-management for staff. Lives in the Settings tab.
// Three behaviours:
//   1. No account on file        → show form (first-time setup).
//   2. Account on file + editable → show current + "Change account"
//                                   toggle that reveals the form.
//   3. Account on file + locked  → show current + lock countdown.

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertCircle, CheckCircle2, CircleDollarSign, Landmark, Lock, Pencil, X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  updateBankAccountAction, type BankActionState,
} from '@/lib/staff/bank-actions';
import {
  NIGERIAN_BANKS, formatAccountNumber, canUpdateBank,
} from '@/lib/staff/bank';

const INITIAL: BankActionState = { status: 'idle' };

interface Props {
  initialBankName: string | null;
  initialAccountNumber: string | null;
  initialAccountName: string | null;
  initialUpdatedAt: string | null;
}

function SubmitButton({ isFirstTime }: { isFirstTime: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <CheckCircle2 className="h-4 w-4" />}>
      {isFirstTime ? 'Save bank account' : 'Update bank account'}
    </Button>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(iso));
}

export function StaffBankAccount({
  initialBankName, initialAccountNumber, initialAccountName, initialUpdatedAt,
}: Props) {
  const [state, formAction] = useActionState(updateBankAccountAction, INITIAL);
  const [editing, setEditing] = useState(!initialAccountNumber);

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;
  const lock = canUpdateBank(initialUpdatedAt);

  // Refresh local view once the action returns success.
  const current = state.status === 'success'
    ? { name: initialBankName, num: initialAccountNumber, accName: initialAccountName, updatedAt: initialUpdatedAt }
    : { name: initialBankName, num: initialAccountNumber, accName: initialAccountName, updatedAt: initialUpdatedAt };

  const onSaved = state.status === 'success';
  const isFirstTime = !initialAccountNumber;

  return (
    <div className="space-y-5">
      {/* Banner state */}
      {!initialAccountNumber && (
        <div className="flex items-start gap-2.5 rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-fg">No bank account on file.</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              Add yours below so your monthly salary lands on payday.
            </p>
          </div>
        </div>
      )}

      {/* Current account view */}
      {initialAccountNumber && !editing && (
        <div className="rounded-md border border-border bg-surface/40 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
                Account on file
              </p>
              <p className="text-base font-semibold text-fg">{current.name}</p>
              <p className="font-mono tabular text-xl font-extrabold text-fg leading-none">
                {formatAccountNumber(current.num)}
              </p>
              <p className="text-sm text-fg-muted uppercase">{current.accName}</p>
            </div>

            {lock.allowed ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setEditing(true)}
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
              >
                Change
              </Button>
            ) : (
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-surface-hover text-fg-muted text-[11px] font-bold">
                  <Lock className="h-3 w-3" /> Locked
                </span>
                <p className="mt-1.5 text-xs text-fg-subtle">
                  Next change in {lock.daysLeft} day{lock.daysLeft === 1 ? '' : 's'} <br />
                  ({formatDate(lock.nextAllowedAt)})
                </p>
              </div>
            )}
          </div>
          {initialUpdatedAt && (
            <p className="mt-3 text-xs text-fg-subtle border-t border-border pt-3">
              Last updated {formatDate(initialUpdatedAt)}.
            </p>
          )}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <form action={formAction} className="space-y-4">
          {!isFirstTime && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3 flex items-start gap-2 text-sm">
              <Lock className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div className="text-fg">
                <p className="font-semibold">You can change this once every 90 days.</p>
                <p className="mt-0.5 text-xs text-fg-muted">
                  After saving, this card will be locked until the next allowed change.
                </p>
              </div>
            </div>
          )}

          {state.status === 'success' && (
            <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <p className="text-fg">{state.message}</p>
            </div>
          )}
          {state.status === 'error' && !fieldErrors && (
            <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <p className="text-fg">{state.message}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bank_name" className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle inline-flex items-center gap-1.5">
                <Landmark className="h-3 w-3" /> Bank
              </label>
              <select
                id="bank_name"
                name="bank_name"
                required
                defaultValue={initialBankName ?? ''}
                className="mt-1.5 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
              >
                <option value="">Pick a bank…</option>
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {fieldErrors?.bank_name && (
                <p className="mt-1 text-xs text-danger">{fieldErrors.bank_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="bank_account_number" className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle inline-flex items-center gap-1.5">
                <CircleDollarSign className="h-3 w-3" /> Account number
              </label>
              <input
                id="bank_account_number"
                name="bank_account_number"
                type="text"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                required
                defaultValue={initialAccountNumber ?? ''}
                placeholder="0123456789"
                className="mt-1.5 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-mono tabular"
              />
              <p className="mt-1 text-[11px] text-fg-subtle">10 digits, no spaces.</p>
              {fieldErrors?.bank_account_number && (
                <p className="mt-1 text-xs text-danger">{fieldErrors.bank_account_number}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bank_account_name" className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
              Account name
            </label>
            <input
              id="bank_account_name"
              name="bank_account_name"
              type="text"
              required
              defaultValue={initialAccountName ?? ''}
              placeholder="As shown on your bank statement"
              className="mt-1.5 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm uppercase"
            />
            <p className="mt-1 text-[11px] text-fg-subtle">
              Exactly as it appears on your bank record. Mismatched names can fail the transfer.
            </p>
            {fieldErrors?.bank_account_name && (
              <p className="mt-1 text-xs text-danger">{fieldErrors.bank_account_name}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <SubmitButton isFirstTime={isFirstTime} />
            {!isFirstTime && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(false)}
                leftIcon={<X className="h-3.5 w-3.5" />}
                size="sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Footnote */}
      {!editing && initialAccountNumber && !onSaved && (
        <p className="text-xs text-fg-subtle leading-relaxed">
          For your safety, bank details can only be changed once every <strong className="text-fg">90 days</strong>.
          This protects you from social-engineered payroll redirection.
        </p>
      )}
    </div>
  );
}
