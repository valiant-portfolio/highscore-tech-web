'use client';

// Marketing route error boundary. Catches any RSC / page-level throws and
// presents a brand-styled retry without losing the chrome.

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, LinkButton } from '@/components/ui';

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Marketing route error:', error);
  }, [error]);

  return (
    <section className="relative isolate px-4 md:px-8 py-24 md:py-32">
      <div className="mx-auto max-w-[640px] text-center space-y-5">
        <div
          aria-hidden="true"
          className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger"
        >
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
          Something went wrong on our side.
        </h1>
        <p className="text-fg-muted">
          The page tripped while rendering. Try again — and if it keeps happening, drop us a note.
        </p>
        {error.digest && (
          <p className="text-xs text-fg-subtle font-mono">Reference: {error.digest}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()}>Try again</Button>
          <LinkButton href="/contact" variant="secondary">Tell us about it</LinkButton>
        </div>
      </div>
    </section>
  );
}
