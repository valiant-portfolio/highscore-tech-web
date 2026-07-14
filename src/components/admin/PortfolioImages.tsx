'use client';

// Portfolio image picker: upload up to 5 images from the device (no URL
// pasting), preview them, and remove any before saving. The first image is the
// cover. New files ride along in a hidden <input type="file" name="new_images">
// (kept in sync via a DataTransfer); kept existing images submit as hidden
// text inputs named "existing_images". The save action combines both.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, X, Star, Loader2 } from 'lucide-react';

const MAX = 8;
const MAX_EDGE = 1600; // px — downscale longest side before upload

// Downscale + re-encode in the browser so the Server Action payload stays
// small (Netlify function body limits). Falls back to the original file if the
// browser can't decode it (e.g. HEIC).
async function compress(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, 'image/webp', 0.85),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file;
  }
}

export function PortfolioImages({
  initial = [],
  error,
}: {
  initial?: string[];
  error?: string;
}) {
  const [existing, setExisting] = useState<string[]>(initial.slice(0, MAX));
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = existing.length + files.length;
  const remaining = Math.max(0, MAX - total);

  // Object URLs for the freshly picked files, rebuilt when the set changes.
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // Keep the hidden file input's FileList equal to `files` so the form submits
  // exactly what's previewed (supports additive picking + individual removal).
  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    inputRef.current.files = dt.files;
  }, [files]);

  const onPick = async (list: FileList | null) => {
    if (!list) return;
    const room = Math.max(0, MAX - existing.length - files.length);
    const picked = Array.from(list).filter((f) => f.type.startsWith('image/')).slice(0, room);
    if (picked.length === 0) return;
    setBusy(true);
    try {
      const compressed = await Promise.all(picked.map(compress));
      setFiles((prev) => [...prev, ...compressed].slice(0, Math.max(0, MAX - existing.length)));
    } finally {
      setBusy(false);
    }
  };

  const removeExisting = (url: string) => setExisting((prev) => prev.filter((u) => u !== url));
  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const tiles: { key: string; src: string; onRemove: () => void; cover: boolean }[] = [
    ...existing.map((url, i) => ({ key: `e-${url}`, src: url, onRemove: () => removeExisting(url), cover: i === 0 })),
    ...files.map((_, i) => ({ key: `f-${i}`, src: previews[i], onRemove: () => removeFile(i), cover: existing.length === 0 && i === 0 })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-fg-muted">Project images</span>
        <span className="text-xs text-fg-subtle">{total}/{MAX} · first image is the cover</span>
      </div>

      {/* Kept existing images submit as hidden fields (in order). */}
      {existing.map((url) => (
        <input key={url} type="hidden" name="existing_images" value={url} />
      ))}

      {/* Hidden real file input — synced to `files` via DataTransfer above. */}
      <input
        ref={inputRef}
        type="file"
        name="new_images"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />

      {tiles.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {tiles.map((t) => (
            <div key={t.key} className="relative aspect-square rounded-md overflow-hidden border border-border bg-surface group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt="" className="h-full w-full object-cover" />
              {t.cover && (
                <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded bg-brand/90 px-1.5 py-0.5 text-[10px] font-bold text-brand-fg">
                  <Star className="h-2.5 w-2.5" /> Cover
                </span>
              )}
              <button
                type="button"
                onClick={t.onRemove}
                aria-label="Remove image"
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-danger"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={remaining === 0 || busy}
        className="inline-flex h-11 items-center gap-2 px-4 rounded-md border border-dashed border-border bg-surface/60 text-sm font-semibold text-fg-muted hover:text-fg hover:border-brand/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {busy ? 'Processing…' : remaining === 0 ? 'Maximum 5 images' : `Upload images (${remaining} left)`}
      </button>

      <p className="text-xs text-fg-subtle">
        PNG, JPG, WebP or AVIF from your device. The first image is used as the cover on the portfolio grid.
      </p>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
