'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { updateStaffProfileAction, type StaffActionState } from '@/lib/staff/actions';

interface Props {
  signedInEmail: string;
  defaultName: string;
  defaultPhone: string;
}

const INITIAL: StaffActionState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Save className="h-4 w-4" />}>
      Save profile
    </Button>
  );
}

export function StaffProfileForm({ signedInEmail, defaultName, defaultPhone }: Props) {
  const [state, formAction] = useActionState(updateStaffProfileAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4">
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

      <Input
        label="Work email"
        value={signedInEmail}
        disabled
        helper="Email is the unique sign-in identifier — only admin can change it."
      />
      <Input
        name="full_name"
        label="Full name"
        required
        defaultValue={defaultName}
        error={fieldErrors?.full_name}
      />
      <Input
        name="phone"
        type="tel"
        label="Phone (optional)"
        defaultValue={defaultPhone}
        placeholder="+234 …"
      />
      <SubmitButton />
    </form>
  );
}
