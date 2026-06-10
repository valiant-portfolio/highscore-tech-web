// EmptyState — what we show when a list/section has no data. Required for
// every place that can be empty (per DESIGN.md).

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center text-center max-w-md mx-auto py-12 px-6', className)}>
      {icon && (
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-active text-fg-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-fg-muted leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
