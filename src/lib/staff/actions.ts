'use server';

// Staff-portal server actions. The legacy cookie email-gate is gone — staff
// log in via /login like anyone else. The actions here cover password
// change + profile edits that the staff dashboard exposes.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { checkProfileEdit } from './access';

export type StaffActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

// ── changePasswordAction ──────────────────────────────────────────────────
// Used by staff and student settings panels. Requires the caller to know
// their current password (Supabase doesn't expose a non-current-password
// flow except via password reset email).
export async function changePasswordAction(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const current = String(formData.get('current_password') ?? '');
  const next    = String(formData.get('new_password')     ?? '');
  const confirm = String(formData.get('confirm_password') ?? '');

  const errors: Record<string, string> = {};
  if (!current) errors.current_password = 'Enter your current password.';
  if (!next)    errors.new_password     = 'Enter a new password.';
  else if (next.length < 8) errors.new_password = 'At least 8 characters please.';
  if (next !== confirm) errors.confirm_password = "Passwords don't match.";
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: errors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { status: 'error', message: 'Not signed in.' };
  }

  // Staff members may only change their password once granted 'profile-edit'.
  // Students (no staff row) are unaffected — this action serves both panels.
  {
    const admin = serviceClient();
    const { data: staffRow } = await admin.from('staff').select('id').eq('user_id', user.id).maybeSingle();
    if (staffRow) {
      const { data: meRow } = await admin.from('users').select('admin_sections').eq('id', user.id).maybeSingle();
      const caps = (meRow?.admin_sections as string[] | null) ?? [];
      if (!caps.includes('profile-edit')) {
        return { status: 'error', message: 'You do not have access to change your password. Ask an admin to grant profile access.' };
      }
    }
  }

  // Re-authenticate using the current password to confirm ownership.
  const { error: signinErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signinErr) {
    return {
      status: 'error',
      message: 'Current password is wrong.',
      fieldErrors: { current_password: 'Wrong password.' },
    };
  }

  const { error: updErr } = await supabase.auth.updateUser({ password: next });
  if (updErr) {
    return { status: 'error', message: `Could not update password: ${updErr.message}` };
  }

  return { status: 'success', message: 'Password updated. New password is active immediately.' };
}

// ── updateStaffProfileAction ──────────────────────────────────────────────
// Lets a staff member update their own phone + personal email. Name and work
// email are admin-controlled; salary, role and contract live in /admin/staff.
// Requires the admin-granted 'profile-edit' capability.
export async function updateStaffProfileAction(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const phone         = String(formData.get('phone') ?? '').trim();
  const personalEmail = String(formData.get('personal_email') ?? '').trim().toLowerCase();

  if (personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
    return { status: 'error', message: 'Enter a valid personal email.', fieldErrors: { personal_email: 'Invalid email.' } };
  }

  const gate = await checkProfileEdit();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const admin = serviceClient();
  await admin.from('users').update({ phone: phone || null }).eq('id', gate.userId);
  await admin.from('staff').update({ personal_email: personalEmail || null }).eq('user_id', gate.userId);
  revalidatePath('/staff');
  return { status: 'success', message: 'Profile updated.' };
}
