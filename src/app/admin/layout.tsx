// Admin chrome with role guard. Anonymous users are bounced to /login by
// middleware; non-admin students get redirected to /profile here.
//
// Users with `can_manage_portfolio` render this shell too, but middleware only
// lets them onto /admin/portfolio — and `isAdmin: false` trims the nav to it.

import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { getCurrentUser, initialsOf } from '@/lib/auth/queries';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  const isAdmin = user.role === 'admin';
  if (!isAdmin && !user.can_manage_portfolio) redirect('/profile');

  return (
    <AdminShell
      isAdmin={isAdmin}
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
