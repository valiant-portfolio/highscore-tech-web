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

  // Staff-portal capabilities are granted per-staff by an admin (stored in
  // users.admin_sections). No one has them by default.
  const caps = user.admin_sections;
  const canPostTeamEod = caps.includes('team-eod');
  const canEditProfile = caps.includes('profile-edit');

  const { tab } = await searchParams;
  if (tab === 'reports' && !canPostTeamEod) redirect('/staff');
  const activeTab: 'profile' | 'documents' | 'reports' | 'settings' =
    tab === 'documents' || tab === 'settings' || (tab === 'reports' && canPostTeamEod)
      ? tab
      : 'profile';

  const { serviceClient } = await import('@/lib/supabase/service');
  const admin = serviceClient();
  const { data: meRow } = await admin.from('users').select('nin_doc_url').eq('id', user.id).maybeSingle();
  const ninUploaded = !!meRow?.nin_doc_url;

  // Olivia-only data: active staff for the team EOD form, plus past team
  // EOD rows for the table.
  let activeStaffForEod: { id: string; full_name: string; role_title: string }[] = [];
  let teamEodRows: { id: string; report_date: string; content: string; created_at: string }[] = [];
  if (canPostTeamEod) {
    const [{ data: activeList }, { data: pastEods }] = await Promise.all([
      admin.from('staff').select('id, full_name, role_title').eq('status', 'active').order('full_name', { ascending: true }),
      admin.from('staff_reports')
        .select('id, report_date, content, created_at')
        .eq('kind', 'team_eod')
        .order('report_date', { ascending: false })
        .limit(60),
    ]);
    activeStaffForEod = (activeList ?? []).map((r) => ({
      id: r.id as string,
      full_name: r.full_name as string,
      role_title: r.role_title as string,
    }));
    teamEodRows = (pastEods ?? []).map((r) => ({
      id: r.id as string,
      report_date: r.report_date as string,
      content: r.content as string,
      created_at: r.created_at as string,
    }));
  }

  // ownReports query removed — personal reports are no longer collected
  // here. Olivia gathers updates from Google Workspace and posts a single
  // Team EOD covering everyone.
  void listReportsForStaff;

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
          canPostTeamEod,
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
          canPostTeamEod={canPostTeamEod}
          canEditProfile={canEditProfile}
          activeStaffForEod={activeStaffForEod}
          teamEodRows={teamEodRows}
        />
      </StaffShell>
    </Suspense>
  );
}
