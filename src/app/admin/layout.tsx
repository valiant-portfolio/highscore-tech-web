// Admin chrome with role guard. Anonymous users are bounced to /login by
// middleware; users with no admin sections get redirected to /profile here.
//
// Staff granted one or more sections render this shell too; middleware limits
// them to those routes, and the nav below is trimmed to what they may open.

import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCurrentUser, initialsOf } from '@/lib/auth/queries';
import { ADMIN_SECTION_KEYS, allowedHrefs } from '@/lib/admin/sections';

// Only real admin-panel section keys count toward /admin entry — staff-portal
// capabilities (team-eod, profile-edit) live in the same array but don't grant
// the panel.

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  const isAdmin = user.role === 'admin';
  const sections = isAdmin
    ? ADMIN_SECTION_KEYS
    : user.admin_sections.filter((k) => ADMIN_SECTION_KEYS.includes(k));
  if (sections.length === 0) redirect('/profile');

  return (
    <AdminShell
      allowedHrefs={allowedHrefs(sections)}
      user={{
        fullName: user.full_name,
        email: user.email,
        initials: initialsOf(user),
      }}
    >
      {children}
    </AdminShell>
  );
}
