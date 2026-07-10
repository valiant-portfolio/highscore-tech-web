'use server';

// Admin controls for the trading bot: change a market's lot size or enable/
// disable it. The bot reads these values each loop and obeys them.

import { revalidatePath } from 'next/cache';
import { serviceClient } from '@/lib/supabase/service';
import { checkSection } from './access';
import { logAudit } from './audit';

// Admins pass; staff pass if granted the 'trading-bot' section.
async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  return checkSection('trading-bot');
}

export type BotControlResult = { ok: boolean; message?: string };

export async function setLotSizeAction(symbol: string, lot: number): Promise<BotControlResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, message: gate.message };
  if (!Number.isFinite(lot) || lot <= 0) return { ok: false, message: 'Lot size must be greater than 0.' };

  const admin = serviceClient();
  const { error } = await admin.from('trading_bot_markets').update({ lot_size: lot }).eq('symbol', symbol);
  if (error) return { ok: false, message: `Could not save: ${error.message}` };

  await logAudit({ action: 'trading_bot.lot_size', targetType: 'trading_bot_market', targetId: symbol, notes: `lot=${lot}` });
  revalidatePath('/admin/trading-bot');
  return { ok: true };
}

export async function setMarketEnabledAction(symbol: string, enabled: boolean): Promise<BotControlResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, message: gate.message };

  const admin = serviceClient();
  const { error } = await admin.from('trading_bot_markets').update({ enabled }).eq('symbol', symbol);
  if (error) return { ok: false, message: `Could not save: ${error.message}` };

  await logAudit({
    action: 'trading_bot.enabled',
    targetType: 'trading_bot_market',
    targetId: symbol,
    notes: enabled ? 'enabled' : 'disabled',
  });
  revalidatePath('/admin/trading-bot');
  return { ok: true };
}
