// /admin/projects/new — bootstrap a new client project. Payments,
// expenses, milestones, and staff get added on the detail page.

import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { ProjectCreateForm } from '@/components/admin/ProjectCreateForm';

export const dynamic = 'force-dynamic';

export default function AdminProjectCreatePage() {
  return (
    <>
      <PageHead
        title="New project"
        description="Capture the basics. You can record payments, expenses, milestones, and assign staff once it's created."
      />
      <AdminCard>
        <div className="p-5 md:p-7 max-w-[760px]">
          <ProjectCreateForm />
        </div>
      </AdminCard>
    </>
  );
}
