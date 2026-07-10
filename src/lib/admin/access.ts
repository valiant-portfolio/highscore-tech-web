import 'server-only';

// Server-side permission checks for admin sections. Admins pass everything;
// staff pass only the sections listed in their `users.admin_sections`.
//
// Two flavours to match the two calling conventions already in the codebase:
//   • requireSection(key)  — throws on failure (for `await requireX()` callers)
//   • checkSection(key)     — returns a {ok} result (for `if (!gate.ok)` callers)

import { createClient } from '@/lib/supabase/server';
import { ADMIN_SECTION_KEYS } from './sections';

export interface AdminAccess {
  userId: string;
  isAdmin: boolean;
  sections: string[]; // effective keys — admins get the full list
}

// Reads the signed-in user's role + granted sections. Returns null if there is
// no session at all.
export async function getAdminAccess(): Promise<AdminAccess | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('users')
    .select('role, admin_sections')
    .eq('id', user.id)
    .maybeSingle();
  const isAdmin = data?.role === 'admin';
  const granted = (data?.admin_sections as string[] | null) ?? [];
  return { userId: user.id, isAdmin, sections: isAdmin ? [...ADMIN_SECTION_KEYS] : granted };
}

function allows(access: AdminAccess | null, section: string): boolean {
  return !!access && (access.isAdmin || access.sections.includes(section));
}

// Throwing variant. Returns the user id so callers can attribute audit rows.
export async function requireSection(section: string): Promise<{ userId: string }> {
  const access = await getAdminAccess();
  if (!access) throw new Error('Not signed in.');
  if (!allows(access, section)) throw new Error('Not authorised.');
  return { userId: access.userId };
}

// Result variant, matching the {ok:true,userId}|{ok:false,message} shape used by
// the finance / project / trading-bot / signature action files.
export async function checkSection(
  section: string,
): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  const access = await getAdminAccess();
  if (!access) return { ok: false, message: 'Sign in first.' };
  if (!allows(access, section)) return { ok: false, message: 'You do not have access to this area.' };
  return { ok: true, userId: access.userId };
}

// Strict admin-only gate — for actions that must never be delegated, above all
// the permission-granting action itself (a staff-section holder must not be able
// to grant themselves more sections).
export async function requireStrictAdmin(): Promise<{ userId: string }> {
  const access = await getAdminAccess();
  if (!access) throw new Error('Not signed in.');
  if (!access.isAdmin) throw new Error('Not authorised.');
  return { userId: access.userId };
}
