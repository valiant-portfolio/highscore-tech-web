'use client';

// Admin chrome — fixed sidebar nav + topbar with user menu. Mobile collapses
// the sidebar into a sheet. The role check is handled by the layout above;
// this component assumes an authorised admin.

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, GraduationCap, Users, IdCard, Inbox,
  CircleDollarSign, ExternalLink, LogOut, Menu, X,
  Activity, ShieldCheck, FileText, Settings, ClipboardList,
  Briefcase,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';

const NAV: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '/admin',             label: 'Dashboard',   icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/admin/portfolio',   label: 'Portfolio',   icon: <Layers className="h-4 w-4" /> },
  { href: '/admin/courses',     label: 'Courses',     icon: <GraduationCap className="h-4 w-4" /> },
  { href: '/admin/enrollments', label: 'Enrolments',  icon: <Users className="h-4 w-4" /> },
  { href: '/admin/staff',       label: 'Staff',       icon: <IdCard className="h-4 w-4" /> },
  { href: '/admin/projects',    label: 'Projects',    icon: <Briefcase className="h-4 w-4" /> },
  { href: '/admin/reports',     label: 'EOD reports', icon: <ClipboardList className="h-4 w-4" /> },
  { href: '/admin/performance', label: 'Performance', icon: <Activity className="h-4 w-4" /> },
  { href: '/admin/contact',     label: 'Contact',     icon: <Inbox className="h-4 w-4" /> },
  { href: '/admin/ledger',      label: 'Ledger',      icon: <CircleDollarSign className="h-4 w-4" /> },
  { href: '/admin/nin-docs',    label: 'NIN docs',    icon: <FileText className="h-4 w-4" /> },
  { href: '/admin/audit',       label: 'Audit log',   icon: <ShieldCheck className="h-4 w-4" /> },
  { href: '/admin/settings',    label: 'Settings',    icon: <Settings className="h-4 w-4" /> },
];

interface Props {
  user: { fullName: string | null; email: string; initials: string };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname?.startsWith(href));

  const navList = (
    <ul className="space-y-1">
      {NAV.map((n) => (
        <li key={n.href}>
          <Link
            href={n.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors',
              isActive(n.href)
                ? 'bg-brand-tint text-brand'
                : 'text-fg-muted hover:text-fg hover:bg-surface-hover',
            )}
          >
            <span className="shrink-0">{n.icon}</span>
            {n.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-bg-elevated">
        <div className="h-16 px-4 flex items-center border-b border-border">
          <Logo size="sm" />
        </div>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Admin</p>
          <p className="mt-1 text-sm font-semibold text-fg truncate">{user.fullName ?? user.email}</p>
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
            <p className="text-sm font-semibold text-fg">Admin</p>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                className="hidden sm:inline-flex h-9 items-center px-3 rounded-md text-sm font-semibold text-fg-muted hover:text-fg"
              >
                Visit site
              </Link>
              <UserMenu fullName={user.fullName} email={user.email} initials={user.initials} />
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

// Suppress unused-import warnings for icons we may reach for in future panels.
void LogOut;
