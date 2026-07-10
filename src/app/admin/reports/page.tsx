// /admin/reports — admin's view of every Team EOD, paginated. Reuses the same
// TeamEodTable used inside the staff dashboard so the drill-down behaviour and
// per-staff breakdown look identical.

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { TeamEodTable } from '@/components/staff/TeamEodTable';
import { serviceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = serviceClient();
  const { data, count } = await admin
    .from('staff_reports')
    .select('id, report_date, content, created_at', { count: 'exact' })
    .eq('kind', 'team_eod')
    .order('report_date', { ascending: false })
    .range(from, to);

  const rows = (data ?? []).map((r) => ({
    id: r.id as string,
    report_date: r.report_date as string,
    content: r.content as string,
    created_at: r.created_at as string,
  }));

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : from + 1;
  const showingTo = Math.min(from + PAGE_SIZE, total);

  return (
    <>
      <PageHead
        title="Team EOD reports"
        description="Daily progress reports compiled by the Operations Manager. Click any row to see the per-staff breakdown."
      />

      <AdminCard>
        <div className="p-5 md:p-6">
          <TeamEodTable rows={rows} />

          {total > 0 && (
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-xs text-fg-subtle">
                Showing <span className="font-semibold text-fg-muted">{showingFrom}–{showingTo}</span> of{' '}
                <span className="font-semibold text-fg-muted">{total}</span>
              </p>
              <div className="flex items-center gap-2">
                <PagerLink page={page - 1} disabled={page <= 1} label="Previous">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </PagerLink>
                <span className="text-xs font-semibold text-fg-muted tabular">
                  Page {page} / {totalPages}
                </span>
                <PagerLink page={page + 1} disabled={page >= totalPages} label="Next">
                  Next <ChevronRight className="h-4 w-4" />
                </PagerLink>
              </div>
            </div>
          )}
        </div>
      </AdminCard>
    </>
  );
}

function PagerLink({
  page, disabled, label, children,
}: {
  page: number;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls =
    'inline-flex h-9 items-center gap-1 px-3 rounded-md border border-border text-sm font-semibold';
  if (disabled) {
    return <span className={`${cls} text-fg-subtle opacity-50 cursor-not-allowed`}>{children}</span>;
  }
  return (
    <Link href={`/admin/reports?page=${page}`} aria-label={label} className={`${cls} text-fg-muted hover:text-fg hover:bg-surface-hover`}>
      {children}
    </Link>
  );
}
