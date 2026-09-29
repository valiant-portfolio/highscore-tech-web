// The workspace — where "Open App" lands.
//
// On ai.highzcore.tech the proxy serves this at /app, so the nav button goes
// somewhere real.
//
// The data is the existing bot's, unchanged — getBotOverview() is the same
// call /bot makes. One source, two skins.
//
// NO SIGN-IN, ON INSTRUCTION, FOR NOW. Read that plainly: this page shows a
// real account's balance, equity, open positions and trade history to anyone
// who has the URL, on a public subdomain. It is not linked from anywhere a
// crawler follows, which is not the same as private. Put the guard back — the
// four lines below the import block — before this is shown to anyone outside
// the team.

import type { Metadata } from 'next';
import { getBotOverview } from '@/lib/admin/trading-bot-queries';
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
  // Read the session if there is one — it names the desk in the rail — but do
  // not require it.
  const user = await getCurrentUser().catch(() => null);

  const { markets, closedTrades, equity, settings, proposals } = await getBotOverview();

  return (
    <Workspace
      markets={markets}
      closedTrades={closedTrades}
      equity={equity}
      settings={settings}
      proposals={proposals}
      user={user
        ? { name: user.email ?? 'Signed in', initials: initialsOf(user) }
        : { name: 'Highscore desk', initials: 'HS' }}
    />
  );
}
