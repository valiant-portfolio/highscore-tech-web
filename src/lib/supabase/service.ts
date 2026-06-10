// Service-role Supabase client — bypasses RLS. Server-only.
//
// NEVER import from any file marked `'use client'`. Never expose to the
// browser. Use only for trusted server flows: webhook handlers, cron jobs,
// admin operations, and the privileged side of OAuth/telegram-link.
//
// Defaults to `any` Database for legacy callers; pass `<Database>` for new
// code to get typed Tables/Functions:
//
//   const admin = serviceClient<Database>();
//
// Each call creates a fresh client — admin/service operations are infrequent
// enough that caching isn't worth the type-erasure tradeoff it caused.

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultDb = any;

export function serviceClient<D = DefaultDb>(): SupabaseClient<D> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Service client not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    );
  }
  return createSupabaseClient<D>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
