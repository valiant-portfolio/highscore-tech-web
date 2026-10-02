'use client';

// Error boundary for the desk.
//
// Without this, a throw anywhere in the server render returned a bodyless 500
// and the browser showed its own "This page couldn't load" — no message, no
// retry, and nothing in the logs tying it to a cause. That screen could appear
// on its own, because Workspace refreshes every 15 seconds: every poll was
// another chance to hit it while nobody was touching the page.
//
// Two jobs. Say what broke, and offer the retry that a refresh-driven screen
// needs — reset() re-runs the render without dropping the tab.

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function DeskError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on the real stack once the message has
    // been redacted in production — log it so a report can be matched to it.
    console.error('[desk] render failed', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px] rounded-sm border border-danger/40 bg-bg-elevated p-6">
        <p className="flex items-center gap-2 text-sm font-bold text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          The desk could not load
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-fg">
          Nothing was sent to the broker and no position changed — this is the
          screen failing to draw, not the bot failing to trade.
        </p>
        {/* SAY WHAT BROKE.
            This showed a digest and nothing else, and a digest only exists for
            a SERVER error — so a client-side crash gave a screen that said
            something failed and refused to say what. Diagnosing it then needs
            DevTools, which is a lot to ask of someone just reporting a bug.
            The message is shown as well, and the stack behind a disclosure. */}
        {error.message && (
          <p className="mt-2 break-words font-mono text-[11px] leading-relaxed text-warning">
            {error.message}
          </p>
        )}
        {error.digest && (
          <p className="mt-1 font-mono text-[11px] text-fg-subtle">ref {error.digest}</p>
        )}
        {error.stack && (
          <details className="mt-2">
            <summary className="cursor-pointer font-mono text-[11px] text-fg-subtle">
              stack
            </summary>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed text-fg-subtle">
              {error.stack}
            </pre>
          </details>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-surface-hover py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-brand/15 hover:text-brand"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}
