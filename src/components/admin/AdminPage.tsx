// Small layout primitives shared by every admin page — a title strip with
// optional action slot, and a thin reusable Card.

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeadProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}

export function PageHead({ title, description, actions, back }: PageHeadProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
      <div>
        {back && (
          <a href={back.href} className="text-sm font-semibold text-fg-muted hover:text-fg inline-flex items-center gap-1.5 mb-2">
            ← {back.label}
          </a>
        )}
        <h1 className="font-display text-2xl md:text-4xl font-extrabold tracking-[-0.025em] text-fg leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm md:text-base text-fg-muted leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-bg-elevated overflow-hidden', className)}>
      {children}
    </div>
  );
}

interface KpiProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'brand' | 'success' | 'danger';
}

export function Kpi({ label, value, hint, tone = 'default' }: KpiProps) {
  const accent =
    tone === 'brand'   ? 'text-brand'   :
    tone === 'success' ? 'text-success' :
    tone === 'danger'  ? 'text-danger'  :
    'text-fg';
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">{label}</p>
      <p className={cn('mt-2 font-mono tabular text-2xl md:text-3xl font-extrabold leading-none', accent)}>
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
