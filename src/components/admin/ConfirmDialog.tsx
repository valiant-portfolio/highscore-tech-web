'use client';

// Reusable confirmation modal — the custom replacement for window.confirm().
// Controlled: the parent owns `open` and provides onConfirm (which may be async).
// Shows a spinner + disables the buttons while the action runs, surfaces an
// error inline instead of closing, and closes on backdrop click / Escape.

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset transient state whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) { setBusy(false); setError(null); }
  }, [open]);

  // Escape to cancel (ignored while an action is in flight).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, busy, onClose]);

  if (!open) return null;

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      // On success the parent closes/navigates. If it didn't, release the button.
      setBusy(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm"
      onClick={() => { if (!busy) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <span
            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              destructive ? 'bg-danger/15 text-danger' : 'bg-brand/15 text-brand'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-fg">{title}</h3>
            {description && <div className="mt-1 text-sm text-fg-muted leading-relaxed">{description}</div>}
          </div>
          <button
            type="button"
            onClick={() => { if (!busy) onClose(); }}
            className="text-fg-subtle hover:text-fg disabled:opacity-40"
            disabled={busy}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="mx-5 mb-1 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-10 items-center px-4 rounded-md border border-border bg-surface/60 text-sm font-semibold text-fg-muted hover:text-fg disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className={`inline-flex h-10 items-center gap-2 px-4 rounded-md text-sm font-semibold text-white disabled:opacity-50 ${
              destructive ? 'bg-danger hover:opacity-90' : 'bg-brand hover:bg-brand-hover'
            }`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
