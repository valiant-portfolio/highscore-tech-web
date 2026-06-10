// Supabase client for browser-side operations.
//
// The Database generic defaults to `any` so legacy code keeps compiling while
// we rebuild the schema. New code should pass the typed Database:
//
//   import { createClient } from '@/lib/supabase/client';
//   import type { Database } from '@/lib/supabase/types';
//   const supabase = createClient<Database>();

import { createBrowserClient } from '@supabase/ssr';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultDb = any;

export const createClient = <D = DefaultDb>() =>
  createBrowserClient<D>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
