// Shared chrome for every public marketing page. Server-rendered so the
// signed-in user is fetched once at the layout boundary and threaded into
// the header.

import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { getCurrentUser, initialsOf } from '@/lib/auth/queries';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const headerUser = user
    ? { fullName: user.full_name, email: user.email, initials: initialsOf(user), role: user.role }
    : null;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:inline-flex focus:h-10 focus:items-center focus:px-3 focus:rounded-md focus:bg-brand focus:text-brand-fg focus:font-semibold focus:shadow-elev-2"
      >
        Skip to content
      </a>
      <MarketingHeader user={headerUser} />
      <main id="main-content" className="flex-1">{children}</main>
      <MarketingFooter />
    </>
  );
}
