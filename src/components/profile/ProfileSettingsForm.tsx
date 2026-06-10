'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { updateProfileAction, type AuthFormState } from '@/lib/auth/actions';

interface Props {
  defaultName: string;
  defaultPhone: string;
  email: string;
}

const INITIAL: AuthFormState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      loading={pending}
      rightIcon={pending ? undefined : <Save className="h-4 w-4" />}
    >
      Save changes
    </Button>
  );
}

export function ProfileSettingsForm({ defaultName, defaultPhone, email }: Props) {
  const [state, formAction] = useActionState(updateProfileAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4 max-w-[520px]">
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
        label="Email"
        value={email}
        disabled
        helper="Email is managed by your account — contact us if you need to change it."
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
        label="Phone (optional)"
        type="tel"
        defaultValue={defaultPhone}
        placeholder="+234 …"
      />

      <SubmitButton />
    </form>
  );
}
