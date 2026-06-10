// Services — M0 stub. M1 fills with AI/software service offerings.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services — Highscore Tech',
  description: 'AI integration, software development, and product strategy.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <section className="relative px-4 md:px-8 pt-16 md:pt-24 pb-24">
      <div className="mx-auto max-w-[860px] space-y-6">
        <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Services</p>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.03em] leading-tight text-fg">
          What we build for clients.
        </h1>
        <p className="text-lg text-fg-muted leading-relaxed">
          From integrating AI into an existing product to shipping a new software
          system end-to-end, we work with teams that need senior delivery without
          the senior overhead.
        </p>
        <p className="text-sm text-fg-subtle pt-12">M1 lays out the three service tracks + process + engagement model.</p>
      </div>
    </section>
  );
}
