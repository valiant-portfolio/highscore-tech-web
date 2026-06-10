// Public read of the team strip for the About page. Returns staff records
// with publicly-shareable fields only (name + role + optional photo url).
// CEO row is appended manually since the CEO has no staff record.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  photoUrl: string | null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function publicPhotoUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
  return `${base}/storage/v1/object/public/staff-photos/${path}`;
}

export async function listPublicTeam(): Promise<TeamMember[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('staff')
    .select('full_name, role_title, photo_url, salary_ngn')
    .eq('status', 'active')
    .order('salary_ngn', { ascending: false });
  if (error) {
    return [{ name: 'Victor Otung', role: 'Founder & Chief Executive', initials: 'VO', photoUrl: null }];
  }

  const ceo: TeamMember = {
    name: 'Victor Otung',
    role: 'Founder & Chief Executive',
    initials: 'VO',
    photoUrl: null,
  };

  const team: TeamMember[] = (data ?? []).map((s) => ({
    name: s.full_name as string,
    role: s.role_title as string,
    initials: initialsOf(s.full_name as string),
    photoUrl: publicPhotoUrl(s.photo_url as string | null),
  }));

  return [ceo, ...team];
}
