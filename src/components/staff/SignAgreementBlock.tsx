'use client';

// Signature upload + NDA-sign UI. Two states:
//   • Not signed yet: instructions → photo upload → preview → "Sign agreement"
//   • Signed: confirmation card, optional re-upload (admin only via dashboard)

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertCircle, CheckCircle2, FileSignature, Loader2, Upload,
  PenTool, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import {
  uploadSignatureAction,
  signNdaAction,
  type SigActionState,
} from '@/lib/staff/signature-actions';

const INITIAL: SigActionState = { status: 'idle' };

interface Props {
  hasSignature: boolean;
  ndaSignedAt: string | null;
}

function UploadButton({ replacing }: { replacing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      loading={pending}
      rightIcon={pending ? undefined : <Upload className="h-4 w-4" />}
    >
      {replacing ? 'Replace signature' : 'Upload signature'}
    </Button>
  );
}

function SignButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} rightIcon={pending ? undefined : <PenTool className="h-4 w-4" />}>
      Sign the agreement
    </Button>
  );
}

export function SignAgreementBlock({ hasSignature, ndaSignedAt }: Props) {
  const [uploadState, uploadAction] = useActionState(uploadSignatureAction, INITIAL);
  const [signState,   signAction]   = useActionState(signNdaAction, INITIAL);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const effectiveHasSig = hasSignature || uploadState.status === 'success';

  // Fetch a signed URL for the stored signature when one exists.
  useEffect(() => {
    if (!effectiveHasSig) return;
    setLoadingPreview(true);
    fetch('/api/staff/me/signature-preview')
      .then((r) => r.json())
      .then(({ url }) => setPreviewUrl(url))
      .finally(() => setLoadingPreview(false));
  }, [effectiveHasSig, uploadState.status]);

  // ─── Signed state ─────────────────────────────────────────────
  if (ndaSignedAt) {
    return (
      <PremiumCard noLift>
        <div className="p-5 md:p-7">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-success/15 text-success shrink-0">
              <FileSignature className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-fg">Agreement signed</h3>
              <p className="mt-1 text-sm text-fg-muted">
                You signed on <strong className="text-fg">{new Date(ndaSignedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                Your contract and NDA are on file.
              </p>
            </div>
          </div>

          {previewUrl && (
            <div className="mt-5 p-4 rounded-md border border-border bg-paper">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-2">Your signature on file</p>
              <img src={previewUrl} alt="Your signature" className="max-h-24 mx-auto" />
            </div>
          )}

          <p className="mt-5 text-xs text-fg-subtle">
            Need to amend the agreement? Reach out to admin@highzcore.tech — only the CEO can re-issue.
          </p>
        </div>
      </PremiumCard>
    );
  }

  // ─── Unsigned state ───────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <PremiumCard noLift>
        <div className="p-5 md:p-6 space-y-3">
          <h3 className="font-display text-lg md:text-xl font-bold text-fg">How to sign</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-fg-muted leading-relaxed">
            <li>Take a clean piece of <strong className="text-fg">plain white paper</strong> (printer paper is perfect — no lines).</li>
            <li>Sign in <strong className="text-fg">dark ink</strong> — blue or black biro is ideal, purple/gel works too.</li>
            <li>Take a photo in good light, hold the camera straight above the paper, fill the frame with the signature.</li>
            <li>Upload below. We automatically remove the background and crop to the signature.</li>
          </ol>
        </div>
      </PremiumCard>

      {/* Upload form */}
      <PremiumCard noLift>
        <div className="p-5 md:p-7">
          <h3 className="font-display text-lg md:text-xl font-bold text-fg">
            {effectiveHasSig ? 'Replace signature' : 'Upload your signature'}
          </h3>
          <p className="mt-1 text-sm text-fg-muted">JPG or PNG, up to 8 MB. We strip the white background automatically.</p>

          <form action={uploadAction} encType="multipart/form-data" className="mt-5 space-y-4">
            {uploadState.status === 'success' && (
              <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <p className="text-fg">{uploadState.message}</p>
              </div>
            )}
            {uploadState.status === 'error' && (
              <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
                <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <p className="text-fg">{uploadState.message}</p>
              </div>
            )}

            <label className="flex items-center gap-3 px-4 py-3 rounded-md border-2 border-dashed border-border bg-surface/40 hover:bg-surface-hover cursor-pointer transition-colors">
              <Upload className="h-5 w-5 text-brand" />
              <span className="text-sm text-fg-muted">
                <span className="font-semibold text-fg">Click to upload</span> · JPG / PNG, max 8 MB
              </span>
              <input
                type="file"
                name="signature"
                accept="image/jpeg,image/png"
                required
                className="sr-only"
                onChange={(e) => {
                  const label = e.target.parentElement?.querySelector('span span') as HTMLSpanElement | null;
                  if (label && e.target.files?.[0]) label.textContent = e.target.files[0].name;
                }}
              />
            </label>

            <UploadButton replacing={effectiveHasSig} />
          </form>
        </div>
      </PremiumCard>

      {/* Preview */}
      {effectiveHasSig && (
        <PremiumCard noLift>
          <div className="p-5 md:p-7">
            <h3 className="font-display text-lg md:text-xl font-bold text-fg">Preview</h3>
            <p className="mt-1 text-sm text-fg-muted">
              This is exactly how your signature will appear in the contract. Re-upload above if it doesn't look right.
            </p>
            <div className="mt-5 p-6 rounded-md border border-border bg-paper grid place-items-center min-h-[140px]">
              {loadingPreview ? (
                <Loader2 className="h-6 w-6 text-fg-muted animate-spin" />
              ) : previewUrl ? (
                <img src={previewUrl} alt="Your signature preview" className="max-h-32" />
              ) : (
                <span className="text-sm text-fg-subtle inline-flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Preparing preview…
                </span>
              )}
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Final commit */}
      <PremiumCard noLift highlight={effectiveHasSig}>
        <div className="p-5 md:p-7">
          <h3 className="font-display text-lg md:text-xl font-bold text-fg">Sign and accept</h3>
          <p className="mt-1 text-sm text-fg-muted leading-relaxed">
            By signing you accept the offer letter, employment contract, and the confidentiality / NDA terms.
            The signing timestamp is recorded on file. Payday remains the <strong className="text-fg">15th of every month</strong>.
          </p>
          {signState.status === 'success' && (
            <div className="mt-4 flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <p className="text-fg">{signState.message}</p>
            </div>
          )}
          {signState.status === 'error' && (
            <div className="mt-4 flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <p className="text-fg">{signState.message}</p>
            </div>
          )}
          <form action={signAction} className="mt-5">
            <fieldset disabled={!effectiveHasSig} className="disabled:opacity-60">
              <SignButton />
            </fieldset>
          </form>
          {!effectiveHasSig && (
            <p className="mt-3 text-xs text-fg-subtle">Upload your signature first to enable signing.</p>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}
