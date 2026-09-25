// The trading bot's own shell. Not the admin panel.
//
// It used to live at /admin/trading-bot, inside the admin chrome, beside
// courses and payroll and the portfolio. It is none of those things: it is a
// trading desk, it has its own subdomain, and the two people who use it do not
// work anywhere else in that panel. Sharing a shell meant a nav full of
// sections they cannot open and a URL that says this is a corner of something
// else.
//
// The PERMISSION is deliberately unchanged. HS-BOT-v3 is explicit — "both
// already exist in requireSection('trading-bot'), do not build a second way
// in" — so this checks the same grant the admin panel checks, against the same
// session, and adds no auth path of its own.

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getAdminAccess } from '@/lib/admin/access';
import { getCurrentUser, initialsOf } from '@/lib/auth/queries';

export const dynamic = 'force-dynamic';

export default async function BotLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    // Sign in on the host you arrived at, and come back HERE — not to the
    // admin panel, which is the whole point of the move.
    const host = (await headers()).get('host')?.split(':')[0].toLowerCase() ?? '';
    const next = host.startsWith('bot.') ? '/' : '/bot';
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const access = await getAdminAccess();
  const allowed = !!access && (access.isAdmin || access.sections.includes('trading-bot'));
  if (!allowed) redirect('/profile');

  return (
    <div className="min-h-screen bg-bg">
      {/* One bar, naming the desk and who is at it. No section nav: there is
          one place to be here, and the tabs inside the page are the
          navigation. */}
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-fg">Trading bot</span>
            <span className="hidden text-[11px] text-fg-subtle sm:inline">
              Highscore Tech · demo account
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[11px] text-fg-subtle sm:inline">{user.email}</span>
            <span
              className="grid h-7 w-7 place-items-center rounded-full bg-surface-hover text-[11px] font-bold text-fg-muted"
              title={user.full_name ?? user.email}
            >
              {initialsOf(user)}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 md:px-6 md:py-6">{children}</main>

      {/* Stated on every page on purpose. Nothing here is protecting live
          capital, and nobody should read these numbers as income. */}
      <footer className="mx-auto max-w-[1600px] px-4 pb-8 md:px-6">
        <p className="text-[11px] text-fg-subtle">
          Demo account. No strategy here has passed out-of-sample validation, and
          the bot refuses to run on a non-demo account.
        </p>
      </footer>
    </div>
  );
}
