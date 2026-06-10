'use client';

// Marketing header — sticky, scroll-aware blur, animated active-route
// underline, mobile sheet with staggered reveal.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { ThemeQuickToggle } from '@/components/theme/ThemeToggle';
import { LinkButton } from '@/components/ui';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';

interface HeaderUser {
  fullName: string | null;
  email: string;
  initials: string;
  role?: 'student' | 'staff' | 'admin';
}

const PRIMARY_NAV: { href: string; label: string }[] = [
  { href: '/services',  label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/academy',   label: 'Academy' },
  { href: '/about',     label: 'About' },
  { href: '/contact',   label: 'Contact' },
];

// Staff portal is no longer publicly linked. Staff sign in via the regular
// /login form using their work email; the post-login redirect sends them to
// their staff dashboard automatically.
const SECONDARY_NAV: { href: string; label: string }[] = [];

export function MarketingHeader({ user }: { user?: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-[background-color,backdrop-filter,border-color] duration-300',
        scrolled
          ? 'bg-bg-elevated/85 backdrop-blur-md border-b border-border'
          : 'bg-bg/40 backdrop-blur-sm border-b border-transparent',
      )}
    >
      <div className="mx-auto max-w-[1440px] flex items-center gap-3 sm:gap-6 px-3 sm:px-4 md:px-8 h-16 md:h-20">
        <Logo size="sm" />
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {PRIMARY_NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'relative inline-flex items-center h-9 px-3 rounded-md text-sm font-medium transition-colors',
                  active ? 'text-fg' : 'text-fg-muted hover:text-fg',
                )}
              >
                {n.label}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-md bg-surface-hover"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeQuickToggle className="hidden md:inline-flex" />
          {user ? (
            <UserMenu fullName={user.fullName} email={user.email} initials={user.initials} role={user.role} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex h-9 items-center px-3 text-sm font-semibold text-fg-muted hover:text-fg"
              >
                Log in
              </Link>
              <LinkButton href="/signup" size="sm" className="hidden sm:inline-flex">
                Sign up
              </LinkButton>
            </>
          )}
          <button
            type="button"
            className={cn(
              'lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md',
              'text-fg hover:bg-surface-hover',
              'border border-border bg-surface/60 backdrop-blur',
            )}
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="absolute inset-0 bg-ink/70 backdrop-blur"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className={cn(
                'absolute inset-y-0 right-0 w-full sm:w-96 max-w-full bg-bg-elevated border-l border-border',
                'flex flex-col',
              )}
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <Logo size="sm" href={null} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-fg-muted hover:bg-surface-hover"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-0.5 px-3 py-4 overflow-y-auto flex-1">
                <p className="px-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-fg-subtle mb-2">
                  Explore
                </p>
                {PRIMARY_NAV.map((n, i) => (
                  <motion.div
                    key={n.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.03 }}
                  >
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'inline-flex w-full items-center h-12 px-3 rounded-md text-base font-medium',
                        isActive(n.href)
                          ? 'bg-brand-tint text-brand'
                          : 'text-fg hover:bg-surface-hover',
                      )}
                    >
                      {n.label}
                    </Link>
                  </motion.div>
                ))}
                {SECONDARY_NAV.length > 0 && (
                  <>
                    <div className="my-3 border-t border-border" />
                    {SECONDARY_NAV.map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'inline-flex items-center h-11 px-3 rounded-md text-sm font-medium',
                          pathname === n.href ? 'text-brand' : 'text-fg-muted hover:text-fg hover:bg-surface-hover',
                        )}
                      >
                        {n.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
              <div className="px-4 py-4 border-t border-border space-y-2.5">
                {user ? (
                  <>
                    <span onClick={() => setOpen(false)}>
                      <LinkButton href="/profile" fullWidth size="lg">
                        My profile
                      </LinkButton>
                    </span>
                    <p className="text-xs text-fg-subtle text-center pt-1 truncate">
                      Signed in as {user.email}
                    </p>
                  </>
                ) : (
                  <>
                    <span onClick={() => setOpen(false)}>
                      <LinkButton href="/signup" fullWidth size="lg">
                        Sign up
                      </LinkButton>
                    </span>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="block w-full text-center h-11 leading-[44px] rounded-md text-sm font-semibold text-fg-muted hover:text-fg"
                    >
                      Log in
                    </Link>
                  </>
                )}
                <div className="pt-2 flex justify-center">
                  <ThemeQuickToggle />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
