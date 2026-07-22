'use server';

// Admin controls for the trading bot — the only writes the frontend is allowed
// (per trading-bot-db/BACKEND_V1.md): set a market's lot size, and queue a
// "close" command. The engine itself is never exposed. Gated by the
// 'trading-bot' section; writes go through the service client.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { requireSection } from './access';

type Result<T = undefined> = { ok: true; value?: T } | { ok: false; error: string };

/** Snap `v` to `step` and clamp into [min, max] — mirrors the bot's validation. */
function clampSnap(v: number, min: number, max: number, step: number): number {
  let x = v;
  if (step > 0) x = Math.round(x / step) * step;
  if (x < min) x = min;
  if (x > max) x = max;
  // Kill floating-point dust from the rounding (e.g. 0.30000000000000004).
  const decimals = (String(step).split('.')[1] || '').length;
  return Number(x.toFixed(Math.min(decimals || 2, 8)));
}

/**
 * Set a market's lot size. `null` = use the broker minimum. Any number is
 * validated against the broker's min/max/step (from bot_symbols) so an
 * impossible size can't be stored; the returned value is what was actually
 * saved after clamping/snapping.
 */
export async function setLotSizeAction(symbol: string, lot: number | null): Promise<Result<number | null>> {
  await requireSection('trading-bot');
  const admin = serviceClient();

  let saved: number | null = null;
  if (lot != null) {
    if (!Number.isFinite(lot) || lot <= 0) return { ok: false, error: 'Enter a positive lot size.' };
    const { data: spec } = await admin
      .from('bot_symbols')
      .select('volume_min, volume_max, volume_step')
      .eq('name', symbol)
      .maybeSingle();
    saved = spec
      ? clampSnap(lot, Number(spec.volume_min), Number(spec.volume_max), Number(spec.volume_step))
      : Number(lot.toFixed(2)); // no broker spec on file → store as-is; the bot re-validates
  }

  const { error } = await admin
    .from('bot_symbol_config')
    .update({ lot_size: saved, updated_at: new Date().toISOString() })
    .eq('symbol', symbol);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/trading-bot');
  return { ok: true, value: saved };
}

/**
 * Toggle whether the bot may trade a market. Writes bot_symbol_config.enabled.
 * Per BACKEND_V1 the bot treats `enabled` as reserved (it currently trades any
 * market with a strategy) — so this records intent and takes effect once the
 * engine honours the flag. It never touches open positions; use close for that.
 */
export async function setMarketEnabledAction(symbol: string, enabled: boolean): Promise<Result> {
  await requireSection('trading-bot');
  const admin = serviceClient();
  const { error } = await admin
    .from('bot_symbol_config')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('symbol', symbol);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/trading-bot');
  return { ok: true };
}

/** Who issued a command, for the bot_commands.created_by audit trail. */
async function issuer(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email ?? 'admin';
}

/**
 * Queue a close command. `ticket = null` closes ALL positions on the symbol.
 * The bot picks the row up within a poll cycle, executes, and writes the
 * outcome back to the same row (status done/failed, note).
 */
export async function closePositionAction(symbol: string, ticket: number | null): Promise<Result> {
  await requireSection('trading-bot');
  const admin = serviceClient();
  const createdBy = await issuer();

  const { error } = await admin.from('bot_commands').insert({
    command: 'close', symbol, ticket, created_by: createdBy,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/trading-bot');
  return { ok: true };
}

/**
 * Kill switch: flatten every open position. Queues one close command per symbol
 * that currently has an open trade (ticket null = all on that symbol), using
 * only documented per-symbol behaviour. Returns how many symbols were queued.
 */
export async function closeAllPositionsAction(): Promise<Result<number>> {
  await requireSection('trading-bot');
  const admin = serviceClient();
  const createdBy = await issuer();

  const { data: open } = await admin.from('bot_trades').select('symbol').is('close_ts', null);
  const symbols = Array.from(new Set((open ?? []).map((r: { symbol: string }) => r.symbol)));
  if (symbols.length === 0) return { ok: true, value: 0 };

  const { error } = await admin.from('bot_commands').insert(
    symbols.map((symbol) => ({ command: 'close', symbol, ticket: null, created_by: createdBy })),
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/trading-bot');
  return { ok: true, value: symbols.length };
}
