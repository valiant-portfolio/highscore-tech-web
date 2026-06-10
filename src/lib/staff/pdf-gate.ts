// Auth-based gate for the four /api/staff/[slug]/*.pdf routes. Confirms the
// caller is either:
//   (a) the staff member whose slug is being requested, OR
//   (b) an admin.
// Returns the StaffRecord on pass; otherwise a 403/404 Response.

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { getStaffBySlug, type StaffRecord } from './queries';

export async function gateStaffPdf(slug: string): Promise<
  { ok: true; staff: StaffRecord } | { ok: false; response: Response }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: new Response('Sign in required.', { status: 401 }) };
  }

  const staff = await getStaffBySlug(slug);
  if (!staff) {
    return { ok: false, response: new Response('Staff record not found.', { status: 404 }) };
  }

  // Allow either the linked staff user themselves, or any admin.
  if (staff.user_id !== user.id) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.role !== 'admin') {
      return { ok: false, response: new Response('Forbidden.', { status: 403 }) };
    }
  }

  return { ok: true, staff };
}

export function formatIssuedDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
}
