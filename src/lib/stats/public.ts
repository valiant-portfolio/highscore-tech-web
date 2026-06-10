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
  courseCount: number;
  studentCount: number;
  projectCount: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  const supabase = anonClient();
  const [c, s, p] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).in('status', ['active', 'completed']),
    supabase.from('portfolio_projects').select('id', { count: 'exact', head: true }).eq('published', true),
  ]);
  return {
    courseCount:  c.count ?? 0,
    studentCount: s.count ?? 0,
    projectCount: p.count ?? 0,
  };
}
