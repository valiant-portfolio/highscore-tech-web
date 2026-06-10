// StatCard — a card-sized number with label, optional trend, and accent icon.
// Used heavily in dashboards.

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { Card } from './Card';
import { Counter } from './Counter';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: number;
  /** Optional explicit display string — overrides Counter rendering. */
  displayValue?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Percentage change displayed next to the value. */
  delta?: number;
  /** Helper sub-label under the trend. */
  trendHint?: string;
  icon?: ReactNode;
  accent?: string;       // raw CSS color (e.g. var(--c-product-insights)) for the icon ring
  className?: string;
}

export function StatCard({
  label,
  value,
  displayValue,
  prefix = '',
  suffix = '',
  decimals = 0,
  delta,
  trendHint,
  icon,
  accent,
  className,
}: StatCardProps) {
  const trendUp = (delta ?? 0) >= 0;
  return (
    <Card padding="md" className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-fg-subtle">{label}</span>
        {icon && (
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-md"
            style={
              accent
                ? {
                    backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
                    color: accent,
                  }
                : { backgroundColor: 'var(--brand-tint)', color: 'var(--brand)' }
            }
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight text-fg">
          {displayValue ?? (
            <Counter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          )}
        </span>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold',
              trendUp ? 'text-success' : 'text-danger',
            )}
          >
            {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {trendHint && <p className="text-xs text-fg-muted">{trendHint}</p>}
    </Card>
  );
}
