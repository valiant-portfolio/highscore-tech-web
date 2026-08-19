// THE canonical Highscore Tech logo. Use this — and only this — everywhere a
// logo is shown.
//
// Renders the `public/full-logo.png` lockup, or the Studio lockup
// (`public/studio-logo.png`) when `variant="studio"` — the Studio subdomain
// carries its own logo. `iconOnly` falls back to a circular cyan H mark for
// tight spots (favicons, mobile nav rails, etc.) since the wordmark isn't
// legible below ~120px wide.

import Image from 'next/image';
import Link from 'next/link';

type Size = 'sm' | 'md' | 'lg';

// Sized per lockup, because the artworks have different proportions:
// full-logo is 444×124 (~3.6:1) and the Studio lockup is 480×161 (~3:1).
// Both source files are pre-trimmed of transparent padding, so these CSS
// heights are the real visible height of the mark.
const FULL_DIMENSIONS: Record<Size, { w: number; h: number; className: string }> = {
  sm: { w: 140, h: 40, className: 'h-8 w-auto' },
  md: { w: 180, h: 52, className: 'h-10 w-auto' },
  lg: { w: 240, h: 70, className: 'h-14 w-auto' },
};

const STUDIO_DIMENSIONS: Record<Size, { w: number; h: number; className: string }> = {
  sm: { w: 108, h: 36, className: 'h-8 w-auto' },
  md: { w: 143, h: 48, className: 'h-11 w-auto' },
  lg: { w: 197, h: 66, className: 'h-16 w-auto' },
};

const ICON_DIMENSIONS: Record<Size, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-xl',
};

interface LogoProps {
  size?: Size;
  iconOnly?: boolean;
  href?: string | null;
  className?: string;
  /** `studio` swaps in the Highscore Studio lockup. */
  variant?: 'default' | 'studio';
}

const LOCKUP: Record<'default' | 'studio', { src: string; alt: string; mark: string }> = {
  default: { src: '/full-logo.png',     alt: 'Highscore Tech',        mark: '' },
  studio:  { src: '/studio-lockup.png', alt: 'Highscore Tech Studio', mark: '/studio-mark.png' },
};

function IconMark({ size }: { size: Size }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center rounded-full font-black text-bg shadow-[0_4px_18px_-2px_rgba(24,194,220,0.45)] ${ICON_DIMENSIONS[size]}`}
      style={{
        background: 'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)',
      }}
    >
      H
    </span>
  );
}

export default function Logo({
  size = 'md',
  iconOnly = false,
  href = '/',
  className = '',
  variant = 'default',
}: LogoProps) {
  const lockup = LOCKUP[variant];
  const dims = (variant === 'studio' ? STUDIO_DIMENSIONS : FULL_DIMENSIONS)[size];

  // Studio has a real badge artwork for tight spots; the main brand falls back
  // to the drawn cyan H.
  const iconSizes: Record<Size, number> = { sm: 32, md: 40, lg: 56 };
  const content = iconOnly ? (
    lockup.mark ? (
      <Image
        src={lockup.mark}
        alt={lockup.alt}
        width={iconSizes[size]}
        height={iconSizes[size]}
        className={`${ICON_DIMENSIONS[size].split(' ').slice(0, 2).join(' ')} ${className}`}
      />
    ) : (
      <IconMark size={size} />
    )
  ) : (
    <Image
      src={lockup.src}
      alt={lockup.alt}
      width={dims.w}
      height={dims.h}
      className={`${dims.className} ${className}`}
      priority={size === 'lg'}
    />
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label={`${lockup.alt} home`} className="inline-flex shrink-0">
      {content}
    </Link>
  );
}
