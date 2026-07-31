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
  // Admin sections this user may access (keys from lib/admin/sections.ts).
  // Empty for everyone except staff an admin has granted. Admins ignore it.
  admin_sections: string[];
}

// Returns the current user's joined row from `public.users`, or null if no
// session. NEVER throws — pages decide what to do when `null` comes back.
//
// Why the try/catch matters: getUser()/the DB read can *reject* (not just
// return an `error`) on a transient network hiccup, a Netlify cold start, or a
// token-refresh race in the first request right after login. An unhandled
// reject here crashes the server render → a 500 → the browser's "This page
// couldn't load", which a reload then fixes. We instead retry the transient
// case once and fall through to null so the caller redirects cleanly.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  // getUser() validates against Supabase, not just cookies — required if
  // we're going to make trust decisions. Retry once on a *thrown* failure
  // (the second attempt runs against an already-warm function / settled
  // cookies, which is what a manual reload was doing by hand).
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return null;          // genuine auth error → no valid session
      user = data.user;
      break;
    } catch {
      if (attempt === 1) return null;  // transient twice — give up gracefully
    }
  }
  if (!user) return null;

  // Minimum shape when the DB row isn't readable — a race with the
  // handle_new_user trigger, or a transient read failure. Profile-edit UPSERTs.
  const fallback: AuthUser = {
    id: user.id,
    email: user.email ?? '',
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    phone: null,
    avatar_url: null,
    role: 'student',
    admin_sections: [],
  };

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, avatar_url, role, admin_sections')
      .eq('id', user.id)
      .maybeSingle();
    if (error || !data) return fallback;
    return { ...data, admin_sections: (data.admin_sections as string[] | null) ?? [] } as AuthUser;
  } catch {
    return fallback; // DB unreachable — keep rendering rather than 500
  }
}

// Convenience: short label for header avatar bubble.
export function initialsOf(user: Pick<AuthUser, 'full_name' | 'email'>): string {
  const source = user.full_name?.trim() || user.email;
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
