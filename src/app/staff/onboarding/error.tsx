'use client';

// Error boundary for the staff onboarding wizard. Without this, a
// server-side render error returns a 500 with no body and the user sees
// Firefox's generic "This page couldn't load" — useless for debugging.
// With this, the user sees a real error message + a Try-again button,
// and the error gets logged to Netlify Functions for us.

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import Logo from '@/components/brand/Logo';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OnboardingError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[onboarding] render error:', error.message, error.digest);
    console.error(error.stack);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-bg-elevated/85 backdrop-blur-md border-b border-border h-16">
        <div className="h-full mx-auto max-w-[1180px] px-4 md:px-8 flex items-center">
          <Logo size="sm" href={null} />
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-20">
        <div className="mx-auto max-w-[640px] text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-danger/15 text-danger mb-5">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-fg">
            Something went wrong loading onboarding.
          </h1>
          <p className="mt-3 text-base text-fg-muted leading-relaxed">
            We couldn't render this page for your account. This isn't your fault —
            it's a problem on our side, and admin has been notified.
          </p>

          {error.digest && (
            <p className="mt-4 text-xs font-mono tabular text-fg-subtle">
              Error reference: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              size="lg"
              onClick={reset}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Try again
            </Button>
            <Link
              href="/contact"
              className="inline-flex h-14 items-center px-6 rounded-lg border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
            >
              Contact admin
            </Link>
          </div>

          <p className="mt-12 text-xs text-fg-subtle leading-relaxed border-t border-border pt-6">
            <strong className="text-fg-muted">Quick things to try while admin investigates:</strong>{' '}
            log out and log in again · clear cookies for highzcore.tech · try a different browser
            (Chrome or Edge tends to be most reliable) · disable browser extensions / VPN.
          </p>
        </div>
      </main>
    </div>
  );
}
