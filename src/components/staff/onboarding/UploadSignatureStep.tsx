'use client';

// Step 1 of the staff onboarding wizard: upload + crop signature photo.
// • Instructions card
// • SignatureCropper — file picker → interactive crop (4:1 aspect lock)
//   → server upload with background removal
// • Live preview at the same 4:1 horizontal slot shape used in the
//   actual agreement documents

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { SignaturePreview } from './SignaturePreview';
import { SignatureCropper } from './SignatureCropper';

export function UploadSignatureStep({ initialHasSignature }: { initialHasSignature: boolean }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasSignature, setHasSignature] = useState(initialHasSignature);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PremiumCard noLift>
        <div className="p-5 md:p-6">
          <h2 className="font-display text-lg md:text-xl font-bold text-fg">How to take the photo</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-fg-muted leading-relaxed">
            <li>Use a <strong className="text-fg">plain white sheet of paper</strong> — printer paper is perfect, no ruled lines.</li>
            <li>Sign in <strong className="text-fg">dark ink</strong> — blue or black biro is ideal.</li>
            <li>Hold your phone <strong className="text-fg">straight above the paper</strong> in good light. The whole signature should be in focus.</li>
            <li>Upload the photo, then drag and zoom inside the crop window so only the signature ink is visible. We'll remove the white background automatically.</li>
          </ol>
        </div>
      </PremiumCard>

      <PremiumCard noLift>
        <div className="p-5 md:p-7">
          <h2 className="font-display text-lg md:text-xl font-bold text-fg">
            {hasSignature ? 'Replace signature' : 'Upload + crop your signature'}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Drag the photo behind the horizontal frame. Zoom until just the signature shows. Save when it looks right.
          </p>
          <div className="mt-6">
            <SignatureCropper
              key={refreshKey}
              onComplete={() => {
                setHasSignature(true);
                setRefreshKey((k) => k + 1);
              }}
            />
          </div>
        </div>
      </PremiumCard>

      {hasSignature && (
        <PremiumCard noLift>
          <div className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Preview</h2>
            <p className="mt-1 text-sm text-fg-muted">
              This is exactly how your signature will appear inside the offer letter and contract.
            </p>
            <div className="mt-4">
              <SignaturePreview refreshKey={refreshKey} />
            </div>
          </div>
        </PremiumCard>
      )}

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
