'use server';

// Staff NIN upload — saves the file under nin-docs/<user.id>/nin.<ext> and
// writes the path to users.nin_doc_url. Replacing existing upload is fine
// (upsert: true).

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export type NinUploadState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

export async function uploadStaffNinAction(_prev: NinUploadState, formData: FormData): Promise<NinUploadState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Sign in to upload.' };

  const admin = serviceClient();

  // Confirm caller is a linked, active staff member.
  const { data: staff } = await admin.from('staff').select('id, status').eq('user_id', user.id).maybeSingle();
  if (!staff)                      return { status: 'error', message: 'You are not registered as staff.' };
  if (staff.status !== 'active')   return { status: 'error', message: 'Your staff record is not active.' };

  const file = formData.get('nin_doc') as File | null;
  if (!file || file.size === 0) return { status: 'error', message: 'Pick a file.', fieldErrors: { nin_doc: 'Required.' } };
  if (file.size > 5 * 1024 * 1024) return { status: 'error', message: 'File too big (5 MB max).' };
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type))
    return { status: 'error', message: 'JPG, PNG, or PDF only.' };

  const ext = file.type === 'application/pdf' ? 'pdf' : (file.type === 'image/png' ? 'png' : 'jpg');
  const path = `${user.id}/nin.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage.from('nin-docs').upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (upErr) return { status: 'error', message: `Upload failed: ${upErr.message}` };

  await admin.from('users').update({ nin_doc_url: path }).eq('id', user.id);

  revalidatePath('/staff');
  revalidatePath('/admin/nin-docs');
  return { status: 'success', message: 'NIN uploaded. Only admin can view it.' };
}
