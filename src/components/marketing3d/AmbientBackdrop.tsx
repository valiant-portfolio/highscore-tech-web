'use client';

// AmbientBackdrop — subtle 3D backdrop for inner sections. Lighter than the
// hero. Only mounts when the section enters the viewport so off-screen
// sections don't burn GPU.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Stage } from './Stage';
import { GradientMesh } from './scenes/GradientMesh';

interface Props {
  /** Scene preset for the ambient backdrop. Defaults to `subtle`. */
  variant?: 'subtle' | 'brand-soft';
  children?: ReactNode;
}

const PRESETS = {
  subtle: {
    colorA: '#0A8EA8', colorB: '#103040', intensity: 0.18,
    fallback:
      'radial-gradient(60% 40% at 50% 50%, color-mix(in srgb, #0A8EA8 6%, transparent) 0%, transparent 80%)',
  },
  'brand-soft': {
    colorA: '#18C2DC', colorB: '#0A8EA8', intensity: 0.28,
    fallback:
      'radial-gradient(80% 50% at 50% 30%, color-mix(in srgb, #18C2DC 10%, transparent) 0%, transparent 75%)',
  },
} as const;

export function AmbientBackdrop({ variant = 'subtle' }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px 0px' },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  const preset = PRESETS[variant];

  return (
    <div ref={hostRef} aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {inView && (
        <Stage gradient={{ fallback: preset.fallback }}>
          <GradientMesh
            colorA={preset.colorA}
            colorB={preset.colorB}
            intensity={preset.intensity}
            speed={0.5}
          />
        </Stage>
      )}
      {!inView && (
        <div className="absolute inset-0" style={{ background: preset.fallback }} />
      )}
    </div>
  );
}
