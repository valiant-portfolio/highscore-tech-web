// Staff portal entry — auth-gated. Anyone hitting /staff without a session
// gets bounced to /login; signed-in users without a linked staff record
// (students, admins without staff seat) get bounced to their own dashboard.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StaffDashboard } from '@/components/staff/StaffDashboard';
import { getStaffByUserId } from '@/lib/staff/queries';
import { listReportsForStaff } from '@/lib/admin/staff-queries';
import { getCurrentUser } from '@/lib/auth/queries';

export const metadata: Metadata = {
  title: 'Staff portal — Highscore Tech',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const EMPLOYEE_IDS: Record<string, string> = {
  olivia:   'HST-OPS-001',
  godswill: 'HST-OPS-002',
  promise:  'HST-ENG-001',
  samuel:   'HST-ENG-002',
  vany:     'HST-ENG-003',
};

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function StaffPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/staff');

  const staff = await getStaffByUserId(user.id);
  // Admin without staff seat → admin dashboard.
  if (!staff && user.role === 'admin') redirect('/admin');
  // Student or unlinked → student dashboard.
  if (!staff) redirect('/profile');
  // Former / suspended staff → log them out gently.
  if (staff.status !== 'active') redirect('/login?inactive=1');

  const { tab } = await searchParams;
  const activeTab = (tab === 'documents' || tab === 'settings' || tab === 'sign' || tab === 'reports') ? tab : 'profile';

  const reports = await listReportsForStaff(staff.id, 30);

  // Has the staff member uploaded their NIN? Pulled from the users mirror.
  const { serviceClient } = await import('@/lib/supabase/service');
  const admin = serviceClient();
  const { data: meRow } = await admin.from('users').select('nin_doc_url').eq('id', user.id).maybeSingle();
  const ninUploaded = !!meRow?.nin_doc_url;

  return (
    <StaffDashboard
      staff={staff}
      employeeId={EMPLOYEE_IDS[staff.slug] ?? `HST-${staff.slug.toUpperCase().slice(0, 3)}`}
      activeTab={activeTab}
      signedInEmail={user.email}
      signedInName={user.full_name ?? ''}
      signedInPhone={user.phone ?? ''}
      ninUploaded={ninUploaded}
      ownReports={reports.map((r) => ({
        id: r.id,
        kind: r.kind,
        report_date: r.report_date,
        content: r.content,
        is_admin_override: r.is_admin_override,
        created_at: r.created_at,
      }))}
    />
  );
}
