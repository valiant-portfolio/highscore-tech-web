'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { requestPasswordResetAction, type AuthFormState } from '@/lib/auth/actions';

const INITIAL: AuthFormState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      fullWidth
      loading={pending}
      rightIcon={pending ? undefined : <Send className="h-4 w-4" />}
    >
      Send reset link
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, INITIAL);

  if (state.status === 'success') {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
        <p className="text-fg-muted leading-relaxed">{state.message}</p>
      </div>
    );
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;
  return (
    <form action={formAction} className="space-y-4">
      {state.status === 'error' && !fieldErrors && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm"
        >
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <Input
        name="email"
        type="email"
        label="Email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        error={fieldErrors?.email}
      />
      <SubmitButton />
    </form>
  );
}
