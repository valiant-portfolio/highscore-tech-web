// 404 — branded. Sits at the root so it catches any unmatched route, then
// renders inside the marketing-style chrome via inline header/footer.

import type { Metadata } from 'next';
import { Compass } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Page not found — Highscore Tech',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <MarketingHeader user={null} />
      <main className="flex-1">
        <section className="relative isolate px-4 md:px-8 py-24 md:py-40">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 30%, color-mix(in srgb, #18C2DC 14%, transparent) 0%, transparent 70%)',
            }}
          />
          <div className="mx-auto max-w-[680px] text-center space-y-6">
            <p
              className="font-mono tabular text-7xl md:text-8xl font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #6CE8FA 0%, #18C2DC 60%, #0A8EA8 100%)' }}
            >
              404
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
              This page isn't here.
            </h1>
            <p className="text-fg-muted leading-relaxed">
              The link is broken, the page was retired, or the URL was typed slightly wrong.
              Either way, here are some good places to go next.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <LinkButton href="/" leftIcon={<Compass className="h-4 w-4" />}>
                Home
              </LinkButton>
              <LinkButton href="/academy" variant="secondary">Browse the academy</LinkButton>
              <LinkButton href="/contact" variant="secondary">Get in touch</LinkButton>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
