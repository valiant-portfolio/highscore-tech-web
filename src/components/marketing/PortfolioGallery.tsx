'use client';

// Portfolio media on the case-study page.
//
// If the project has a video, it takes the cover slot: it plays inline —
// muted, looping, NO controls — and every image drops into the thumbnail grid
// below. Clicking the video opens it full-screen WITH controls (and sound).
//
// No video → the first image is the cover and the rest are the grid, exactly
// as before. Either way, clicking any image opens the image lightbox with
// arrow-key navigation.

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

type Lightbox = { kind: 'image'; index: number } | { kind: 'video' } | null;

export function PortfolioGallery({
  images,
  title,
  videoUrl = null,
}: {
  images: string[];
  title: string;
  videoUrl?: string | null;
}) {
  const [box, setBox] = useState<Lightbox>(null);
  const inlineVideo = useRef<HTMLVideoElement>(null);
  const imageCount = images.length;

  // With a video the cover is the video, so ALL images go to the grid.
  const gridImages = videoUrl ? images : images.slice(1);
  const cover = videoUrl ? null : images[0];

  const close = useCallback(() => setBox(null), []);
  const step = useCallback(
    (d: number) => setBox((b) => (b?.kind === 'image' ? { kind: 'image', index: (b.index + d + imageCount) % imageCount } : b)),
    [imageCount],
  );

  useEffect(() => {
    if (!box) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (box.kind === 'image' && e.key === 'ArrowLeft') step(-1);
      else if (box.kind === 'image' && e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [box, close, step]);

  if (!videoUrl && imageCount === 0) return null;

  return (
    <>
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      {videoUrl ? (
        <button
          type="button"
          onClick={() => setBox({ kind: 'video' })}
          aria-label="Play video full screen"
          className="group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-black"
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={inlineVideo}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={cover ?? images[0] ?? undefined}
            className="h-full w-full object-cover"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg/85 px-3 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" /> Click for sound &amp; full screen
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setBox({ kind: 'image', index: 0 })}
          aria-label="View image full size"
          className="group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <Image
            src={cover!}
            alt={title}
            fill
            priority
            sizes="(min-width: 1180px) 1180px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/25">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg/85 px-3 py-1.5 text-xs font-semibold text-fg opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" /> Click to view
            </span>
          </span>
        </button>
      )}

      {/* ── Thumbnail grid ────────────────────────────────────────────── */}
      {gridImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {gridImages.map((src, i) => {
            const imageIndex = videoUrl ? i : i + 1; // index into `images`
            return (
              <button
                key={src}
                type="button"
                onClick={() => setBox({ kind: 'image', index: imageIndex })}
                aria-label="View image full size"
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface"
              >
                <Image
                  src={src}
                  alt={`${title} — image ${imageIndex + 1}`}
                  fill
                  sizes="(min-width: 1180px) 380px, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {box && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {box.kind === 'video' ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={videoUrl ?? undefined}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[94vw] rounded-lg bg-black shadow-2xl"
            />
          ) : (
            <>
              {imageCount > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); step(-1); }}
                  aria-label="Previous image"
                  className="absolute left-3 md:left-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[box.index]}
                alt={title}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
              />
              {imageCount > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); step(1); }}
                  aria-label="Next image"
                  className="absolute right-3 md:right-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
              {imageCount > 1 && (
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white tabular">
                  {box.index + 1} / {imageCount}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
