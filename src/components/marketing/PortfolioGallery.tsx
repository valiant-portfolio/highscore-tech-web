'use client';

// Portfolio images on the case-study page: a large cover plus a thumbnail grid,
// each opening a full-screen lightbox (contain-fit, so the whole image is
// legible) with keyboard + arrow navigation across every image.

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export function PortfolioGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const count = images.length;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % count)),
    [count],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, close, prev, next]);

  if (count === 0) return null;

  const [cover, ...rest] = images;

  return (
    <>
      {/* Cover */}
      <button
        type="button"
        onClick={() => setIndex(0)}
        aria-label="View image full size"
        className="group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <Image
          src={cover}
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

      {/* Thumbnail grid */}
      {rest.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {rest.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i + 1)}
              aria-label="View image full size"
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface"
            >
              <Image
                src={src}
                alt={`${title} — image ${i + 2}`}
                fill
                sizes="(min-width: 1180px) 380px, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {index !== null && (
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
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {count > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              className="absolute left-3 md:left-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />

          {count > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              className="absolute right-3 md:right-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {count > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white tabular">
              {index + 1} / {count}
            </span>
          )}
        </div>
      )}
    </>
  );
}
