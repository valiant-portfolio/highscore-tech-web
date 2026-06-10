'use server';

// Two-step signing flow for staff:
//   1. uploadSignatureAction — takes a phone photo of a paper signature,
//      removes the white background, stores under signatures/<user.id>/
//      and points staff.signature_url at the result.
//   2. signNdaAction — sets staff.nda_signed_at, kicking the payroll rule
//      from 5th-of-month to 15th-of-month for that employee.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { removeSignatureBackground } from '@/lib/signature/processor';

export type SigActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

interface StaffContextStaff {
  id: string;
  user_id: string;
  slug: string;
  signature_url: string | null;
  nda_signed_at: string | null;
  status: 'active' | 'former';
}
interface StaffContext {
  ok: true;
  staff: StaffContextStaff;
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any;
}
interface StaffContextError { ok: false; error: string }

async function loadCurrentStaff(): Promise<StaffContext | StaffContextError> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };
  const admin = serviceClient();
  const { data: staff } = await admin
    .from('staff')
    .select('id, user_id, slug, signature_url, nda_signed_at, status')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!staff) return { ok: false, error: 'You are not registered as staff.' };
  if (staff.status !== 'active') return { ok: false, error: 'Your staff record is not active.' };
  return { ok: true, staff: staff as StaffContextStaff, userId: user.id, admin };
}

export async function uploadSignatureAction(_prev: SigActionState, formData: FormData): Promise<SigActionState> {
  const ctx = await loadCurrentStaff();
  if (!ctx.ok) return { status: 'error', message: ctx.error };

  const file = formData.get('signature') as File | null;
  if (!file || file.size === 0) {
    return { status: 'error', message: 'Pick a photo of your signature.', fieldErrors: { signature: 'Required.' } };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { status: 'error', message: 'File too large (8 MB max).', fieldErrors: { signature: 'Too large.' } };
  }
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return { status: 'error', message: 'JPG or PNG only.', fieldErrors: { signature: 'Wrong format.' } };
  }

  let processed: Buffer;
  try {
    const raw = Buffer.from(await file.arrayBuffer());
    processed = await removeSignatureBackground(raw);
  } catch (err) {
    return {
      status: 'error',
      message: `Couldn't process the image: ${err instanceof Error ? err.message : 'unknown'}. Make sure the background is white and the signature is clear.`,
    };
  }

  const path = `${ctx.userId}/signature.png`;
  const { error: uploadErr } = await ctx.admin.storage.from('signatures').upload(path, processed, {
    contentType: 'image/png',
    upsert: true,
  });
  if (uploadErr) {
    return { status: 'error', message: `Upload failed: ${uploadErr.message}` };
  }

  await ctx.admin.from('staff').update({ signature_url: path }).eq('id', ctx.staff.id);
  revalidatePath('/staff');
  return { status: 'success', message: 'Signature processed and saved. Review the preview, then sign below to finalise.' };
}

export async function signNdaAction(_prev: SigActionState, _formData: FormData): Promise<SigActionState> {
  const ctx = await loadCurrentStaff();
  if (!ctx.ok) return { status: 'error', message: ctx.error };

  if (!ctx.staff.signature_url) {
    return { status: 'error', message: 'Upload your signature first.' };
  }
  if (ctx.staff.nda_signed_at) {
    return { status: 'success', message: 'You already signed. Your contract is on file.' };
  }

  const now = new Date().toISOString();
  await ctx.admin.from('staff').update({ nda_signed_at: now }).eq('id', ctx.staff.id);
  revalidatePath('/staff');
  return {
    status: 'success',
    message: `Signed and on file (${new Date(now).toLocaleString('en-GB')}). Your contract and NDA are confirmed.`,
  };
}

// Admin can reset a staff signature (e.g. employee asked to re-upload).
export async function adminResetStaffSignatureAction(staffId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return;
  const admin = serviceClient();
  await admin.from('staff').update({ signature_url: null, nda_signed_at: null }).eq('id', staffId);
  revalidatePath('/admin/staff');
  revalidatePath('/staff');
}
