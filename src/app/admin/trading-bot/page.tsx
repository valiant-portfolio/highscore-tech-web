// /admin/trading-bot — tabbed read-only monitor + the two allowed controls
// (lot size, close a trade). Overview · Markets · Open positions · Transactions.
// The server fetches everything; the client dashboard owns the tabs, the
// interactive controls, and the 30s auto-refresh. See trading-bot-db/BACKEND_V1.md.

import { PageHead } from '@/components/admin/AdminPage';
import { TradingBotDashboard, BotStatus } from '@/components/admin/bot/TradingBotDashboard';
import { getBotOverview } from '@/lib/admin/trading-bot-queries';

export const dynamic = 'force-dynamic';

export default async function TradingBotPage() {
  const data = await getBotOverview();

  return (
    <>
      <PageHead
        title="Trading bot"
        description="Live monitor + controls. The bot trades autonomously; here you size markets and can close positions."
        actions={<BotStatus lastUpdate={data.lastUpdate} />}
      />
      <TradingBotDashboard {...data} />
    </>
  );
}
