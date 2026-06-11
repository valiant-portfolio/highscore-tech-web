'use client';

// Modal opened from the AgreementSignBlock when the staff member tries
// to sign a document without a signature on file. Wraps SignatureCropper
// with a backdrop + header. On successful crop+upload the modal closes
// itself and signals the parent to proceed with the actual signing.

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { SignatureCropper } from './SignatureCropper';

interface Props {
  open: boolean;
  onClose: () => void;
  onSigned: () => void;
}

export function SignatureCollectionModal({ open, onClose, onSigned }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[760px] max-h-[95vh] overflow-y-auto rounded-xl border border-border bg-bg-elevated shadow-elev-3">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 md:px-6 py-4 border-b border-border bg-bg-elevated">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Add your signature</p>
            <h2 className="mt-1 font-display text-lg md:text-xl font-bold text-fg">
              Sign once. Reuse on every document.
            </h2>
            <p className="mt-1 text-xs text-fg-muted">
              Take a photo with your camera or upload one. We'll crop just the ink and embed it into the document.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-hover"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 md:p-6">
          <SignatureCropper onComplete={onSigned} />
        </div>
      </div>
    </div>
  );
}
