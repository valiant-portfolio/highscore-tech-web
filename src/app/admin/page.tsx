// Admin dashboard — honest company-wide numbers across academy AND studio,
// plus team operations metrics. Net is unclamped: losses show as negative.

import Link from 'next/link';
import {
  ArrowRight, Briefcase, ClipboardList, Coins, GraduationCap,
  IdCard, Inbox, Layers, Settings, TrendingDown, TrendingUp, Users,
} from 'lucide-react';
import { PageHead, Kpi, AdminCard } from '@/components/admin/AdminPage';
import { getKpis } from '@/lib/admin/queries';
import { formatNgn } from '@/lib/academy/queries';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const k = await getKpis();
  const inTheGreen = k.netNgn >= 0;

  return (
    <>
      <PageHead
        title="Dashboard"
        description="Top-line numbers across the studio, academy, and team. Click into any section in the sidebar for the full picture."
      />

      {/* MONEY — all-time */}
      <SectionLabel icon={<Coins className="h-4 w-4" />} title="Money — all time" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="Total income"
          value={formatNgn(k.totalIncomeNgn)}
          hint={`Academy ${formatNgn(k.academyRevenueNgn)} · Projects ${formatNgn(k.projectIncomeNgn)}`}
          tone="success"
        />
        <Kpi
          label="Total expenses"
          value={formatNgn(k.totalExpensesNgn)}
          hint="Recorded company spend"
        />
        <Kpi
          label="Net (income − expenses)"
          value={`${k.netNgn < 0 ? '−' : ''}${formatNgn(Math.abs(k.netNgn))}`}
          hint={inTheGreen ? 'Company is in the green' : 'Company is in the red'}
          tone={inTheGreen ? 'success' : 'brand'}
        />
        <Kpi
          label="Committed (academy)"
          value={formatNgn(k.totalCommittedNgn)}
          hint="Enrolment plans signed (paid + outstanding)"
        />
      </div>

      {/* MONEY — this month */}
      <SectionLabel icon={<Coins className="h-4 w-4" />} title="Money — this month" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Income this month"   value={formatNgn(k.monthIncomeNgn)}   tone="success" />
        <Kpi label="Expenses this month" value={formatNgn(k.monthExpensesNgn)} />
        <Kpi
          label="Net this month"
          value={`${k.monthNetNgn < 0 ? '−' : ''}${formatNgn(Math.abs(k.monthNetNgn))}`}
          hint={k.monthNetNgn >= 0 ? 'Surplus' : 'Deficit'}
          tone={k.monthNetNgn >= 0 ? 'success' : 'brand'}
        />
        <Kpi
          label="Monthly payroll burn"
          value={formatNgn(k.monthlyPayroll)}
          hint={`${k.totalStaff} active staff`}
        />
      </div>

      {/* STUDIO — Projects */}
      <SectionLabel icon={<Briefcase className="h-4 w-4" />} title="Studio · client + internal" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Active projects"    value={k.activeProjects} />
        <Kpi label="Internal products"  value={k.internalProjects} tone="brand" />
        <Kpi label="Completed projects" value={k.completedProjects} tone="success" />
        <Kpi label="Portfolio entries"  value={k.publishedProjects} hint="published case studies" />
      </div>

      {/* ACADEMY */}
      <SectionLabel icon={<GraduationCap className="h-4 w-4" />} title="Academy" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Active enrolments"  value={k.activeEnrollments}  tone="success" />
        <Kpi label="Pending enrolments" value={k.pendingEnrollments} hint="awaiting first payment" />
        <Kpi label="Live courses"       value={k.totalCourses}       hint="published in the catalog" />
        <Kpi
          label="Unread contact"
          value={k.unreadContact}
          hint={k.unreadContact === 0 ? 'Inbox clean' : 'awaiting reply'}
          tone={k.unreadContact > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Quick links */}
      <h2 className="mt-12 mb-4 font-display text-lg md:text-xl font-bold text-fg">Quick actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: '/admin/finance',     icon: <Coins className="h-5 w-5" />,             title: 'Finance',           body: 'Record client payments and company expenses; track income vs spend.' },
          { href: '/admin/projects',    icon: <Briefcase className="h-5 w-5" />,         title: 'Projects',          body: 'Client engagements + our own products: milestones, team, progress.' },
          { href: '/admin/staff',       icon: <IdCard className="h-5 w-5" />,            title: 'Staff',             body: 'Hire, amend, view bank accounts, photos, agreements.' },
          { href: '/admin/reports',     icon: <ClipboardList className="h-5 w-5" />,     title: 'EOD reports',       body: 'Olivia\'s daily team report — who worked, who didn\'t.' },
          { href: '/admin/portfolio',   icon: <Layers className="h-5 w-5" />,            title: 'Portfolio',         body: 'Public case studies on the marketing site.' },
          { href: '/admin/courses',     icon: <GraduationCap className="h-5 w-5" />,     title: 'Courses',           body: 'Catalogue + pricing + outcomes + publish state.' },
          { href: '/admin/enrollments', icon: <Users className="h-5 w-5" />,             title: 'Enrolments',        body: 'Installment plans + mark offline payments paid.' },
          { href: '/admin/contact',     icon: <Inbox className="h-5 w-5" />,             title: 'Contact',           body: 'Triage incoming enquiries from /contact.' },
          { href: '/admin/settings',    icon: <Settings className="h-5 w-5" />,          title: 'Company settings',  body: 'CEO signature for legal documents + future company-wide config.' },
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

      <p className="mt-10 text-xs text-fg-subtle inline-flex items-center gap-2 flex-wrap">
        {inTheGreen ? (
          <span className="inline-flex items-center gap-1 text-success font-semibold">
            <TrendingUp className="h-3 w-3" /> Company is currently in the green.
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-danger font-semibold">
            <TrendingDown className="h-3 w-3" /> Company is currently in the red — record more income or cut spending.
          </span>
        )}
        <span>Monthly payroll {formatNgn(k.monthlyPayroll)} is treated as a known burn but not yet auto-recorded as a monthly expense — record it from Finance each payday for an accurate net.</span>
      </p>
    </>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mt-8 mb-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
      <span className="text-brand">{icon}</span> {title}
    </div>
  );
}
