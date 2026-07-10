// Renders a granted admin-panel section INSIDE the staff portal (under
// /staff?section=<key>) so a staff-admin keeps their staff sidebar instead of
// being thrown into the /admin chrome. The admin page components are plain
// async server components (they render PageHead/AdminCard, not AdminShell), so
// they embed cleanly. Access is enforced by the staff page before this renders.

import AdminDashboard from '@/app/admin/page';
import AdminPortfolioListPage from '@/app/admin/portfolio/page';
import AdminCoursesListPage from '@/app/admin/courses/page';
import AdminEnrollmentsPage from '@/app/admin/enrollments/page';
import AdminStaffPage from '@/app/admin/staff/page';
import AdminProjectsPage from '@/app/admin/projects/page';
import AdminFinancePage from '@/app/admin/finance/page';
import AdminReportsPage from '@/app/admin/reports/page';
import AdminPerformancePage from '@/app/admin/performance/page';
import TradingBotPage from '@/app/admin/trading-bot/page';
import AdminContactPage from '@/app/admin/contact/page';
import AdminLedgerPage from '@/app/admin/ledger/page';
import AdminNinDocsPage from '@/app/admin/nin-docs/page';
import AdminAuditPage from '@/app/admin/audit/page';
import AdminSettingsPage from '@/app/admin/settings/page';

export function AdminSectionView({
  section,
  searchParams,
}: {
  section: string;
  searchParams: Record<string, string | undefined>;
}) {
  // reports + audit read query params; pass the raw bag as a resolved promise.
  const sp = Promise.resolve(searchParams);
  switch (section) {
    case 'dashboard':   return <AdminDashboard />;
    case 'portfolio':   return <AdminPortfolioListPage />;
    case 'courses':     return <AdminCoursesListPage />;
    case 'enrollments': return <AdminEnrollmentsPage />;
    case 'staff':       return <AdminStaffPage />;
    case 'projects':    return <AdminProjectsPage />;
    case 'finance':     return <AdminFinancePage />;
    case 'reports':     return <AdminReportsPage searchParams={sp} />;
    case 'performance': return <AdminPerformancePage />;
    case 'trading-bot': return <TradingBotPage />;
    case 'contact':     return <AdminContactPage />;
    case 'ledger':      return <AdminLedgerPage />;
    case 'nin-docs':    return <AdminNinDocsPage />;
    case 'audit':       return <AdminAuditPage searchParams={sp} />;
    case 'settings':    return <AdminSettingsPage />;
    default:            return null;
  }
}
