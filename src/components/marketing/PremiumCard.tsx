'use client';

// PremiumCard — the marketing-grade card. Gradient hairline border,
// cursor-tracked spotlight, optional bottom accent glow on hover, top
// inner highlight for a tiny ambient-light effect. Used wherever a card
// needs to feel premium (homepage products, pricing, about, etc.).
//
// Style-wise, this is closer to Linear / Vercel / Stripe than the base
// dashboard Card. Don't use it inside data-dense surfaces — its visual
// weight is wrong there.

import { useRef, type ReactNode, type CSSProperties } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  /** Hex color that drives the bottom-rim glow on hover. Defaults to brand. */
  accent?: string;
  /** When provided, the whole card is a link. */
  href?: string;
  /** Show the cursor-spotlight effect on hover. Default true. */
  spotlight?: boolean;
  /** Disable hover lift (e.g. when inside a wider hover trigger). */
  noLift?: boolean;
  /** Static elevated look (ring + glow always on). Use sparingly. */
  highlight?: boolean;
}

export function PremiumCard({
  children,
  className,
  accent = 'var(--c-brand)',
  href,
  spotlight = true,
  noLift = false,
  highlight = false,
}: PremiumCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  };

  const body = (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        'group relative isolate overflow-hidden rounded-2xl',
        // Border = gradient via a padding box trick.
        'p-[1px]',
        // Subtle lift on hover.
        !noLift && 'transition-transform duration-300 hover:-translate-y-0.5',
        className,
      )}
      style={{
        // Hairline gradient border — a touch brighter at the top so the card
        // feels lit from above.
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--c-fg) 16%, transparent) 0%, color-mix(in srgb, var(--c-fg) 6%, transparent) 50%, color-mix(in srgb, var(--c-fg) 2%, transparent) 100%)',
        ...(highlight && {
          boxShadow: `0 0 0 1px ${accent}30, 0 12px 40px -10px ${accent}40`,
        }),
      } as CSSProperties}
    >
      {/* Inner surface */}
      <div className={cn(
        'relative rounded-[15px] h-full',
        'bg-surface/85 backdrop-blur-sm',
        // Top inner highlight — fake ambient-light reflection.
        'before:absolute before:inset-x-0 before:top-0 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-fg/20 before:to-transparent',
        'before:pointer-events-none before:opacity-60',
      )}>
        {/* Cursor-tracked spotlight */}
        {spotlight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[15px]"
            style={{
              background: `radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, ${accent} 12%, transparent), transparent 60%)`,
            }}
          />
        )}

        {/* Bottom-rim accent glow on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 20px 2px ${accent}80`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{body}</Link>;
  }
  return body;
}
