// Service-role client for the TRADING BOT's Supabase project.
//
// This is a DIFFERENT Supabase project from the main app: the bot has its own
// instance so its write volume and schema can never affect users/payments/staff.
// See .env.local — NEXT_PUBLIC_BOT_SUPABASE_URL, not NEXT_PUBLIC_SUPABASE_URL.
//
// Server-only, bypasses RLS. NEVER import from a file marked 'use client'.
// Auth still runs against the main project — use @/lib/supabase/server for that.

import 'server-only';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultDb = any;

export function botServiceClient<D = DefaultDb>(): SupabaseClient<D> {
  const url = process.env.NEXT_PUBLIC_BOT_SUPABASE_URL;
  const key = process.env.BOT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Bot Supabase client not configured: set NEXT_PUBLIC_BOT_SUPABASE_URL and ' +
        'BOT_SUPABASE_SERVICE_ROLE_KEY (the bot project\'s service_role key).',
    );
  }
  return createSupabaseClient<D>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
