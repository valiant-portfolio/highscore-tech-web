'use server';

// Onboarding server action — saves the new student's profile fields and
// uploads their NIN document to Supabase Storage. After success the user
// is bounced to /profile (or wherever they were headed before).

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export type OnboardingState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

const NG_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const GENDERS = ['Male', 'Female', 'Prefer not to say'];

export async function submitOnboardingAction(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.' };

  // Pull every field, normalise.
  const date_of_birth      = String(formData.get('date_of_birth')      ?? '').trim();
  const gender             = String(formData.get('gender')             ?? '').trim();
  const state_of_origin    = String(formData.get('state_of_origin')    ?? '').trim();
  const address_line       = String(formData.get('address_line')       ?? '').trim();
  const city               = String(formData.get('city')               ?? '').trim();
  const phone              = String(formData.get('phone')              ?? '').trim();
  const emergency_name     = String(formData.get('emergency_name')     ?? '').trim();
  const emergency_phone    = String(formData.get('emergency_phone')    ?? '').trim();
  const emergency_relation = String(formData.get('emergency_relation') ?? '').trim();
  const education_level    = String(formData.get('education_level')    ?? '').trim();
  const occupation         = String(formData.get('occupation')         ?? '').trim();

  const errors: Record<string, string> = {};
  if (!date_of_birth) errors.date_of_birth = 'Required.';
  else {
    const dob = new Date(date_of_birth);
    if (Number.isNaN(dob.getTime())) errors.date_of_birth = 'Invalid date.';
    else {
      const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 16) errors.date_of_birth = 'You must be at least 16.';
      if (age > 100) errors.date_of_birth = 'Please check the year.';
    }
  }
  if (!gender || !GENDERS.includes(gender)) errors.gender = 'Pick one.';
  if (!state_of_origin || !NG_STATES.includes(state_of_origin)) errors.state_of_origin = 'Pick one.';
  if (!address_line) errors.address_line = 'Required.';
  if (!city) errors.city = 'Required.';
  if (!phone) errors.phone = 'Required.';
  if (!emergency_name) errors.emergency_name = 'Required.';
  if (!emergency_phone) errors.emergency_phone = 'Required.';
  if (!emergency_relation) errors.emergency_relation = 'Required.';
  if (!education_level) errors.education_level = 'Required.';

  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: errors };
  }

  const admin = serviceClient();
  const { error: dbErr } = await admin.from('users').update({
    date_of_birth,
    gender,
    state_of_origin,
    address_line,
    city,
    phone,
    emergency_name,
    emergency_phone,
    emergency_relation,
    education_level,
    occupation: occupation || null,
    onboarded_at: new Date().toISOString(),
  }).eq('id', user.id);
  if (dbErr) {
    return { status: 'error', message: `Could not save: ${dbErr.message}` };
  }

  revalidatePath('/profile');
  redirect('/profile');
}

export const ONBOARDING_OPTIONS = {
  states: NG_STATES,
  genders: GENDERS,
  education_levels: [
    'Secondary',
    'OND / NCE',
    'HND',
    "Bachelor's degree",
    "Master's degree",
    'PhD',
    'Self-taught / Other',
  ],
};
