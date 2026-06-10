'use client';

// Button — three variants, three sizes, optional left/right icons.
// Press feedback comes from a CSS active-scale; Framer would be overkill for
// a primitive that's mounted everywhere.

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none transition-[transform,background-color,color,border-color] duration-[160ms] [transition-timing-function:var(--ease-out)] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-brand text-brand-fg hover:bg-brand-hover active:bg-brand-active',
  secondary: 'bg-transparent text-fg border border-border hover:bg-surface-hover',
  ghost:     'bg-transparent text-fg hover:bg-surface-hover',
  danger:    'bg-danger text-paper hover:opacity-90',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-md',
  md: 'h-11 px-6 text-[15px] rounded-md',
  lg: 'h-14 px-8 text-base rounded-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
});

// Button-styled link. Use when an action is actually a navigation (anchor),
// not a JS action. Inherits Button's visual variants.
export interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  external?: boolean;
  ariaLabel?: string;
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  external,
  ariaLabel,
}: LinkButtonProps) {
  const classes = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={classes}
      >
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={classes}>
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </Link>
  );
}

// Icon-only button — square, used for header actions, menu toggles, etc.
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  ariaLabel: string;
  icon: ReactNode;
  variant?: 'secondary' | 'ghost';
  size?: Size;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { ariaLabel, icon, variant = 'ghost', size = 'md', className, ...rest },
  ref,
) {
  const SQUARE: Record<Size, string> = {
    sm: 'h-9 w-9 rounded-md',
    md: 'h-11 w-11 rounded-md',
    lg: 'h-14 w-14 rounded-lg',
  };
  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        BASE,
        VARIANTS[variant],
        SQUARE[size],
        '!px-0',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
