'use client';

// Interactive signature cropper used by step 1 of the staff onboarding
// wizard. Built on react-image-crop so the staff can:
//   • See the entire uploaded photo at all times
//   • Draw a crop box of any shape and size by dragging edges/corners
//   • Move the crop box freely over the image
//   • Save when the box surrounds just the signature
// On save we extract the cropped region client-side via canvas and POST
// it as a File to the existing uploadSignatureAction. The server then
// strips the paper background via Otsu adaptive thresholding.

import { useEffect, useRef, useState, useTransition } from 'react';
import ReactCrop, {
  centerCrop, makeAspectCrop, type Crop, type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { AlertCircle, CheckCircle2, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui';
import { uploadSignatureAction } from '@/lib/staff/signature-actions';
import { getCroppedBlob } from '@/lib/signature/crop-canvas';

interface Props {
  onComplete: () => void;
}

export function SignatureCropper({ onComplete }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      setError('File too big — keep it under 8 MB.');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(f.type)) {
      setError('JPG or PNG only.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(f);
    setCrop(undefined);
    setCompletedCrop(null);
  }

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    // Default crop = centered, 80% of image (most photos have padding around
    // the signature so this is a sensible starting point the user can adjust).
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, width / height, width, height),
      width,
      height,
    );
    setCrop(initialCrop);
    // Compute pixel-coords for the initial crop so "Save" works without any
    // user interaction if the default is already correct.
    setCompletedCrop({
      unit: 'px',
      x: (initialCrop.x! / 100) * width,
      y: (initialCrop.y! / 100) * height,
      width:  (initialCrop.width!  / 100) * width,
      height: (initialCrop.height! / 100) * height,
    });
  }

  function reset() {
    setImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setError(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function confirm() {
    if (!imageSrc || !completedCrop || !imgRef.current) {
      setError('Draw a crop box first.');
      return;
    }
    setError(null);
    try {
      const img = imgRef.current;
      // react-image-crop reports coords in the DISPLAYED image's space;
      // scale up to the natural image so canvas extraction matches the
      // source pixels exactly.
      const scaleX = img.naturalWidth  / img.width;
      const scaleY = img.naturalHeight / img.height;
      const area = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width:  completedCrop.width  * scaleX,
        height: completedCrop.height * scaleY,
      };
      if (area.width < 50 || area.height < 20) {
        setError('Crop area is too small. Make it bigger.');
        return;
      }

      const blob = await getCroppedBlob(imageSrc, area, 1600, 'image/png');
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      const fd = new FormData();
      fd.set('signature', file);

      startTransition(async () => {
        const res = await uploadSignatureAction({ status: 'idle' }, fd);
        if (res.status === 'success') {
          onComplete();
        } else if (res.status === 'error') {
          setError(res.message);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process the image.');
    }
  }

  // ── No image yet → file picker ───────────────────────────────────────
  if (!imageSrc) {
    return (
      <div className="space-y-4">
        <label className="flex items-center gap-3 px-4 py-3 rounded-md border-2 border-dashed border-border bg-surface/40 hover:bg-surface-hover cursor-pointer transition-colors">
          <Upload className="h-5 w-5 text-brand" />
          <span className="text-sm text-fg-muted">
            <span className="font-semibold text-fg">Click to upload your signature photo</span> · JPG or PNG, max 8 MB
          </span>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={onFile}
          />
        </label>
        {error && (
          <p className="flex items-start gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
          </p>
        )}
      </div>
    );
  }

  // ── Image loaded → free-form crop UI ─────────────────────────────────
  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted leading-relaxed">
        Drag any corner or edge of the box to resize it. Drag the middle to move it.
        Make the box hug just the signature — leave the paper outside. We'll strip the
        background after you save.
      </p>

      <div className="rounded-md border border-border bg-ink/80 p-2 overflow-hidden">
        <div className="signature-crop max-h-[60vh] overflow-auto flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_pixel, percent) => setCrop(percent)}
            onComplete={(c) => setCompletedCrop(c)}
            ruleOfThirds
            keepSelection
            className="!max-w-full"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Uploaded signature"
              onLoad={onImgLoad}
              className="max-h-[60vh] w-auto"
            />
          </ReactCrop>
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          size="lg"
          loading={submitting}
          onClick={confirm}
          rightIcon={!submitting ? <CheckCircle2 className="h-4 w-4" /> : undefined}
        >
          {submitting ? 'Processing…' : 'Save signature'}
        </Button>
        <Button type="button" size="lg" variant="secondary" onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Upload a different photo
        </Button>
      </div>
    </div>
  );
}
