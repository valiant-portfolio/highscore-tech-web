// Avatar — circular image with initials fallback. Sizes match the type scale.

import Image from 'next/image';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SIZES: Record<Size, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-2xl',
};

const SIZE_PX: Record<Size, number> = {
  xs: 24, sm: 32, md: 40, lg: 48, xl: 64, '2xl': 96,
};

function initials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
  ring?: boolean;
}

export function Avatar({ src, name, size = 'md', ring = false, className }: AvatarProps) {
  const dim = SIZE_PX[size];
  const base = cn(
    'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-surface-active text-fg font-semibold shrink-0',
    SIZES[size],
    ring && 'ring-2 ring-bg',
    className,
  );
  if (src) {
    return (
      <span className={base}>
        <Image
          src={src}
          alt={name ?? 'avatar'}
          width={dim}
          height={dim}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }
  return <span className={base}>{initials(name)}</span>;
}

// Stacked avatars with overlap — used in lists ("3 workers contributed").
export function AvatarStack({
  people,
  size = 'sm',
  max = 4,
  className,
}: {
  people: { src?: string | null; name?: string | null }[];
  size?: Size;
  max?: number;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const overflow = Math.max(0, people.length - max);
  return (
    <div className={cn('flex -space-x-2', className)}>
      {shown.map((p, i) => (
        <Avatar key={i} src={p.src} name={p.name} size={size} ring />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            SIZES[size],
            'inline-flex items-center justify-center rounded-full bg-surface-active text-fg font-semibold ring-2 ring-bg',
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
