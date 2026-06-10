'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, LogIn } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { loginAction, type AuthFormState } from '@/lib/auth/actions';

const INITIAL: AuthFormState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      fullWidth
      loading={pending}
      rightIcon={pending ? undefined : <LogIn className="h-4 w-4" />}
    >
      Log in
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, INITIAL);
  const params = useSearchParams();
  const next = params.get('next') ?? '';
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

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
      <Input
        name="password"
        type="password"
        label="Password"
        required
        autoComplete="current-password"
        placeholder="••••••••"
        error={fieldErrors?.password}
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <SubmitButton />
    </form>
  );
}
