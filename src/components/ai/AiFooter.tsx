// The footer, and the line that is not optional.
//
// "Every AI answer must carry: AI can make mistakes. Not financial advice."
// It lives in the layout's footer so no screen can ship without it, and it is
// repeated beside each individual answer where one is shown — a disclaimer two
// scrolls below the thing it disclaims is decoration.
//
// The market columns list what we can actually analyse. If a name appears
// here, there is a feed behind it.

import Link from 'next/link';

export const AI_DISCLAIMER = 'AI can make mistakes. Not financial advice.';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '/changelog', label: 'Changelog' },
    ],
  },
  {
    title: 'Markets',
    links: [
      { href: '/markets/crypto', label: 'Crypto' },
      { href: '/markets/forex', label: 'Forex' },
      { href: '/markets/indices', label: 'Indices' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/journal', label: 'Journal' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/risk', label: 'Risk disclosure' },
    ],
  },
];

export function AiFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* Two columns on a phone, not four stacked one-per-screen. The brand
            block spans both so the link columns pair up underneath it. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.5fr_repeat(4,1fr)] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="flex items-center gap-2 font-bold tracking-tight text-fg">
              <span aria-hidden className="text-brand">✦</span>
              highscore<span className="text-brand">.ai</span>
            </p>
            <p className="mt-2 text-sm text-fg-muted">A calmer way to read the market.</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-semibold text-fg">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {/* Anchors stay plain <a>: there is no route to push. */}
                    {l.href.startsWith('#') ? (
                      <a href={l.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stacked on a phone: side by side, the disclaimer wrapped to three
            ragged lines with the copyright orphaned beneath it. */}
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-fg-subtle sm:text-xs">
            Highscore Tech. {AI_DISCLAIMER} Trading carries risk of loss.
          </p>
          <p className="text-[11px] text-fg-subtle sm:text-xs">© {new Date().getFullYear()} Highscore Tech</p>
        </div>
      </div>
    </footer>
  );
}
