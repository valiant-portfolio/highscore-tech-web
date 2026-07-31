'use client';

// One-time capture of NIN + bank account, shown as the final onboarding step
// after all documents are signed. Only renders the fields still missing.
// On success the action redirects straight to the dashboard.

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';
import { submitOnboardingDetailsAction, type DetailsState } from '@/lib/staff/onboarding-details-actions';
import { NIGERIAN_BANKS } from '@/lib/staff/bank';

const INITIAL: DetailsState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} rightIcon={pending ? undefined : <ArrowRight className="h-4 w-4" />}>
      Save and open my dashboard
    </Button>
  );
}

export function OnboardingDetailsForm({ needsBank, needsNin }: { needsBank: boolean; needsNin: boolean }) {
  const [state, formAction] = useActionState(submitOnboardingDetailsAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-8" encType="multipart/form-data">
      {state.status === 'error' && !fieldErrors && (
        <div role="alert" className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <div className="flex items-start gap-2.5 rounded-md border border-brand/25 bg-brand/5 p-3 text-sm">
        <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
        <p className="text-fg-muted">
          You&apos;re entering these <strong className="text-fg">once</strong>. For your security they are
          then locked — only an administrator can access them. Please double-check before saving.
        </p>
      </div>

      {needsBank && (
        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-bold text-fg mb-1">Salary account</legend>
          <Select
            name="bank_name"
            label="Bank"
            required
            placeholder="Select your bank"
            options={NIGERIAN_BANKS.map((b) => ({ value: b, label: b }))}
            error={fieldErrors?.bank_name}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              name="bank_account_number"
              label="Account number"
              required
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digits"
              error={fieldErrors?.bank_account_number}
              helper="This is where your monthly salary is paid."
            />
            <Input
              name="bank_account_name"
              label="Account name"
              required
              placeholder="Name exactly as on the account"
              error={fieldErrors?.bank_account_name}
            />
          </div>
        </fieldset>
      )}

      {needsNin && (
        <fieldset className="space-y-4">
          <legend className="font-display text-lg font-bold text-fg mb-1">Identity (NIN)</legend>
          <div>
            <label htmlFor="nin_doc" className="block text-sm font-semibold text-fg mb-1.5">
              NIN slip <span className="text-danger">*</span>
            </label>
            <input
              id="nin_doc"
              name="nin_doc"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              required
              className="block w-full text-sm text-fg-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-fg hover:file:bg-brand/90"
            />
            {fieldErrors?.nin_doc && <p className="mt-1 text-xs text-danger">{fieldErrors.nin_doc}</p>}
            <p className="mt-1.5 text-xs text-fg-subtle">
              Upload your National Identification Number slip (JPG, PNG or PDF, max 5&nbsp;MB). Private —
              only admin can view it. This cannot be changed later.
            </p>
          </div>
        </fieldset>
      )}

      <div className="pt-2">
        <SubmitButton />
        <p className="mt-3 text-xs text-fg-subtle">
          By saving you confirm these details are correct.
        </p>
      </div>
    </form>
  );
}
