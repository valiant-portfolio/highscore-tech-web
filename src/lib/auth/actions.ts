'use server';

// Auth server actions — signup, login, logout, password reset, profile edit.
// All are called from form action attributes via useActionState; each
// returns a consistent { status, message, fieldErrors? } shape.

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export type AuthFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Where to send a freshly-signed-in user. If they came in from a course
// link (?course=frontend), bounce them to the course detail so they can
// enrol once payments land in M5.
function postAuthRedirect(courseSlug?: string | null): string {
  if (courseSlug && /^[a-z0-9-]+$/.test(courseSlug)) {
    return `/academy/${courseSlug}`;
  }
  return '/profile';
}

// ────────────────────────────────────────────────────────────────────────
// signUpAction — creates auth.users + (via trigger) public.users
// ────────────────────────────────────────────────────────────────────────
export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const fullName  = String(formData.get('full_name')  ?? '').trim();
  const email     = String(formData.get('email')      ?? '').trim().toLowerCase();
  const password  = String(formData.get('password')   ?? '');
  const courseSlug = String(formData.get('course')    ?? '').trim() || null;

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.full_name = 'Tell us your name.';
  if (!email)    fieldErrors.email     = 'We need an email.';
  else if (!EMAIL_RE.test(email)) fieldErrors.email = "That email doesn't look right.";
  if (!password) fieldErrors.password = 'Pick a password.';
  else if (password.length < 8) fieldErrors.password = 'At least 8 characters please.';

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(postAuthRedirect(courseSlug))}`,
    },
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  // If Supabase auto-confirms (email confirmation off in project settings),
  // there's a session and we can drop them straight in. Otherwise tell
  // them to check their inbox.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect(postAuthRedirect(courseSlug));
  }

  return {
    status: 'success',
    message: `We sent a confirmation link to ${email}. Click it to finish signing up.`,
  };
}

// ────────────────────────────────────────────────────────────────────────
// loginAction
// ────────────────────────────────────────────────────────────────────────
export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email    = String(formData.get('email')    ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next     = String(formData.get('next')     ?? '').trim() || null;

  const fieldErrors: Record<string, string> = {};
  if (!email)    fieldErrors.email    = 'Email required.';
  if (!password) fieldErrors.password = 'Password required.';
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { status: 'error', message: 'Wrong email or password.' };
  }

  // Former staff must not be able to sign in — even if their auth user was
  // never banned (e.g. they were offboarded before bans existed). Check with
  // the service client so RLS can't hide the row, then sign the session out.
  if (data.user) {
    const admin = serviceClient();
    const { data: staffRow } = await admin
      .from('staff')
      .select('status')
      .eq('user_id', data.user.id)
      .maybeSingle();
    if (staffRow?.status === 'former') {
      await supabase.auth.signOut();
      return {
        status: 'error',
        message: 'This account has been deactivated. Please contact Highscore Tech if you believe this is a mistake.',
      };
    }
  }

  // Role-aware default landing: admins to /admin, staff to /staff,
  // students to /profile (or /onboarding if not yet onboarded).
  // An explicit ?next= always wins (e.g. middleware redirect from a guarded route).
  let landing = '/profile';
  if (data.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, onboarded_at')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profile?.role === 'admin') landing = '/admin';
    else if (profile?.role === 'staff') landing = '/staff';
    else if (!profile?.onboarded_at) landing = '/onboarding';
  }

  revalidatePath('/', 'layout');
  redirect(next && next.startsWith('/') ? next : landing);
}

// ────────────────────────────────────────────────────────────────────────
// logoutAction
// ────────────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ────────────────────────────────────────────────────────────────────────
// requestPasswordResetAction
// ────────────────────────────────────────────────────────────────────────
export async function requestPasswordResetAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return { status: 'error', message: 'Enter the email on your account.', fieldErrors: { email: 'Invalid email.' } };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/profile`,
  });
  if (error) {
    return { status: 'error', message: 'Could not send a reset link — try again.' };
  }
  return {
    status: 'success',
    message: `If an account exists for ${email}, a reset link is on its way.`,
  };
}

// ────────────────────────────────────────────────────────────────────────
// updateProfileAction — name + phone
// ────────────────────────────────────────────────────────────────────────
export async function updateProfileAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const phone    = String(formData.get('phone')     ?? '').trim();

  if (!fullName) {
    return { status: 'error', message: 'Name required.', fieldErrors: { full_name: 'Required.' } };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Not signed in.' };

  const { error } = await supabase
    .from('users')
    .update({ full_name: fullName, phone: phone || null })
    .eq('id', user.id);
  if (error) {
    return { status: 'error', message: 'Could not save — try again.' };
  }
  revalidatePath('/profile');
  return { status: 'success', message: 'Profile updated.' };
}
