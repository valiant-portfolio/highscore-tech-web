// Admin chrome with role guard. Anonymous users are bounced to /login by
// middleware; non-admin students get redirected to /profile here.

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
  if (user.role !== 'admin') redirect('/profile');

  return (
    <AdminShell
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
