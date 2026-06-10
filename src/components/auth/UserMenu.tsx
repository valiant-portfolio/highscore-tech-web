'use client';

// Signed-in user menu — avatar bubble that opens a dropdown with quick
// links + logout. Items are role-aware:
//   • student → "Profile" links to /profile, "Browse courses" shown
//   • staff   → "Staff portal" links to /staff, no "Browse courses"
//   • admin   → "Admin dashboard" + "My profile" link to /admin and
//                /profile respectively, no "Browse courses"

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  LogOut, User, ChevronDown, GraduationCap, LayoutDashboard, Shield, IdCard,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

interface Props {
  fullName: string | null;
  email: string;
  initials: string;
  role?: 'student' | 'staff' | 'admin';
}

export function UserMenu({ fullName, email, initials, role = 'student' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin   = role === 'admin';
  const isStaff   = role === 'staff';
  const isStudent = role === 'student';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-2">
      {isAdmin && (
        <span
          className="hidden sm:inline-flex h-7 items-center gap-1 px-2.5 rounded-full bg-brand-tint border border-brand/30 text-brand text-[11px] font-bold uppercase tracking-wider"
          title="You're signed in as an admin"
        >
          <Shield className="h-3 w-3" /> Admin
        </span>
      )}
      {isStaff && (
        <span
          className="hidden sm:inline-flex h-7 items-center gap-1 px-2.5 rounded-full bg-brand-tint border border-brand/30 text-brand text-[11px] font-bold uppercase tracking-wider"
          title="You're signed in as staff"
        >
          <IdCard className="h-3 w-3" /> Staff
        </span>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className={cn(
          'inline-flex items-center gap-2 h-10 pl-1 pr-2 rounded-full',
          'border border-border bg-surface/60 backdrop-blur hover:bg-surface-hover transition-colors',
        )}
      >
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center h-8 w-8 rounded-full text-bg font-extrabold text-xs"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)',
          }}
        >
          {initials}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-fg-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-64 rounded-xl border border-border bg-bg-elevated shadow-elev-3 overflow-hidden z-40"
        >
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-fg truncate">{fullName || 'Highscore Tech account'}</p>
              {isAdmin && (
                <span className="sm:hidden inline-flex h-5 items-center gap-1 px-1.5 rounded-md bg-brand-tint text-brand text-[10px] font-bold uppercase">
                  Admin
                </span>
              )}
              {isStaff && (
                <span className="sm:hidden inline-flex h-5 items-center gap-1 px-1.5 rounded-md bg-brand-tint text-brand text-[10px] font-bold uppercase">
                  Staff
                </span>
              )}
            </div>
            <p className="text-xs text-fg-subtle truncate">{email}</p>
          </div>

          {/* Primary destination per role */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand-tint/50 border-b border-border"
              role="menuitem"
            >
              <LayoutDashboard className="h-4 w-4" /> Admin dashboard
            </Link>
          )}
          {isStaff && (
            <Link
              href="/staff"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand-tint/50 border-b border-border"
              role="menuitem"
            >
              <IdCard className="h-4 w-4" /> Staff portal
            </Link>
          )}
          {isStudent && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-surface-hover"
              role="menuitem"
            >
              <User className="h-4 w-4 text-fg-muted" /> Profile
            </Link>
          )}

          {/* Admin gets a secondary 'My profile' link to see their own
              student-style page if they ever need it. Staff don't — the
              staff portal IS their profile. */}
          {isAdmin && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-surface-hover"
              role="menuitem"
            >
              <User className="h-4 w-4 text-fg-muted" /> My profile
            </Link>
          )}

          {/* "Browse courses" only makes sense for students who can enrol. */}
          {isStudent && (
            <Link
              href="/academy"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-surface-hover"
              role="menuitem"
            >
              <GraduationCap className="h-4 w-4 text-fg-muted" /> Browse courses
            </Link>
          )}

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-surface-hover border-t border-border"
              role="menuitem"
            >
              <LogOut className="h-4 w-4 text-fg-muted" /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
