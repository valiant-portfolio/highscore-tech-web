// Skeleton — loading placeholder. Use to mirror the shape of the content
// that will replace it, not a generic grey rectangle.

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Shape preset. `text` defaults to a single line. */
  shape?: 'rect' | 'text' | 'circle';
}

export function Skeleton({ shape = 'rect', className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden bg-surface-active',
        shape === 'circle' && 'rounded-full',
        shape === 'rect' && 'rounded-md',
        shape === 'text' && 'h-4 rounded',
        // Shimmer: a thin gradient sweeps left → right.
        'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent before:animate-[skeleton-sweep_1.6s_ease-out_infinite]',
        className,
      )}
      {...rest}
    />
  );
}

// Convenience: a stack of N text lines, each shrinking slightly.
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          shape="text"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
