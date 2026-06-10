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

// Display floor for the student count. Shows "100+" until we have more
// than 100 real active enrolments — a blank "0+" on a freshly-launched
// site scares prospective students away. Once real numbers cross the
// floor, the actual count shows.
const STUDENT_FLOOR = 100;

export async function getPublicStats(): Promise<PublicStats> {
  const supabase = anonClient();
  const [c, s, p] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).in('status', ['active', 'completed']),
    supabase.from('portfolio_projects').select('id', { count: 'exact', head: true }).eq('published', true),
  ]);
  return {
    courseCount:  c.count ?? 0,
    studentCount: Math.max(STUDENT_FLOOR, s.count ?? 0),
    projectCount: p.count ?? 0,
  };
}
