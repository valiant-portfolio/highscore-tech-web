// Server-only auth read helpers. Used by RSCs to gate access and shape UI
// based on the signed-in user. Never throws — pages decide what to do when
// `null` comes back.

import { createClient } from '@/lib/supabase/server';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'student' | 'staff' | 'admin';
}

// Returns the current user's joined row from `public.users`, or null if no
// session. Falls through cleanly when the DB is unreachable.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  // getUser() validates against Supabase, not just cookies — required if
  // we're going to make trust decisions.
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data) {
    // No row yet (race with handle_new_user trigger) — synthesise the minimum
    // shape so pages can keep rendering. Profile-edit will UPSERT.
    return {
      id: user.id,
      email: user.email ?? '',
      full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
      phone: null,
      avatar_url: null,
      role: 'student',
    };
  }
  return data as AuthUser;
}

// Convenience: short label for header avatar bubble.
export function initialsOf(user: Pick<AuthUser, 'full_name' | 'email'>): string {
  const source = user.full_name?.trim() || user.email;
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
