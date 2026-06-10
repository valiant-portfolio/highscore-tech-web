'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Key } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { changePasswordAction, type StaffActionState } from '@/lib/staff/actions';

const INITIAL: StaffActionState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Key className="h-4 w-4" />}>
      Update password
    </Button>
  );
}

export function StaffPasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, INITIAL);
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
        name="current_password"
        type="password"
        label="Current password"
        autoComplete="current-password"
        required
        error={fieldErrors?.current_password}
      />
      <Input
        name="new_password"
        type="password"
        label="New password"
        autoComplete="new-password"
        required
        helper="At least 8 characters."
        error={fieldErrors?.new_password}
      />
      <Input
        name="confirm_password"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        required
        error={fieldErrors?.confirm_password}
      />
      <SubmitButton />
    </form>
  );
}
