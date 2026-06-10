'use client';

// Interactive signature cropper used by step 1 of the staff onboarding
// wizard. Flow:
//   1. User picks an image file
//   2. We display react-easy-crop with a 4:1 horizontal aspect lock —
//      they pan and zoom to position just the signature ink inside the
//      crop window
//   3. On confirm, we extract the cropped region into a Blob via canvas
//      and POST it as a File to the existing uploadSignatureAction. The
//      server then strips the white paper background via sharp.

import { useCallback, useRef, useState, useTransition } from 'react';
import Cropper from 'react-easy-crop';
import { AlertCircle, CheckCircle2, RotateCcw, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { uploadSignatureAction } from '@/lib/staff/signature-actions';
import { getCroppedBlob, type PixelArea } from '@/lib/signature/crop-canvas';

interface Props {
  onComplete: () => void;
}

export function SignatureCropper({ onComplete }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<PixelArea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startTransition] = useTransition();

  const onCropComplete = useCallback((_cropped: PixelArea, croppedPixels: PixelArea) => {
    setCroppedArea(croppedPixels);
  }, []);

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
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  function reset() {
    setImageSrc(null);
    setCroppedArea(null);
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function confirm() {
    if (!imageSrc || !croppedArea) return;
    setError(null);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea, 1400, 'image/png');
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

  // ── Image loaded → crop UI ───────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[4/1] rounded-md overflow-hidden bg-ink/80 border border-border">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 1}
          showGrid={true}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
          restrictPosition={false}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3">
        <ZoomOut className="h-4 w-4 text-fg-muted shrink-0" />
        <input
          type="range"
          min={1}
          max={5}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-surface-hover [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
          aria-label="Zoom"
        />
        <ZoomIn className="h-4 w-4 text-fg-muted shrink-0" />
        <span className="text-xs font-mono tabular text-fg-subtle w-10 text-right">{zoom.toFixed(1)}x</span>
      </div>

      <p className="text-xs text-fg-subtle leading-relaxed">
        Drag the photo behind the frame. Zoom in or out until only the signature is inside.
        We'll strip the white paper background after you save.
      </p>

      {error && (
        <p className="flex items-start gap-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="button" size="lg" loading={submitting} onClick={confirm} rightIcon={!submitting ? <CheckCircle2 className="h-4 w-4" /> : undefined}>
          {submitting ? 'Processing…' : 'Save signature'}
        </Button>
        <Button type="button" size="lg" variant="secondary" onClick={reset} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Upload a different photo
        </Button>
      </div>
    </div>
  );
}
