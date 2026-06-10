// Shared chrome for signup / login / forgot-password — a centred card
// over the ambient brand backdrop with a small header and link slot.

import type { ReactNode } from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { PremiumCard } from '@/components/marketing/PremiumCard';

interface Props {
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, footer, children }: Props) {
  return (
    <section className="relative isolate min-h-[calc(100vh-8rem)] px-4 md:px-8 pt-16 md:pt-24 pb-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 20%, color-mix(in srgb, #18C2DC 14%, transparent) 0%, transparent 70%)',
        }}
      />
      <div className="mx-auto max-w-[460px]">
        <div className="text-center mb-6">
          <Link href="/" aria-label="Highscore Tech home" className="inline-flex">
            <Logo size="md" href={null} />
          </Link>
        </div>
        <PremiumCard noLift>
          <div className="p-7 md:p-8">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-fg text-center">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-fg-muted text-center leading-relaxed">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>
        </PremiumCard>
        {footer && <div className="mt-5 text-center text-sm text-fg-muted">{footer}</div>}
      </div>
    </section>
  );
}
