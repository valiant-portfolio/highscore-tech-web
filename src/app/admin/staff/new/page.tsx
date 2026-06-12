// /admin/staff/new — provisioning page. Admin enters the new employee's
// details + a default password; on save we create the auth user, insert
// the staff record, and show the credentials.

import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { StaffCreateForm } from '@/components/admin/StaffCreateForm';
import { serviceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export default async function AdminStaffCreatePage() {
  const admin = serviceClient();
  // Pull active staff so we can offer them as "Reports to" options.
  const { data } = await admin
    .from('staff')
    .select('id, full_name, role_title')
    .eq('status', 'active')
    .order('full_name', { ascending: true });

  const reportsToOptions = (data ?? []).map((r) => ({
    id: r.id as string,
    full_name: r.full_name as string,
    role_title: r.role_title as string,
  }));

  return (
    <>
      <PageHead
        title="Add staff"
        description="Provision a new employee account. You set their starting password — they can change it after first login."
      />

      <AdminCard>
        <div className="p-5 md:p-7 max-w-[860px]">
          <StaffCreateForm reportsToOptions={reportsToOptions} />
        </div>
      </AdminCard>
    </>
  );
}
