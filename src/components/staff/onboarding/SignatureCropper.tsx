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
import { uploadSignatureAction, type SigActionState } from '@/lib/staff/signature-actions';
import { getCroppedBlob } from '@/lib/signature/crop-canvas';

type SigAction = (prev: SigActionState, fd: FormData) => Promise<SigActionState>;

interface Props {
  onComplete: () => void;
  /** Optional override. Defaults to the staff upload action. */
  action?: SigAction;
  /** Form-field name the action expects. Defaults to "signature". */
  fieldName?: string;
}

export function SignatureCropper({
  onComplete,
  action = uploadSignatureAction,
  fieldName = 'signature',
}: Props) {
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
    // Default crop = centered horizontal rectangle covering roughly the
    // lower 40% of the photo (signatures usually live there). 70% wide so
    // there's room to drag outward in either direction without the box
    // hitting the image edge.
    const cropPercent: Crop = {
      unit: '%',
      width: 70,
      height: 40,
      x: 15,
      y: 45,
    };
    setCrop(cropPercent);
    setCompletedCrop({
      unit: 'px',
      x: (cropPercent.x! / 100) * width,
      y: (cropPercent.y! / 100) * height,
      width:  (cropPercent.width!  / 100) * width,
      height: (cropPercent.height! / 100) * height,
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
      fd.set(fieldName, file);

      startTransition(async () => {
        const res = await action({ status: 'idle' }, fd);
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

      {/* Cropper canvas — image always fits the viewport, no scrolling.
          Selection box overlays the rendered image so what you see is
          exactly what you get. */}
      <div className="signature-crop rounded-md border border-border bg-ink/80 p-3 flex items-center justify-center min-h-[300px]">
        <ReactCrop
          crop={crop}
          onChange={(_pixel, percent) => setCrop(percent)}
          onComplete={(c) => setCompletedCrop(c)}
          ruleOfThirds
          keepSelection
          minWidth={40}
          minHeight={20}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Uploaded signature"
            onLoad={onImgLoad}
            style={{
              display: 'block',
              maxWidth:  '100%',
              maxHeight: '65vh',
              width:  'auto',
              height: 'auto',
            }}
          />
        </ReactCrop>
      </div>

      {completedCrop && (
        <p className="text-[11px] font-mono tabular text-fg-subtle text-center">
          Selection: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} px
        </p>
      )}

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
