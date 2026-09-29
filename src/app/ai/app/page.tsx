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
import { getBotOverview } from '@/lib/admin/trading-bot-queries';
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

export default async function AiWorkspacePage() {
  const user = await getCurrentUser();
  // Sign in on THIS host and come back here — the desk does not hand anyone to
  // the admin panel.
  if (!user) redirect('/login?next=%2Fapp');

  const access = await getAdminAccess();
  if (!access?.isAdmin && !access?.sections.includes('trading-bot')) redirect('/profile');

  const {
    markets, configs, specs, closedTrades, equity, equityCurve, settings, proposals,
  } = await getBotOverview();

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
      user={{ name: user.email ?? 'Signed in', initials: initialsOf(user) }}
    />
  );
}
