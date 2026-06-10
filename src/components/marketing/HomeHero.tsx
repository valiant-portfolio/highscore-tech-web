'use client';

// Home hero — full-bleed shot of the studio (public/computer.jpg) with a
// dark navy gradient overlay tinted toward brand cyan, ambient particles on
// top, and centered copy. The headline and CTAs are progressively revealed
// with framer-motion so the page doesn't feel static on load.

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, ChevronDown, GraduationCap, Sparkles } from 'lucide-react';
import { LinkButton } from '@/components/ui';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Photo backdrop */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/computer.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
      </div>

      {/* Tint stack — keeps the photo readable + cyan-leaning */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--c-ink) 60%, transparent) 0%, color-mix(in srgb, var(--c-ink) 70%, transparent) 60%, var(--bg) 100%), radial-gradient(60% 50% at 50% 30%, color-mix(in srgb, #18C2DC 20%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* Subtle vignette around the edges so corners read as black */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 70% at 50% 100%, transparent 0%, color-mix(in srgb, var(--c-ink) 60%, transparent) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1180px] px-4 md:px-8 pt-28 md:pt-40 pb-24 md:pb-36">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-tint/40 border border-brand/20 text-[11px] uppercase tracking-[0.18em] font-semibold text-brand backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI development studio · Academy
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-[44px] sm:text-6xl md:text-7xl lg:text-[104px] font-extrabold tracking-[-0.035em] leading-[1.02] text-paper"
          >
            We build AI. <br className="hidden md:block" />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #6CE8FA 0%, #18C2DC 60%, #0A8EA8 100%)' }}
            >
              We train builders.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 md:mt-8 max-w-2xl text-base sm:text-lg md:text-xl text-graphite-200 leading-relaxed"
          >
            Highscore Tech designs AI systems and ships software for organisations
            worldwide. Our academy trains the next generation of engineers — and we
            hire the best of them.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <LinkButton href="/contact" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Hire us
            </LinkButton>
            <LinkButton
              href="/academy"
              size="lg"
              variant="secondary"
              leftIcon={<GraduationCap className="h-4 w-4" />}
            >
              Browse the academy
            </LinkButton>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-12 text-xs uppercase tracking-[0.18em] text-graphite-300/80"
          >
            Built in Nigeria · serving clients globally
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <a
          href="#services"
          aria-label="Scroll to services"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-paper/20 bg-paper/5 backdrop-blur text-paper/70 hover:text-paper hover:bg-paper/10 transition-colors animate-bounce"
          style={{ animationDuration: '2.4s' }}
        >
          <ChevronDown className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
