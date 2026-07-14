'use client';

// Portfolio grid thumbnail. Shows the cover image; if the project has a video,
// hovering the card fades the (muted, looping) video in over the cover and
// plays it — a silent preview. Pointer leaves → it pauses and resets. No video
// → just the cover, exactly as before.

import { useRef, useState } from 'react';
import Image from 'next/image';

export function PortfolioCardMedia({
  cover,
  video,
  category,
  title,
}: {
  cover: string | null;
  video: string | null;
  category: string | null;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const onEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    setPlaying(true);
    v.play().catch(() => setPlaying(false));
  };
  const onLeave = () => {
    const v = videoRef.current;
    setPlaying(false);
    if (v) { v.pause(); v.currentTime = 0; }
  };

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[15px] bg-surface-hover"
      onMouseEnter={video ? onEnter : undefined}
      onMouseLeave={video ? onLeave : undefined}
    >
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 50% at 50% 30%, color-mix(in srgb, #18C2DC 18%, transparent) 0%, transparent 70%), linear-gradient(135deg, var(--c-graphite-800), var(--c-graphite-900))',
          }}
        />
      )}

      {video && (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            src={video}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Little "has video" affordance, hidden while previewing. */}
          <span
            className={`absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-bg/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-fg backdrop-blur transition-opacity ${playing ? 'opacity-0' : 'opacity-100'}`}
          >
            ▶ Video
          </span>
        </>
      )}

      {category && (
        <span className="absolute top-3 left-3 inline-flex h-6 items-center px-2.5 rounded-full bg-bg/70 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-fg">
          {category}
        </span>
      )}
    </div>
  );
}
