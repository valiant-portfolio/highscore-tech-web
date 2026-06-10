// Admin dashboard — top-line KPIs + quick links.

import Link from 'next/link';
import { ArrowRight, GraduationCap, Layers, Users, IdCard, Inbox, CircleDollarSign } from 'lucide-react';
import { PageHead, Kpi, AdminCard } from '@/components/admin/AdminPage';
import { getKpis } from '@/lib/admin/queries';
import { formatNgn } from '@/lib/academy/queries';

export default async function AdminDashboard() {
  const k = await getKpis();

  return (
    <>
      <PageHead
        title="Dashboard"
        description="Top-line numbers across the studio, academy, and team. Everything else lives in the sidebar."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="Revenue (paid)"
          value={formatNgn(k.totalRevenueNgn)}
          hint={`${formatNgn(k.totalCommittedNgn)} committed`}
          tone="brand"
        />
        <Kpi
          label="Active enrolments"
          value={k.activeEnrollments}
          hint={`${k.pendingEnrollments} pending`}
          tone="success"
        />
        <Kpi
          label="Monthly payroll"
          value={formatNgn(k.monthlyPayroll)}
          hint={`${k.totalStaff} on the team`}
        />
        <Kpi
          label="Unread contact"
          value={k.unreadContact}
          hint="contact messages awaiting reply"
          tone={k.unreadContact > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Courses" value={k.totalCourses} hint="published in the catalog" />
        <Kpi label="Portfolio entries" value={k.publishedProjects} hint="live case studies" />
        <Kpi label="Pending enrolments" value={k.pendingEnrollments} hint="awaiting first payment" />
        <Kpi
          label="Net (this view)"
          value={formatNgn(Math.max(0, k.totalRevenueNgn - k.monthlyPayroll))}
          hint="cash collected minus 1 month payroll"
        />
      </div>

      {/* Quick links */}
      <h2 className="mt-12 mb-4 font-display text-lg md:text-xl font-bold text-fg">Quick actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: '/admin/portfolio',   icon: <Layers className="h-5 w-5" />,         title: 'Manage portfolio',  body: 'Add, edit, reorder, publish or unpublish case studies.' },
          { href: '/admin/courses',     icon: <GraduationCap className="h-5 w-5" />,  title: 'Edit courses',      body: 'Update pricing, durations, outcomes, and publish status.' },
          { href: '/admin/enrollments', icon: <Users className="h-5 w-5" />,          title: 'Track enrolments',  body: 'View installment plans and mark offline payments paid.' },
          { href: '/admin/staff',       icon: <IdCard className="h-5 w-5" />,         title: 'Manage staff',      body: 'Reset personal-email access, adjust salaries, view records.' },
          { href: '/admin/contact',     icon: <Inbox className="h-5 w-5" />,          title: 'Contact inbox',     body: 'Triage incoming enquiries from the contact form.' },
          { href: '/admin/ledger',      icon: <CircleDollarSign className="h-5 w-5" />, title: 'Ledger',           body: 'Revenue collected from the academy vs monthly payroll outflow.' },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="block">
            <AdminCard className="hover:border-brand/40 transition-colors h-full">
              <div className="p-5 flex items-start gap-4">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-brand-tint text-brand shrink-0">
                  {c.icon}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-fg">{c.title}</h3>
                  <p className="mt-1 text-sm text-fg-muted">{c.body}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>
    </>
  );
}
