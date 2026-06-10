// Card — the workhorse content block. Padded surface with three variants:
//   - resting     bordered, shadow-1, default
//   - interactive bordered, shadow-1, lifts on hover (links + click handlers)
//   - plain       no border, no shadow (page sections)

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';
import { Surface } from './Surface';
import { cn } from '@/lib/utils';

type Variant = 'resting' | 'interactive' | 'plain';
type Padding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

const PADDING: Record<Padding, string> = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
  xl:   'p-10',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'resting', padding = 'lg', className, children, ...rest },
  ref,
) {
  return (
    <Surface
      ref={ref}
      tone={variant === 'plain' ? 'subtle' : 'elevated'}
      elevation={variant === 'plain' ? 0 : 1}
      bordered={variant !== 'plain'}
      radius="lg"
      className={cn(
        PADDING[padding],
        variant === 'interactive' &&
          'transition-[transform,box-shadow] duration-[240ms] [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:shadow-elev-2 cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </Surface>
  );
});

// Anchor-flavored card — clicks navigate. Common in dashboard lists.
export function CardLink({
  href,
  children,
  className,
  padding = 'lg',
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  padding?: Padding;
  external?: boolean;
}) {
  const sharedClasses = cn(
    'block rounded-lg bg-surface-raised border border-border shadow-elev-1',
    'transition-[transform,box-shadow] duration-[240ms] [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:shadow-elev-2',
    PADDING[padding],
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={sharedClasses}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={sharedClasses}>
      {children}
    </Link>
  );
}

// Standalone sub-elements with consistent typography. Optional — most cards
// can just put their own content inside without these.
export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold tracking-tight text-fg', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-fg-muted leading-relaxed', className)}>{children}</p>;
}
