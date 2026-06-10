'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';
import {
  submitOnboardingAction,
  ONBOARDING_OPTIONS,
  type OnboardingState,
} from '@/lib/onboarding/actions';

const INITIAL: OnboardingState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} rightIcon={pending ? undefined : <ArrowRight className="h-4 w-4" />}>
      Finish onboarding
    </Button>
  );
}

export function OnboardingForm({ defaultPhone }: { defaultPhone: string }) {
  const [state, formAction] = useActionState(submitOnboardingAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-8" encType="multipart/form-data">
      {state.status === 'error' && !fieldErrors && (
        <div role="alert" className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      {/* ── Identity ────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-bold text-fg mb-1">Identity</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            name="date_of_birth"
            type="date"
            label="Date of birth"
            required
            error={fieldErrors?.date_of_birth}
            helper="We need this for age verification."
          />
          <Select
            name="gender"
            label="Gender"
            required
            placeholder="Select"
            options={ONBOARDING_OPTIONS.genders.map((g) => ({ value: g, label: g }))}
            error={fieldErrors?.gender}
          />
        </div>
      </fieldset>

      {/* ── Location ────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-bold text-fg mb-1">Where you live</legend>
        <Select
          name="state_of_origin"
          label="State of origin"
          required
          placeholder="Pick your state"
          options={ONBOARDING_OPTIONS.states.map((s) => ({ value: s, label: s }))}
          error={fieldErrors?.state_of_origin}
        />
        <Input
          name="address_line"
          label="Address"
          required
          placeholder="Street, house number, area"
          error={fieldErrors?.address_line}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            name="city"
            label="City"
            required
            error={fieldErrors?.city}
          />
          <Input
            name="phone"
            type="tel"
            label="Phone"
            required
            defaultValue={defaultPhone}
            placeholder="+234 …"
            error={fieldErrors?.phone}
          />
        </div>
      </fieldset>

      {/* ── Emergency contact ──────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-bold text-fg mb-1">Emergency contact</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            name="emergency_name"
            label="Full name"
            required
            error={fieldErrors?.emergency_name}
          />
          <Input
            name="emergency_phone"
            type="tel"
            label="Phone"
            required
            placeholder="+234 …"
            error={fieldErrors?.emergency_phone}
          />
        </div>
        <Input
          name="emergency_relation"
          label="Relationship"
          required
          placeholder="Spouse, parent, sibling, …"
          error={fieldErrors?.emergency_relation}
        />
      </fieldset>

      {/* ── Background ─────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-bold text-fg mb-1">Background</legend>
        <Select
          name="education_level"
          label="Highest level of education"
          required
          placeholder="Select"
          options={ONBOARDING_OPTIONS.education_levels.map((e) => ({ value: e, label: e }))}
          error={fieldErrors?.education_level}
        />
        <Input
          name="occupation"
          label="Current occupation (optional)"
          placeholder="Engineer, student, founder, …"
        />
      </fieldset>

      <div className="pt-2">
        <SubmitButton />
        <p className="mt-3 text-xs text-fg-subtle">
          By submitting you confirm the information is accurate.
        </p>
      </div>
    </form>
  );
}
