'use client';

// Passport-photo self-upload for staff. Lives in the Settings tab.
// Pick a file (or take a selfie via camera capture) → preview → save.
// Server processes to 500×500 JPEG and stores in staff-photos/<id>.jpg.

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  AlertCircle, Camera, CheckCircle2, ImageIcon, Loader2, Trash2, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  uploadOwnPhotoAction, deleteOwnPhotoAction, type PhotoActionState,
} from '@/lib/staff/photo-actions';

const INITIAL: PhotoActionState = { status: 'idle' };

interface Props {
  initialPhotoUrl: string | null;
}

export function StaffPhotoUpload({ initialPhotoUrl }: Props) {
  const fileFromUpload = useRef<HTMLInputElement>(null);
  const fileFromCamera = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [state, setState] = useState<PhotoActionState>(INITIAL);
  const [submitting, startTransition] = useTransition();
  const [currentUrl, setCurrentUrl] = useState<string | null>(initialPhotoUrl);
  const [deletePending, startDelete] = useTransition();

  // Decode the picked file into a data URI so we can show a local preview
  // before the server has the image.
  useEffect(() => {
    if (!file) {
      setPreviewUri(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewUri(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setState(INITIAL);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      setState({ status: 'error', message: 'File too big — keep it under 8 MB.' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setState({ status: 'error', message: 'JPG, PNG, or WebP only.' });
      return;
    }
    setFile(f);
  }

  function reset() {
    setFile(null);
    setPreviewUri(null);
    setState(INITIAL);
    if (fileFromUpload.current) fileFromUpload.current.value = '';
    if (fileFromCamera.current) fileFromCamera.current.value = '';
  }

  async function save() {
    if (!file) return;
    const fd = new FormData();
    fd.set('photo', file);
    startTransition(async () => {
      const res = await uploadOwnPhotoAction(INITIAL, fd);
      setState(res);
      if (res.status === 'success') {
        // Cache-bust the public URL so the new image appears immediately.
        if (currentUrl) {
          const base = currentUrl.split('?')[0];
          setCurrentUrl(`${base}?t=${Date.now()}`);
        }
        // After a moment, reset the picker.
        setTimeout(reset, 1200);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Current + preview */}
      <div className="grid sm:grid-cols-[140px_1fr] gap-4 items-start">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-2">
            {previewUri ? 'New preview' : 'Currently on file'}
          </p>
          <div className="h-32 w-32 rounded-md border border-border bg-surface/40 overflow-hidden flex items-center justify-center">
            {previewUri ? (
              <img src={previewUri} alt="Selected" className="h-full w-full object-cover" />
            ) : currentUrl ? (
              <img src={currentUrl} alt="Your passport photo" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-fg-subtle" />
            )}
          </div>
        </div>

        <div className="space-y-3">
          {currentUrl && !previewUri && (
            <div className="rounded-md border border-success/30 bg-success/5 p-3 flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <div className="text-fg">
                <p className="font-semibold">Photo on file.</p>
                <p className="mt-0.5 text-xs text-fg-muted">
                  Embedded on your ID card and visible to admin. Replace below.
                </p>
              </div>
            </div>
          )}
          {!currentUrl && !previewUri && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-fg">No passport photo yet.</p>
                <p className="mt-0.5 text-xs text-fg-muted">
                  Add one so your ID card has your face on it.
                </p>
              </div>
            </div>
          )}

          {state.status === 'error' && (
            <div className="rounded-md border border-danger/30 bg-danger/5 p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <p className="text-fg">{state.message}</p>
            </div>
          )}
          {state.status === 'success' && (
            <div className="rounded-md border border-success/30 bg-success/5 p-3 flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <p className="text-fg">{state.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pick buttons */}
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-3 px-4 py-3 rounded-md border-2 border-brand/40 bg-brand-tint/30 hover:bg-brand-tint/50 cursor-pointer transition-colors">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand text-brand-fg">
            <Camera className="h-5 w-5" />
          </span>
          <span className="text-sm">
            <span className="block font-semibold text-fg">Take a selfie</span>
            <span className="text-xs text-fg-muted">Camera (front)</span>
          </span>
          <input
            ref={fileFromCamera}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={onFile}
          />
        </label>

        <label className="flex items-center gap-3 px-4 py-3 rounded-md border-2 border-dashed border-border hover:bg-surface-hover cursor-pointer transition-colors">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-hover text-fg-muted">
            <Upload className="h-5 w-5" />
          </span>
          <span className="text-sm">
            <span className="block font-semibold text-fg">Upload a photo</span>
            <span className="text-xs text-fg-muted">JPG / PNG, max 8 MB</span>
          </span>
          <input
            ref={fileFromUpload}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onFile}
          />
        </label>
      </div>

      <p className="text-xs text-fg-subtle leading-relaxed">
        Use a plain background, face centered, no hat or sunglasses. We crop to a square
        automatically — try to fit the head and shoulders in the frame.
      </p>

      {/* Save / cancel / delete */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {file && (
          <Button
            type="button"
            loading={submitting}
            onClick={save}
            rightIcon={!submitting ? <CheckCircle2 className="h-4 w-4" /> : undefined}
          >
            {submitting ? 'Uploading…' : 'Save photo'}
          </Button>
        )}
        {file && (
          <Button type="button" variant="secondary" onClick={reset}>
            Cancel
          </Button>
        )}
        {currentUrl && !file && (
          <Button
            type="button"
            variant="ghost"
            loading={deletePending}
            onClick={() => {
              if (!confirm('Remove your photo? Your ID card will show your initials instead.')) return;
              startDelete(async () => {
                await deleteOwnPhotoAction();
                setCurrentUrl(null);
              });
            }}
            leftIcon={!deletePending ? <Trash2 className="h-3.5 w-3.5" /> : undefined}
            size="sm"
          >
            Remove photo
          </Button>
        )}
      </div>
    </div>
  );
}

void Loader2;
