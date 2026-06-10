// Supabase client for server-side operations (RSC, route handlers, server actions).
//
// Defaults to `any` Database; pass `<Database>` for new code. See client.ts
// for the same pattern.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultDb = any;

export const createClient = async <D = DefaultDb>() => {
  const cookieStore = await cookies();

  return createServerClient<D>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll() called from a Server Component — safe to ignore if
            // middleware refreshes sessions.
          }
        },
      },
    },
  );
};
