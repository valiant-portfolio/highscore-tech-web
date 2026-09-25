// bot.highzcore.tech — tabbed monitor + the two allowed controls (lot size,
// close a trade). The server fetches everything; the client dashboard owns the
// tabs, the compact status/auto-refresh, and the interactive controls. The
// header chrome is intentionally minimal so the tab content gets the space.

import { TradingBotDashboard } from '@/components/admin/bot/TradingBotDashboard';
import { getBotOverview, getTrainingIssues } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

export default async function TradingBotPage() {
  // Fetched alongside the overview rather than inside it: the training list is
  // the one view that is not about right now, and it has no business slowing
  // the desk's first paint any more than it already does.
  const [data, issues] = await Promise.all([getBotOverview(), getTrainingIssues()]);
  return <TradingBotDashboard {...data} issues={issues} />;
}
