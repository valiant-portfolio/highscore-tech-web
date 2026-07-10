'use server';

// CEO signature management. Same pipeline as staff signatures (sharp
// luminance background removal via Otsu) but stored at a fixed path
// (`signatures/ceo/signature.png`) so every PDF + LetterPaper preview
// can resolve it the same way. Admin-only.

import { revalidatePath } from 'next/cache';
import { serviceClient } from '@/lib/supabase/service';
import { removeSignatureBackground } from '@/lib/signature/processor';
import { clearCeoSignatureCache } from '@/lib/staff/signature-loader';
import { checkSection } from './access';
import { logAudit } from './audit';
import type { SigActionState } from '@/lib/staff/signature-actions';

const CEO_PATH = 'ceo/signature.png';

// The CEO signature lives on the Settings page — admins pass; staff pass if
// granted the 'settings' section.
async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; message: string }> {
  return checkSection('settings');
}

export async function uploadCeoSignatureAction(
  _prev: SigActionState,
  formData: FormData,
): Promise<SigActionState> {
  const gate = await requireAdmin();
  if (!gate.ok) return { status: 'error', message: gate.message };

  const file = formData.get('signature') as File | null;
  if (!file || file.size === 0) return { status: 'error', message: 'Pick a signature image.' };
  if (file.size > 10 * 1024 * 1024) return { status: 'error', message: 'File too big (10 MB max).' };
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return { status: 'error', message: 'JPG or PNG only.' };
  }

  const raw = Buffer.from(await file.arrayBuffer());
  let processed: Buffer;
  try {
    processed = await removeSignatureBackground(raw);
  } catch (err) {
    return { status: 'error', message: `Could not process image: ${err instanceof Error ? err.message : 'unknown'}` };
  }

  const admin = serviceClient();
  const { error: upErr } = await admin.storage
    .from('signatures')
    .upload(CEO_PATH, processed, { contentType: 'image/png', upsert: true });
  if (upErr) return { status: 'error', message: `Upload failed: ${upErr.message}` };

  clearCeoSignatureCache();

  await logAudit({
    action: 'admin.ceo_signature_upload',
    targetType: 'company',
    notes: `${(processed.length / 1024).toFixed(0)} KB PNG`,
  });

  revalidatePath('/admin/settings');
  revalidatePath('/staff/onboarding');
  return { status: 'success', message: 'CEO signature uploaded. Now embedded on every signed document.' };
}

export async function deleteCeoSignatureAction(): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;
  const admin = serviceClient();
  await admin.storage.from('signatures').remove([CEO_PATH]);
  clearCeoSignatureCache();
  await logAudit({
    action: 'admin.ceo_signature_delete',
    targetType: 'company',
  });
  revalidatePath('/admin/settings');
}

export async function ceoSignatureExists(): Promise<boolean> {
  const admin = serviceClient();
  const { data } = await admin.storage.from('signatures').list('ceo');
  return !!data?.find((f) => f.name === 'signature.png');
}
