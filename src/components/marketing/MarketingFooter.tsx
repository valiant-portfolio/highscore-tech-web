// Marketing footer for Highscore Tech — links across services, academy
// and company. Staff portal is intentionally not linked here; staff
// log in via /login with their work email.

import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { AmbientBackdrop } from '@/components/marketing3d/AmbientBackdrop';

interface Column {
  title: string;
  links: { href: string; label: string }[];
}

const COLUMNS: Column[] = [
  {
    title: 'Services',
    links: [
      { href: '/services',  label: 'AI development' },
      { href: '/services',  label: 'Software development' },
      { href: '/services',  label: 'Product strategy' },
      { href: '/portfolio', label: 'Portfolio' },
    ],
  },
  {
    title: 'Academy',
    links: [
      { href: '/academy', label: 'All courses' },
      { href: '/academy', label: 'Why study with us' },
      { href: '/academy', label: 'Hiring pipeline' },
      { href: '/signup',  label: 'Enrol' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about',   label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative isolate border-t border-border bg-bg-elevated overflow-hidden">
      <AmbientBackdrop variant="subtle" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 md:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-12">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-fg-muted leading-relaxed max-w-xs">
              AI systems, software, and a training academy that hires its best students.
              Remote-first across Nigeria, working with clients worldwide.
            </p>
            <p className="text-xs text-fg-subtle">
              <a href="mailto:admin@highzcore.tech" className="hover:text-fg">admin@highzcore.tech</a>
            </p>
            <div className="text-xs text-fg-subtle space-y-1 pt-2 border-t border-border/60 max-w-xs">
              <p>Highscore Tech</p>
              <p className="font-mono tabular">CAC RC No. 7223102</p>
              <p>Lagos, Nigeria.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={`${col.title}-${l.label}`}>
                      <Link
                        href={l.href}
                        className="inline-block text-sm text-fg-muted hover:text-fg transition-colors relative
                                   after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-brand
                                   after:scale-x-0 after:origin-left hover:after:scale-x-100
                                   after:transition-transform after:duration-300"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap text-xs text-fg-subtle">
          <span>
            © {new Date().getFullYear()} Highscore Tech (CAC RC No. 7223102). All rights reserved.
          </span>
          <span className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-fg">Sitemap</Link>
            <span aria-hidden="true">·</span>
            <a href="https://highzcore.tech" className="hover:text-fg">highzcore.tech</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
