'use client';

// Stage — wraps an @react-three/fiber Canvas with our capability gating +
// graceful CSS fallback. Tier semantics:
//
//   high   — full scene, dpr ≤ 2
//   medium — full scene, dpr capped at 1.5, fewer particles
//   low    — CSS gradient fallback (no canvas mounted)
//   none   — CSS gradient fallback (no canvas mounted)
//
// Canvas is lazy-mounted *after* the first paint so the LCP isn't blocked
// by three.js. Falls back to the same CSS gradient if mount fails.

import { useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { detectCapability, type CapabilityTier } from './capability';
import { cn } from '@/lib/utils';

// Dynamic import keeps three.js out of the initial bundle.
const FiberCanvas = dynamic(
  () => import('@react-three/fiber').then((m) => ({ default: m.Canvas })),
  { ssr: false, loading: () => null },
);

export type StageGradient = {
  /** CSS gradient string used for the fallback layer + the canvas backdrop. */
  fallback: string;
  /** Used as the canvas clear color when tier is high/medium. */
  clear?: string;
};

export interface StageProps {
  /** Scene contents — must be a `'use client'` component that renders three.js JSX. */
  children: ReactNode;
  gradient: StageGradient;
  /** Override which tier the scene runs at. Useful for debugging. */
  forceTier?: CapabilityTier;
  className?: string;
}

export function Stage({ children, gradient, forceTier, className }: StageProps) {
  const [mounted, setMounted] = useState(false);
  const [tier, setTier] = useState<CapabilityTier>('none');

  useEffect(() => {
    const cap = detectCapability();
    setTier(forceTier ?? cap.tier);
    // Delay canvas mount by one paint so the CSS fallback is visible first.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [forceTier]);

  const wantCanvas = mounted && (tier === 'high' || tier === 'medium');
  const dpr = tier === 'high' ? ([1, 2] as [number, number]) : ([1, 1.5] as [number, number]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* CSS fallback — always renders. Hidden by canvas opacity when mounted. */}
      <div className="absolute inset-0" style={{ background: gradient.fallback }} aria-hidden="true" />
      {wantCanvas && (
        <FiberCanvas
          dpr={dpr}
          gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'low-power' }}
          performance={{ min: 0.5 }}
          camera={{ position: [0, 0, 5], fov: 60 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {children}
        </FiberCanvas>
      )}
    </div>
  );
}
