// THE canonical Highscore Tech logo. Use this — and only this — everywhere a
// logo is shown.
//
// Renders the `public/full-logo.png` lockup. `iconOnly` falls back to a
// circular cyan H mark for tight spots (favicons, mobile nav rails, etc.)
// since the wordmark isn't legible below ~120px wide.

import Image from 'next/image';
import Link from 'next/link';

type Size = 'sm' | 'md' | 'lg';

const FULL_DIMENSIONS: Record<Size, { w: number; h: number; className: string }> = {
  sm: { w: 140, h: 40, className: 'h-8 w-auto' },
  md: { w: 180, h: 52, className: 'h-10 w-auto' },
  lg: { w: 240, h: 70, className: 'h-14 w-auto' },
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
}

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
}: LogoProps) {
  const content = iconOnly ? (
    <IconMark size={size} />
  ) : (
    <Image
      src="/full-logo.png"
      alt="Highscore Tech"
      width={FULL_DIMENSIONS[size].w}
      height={FULL_DIMENSIONS[size].h}
      className={`${FULL_DIMENSIONS[size].className} ${className}`}
      priority={size === 'lg'}
    />
  );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="Highscore Tech home" className="inline-flex shrink-0">
      {content}
    </Link>
  );
}
