'use client';

// CEO signature upload + preview. Reuses SignatureCropper (interactive
// crop, brand cyan handles, viewport-fitting layout) but points it at
// uploadCeoSignatureAction instead of the staff one. After upload the
// processed signature lands at signatures/ceo/signature.png and the
// preview re-fetches via /api/ceo/signature-preview.

import { useEffect, useState, useTransition } from 'react';
import { CheckCircle2, Loader2, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { SignatureCropper } from '@/components/staff/onboarding/SignatureCropper';
import {
  uploadCeoSignatureAction, deleteCeoSignatureAction,
} from '@/lib/admin/ceo-signature-actions';

export function CeoSignatureManager({ initiallyExists }: { initiallyExists: boolean }) {
  const [exists, setExists] = useState(initiallyExists);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [showCropper, setShowCropper] = useState(!initiallyExists);
  const [deletePending, startDelete] = useTransition();
  const [refreshKey, setRefreshKey] = useState(0);

  // (Re-)fetch the signed preview URL whenever exists/refresh changes.
  useEffect(() => {
    let cancelled = false;
    setLoadingPreview(true);
    if (!exists) {
      setPreviewUrl(null);
      setLoadingPreview(false);
      return;
    }
    fetch('/api/ceo/signature-preview')
      .then((r) => r.json())
      .then(({ url }) => { if (!cancelled) setPreviewUrl(url); })
      .finally(() => { if (!cancelled) setLoadingPreview(false); });
    return () => { cancelled = true; };
  }, [exists, refreshKey]);

  return (
    <div className="space-y-5">
      {exists && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-2">
            Currently uploaded
          </p>
          <div className="rounded-md border border-border bg-white p-4 min-h-[100px] flex items-center justify-center">
            {loadingPreview ? (
              <Loader2 className="h-5 w-5 text-fg-subtle animate-spin" />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="CEO signature"
                className="max-h-20 max-w-full object-contain"
              />
            ) : (
              <span className="inline-flex items-center gap-2 text-fg-subtle text-sm">
                <ImageIcon className="h-4 w-4" /> Could not load preview
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setShowCropper((s) => !s)}
            >
              {showCropper ? 'Cancel replace' : 'Replace signature'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              loading={deletePending}
              onClick={() => {
                if (!confirm('Remove the CEO signature? Future signed PDFs will fall back to a blank signature line.')) return;
                startDelete(async () => {
                  await deleteCeoSignatureAction();
                  setExists(false);
                  setShowCropper(true);
                });
              }}
              leftIcon={!deletePending ? <Trash2 className="h-3.5 w-3.5" /> : undefined}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {!exists && (
        <div className="rounded-md border border-warning/30 bg-warning/5 p-3 flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-fg">No CEO signature on file.</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              Upload one below and every staff offer letter, contract, and ID
              card will embed it automatically.
            </p>
          </div>
        </div>
      )}

      {showCropper && (
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-3">
            {exists ? 'Upload a replacement' : 'Upload your signature'}
          </p>
          <SignatureCropper
            key={refreshKey}
            action={uploadCeoSignatureAction}
            onComplete={() => {
              setExists(true);
              setShowCropper(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        </div>
      )}

      {exists && !showCropper && (
        <div className="rounded-md border border-success/30 bg-success/5 p-3 flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-fg">
            Live on every offer letter, contract, and onboarding preview.
          </p>
        </div>
      )}
    </div>
  );
}
