// The bar every Highscore AI screen wears.
//
// Shared by all seven screens rather than copied into each: the landing page
// and the workspace differ in what they show underneath, not in how you get
// between them.

import Link from 'next/link';

// Sections of THIS page, not separate routes. The landing page is one scroll
// — every one of these is a heading further down it — and /features was a 404
// dressed up as a nav item.
const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#markets', label: 'Markets' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'Docs' },
];

export function AiNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur">
      {/* Three tracks: logo, links, actions. The outer two are equal 1fr so
          the middle one is centred on the BAR, not on whatever is left after
          the logo — which is what makes it drift as the logo changes width. */}
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-fg">
          <span aria-hidden className="text-brand">✦</span>
          highscore<span className="text-brand">.ai</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="col-start-3 flex items-center justify-end gap-4">
          <Link href="/login" className="text-sm text-fg-muted transition-colors hover:text-fg">
            Log in
          </Link>
          <Link
            href="/app"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-fg px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Open App <span aria-hidden>→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
