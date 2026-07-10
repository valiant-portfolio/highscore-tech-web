import 'server-only';

// Staff self-service edit gate. A staff member may only edit their own profile
// (photo, NIN, password, phone, personal email, bank) once an admin has granted
// them the 'profile-edit' capability (stored in users.admin_sections).

import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export async function checkProfileEdit(): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };
  const admin = serviceClient();
  const { data } = await admin.from('users').select('admin_sections').eq('id', user.id).maybeSingle();
  const caps = (data?.admin_sections as string[] | null) ?? [];
  if (!caps.includes('profile-edit')) {
    return { ok: false, message: 'You do not have access to edit your profile. Ask an admin to grant it.' };
  }
  return { ok: true, userId: user.id };
}
