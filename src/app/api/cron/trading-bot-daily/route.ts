// POST /api/cron/trading-bot-daily — one end-of-day digest email to the ops
// mailboxes: today's realized P&L, win rate, best/worst, open positions, and
// the account line, with a per-market breakdown. Complements the per-event
// alerts. Schedule once daily (the Netlify function runs it at ~21:00 UTC).

import { NextResponse } from 'next/server';
import { checkCronSecret } from '@/lib/cron/guard';
import { serviceClient } from '@/lib/supabase/service';
import { sendTradingBotDaily } from '@/lib/email/send-helpers';

export const runtime = 'nodejs';

// Daily digest goes to admin only. (Per-event alerts still go to both — see
// /api/cron/trading-bot-notify.)
const RECIPIENTS = ['admin@highzcore.tech'];
const LAGOS_OFFSET_MS = 60 * 60 * 1000; // UTC+1, no DST

const money = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(n).toFixed(2)}`;
const signed = (n: number) => `${n >= 0 ? '+' : ''}${money(n)}`;

export async function POST(req: Request) {
  const gate = checkCronSecret(req);
  if (!gate.ok) return gate.response;

  const admin = serviceClient();

  // "Today" = the current calendar day in Lagos (UTC+1).
  const lagosNow = new Date(Date.now() + LAGOS_OFFSET_MS);
  const dayStartUtc = new Date(Date.UTC(lagosNow.getUTCFullYear(), lagosNow.getUTCMonth(), lagosNow.getUTCDate()) - LAGOS_OFFSET_MS);
  const dateLabel = lagosNow.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  const [closed, open, equityRes, heartbeatRes] = await Promise.all([
    admin.from('bot_trades').select('symbol, pnl, is_dry_run').not('close_ts', 'is', null).gte('close_ts', dayStartUtc.toISOString()),
    admin.from('bot_trades').select('symbol, pnl').is('close_ts', null),
    admin.from('bot_equity_snapshots').select('equity, balance, open_positions').order('ts', { ascending: false }).limit(1),
    admin.from('bot_market_state').select('updated_at').order('updated_at', { ascending: false }).limit(1),
  ]);

  const closedToday = closed.data ?? [];
  const pnls = closedToday.map((t) => Number(t.pnl) || 0);
  const net = pnls.reduce((a, b) => a + b, 0);
  const wins = pnls.filter((p) => p > 0).length;
  const losses = pnls.filter((p) => p < 0).length;
  const decided = wins + losses;
  const best = pnls.length ? Math.max(...pnls) : 0;
  const worst = pnls.length ? Math.min(...pnls) : 0;
  const floating = (open.data ?? []).reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const equity = equityRes.data?.[0];

  const lastUpdate = heartbeatRes.data?.[0]?.updated_at;
  const online = lastUpdate ? Date.now() - new Date(lastUpdate).getTime() < 5 * 60_000 : false;

  // Per-market breakdown for today.
  const byMarket = new Map<string, number>();
  for (const t of closedToday) byMarket.set(t.symbol, (byMarket.get(t.symbol) ?? 0) + (Number(t.pnl) || 0));
  const movers = [...byMarket.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([market, v]) => ({ market, value: signed(v), positive: v >= 0 }));

  const rows = [
    { label: 'Realized P&L', value: signed(net) },
    { label: 'Trades closed', value: String(closedToday.length) },
    { label: 'Win rate', value: decided ? `${Math.round((wins / decided) * 100)}% (${wins}W / ${losses}L)` : '—' },
    { label: 'Best / worst', value: `${signed(best)} / ${signed(worst)}` },
    { label: 'Open now', value: `${(open.data ?? []).length} · floating ${signed(floating)}` },
    { label: 'Equity / balance', value: equity ? `${money(Number(equity.equity))} / ${money(Number(equity.balance))}` : '—' },
    { label: 'Bot status', value: online ? 'online' : 'offline' },
  ];

  const res = await sendTradingBotDaily({
    to: RECIPIENTS,
    subject: `Trading bot · ${dateLabel} · ${signed(net)}${closedToday.length === 0 ? ' · no trades' : ''}`,
    dateLabel,
    online,
    netTodayLabel: signed(net),
    netTodayPositive: net >= 0,
    rows,
    movers,
  });

  return NextResponse.json({ ok: res.ok, closed: closedToday.length, net, sent: res.ok });
}
