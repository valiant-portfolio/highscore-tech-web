'use client';

// The Studio hero's backdrop: a live spectrum analyser behind the headline.
//
// Runs through <Stage>, so it inherits the whole capability story for free —
// no canvas at all on low-end devices or under prefers-reduced-motion, a CSS
// gradient standing in, and three.js kept out of the initial bundle.
//
// Deliberately not a GIF: this stays sharp at any width, costs a few KB of
// geometry instead of megabytes of frames, follows the brand colour, and can
// be turned off for people who ask for less motion.

import { Stage } from '@/components/marketing3d/Stage';
import { SoundWave } from '@/components/marketing3d/scenes/SoundWave';

export function StudioHeroBackdrop() {
  return (
    <Stage
      gradient={{
        // What low-tier devices see instead — the same glow, no canvas.
        fallback:
          'radial-gradient(75% 60% at 50% 100%, color-mix(in srgb, #18C2DC 20%, transparent) 0%, transparent 72%)',
      }}
      // Fades out at the top so the bars never climb into the headline, and
      // again at the very bottom so they dissolve into the section below.
      className="opacity-[0.55] [mask-image:linear-gradient(to_bottom,transparent_0%,black_45%,black_92%,transparent_100%)]"
    >
      <ambientLight intensity={1} />
      <SoundWave />
    </Stage>
  );
}
