// Loading skeletons for anything fetched from the database. Rendered by each
// admin route's loading.tsx while its server component fetches, so the shell
// paints instantly instead of a blank screen or a spinner.
//
// The presets mirror the real page structure (page head + table / cards / form)
// so there's no layout jump when the data arrives.

import { PageHead, AdminCard } from './AdminPage';

/** One shimmering block. Compose these into anything. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-hover ${className}`} />;
}

function HeadSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  );
}

/** Rows of a data table (staff, courses, enrolments, ledger, audit …). */
export function SkeletonTable({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <AdminCard>
      <div className="p-4 md:p-5">
        {/* header row */}
        <div className="flex gap-4 border-b border-border pb-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className={`h-3.5 ${i === 0 ? 'w-40' : 'w-20'}`} />
          ))}
        </div>
        {/* body rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-4 py-4">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-44' : 'w-16'}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}

/** A responsive grid of cards (portfolio, projects, reports …). */
export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <AdminCard key={i}>
          <Skeleton className="h-40 w-full rounded-b-none" />
          <div className="space-y-2 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </AdminCard>
      ))}
    </div>
  );
}

/** KPI tiles + a chart-ish block (dashboard, finance, performance). */
export function SkeletonStats({ tiles = 4 }: { tiles?: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: tiles }).map((_, i) => (
          <AdminCard key={i}>
            <div className="space-y-3 p-5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </AdminCard>
        ))}
      </div>
      <AdminCard><Skeleton className="m-5 h-64 rounded-lg" /></AdminCard>
    </div>
  );
}

/** A two-column edit form (portfolio/[id], staff/[id] …). */
export function SkeletonForm() {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <AdminCard>
        <div className="space-y-5 p-5 md:p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </AdminCard>
      <AdminCard><Skeleton className="m-5 h-40 rounded-lg" /></AdminCard>
    </div>
  );
}

type Variant = 'table' | 'cards' | 'stats' | 'form';

/** Full-page skeleton = page head + the right body shape. */
export function AdminPageSkeleton({ variant = 'table' }: { variant?: Variant }) {
  return (
    <>
      <PageHead title={<Skeleton className="h-7 w-52" />} description={<Skeleton className="mt-1 h-4 w-80 max-w-full" />} />
      {variant === 'cards' && <SkeletonCardGrid />}
      {variant === 'stats' && <SkeletonStats />}
      {variant === 'form' && <SkeletonForm />}
      {variant === 'table' && <SkeletonTable />}
    </>
  );
}

export { HeadSkeleton };
