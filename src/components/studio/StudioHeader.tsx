'use client';

// Highscore Studio header. Deliberately lighter than the agency header: the
// Studio sells to walk-up customers, so the two things that matter are "see
// the work" and "order" — plus the channels people actually message us on.

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageCircle, Send, Mail } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { LinkButton } from '@/components/ui';
import { cn } from '@/lib/utils';

// No "Studio" entry — the logo is the way home, so a nav link beside it is
// just the same destination twice.
const NAV = [
  { href: '/studio/pricing',   label: 'Pricing' },
  { href: '/studio/work',      label: 'Our work' },
];

export function StudioHeader({
  whatsapp, telegram, email,
}: { whatsapp?: string; telegram?: string; email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href) ?? false;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      {/* Taller than the agency header: the Studio lockup is near-square, so it
          needs vertical room to stay legible. */}
      <div className="mx-auto max-w-[1280px] flex items-center gap-3 px-4 md:px-8 h-[72px]">
        {/* The Studio lockup already says "Studio", so no extra wordmark here.
            The badge alone on the narrowest screens, where the full lockup would
            crowd out the nav. */}
        <Link href="/studio" className="flex items-center shrink-0" aria-label="Highscore Studio">
          <span className="hidden sm:inline-flex">
            <Logo size="md" href={null} variant="studio" />
          </span>
          <span className="sm:hidden inline-flex">
            <Logo size="sm" href={null} variant="studio" iconOnly />
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                'inline-flex h-9 items-center px-3 rounded-md text-sm font-medium transition-colors',
                isActive(n.href) ? 'text-fg bg-surface-hover' : 'text-fg-muted hover:text-fg',
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ContactIcons whatsapp={whatsapp} telegram={telegram} email={email} className="hidden sm:flex" />
          <LinkButton href="/studio/order" size="sm">Order now</LinkButton>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-bg px-4 py-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="h-11 flex items-center px-2 rounded-md text-fg font-medium hover:bg-surface-hover"
            >
              {n.label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-border">
            <ContactIcons whatsapp={whatsapp} telegram={telegram} email={email} withLabels />
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Accepts either form for each channel, because both are things you naturally
 * have to hand: a full link (e.g. a wa.me/message/… click-to-chat short link,
 * or t.me/…) or a bare number/@handle. Stripping non-digits from a short link
 * would quietly produce a dead URL, so check for a URL first.
 */
function chatHref(value: string, kind: 'whatsapp' | 'telegram'): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (kind === 'whatsapp') return `https://wa.me/${v.replace(/[^\d]/g, '')}`;
  return `https://t.me/${v.replace(/^@/, '')}`;
}

export function ContactIcons({
  whatsapp, telegram, email, className, withLabels = false,
}: { whatsapp?: string; telegram?: string; email: string; className?: string; withLabels?: boolean }) {
  const items = [
    whatsapp && { href: chatHref(whatsapp, 'whatsapp'), icon: <MessageCircle className="h-4 w-4" />, label: 'WhatsApp' },
    telegram && { href: chatHref(telegram, 'telegram'), icon: <Send className="h-4 w-4" />, label: 'Telegram' },
    { href: `mailto:${email}`, icon: <Mail className="h-4 w-4" />, label: 'Email' },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {items.map((i) => (
        <a
          key={i.label}
          href={i.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Message us on ${i.label}`}
          className={cn(
            'inline-flex items-center gap-2 rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors',
            withLabels ? 'h-10 px-2 text-sm font-medium w-full' : 'h-9 w-9 justify-center',
          )}
        >
          {i.icon}
          {withLabels && i.label}
        </a>
      ))}
    </div>
  );
}
