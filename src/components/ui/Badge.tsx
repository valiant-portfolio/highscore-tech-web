// Badge — small status chip. Two visual modes: filled (solid color) and
// soft (low-opacity tinted background, matching text color).

import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
type Variant = 'soft' | 'solid' | 'outline';
type Size = 'xs' | 'sm' | 'md';

const TONE_SOFT: Record<Tone, string> = {
  neutral: 'bg-surface-active text-fg',
  brand:   'bg-brand-tint text-brand',
  success: 'bg-[color-mix(in_srgb,var(--c-success)_15%,transparent)] text-success',
  warning: 'bg-[color-mix(in_srgb,var(--c-warning)_15%,transparent)] text-warning',
  danger:  'bg-[color-mix(in_srgb,var(--c-danger)_15%,transparent)] text-danger',
  info:    'bg-brand-tint text-info',
};

const TONE_SOLID: Record<Tone, string> = {
  neutral: 'bg-fg text-bg',
  brand:   'bg-brand text-brand-fg',
  success: 'bg-success text-paper',
  warning: 'bg-warning text-ink',
  danger:  'bg-danger text-paper',
  info:    'bg-info text-paper',
};

const TONE_OUTLINE: Record<Tone, string> = {
  neutral: 'border border-border text-fg',
  brand:   'border border-brand text-brand',
  success: 'border border-success text-success',
  warning: 'border border-warning text-warning',
  danger:  'border border-danger text-danger',
  info:    'border border-info text-info',
};

const SIZES: Record<Size, string> = {
  xs: 'h-5 px-1.5 text-[11px]',
  sm: 'h-6 px-2 text-xs',
  md: 'h-7 px-2.5 text-sm',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'sm',
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: BadgeProps) {
  const palette =
    variant === 'solid' ? TONE_SOLID[tone] : variant === 'outline' ? TONE_OUTLINE[tone] : TONE_SOFT[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        palette,
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </span>
  );
}
