// /admin/reports — admin's view of every Team EOD Olivia has filed.
// Reuses the same TeamEodTable used inside her staff dashboard so the
// drill-down behaviour and per-staff breakdown look identical.

import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { TeamEodTable } from '@/components/staff/TeamEodTable';
import { serviceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const admin = serviceClient();
  const { data } = await admin
    .from('staff_reports')
    .select('id, report_date, content, created_at')
    .eq('kind', 'team_eod')
    .order('report_date', { ascending: false })
    .limit(120);

  const rows = (data ?? []).map((r) => ({
    id: r.id as string,
    report_date: r.report_date as string,
    content: r.content as string,
    created_at: r.created_at as string,
  }));

  return (
    <>
      <PageHead
        title="Team EOD reports"
        description="Daily progress reports compiled by the Operations Manager. Click any row to see the per-staff breakdown."
      />

      <AdminCard>
        <div className="p-5 md:p-6">
          <TeamEodTable rows={rows} />
        </div>
      </AdminCard>
    </>
  );
}
