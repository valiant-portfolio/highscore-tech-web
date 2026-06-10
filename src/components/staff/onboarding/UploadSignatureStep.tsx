'use client';

// Step 1 of the staff onboarding wizard: upload signature photo.
// • Instructions panel
// • File upload  → uploadSignatureAction processes (sharp background
//   removal + trim to ink bounding box) and writes signatures/<user.id>/…
// • Live preview in the same 4:1 horizontal slot shape used inside the
//   actual agreement documents

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { SignaturePreview } from './SignaturePreview';
import {
  uploadSignatureAction, type SigActionState,
} from '@/lib/staff/signature-actions';

const INITIAL: SigActionState = { status: 'idle' };

function UploadButton({ replacing }: { replacing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} rightIcon={pending ? undefined : <Upload className="h-4 w-4" />}>
      {replacing ? 'Replace signature' : 'Upload signature'}
    </Button>
  );
}

export function UploadSignatureStep({ initialHasSignature }: { initialHasSignature: boolean }) {
  const [state, formAction] = useActionState(uploadSignatureAction, INITIAL);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  // Treat a successful upload in this session as "has signature".
  const hasSignature = initialHasSignature || state.status === 'success';

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <PremiumCard noLift>
        <div className="p-5 md:p-6">
          <h2 className="font-display text-lg md:text-xl font-bold text-fg">How to take the photo</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-fg-muted leading-relaxed">
            <li>Use a <strong className="text-fg">plain white sheet of paper</strong> — printer paper is perfect, no ruled lines.</li>
            <li>Sign in <strong className="text-fg">dark ink</strong> — blue or black biro is ideal.</li>
            <li>Hold your phone <strong className="text-fg">straight above the paper</strong> in good light. Fill the frame with the signature.</li>
            <li>Upload the photo below. We strip the white background and crop to a horizontal signature shape automatically.</li>
          </ol>
        </div>
      </PremiumCard>

      {/* Upload form */}
      <PremiumCard noLift>
        <div className="p-5 md:p-7">
          <h2 className="font-display text-lg md:text-xl font-bold text-fg">
            {hasSignature ? 'Replace signature' : 'Upload your signature'}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">JPG or PNG, up to 8 MB.</p>

          <form action={formAction} encType="multipart/form-data" className="mt-5 space-y-4"
            onSubmit={() => setTimeout(() => setRefreshKey((k) => k + 1), 1500)}>
            {state.status === 'success' && (
              <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <p className="text-fg">{state.message}</p>
              </div>
            )}
            {state.status === 'error' && (
              <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
                <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <p className="text-fg">{state.message}</p>
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

            <UploadButton replacing={hasSignature} />
          </form>
        </div>
      </PremiumCard>

      {/* Preview */}
      {hasSignature && (
        <PremiumCard noLift>
          <div className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Preview</h2>
            <p className="mt-1 text-sm text-fg-muted">
              This is exactly how your signature will appear in every signed agreement.
              Don't like it? Re-upload above with a clearer photo.
            </p>
            <div className="mt-4">
              <SignaturePreview refreshKey={refreshKey} />
            </div>
          </div>
        </PremiumCard>
      )}

      {/* Continue */}
      {hasSignature && (
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            size="lg"
            onClick={() => router.push('/staff/onboarding?step=offer')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Continue to offer letter
          </Button>
        </div>
      )}
    </div>
  );
}
