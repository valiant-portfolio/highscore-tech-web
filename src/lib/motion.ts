// Motion presets matching DESIGN.md. Components consume these so the motion
// language stays consistent across the whole app.

import type { Transition, Variants } from 'framer-motion';

// ── Easings ─────────────────────────────────────────────────────────────────
// Two curves. Anything that needs physics uses the spring; everything else
// uses ease-out (or ease-in-out for symmetric transitions).
export const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeInOut: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const calmSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};

// ── Durations (seconds — Framer Motion's unit) ──────────────────────────────
export const dur = {
  instant: 0.08,
  quick: 0.16,
  base: 0.24,
  slow: 0.36,
  cinematic: 0.52,
} as const;

// ── Variants ────────────────────────────────────────────────────────────────

// Fade up — the default reveal for scroll-in marketing content.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.cinematic, ease: easeOut },
  },
};

// Subtle scale + fade for cards entering a list.
export const cardEnter: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: dur.base, ease: easeOut },
  },
};

// Stagger container — children animate in 40ms apart.
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
};

// Modal backdrop fade.
export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.base, ease: easeOut } },
  exit:    { opacity: 0, transition: { duration: dur.quick, ease: easeOut } },
};

// Modal panel rise.
export const modalRise: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: dur.slow, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.99,
    transition: { duration: dur.quick, ease: easeOut },
  },
};

// Sheet slide-up for mobile.
export const sheetSlide: Variants = {
  hidden: { y: '100%' },
  visible: { y: '0%', transition: { duration: dur.slow, ease: easeOut } },
  exit:    { y: '100%', transition: { duration: dur.base, ease: easeOut } },
};

// Toast.
export const toastIn: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: dur.base, ease: easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: dur.quick, ease: easeOut },
  },
};

// Button tap — small inward press.
export const tapShrink = { scale: 0.97 };

// Hover lift for interactive cards.
export const hoverLift = {
  y: -2,
  scale: 1.005,
  transition: { duration: dur.base, ease: easeOut },
};
