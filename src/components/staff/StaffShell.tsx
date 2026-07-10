'use client';

// Staff portal chrome — fixed sidebar nav + topbar with user menu. Same
// pattern as AdminShell (deliberate; staff is also "logged-in operator"
// not "marketing visitor") but with a different sidebar nav specific to
// staff-y things: agreements, documents, reports, settings.

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, FolderOpen, MessageSquare, UserCog,
  ExternalLink, Menu, X, IdCard,
  LayoutDashboard, Layers, GraduationCap, Users, Briefcase, Coins,
  ClipboardList, Activity, LineChart, Inbox, CircleDollarSign, FileText,
  ShieldCheck, Settings,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';

interface NavItem {
  tab: 'profile' | 'documents' | 'reports' | 'settings';
  label: string;
  icon: React.ReactNode;
}

interface AdminSectionLink {
  key: string;
  href: string;
  label: string;
}

// Icon per admin section key — mirrors AdminShell so the links look the same
// wherever they appear.
const SECTION_ICON: Record<string, React.ReactNode> = {
  dashboard:   <LayoutDashboard className="h-4 w-4" />,
  portfolio:   <Layers className="h-4 w-4" />,
  courses:     <GraduationCap className="h-4 w-4" />,
  enrollments: <Users className="h-4 w-4" />,
  staff:       <IdCard className="h-4 w-4" />,
  projects:    <Briefcase className="h-4 w-4" />,
  finance:     <Coins className="h-4 w-4" />,
  reports:     <ClipboardList className="h-4 w-4" />,
  performance: <Activity className="h-4 w-4" />,
  'trading-bot': <LineChart className="h-4 w-4" />,
  contact:     <Inbox className="h-4 w-4" />,
  ledger:      <CircleDollarSign className="h-4 w-4" />,
  'nin-docs':  <FileText className="h-4 w-4" />,
  audit:       <ShieldCheck className="h-4 w-4" />,
  settings:    <Settings className="h-4 w-4" />,
};

const NAV_BASE: NavItem[] = [
  { tab: 'profile',   label: 'Overview',  icon: <Home className="h-4 w-4" /> },
  { tab: 'documents', label: 'Documents', icon: <FolderOpen className="h-4 w-4" /> },
  { tab: 'settings',  label: 'Profile',   icon: <UserCog className="h-4 w-4" /> },
];
const REPORTS_NAV: NavItem = {
  tab: 'reports', label: 'Team EOD', icon: <MessageSquare className="h-4 w-4" />,
};

interface Props {
  user: { fullName: string | null; email: string; initials: string };
  staff: {
    fullName: string;
    roleTitle: string;
    employeeId: string;
    /** Shows the Team EOD nav entry when the staff member is granted it. */
    canPostTeamEod?: boolean;
    /** Granted admin-panel sections — each renders as its own sidebar link. */
    adminSections?: AdminSectionLink[];
  };
  children: React.ReactNode;
}

export function StaffShell({ user, staff, children }: Props) {
  // Insert the Reports entry between Documents and Settings — only for
  // the operations manager. Everyone else sees three tabs.
  const NAV: NavItem[] = staff.canPostTeamEod
    ? [NAV_BASE[0], NAV_BASE[1], REPORTS_NAV, NAV_BASE[2]]
    : NAV_BASE;
  const adminSections = staff.adminSections ?? [];
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeSection = sp.get('section');
  const activeTab = sp.get('tab') ?? 'profile';
  // A base tab is active only when no admin section is open.
  const isActive = (tab: string) =>
    pathname === '/staff' && !activeSection && activeTab === tab;
  const isSectionActive = (key: string) =>
    pathname === '/staff' && activeSection === key;

  const navList = (
    <ul className="space-y-1">
      {NAV.map((n) => (
        <li key={n.tab}>
          <Link
            href={`/staff?tab=${n.tab}`}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors',
              isActive(n.tab)
                ? 'bg-brand-tint text-brand'
                : 'text-fg-muted hover:text-fg hover:bg-surface-hover',
            )}
          >
            <span className="shrink-0">{n.icon}</span>
            {n.label}
          </Link>
        </li>
      ))}
      {adminSections.length > 0 && (
        <li className="pt-2 mt-2 border-t border-border">
          <ul className="space-y-1">
            {adminSections.map((s) => (
              <li key={s.key}>
                <Link
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors',
                    isSectionActive(s.key)
                      ? 'bg-brand-tint text-brand'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-hover',
                  )}
                >
                  <span className="shrink-0">{SECTION_ICON[s.key] ?? <ShieldCheck className="h-4 w-4" />}</span>
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      )}
    </ul>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-bg-elevated">
        <div className="h-16 px-4 flex items-center border-b border-border">
          <Logo size="sm" />
        </div>

        {/* Staff identity card */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Staff</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full text-bg font-extrabold text-xs shrink-0"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)',
              }}
            >
              {user.initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg truncate">{staff.fullName}</p>
              <p className="text-xs text-fg-subtle truncate">{staff.roleTitle}</p>
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-fg-subtle font-mono">
            <IdCard className="h-3 w-3" /> {staff.employeeId}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">{navList}</nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 h-9 rounded-md text-xs font-semibold text-fg-muted hover:text-fg hover:bg-surface-hover"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Visit site
          </Link>
        </div>
      </aside>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="absolute inset-0 bg-ink/70 backdrop-blur" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 w-72 max-w-full bg-bg-elevated border-r border-border flex flex-col"
            >
              <div className="h-16 px-4 flex items-center justify-between border-b border-border">
                <Logo size="sm" href={null} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-fg-muted hover:bg-surface-hover"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-4 py-4 border-b border-border">
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Staff</p>
                <p className="mt-1 text-sm font-semibold text-fg truncate">{staff.fullName}</p>
                <p className="text-xs text-fg-subtle truncate">{staff.roleTitle}</p>
              </div>
              <nav className="flex-1 px-3 py-4 overflow-y-auto">{navList}</nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-bg-elevated/85 backdrop-blur-md border-b border-border h-16">
          <div className="h-full px-4 md:px-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface/60 text-fg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-fg">Staff portal</p>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                className="hidden sm:inline-flex h-9 items-center px-3 rounded-md text-sm font-semibold text-fg-muted hover:text-fg"
              >
                Visit site
              </Link>
              <UserMenu
                fullName={user.fullName}
                email={user.email}
                initials={user.initials}
                role="staff"
              />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-10 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
