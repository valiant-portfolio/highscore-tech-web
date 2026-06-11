// Staff portal entry — auth-gated. Anyone hitting /staff without a session
// gets bounced to /login; signed-in users without a linked staff record
// (students, admins without staff seat) get bounced to their own dashboard.
// Staff whose onboarding is incomplete get pushed to /staff/onboarding.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { StaffShell } from '@/components/staff/StaffShell';
import { StaffDashboard } from '@/components/staff/StaffDashboard';
import { getStaffByUserId, getOnboardingState } from '@/lib/staff/queries';
import { listReportsForStaff } from '@/lib/admin/staff-queries';
import { getCurrentUser, initialsOf } from '@/lib/auth/queries';

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
  if (!staff && user.role === 'admin') redirect('/admin');
  if (!staff) redirect('/profile');
  if (staff.status !== 'active') redirect('/login?inactive=1');

  const onboarding = getOnboardingState(staff);
  if (!onboarding.complete) redirect('/staff/onboarding');

  const { tab } = await searchParams;
  const activeTab: 'profile' | 'documents' | 'reports' | 'settings' =
    tab === 'documents' || tab === 'settings' || tab === 'reports' ? tab : 'profile';

  const reports = await listReportsForStaff(staff.id, 30);

  const { serviceClient } = await import('@/lib/supabase/service');
  const admin = serviceClient();
  const { data: meRow } = await admin.from('users').select('nin_doc_url').eq('id', user.id).maybeSingle();
  const ninUploaded = !!meRow?.nin_doc_url;

  const employeeId = EMPLOYEE_IDS[staff.slug] ?? `HST-${staff.slug.toUpperCase().slice(0, 3)}`;

  const photoPublicUrl = staff.photo_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/staff-photos/${staff.photo_url}`
    : null;

  return (
    <Suspense>
      <StaffShell
        user={{
          fullName: user.full_name,
          email: user.email,
          initials: initialsOf(user),
        }}
        staff={{
          fullName: staff.full_name,
          roleTitle: staff.role_title,
          employeeId,
        }}
      >
        <StaffDashboard
          staff={staff}
          employeeId={employeeId}
          activeTab={activeTab}
          signedInEmail={user.email}
          signedInName={user.full_name ?? ''}
          signedInPhone={user.phone ?? ''}
          ninUploaded={ninUploaded}
          photoPublicUrl={photoPublicUrl}
          ownReports={reports.map((r) => ({
            id: r.id,
            kind: r.kind,
            report_date: r.report_date,
            content: r.content,
            is_admin_override: r.is_admin_override,
            created_at: r.created_at,
          }))}
        />
      </StaffShell>
    </Suspense>
  );
}
