'use server';

// Staff-portal server actions. The legacy cookie email-gate is gone — staff
// log in via /login like anyone else. The actions here cover password
// change + profile edits that the staff dashboard exposes.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

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
// Lets a staff member update their own phone + display name. Other fields
// (salary, role, contract) are admin-only and live in /admin/staff.
export async function updateStaffProfileAction(_prev: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const phone    = String(formData.get('phone')     ?? '').trim();

  if (!fullName) {
    return { status: 'error', message: 'Name required.', fieldErrors: { full_name: 'Required.' } };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Not signed in.' };

  const admin = serviceClient();
  await admin.from('users').update({ full_name: fullName, phone: phone || null }).eq('id', user.id);
  revalidatePath('/staff');
  return { status: 'success', message: 'Profile updated.' };
}
