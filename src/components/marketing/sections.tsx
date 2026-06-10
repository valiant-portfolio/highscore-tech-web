'use client';

// Marketing-page section primitives. Hero + Reveal both ship with a 3D
// backdrop by default (shader-driven gradient mesh from
// @/components/marketing3d). Pages can opt out with `scene="none"` or
// `ambient={false}` but the uniform-by-default treatment is what we want
// across the marketing surface.

import { motion, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Hero3D, type ScenePreset } from '@/components/marketing3d/Hero3D';
import { AmbientBackdrop } from '@/components/marketing3d/AmbientBackdrop';
import { PremiumCard } from './PremiumCard';

// ── Hero ─────────────────────────────────────────────────────────────────
// Thin wrapper around Hero3D so existing callsites keep working. The
// `scene` prop picks the colour preset; pass `scene="none"` to drop the
// 3D layer entirely (rarely needed).
export function Hero({
  eyebrow,
  title,
  description,
  actions,
  scene = 'brand',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  scene?: ScenePreset | 'none';
  className?: string;
}) {
  if (scene === 'none') {
    return (
      <section className={cn('relative px-4 md:px-8 pt-16 md:pt-32 pb-16 md:pb-24', className)}>
        <div className="mx-auto max-w-[1100px] text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            {eyebrow && (
              <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">
                {eyebrow}
              </motion.p>
            )}
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl md:text-7xl lg:text-[96px] font-extrabold tracking-[-0.035em] leading-[1.02] text-fg"
            >
              {title}
            </motion.h1>
            {description && (
              <motion.div
                variants={fadeUp}
                className="mx-auto max-w-2xl text-lg md:text-xl text-fg-muted leading-relaxed"
              >
                {description}
              </motion.div>
            )}
            {actions && (
              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {actions}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }
  return (
    <Hero3D
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={actions}
      scene={scene}
      className={className}
    />
  );
}

// ── Reveal — scroll-driven section that fades up into view ───────────────
// Ambient 3D backdrop on by default. Opt out per-section with `ambient={false}`.
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Reveal({
  children,
  className,
  id,
  ambient = true,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  ambient?: boolean | 'subtle' | 'brand-soft';
}) {
  const ref = useRef<HTMLElement>(null);
  const variant = ambient === 'brand-soft' ? 'brand-soft' : 'subtle';
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className={cn('relative isolate px-4 md:px-8 py-12 md:py-24 overflow-hidden', className)}
    >
      {ambient && <AmbientBackdrop variant={variant} />}
      <div className="relative z-10 mx-auto max-w-[1280px]">{children}</div>
    </motion.section>
  );
}

// ── Section heading ──────────────────────────────────────────────────────
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === 'center' ? 'text-center max-w-[760px] mx-auto' : 'max-w-2xl',
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand mb-3">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.025em] leading-[1.08] md:leading-[1.05] text-fg">
        {title}
      </h2>
      {description && (
        <p className="mt-3 md:mt-4 text-base sm:text-lg text-fg-muted leading-relaxed">{description}</p>
      )}
    </div>
  );
}

// ── FeatureGrid ──────────────────────────────────────────────────────────
// Subtle 3D tilt on hover so cards feel alive without going maximalist.
export function FeatureGrid({
  items,
  className,
}: {
  items: { icon?: ReactNode; title: string; description: string }[];
  className?: string;
}) {
  return (
    <div className={cn('mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6', className)}>
      {items.map((it) => (
        <FeatureCard key={it.title} icon={it.icon} title={it.title} description={it.description} />
      ))}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon?: ReactNode; title: string; description: string }) {
  return (
    <PremiumCard className="h-full">
      <div className="p-5 md:p-6">
        {icon && (
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-brand-tint text-brand">
            {icon}
          </span>
        )}
        <h3 className="mt-4 text-base md:text-lg font-semibold text-fg">{title}</h3>
        <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{description}</p>
      </div>
    </PremiumCard>
  );
}
