// One product on the Studio menu. Every tier lists what the client actually
// gets — the whole selling idea is that paying more is a visibly bigger
// deliverable, not a vague "premium" label.

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import type { StudioPackage } from '@/lib/studio/catalog';
import { cn } from '@/lib/utils';

export function PackageCard({ pkg, className }: { pkg: StudioPackage; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-surface p-6 transition-colors',
        pkg.featured ? 'border-warning/50 shadow-[0_0_0_1px_var(--color-warning)]' : 'border-border hover:border-border-strong',
        className,
      )}
    >
      {pkg.featured && (
        <span className="absolute -top-2.5 left-6 inline-flex h-5 items-center rounded-full bg-warning px-2.5 text-[10px] font-bold uppercase tracking-wider text-ink">
          Most popular
        </span>
      )}

      <h3 className="text-lg font-bold text-fg">{pkg.name}</h3>

      <p className="mt-3 flex items-baseline gap-1.5">
        {pkg.from && <span className="text-sm font-semibold text-fg-subtle">from</span>}
        <span className="font-display text-4xl font-extrabold tabular-nums text-warning">
          ${pkg.priceUsd}
        </span>
        {pkg.monthly && <span className="text-sm font-semibold text-fg-muted">/month</span>}
      </p>

      <p className="mt-2 text-sm text-fg-muted leading-relaxed">{pkg.blurb}</p>

      <ul className="mt-5 space-y-2.5 flex-1">
        {pkg.includes.map((line) => (
          <li key={line} className="flex gap-2.5 text-sm text-fg-muted leading-relaxed">
            <Check className="h-4 w-4 shrink-0 mt-0.5 text-success" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/studio/order?package=${pkg.key}`}
        className={cn(
          'mt-6 inline-flex h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition-colors',
          pkg.featured
            ? 'bg-warning text-ink hover:opacity-90'
            : 'border border-border text-fg hover:bg-surface-hover',
        )}
      >
        Order this <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
