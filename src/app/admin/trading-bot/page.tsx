// /admin/trading-bot — tabbed monitor + the two allowed controls (lot size,
// close a trade). The server fetches everything; the client dashboard owns the
// tabs, the compact status/auto-refresh, and the interactive controls. The
// header chrome is intentionally minimal so the tab content gets the space.

import { TradingBotDashboard } from '@/components/admin/bot/TradingBotDashboard';
import { getBotOverview } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

export default async function TradingBotPage() {
  const data = await getBotOverview();
  return <TradingBotDashboard {...data} />;
}
