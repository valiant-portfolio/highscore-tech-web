// Surface — the most-used layout primitive. A box of background + radius +
// elevation. Use `<Card>` for content blocks (it composes Surface); use
// Surface directly when you need finer control (e.g. a section divider).

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'elevated' | 'subtle';
type Elevation = 0 | 1 | 2 | 3;
type Radius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';

const TONES: Record<Tone, string> = {
  default:  'bg-surface',
  elevated: 'bg-surface-raised',
  subtle:   'bg-bg',
};

const ELEVATIONS: Record<Elevation, string> = {
  0: '',
  1: 'shadow-elev-1',
  2: 'shadow-elev-2',
  3: 'shadow-elev-3',
};

const RADII: Record<Radius, string> = {
  none: 'rounded-none',
  sm:   'rounded-sm',
  md:   'rounded-md',
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  '2xl':'rounded-2xl',
  full: 'rounded-full',
};

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  elevation?: Elevation;
  radius?: Radius;
  bordered?: boolean;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { tone = 'default', elevation = 0, radius = 'lg', bordered = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        TONES[tone],
        ELEVATIONS[elevation],
        RADII[radius],
        bordered && 'border border-border',
        className,
      )}
      {...rest}
    />
  );
});
