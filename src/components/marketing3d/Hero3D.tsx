'use client';

// Hero3D — full hero composition. Server-rendered headline + CTAs sit
// above a 3D backdrop. Pages pass a `scene` preset name; the Stage handles
// device gating + fallback.

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Stage } from './Stage';
import { GradientMesh } from './scenes/GradientMesh';
import { ParticleField } from './scenes/ParticleField';
import { cn } from '@/lib/utils';

export type ScenePreset =
  | 'brand'   // Highscore Tech cyan — default hero scene
  | 'calm'    // muted cyan + slow particles (legal / contact / about)
  | 'subtle'; // very low intensity, used in ambient inner sections

const PRESETS: Record<ScenePreset, {
  colorA: string;
  colorB: string;
  particleColor: string;
  intensity: number;
  particleCount: number;
  fallback: string;
}> = {
  brand: {
    colorA: '#18C2DC', colorB: '#0A8EA8',
    particleColor: '#6CE8FA', intensity: 0.55, particleCount: 900,
    fallback:
      'radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, #18C2DC 22%, transparent) 0%, transparent 60%), radial-gradient(80% 60% at 80% 100%, color-mix(in srgb, #0A8EA8 18%, transparent) 0%, transparent 70%)',
  },
  calm: {
    colorA: '#0A8EA8', colorB: '#103040', // teal → navy
    particleColor: '#6CE8FA', intensity: 0.30, particleCount: 700,
    fallback:
      'radial-gradient(100% 60% at 50% 0%, color-mix(in srgb, #0A8EA8 12%, transparent) 0%, transparent 70%)',
  },
  subtle: {
    colorA: '#18C2DC', colorB: '#0A8EA8',
    particleColor: '#6CE8FA', intensity: 0.22, particleCount: 400,
    fallback:
      'radial-gradient(60% 40% at 50% 50%, color-mix(in srgb, #18C2DC 7%, transparent) 0%, transparent 80%)',
  },
};

export interface Hero3DProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  scene?: ScenePreset;
  className?: string;
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function Hero3D({
  eyebrow,
  title,
  description,
  actions,
  scene = 'brand',
  className,
}: Hero3DProps) {
  const preset = PRESETS[scene];

  return (
    <section className={cn(
      'relative isolate overflow-hidden px-4 md:px-8 pt-14 md:pt-32 pb-12 md:pb-28',
      className,
    )}>
      <Stage gradient={{ fallback: preset.fallback }}>
        <GradientMesh
          colorA={preset.colorA}
          colorB={preset.colorB}
          intensity={preset.intensity}
        />
        <ParticleField count={preset.particleCount} color={preset.particleColor} />
      </Stage>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 100%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)' }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 mx-auto max-w-[1100px] text-center"
      >
        {eyebrow && (
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          variants={fadeUp}
          className="mt-4 font-display text-[40px] sm:text-5xl md:text-7xl lg:text-[96px] font-extrabold tracking-[-0.035em] leading-[1.04] md:leading-[1.02] text-fg"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.div
            variants={fadeUp}
            className="mx-auto mt-5 md:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-fg-muted leading-relaxed"
          >
            {description}
          </motion.div>
        )}
        {actions && (
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
