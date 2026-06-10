'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { signUpAction, type AuthFormState } from '@/lib/auth/actions';

const INITIAL: AuthFormState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      fullWidth
      loading={pending}
      rightIcon={pending ? undefined : <UserPlus className="h-4 w-4" />}
    >
      Create account
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, INITIAL);
  const params = useSearchParams();
  const courseSlug = params.get('course');

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
      <input type="hidden" name="course" value={courseSlug ?? ''} />

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
        name="full_name"
        label="Full name"
        required
        autoComplete="name"
        placeholder="Jane Doe"
        error={fieldErrors?.full_name}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        error={fieldErrors?.email}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        required
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={fieldErrors?.password}
      />

      <SubmitButton />

      <p className="text-xs text-fg-subtle leading-relaxed text-center">
        By creating an account you agree to our terms and privacy notice.
      </p>
    </form>
  );
}
