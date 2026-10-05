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
//
// ONE CATCH-ALL ROUTE, every section a real path: /app/markets,
// /app/market/EUR-USD, /app/market/EUR-USD/details, /app/history. It was
// ?tab=markets, which failed at the three things a query string is bad at — a
// refresh landing where you were, Back walking where you have been, and a link
// naming what you are looking at. A folder per section would have duplicated
// this shell eleven times and let the copies drift.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getBotOverview, symbolForTicket } from '@/lib/admin/trading-bot-queries';
import { getAdminAccess } from '@/lib/admin/access';
import { getCurrentUser, initialsOf } from '@/lib/auth/queries';
import { Workspace } from '@/components/ai/workspace/Workspace';
import { parseDeskRoute } from '@/lib/ai/desk-route';
import { symbolFromSlug } from '@/lib/ai/market-slug';

export const metadata: Metadata = {
  title: 'Workspace',
  description: 'Price, context and a second opinion on one screen.',
  // Not indexed while it is open: unlisted is the only protection it has.
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AiWorkspacePage({ params, searchParams }: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ ticket?: string; symbol?: string }>;
}) {
  const user = await getCurrentUser();
  // Sign in on THIS host and come back here — the desk does not hand anyone to
  // the admin panel.
  if (!user) redirect('/login?next=%2Fapp');

  const access = await getAdminAccess();
  if (!access?.isAdmin && !access?.sections.includes('trading-bot')) redirect('/profile');

  const {
    markets, configs, specs, closedTrades, equity, equityCurve, settings, proposals, lastUpdate,
    quotes,
  } = await getBotOverview();

  const route = parseDeskRoute((await params).slug);

  // Old links still work: ?symbol= and ?ticket= are in Telegram alerts already
  // sent, and in people's history. They resolve to the same place the new paths
  // point at rather than 404ing on a shape we stopped using.
  const q = await searchParams;
  const legacyTicket = q.ticket && Number.isFinite(Number(q.ticket)) ? Number(q.ticket) : null;
  const ticket = route.ticket ?? legacyTicket;

  const openOn = route.marketSlug
    ? symbolFromSlug(route.marketSlug, markets)
    : q.symbol
      ?? (ticket ? await symbolForTicket(ticket) : null);

  return (
    <Workspace
      markets={markets}
      quotes={quotes}
      configs={configs}
      specs={specs}
      closedTrades={closedTrades}
      equity={equity}
      equityCurve={equityCurve}
      settings={settings}
      proposals={proposals}
      lastUpdate={lastUpdate}
      section={route.section}
      openOn={openOn}
      openDetails={route.details}
      openTicket={ticket}
      // The person at the desk, not the address they signed in with. The email
      // is the fallback, because a nameless account is still somebody.
      user={{ name: user.full_name?.trim() || user.email || 'Signed in', initials: initialsOf(user) }}
    />
  );
}
