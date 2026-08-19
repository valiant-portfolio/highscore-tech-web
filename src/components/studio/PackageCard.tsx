// One product on the Studio menu. Every tier lists what the client actually
// gets — the whole selling idea is that paying more is a visibly bigger
// deliverable, not a vague "premium" label.

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { type StudioPackage, formatNgn } from '@/lib/studio/catalog';
import { includeTitles, detailFor } from '@/lib/studio/packages';
import { cn } from '@/lib/utils';

export function PackageCard({ pkg, className }: { pkg: StudioPackage; className?: string }) {
  // One source of truth: the card's bullets are the deliverable headings from
  // the full package detail, so the two can never disagree.
  const bullets = includeTitles(pkg.key, pkg.includes);
  const detail = detailFor(pkg.key);
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-surface p-6 transition-colors',
        pkg.featured ? 'border-brand/50 shadow-[0_0_0_1px_var(--color-brand)]' : 'border-border hover:border-border-strong',
        className,
      )}
    >
      {pkg.featured && (
        <span className="absolute -top-2.5 left-6 inline-flex h-5 items-center rounded-full bg-brand px-2.5 text-[10px] font-bold uppercase tracking-wider text-brand-fg">
          Most popular
        </span>
      )}

      <h3 className="text-lg font-bold text-fg">{pkg.name}</h3>

      <p className="mt-3 flex items-baseline gap-1.5 flex-wrap">
        {pkg.from && <span className="text-sm font-semibold text-fg-subtle">from</span>}
        <span className="font-display text-3xl font-extrabold tabular-nums text-brand">
          {formatNgn(pkg.priceNgn)}
        </span>
        {pkg.monthly && <span className="text-sm font-semibold text-fg-muted">/month</span>}
      </p>

      <p className="mt-2 text-sm text-fg-muted leading-relaxed">{pkg.blurb}</p>

      {detail && (
        <p className="mt-4 text-xs text-fg-subtle leading-relaxed">
          <span className="font-semibold text-fg-muted">Best for:</span> {detail.bestFor}
        </p>
      )}

      <ul className="mt-5 space-y-2.5 flex-1">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2.5 text-sm text-fg-muted leading-relaxed">
            <Check className="h-4 w-4 shrink-0 mt-0.5 text-success" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {pkg.note && (
        <p className="mt-4 border-t border-border pt-3 text-xs text-fg-subtle leading-relaxed">{pkg.note}</p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={`/studio/order?package=${pkg.key}`}
          className={cn(
            'inline-flex h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition-colors',
            pkg.featured
              ? 'bg-brand text-brand-fg hover:opacity-90'
              : 'border border-border text-fg hover:bg-surface-hover',
          )}
        >
          Order this <ArrowRight className="h-4 w-4" />
        </Link>
        {/* The card is the summary; this is where the full explanation lives. */}
        <Link
          href={`/studio/packages/${pkg.key}`}
          className="inline-flex h-9 items-center justify-center gap-1 text-xs font-semibold text-fg-muted hover:text-brand"
        >
          See everything included <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
