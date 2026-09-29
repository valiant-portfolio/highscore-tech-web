// The workspace — the trading desk.
//
// ai.highzcore.tech replaces bot.highzcore.tech, so this screen carries the
// controls the old desk had: the trading switch, close-all, approval mode, and
// cancel on a resting order.
//
// WHICH IS WHY THE SIGN-IN IS BACK. It came off while this was read-only. It
// cannot stay off now: a kill switch for a live account on a URL anyone can
// open is a different kind of risk from a screen that only shows numbers. Same
// permission as the old desk, requireSection('trading-bot') — no second way in.
//
// The data is the existing bot's, unchanged: getBotOverview() is the same call
// the old dashboard made. One source, one desk, new room.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getBotOverview, symbolForTicket } from '@/lib/admin/trading-bot-queries';
import { getAdminAccess } from '@/lib/admin/access';
import { getCurrentUser, initialsOf } from '@/lib/auth/queries';
import { Workspace } from '@/components/ai/workspace/Workspace';

export const metadata: Metadata = {
  title: 'Workspace',
  description: 'Price, context and a second opinion on one screen.',
  // Not indexed while it is open: unlisted is the only protection it has.
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AiWorkspacePage({ searchParams }: {
  searchParams: Promise<{
    ticket?: string; symbol?: string; tab?: string; market?: string;
    view?: string; range?: string;
  }>;
}) {
  const user = await getCurrentUser();
  // Sign in on THIS host and come back here — the desk does not hand anyone to
  // the admin panel.
  if (!user) redirect('/login?next=%2Fapp');

  const access = await getAdminAccess();
  if (!access?.isAdmin && !access?.sections.includes('trading-bot')) redirect('/profile');

  const {
    markets, configs, specs, closedTrades, equity, equityCurve, settings, proposals, lastUpdate,
  } = await getBotOverview();

  // A Telegram alert links here with the one thing it knows: a ticket.
  // Resolve it to a market so the desk opens on the thing being asked
  // about, rather than the welcome screen.
  const q = await searchParams;
  const openOn = q.market ?? q.symbol
    ?? (q.ticket && Number.isFinite(Number(q.ticket)) ? await symbolForTicket(Number(q.ticket)) : null);

  // The desk keeps its place in the URL — ?tab, ?market, ?ticket — so a
  // refresh lands where you were rather than back on the welcome screen, and
  // a link to what you are looking at is just the address bar.
  const openTab = q.tab ?? null;
  const openTicket = q.ticket && Number.isFinite(Number(q.ticket)) ? Number(q.ticket) : null;

  return (
    <Workspace
      markets={markets}
      configs={configs}
      specs={specs}
      closedTrades={closedTrades}
      equity={equity}
      equityCurve={equityCurve}
      settings={settings}
      proposals={proposals}
      lastUpdate={lastUpdate}
      openOn={openOn}
      openTab={openTab}
      openTicket={openTicket}
      // Sub-state, so a refresh keeps the tab AND what you had filtered
      // inside it: Orders' Awaiting/Decided, and History's range.
      openView={q.view ?? null}
      openRange={q.range ?? null}
      // The person at the desk, not the address they signed in with. The email
      // is the fallback, because a nameless account is still somebody.
      user={{ name: user.full_name?.trim() || user.email || 'Signed in', initials: initialsOf(user) }}
    />
  );
}
