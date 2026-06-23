'use server';

// Admin controls for the trading bot: change a market's lot size or enable/
// disable it. The bot reads these values each loop and obeys them.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { logAudit } from './audit';

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Sign in first.' };
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return { ok: false, message: 'Admin only.' };
  return { ok: true, userId: user.id };
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
