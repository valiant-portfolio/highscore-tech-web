'use client';

// Portfolio showcase video — optional, one per project. Uploaded from the device
// the same way images are: a file input that rides along in the form submit
// (name="new_video"), which the save action uploads to the portfolio bucket.
// An existing video is kept via a hidden "existing_video" field unless replaced
// or removed.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Film, X } from 'lucide-react';

const MAX_MB = 50; // portfolio bucket ceiling on this Supabase plan

export function PortfolioVideo({
  initial = null,
  error,
}: {
  initial?: string | null;
  error?: string;
}) {
  const [existing, setExisting] = useState<string | null>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [tooBig, setTooBig] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewSrc = useMemo(() => (file ? URL.createObjectURL(file) : existing), [file, existing]);
  useEffect(() => {
    if (!file) return;
    const url = previewSrc as string;
    return () => URL.revokeObjectURL(url);
  }, [file, previewSrc]);

  // Keep the hidden file input's FileList equal to `file` so the form submits it.
  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    inputRef.current.files = dt.files;
  }, [file]);

  const onPick = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) { setTooBig(true); return; }
    setTooBig(false);
    setExisting(null); // a new file replaces whatever was there
    setFile(f);
  };

  const remove = () => {
    setFile(null);
    setExisting(null);
    setTooBig(false);
  };

  const hasVideo = !!previewSrc;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-fg-muted">Showcase video <span className="font-normal text-fg-subtle">(optional)</span></span>
        {hasVideo && (
          <button type="button" onClick={remove} className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline">
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>

      {/* Kept existing video (only when no new file is picked). */}
      {existing && !file && <input type="hidden" name="existing_video" value={existing} />}

      {/* The real file input — synced to `file` above. */}
      <input
        ref={inputRef}
        type="file"
        name="new_video"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />

      {hasVideo ? (
        <div className="relative overflow-hidden rounded-md border border-border bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={previewSrc ?? undefined} controls muted playsInline className="w-full max-h-72 bg-black" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-surface/60 text-sm font-semibold text-fg-muted hover:border-brand/50 hover:text-fg"
        >
          <Film className="h-5 w-5" />
          Upload a video
        </button>
      )}

      {hasVideo && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs font-semibold text-brand hover:underline"
        >
          Replace video
        </button>
      )}

      <p className="text-xs text-fg-subtle">
        MP4, MOV or WebM up to {MAX_MB} MB. On the site it plays on hover and in place of the cover — muted, no controls until opened full-screen.
      </p>
      {tooBig && <p className="text-xs text-danger">That video is over {MAX_MB} MB. Trim or compress it first.</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
