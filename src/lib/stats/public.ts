// Public-facing stat counts for the home page social-proof block.
// Cookie-free anon client so we can use it at build time too.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export interface PublicStats {
  projectCount: number;
}

// Display floor for shipped projects. A freshly-seeded portfolio showing "0+"
// reads as a company that has never delivered anything; hold the floor until
// the real count passes it.
const PROJECT_FLOOR = 10;

// Teaching is retired from the public site, so the student/course counts that
// used to sit beside this one are gone — the strip now leads with shipped work.
export async function getPublicStats(): Promise<PublicStats> {
  const supabase = anonClient();
  const p = await supabase
    .from('portfolio_projects')
    .select('id', { count: 'exact', head: true })
    .eq('published', true);
  return {
    projectCount: Math.max(PROJECT_FLOOR, p.count ?? 0),
  };
}
