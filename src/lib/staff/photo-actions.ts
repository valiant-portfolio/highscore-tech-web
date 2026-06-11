'use server';

// Staff passport photo self-upload + delete. Mirrors the admin photo
// action but the staffId is derived from the current session — staff
// can only manage their OWN photo. Processed image goes to
// staff-photos/<staffId>.jpg (public bucket) so it embeds straight into
// the ID card PDF and the admin staff list.

import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { logAudit } from '@/lib/admin/audit';

export type PhotoActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string };

const INITIAL: PhotoActionState = { status: 'idle' };

async function loadCurrentStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'Sign in first.' };

  const admin = serviceClient();
  const { data: staff } = await admin
    .from('staff')
    .select('id, slug, full_name, status')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!staff) return { ok: false as const, error: 'You are not registered as staff.' };
  if (staff.status !== 'active') return { ok: false as const, error: 'Your staff record is not active.' };
  return { ok: true as const, admin, staff };
}

export async function uploadOwnPhotoAction(
  _prev: PhotoActionState,
  formData: FormData,
): Promise<PhotoActionState> {
  void _prev;
  const ctx = await loadCurrentStaff();
  if (!ctx.ok) return { status: 'error', message: ctx.error };

  const file = formData.get('photo') as File | null;
  if (!file || file.size === 0) return { status: 'error', message: 'Pick a file.' };
  if (file.size > 8 * 1024 * 1024) return { status: 'error', message: 'File too big (8 MB max).' };
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { status: 'error', message: 'JPG, PNG, or WebP only.' };
  }

  // EXIF-rotate → square center-crop → 500×500 JPEG. The "cover" fit on
  // resize gives us a passport-style square no matter the source aspect.
  let processed: Buffer;
  try {
    const raw = Buffer.from(await file.arrayBuffer());
    processed = await sharp(raw)
      .rotate()
      .resize({ width: 500, height: 500, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 88, progressive: true })
      .toBuffer();
  } catch (err) {
    return { status: 'error', message: `Could not process image: ${err instanceof Error ? err.message : 'unknown'}` };
  }

  const path = `${ctx.staff.id}.jpg`;
  const { error: upErr } = await ctx.admin.storage.from('staff-photos').upload(path, processed, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (upErr) return { status: 'error', message: `Upload failed: ${upErr.message}` };

  await ctx.admin.from('staff').update({ photo_url: path }).eq('id', ctx.staff.id);

  await logAudit({
    action: 'staff.own_photo_upload',
    targetType: 'staff',
    targetId: ctx.staff.id,
    targetLabel: `${ctx.staff.full_name} (${ctx.staff.slug})`,
    notes: `${(processed.length / 1024).toFixed(0)} KB · self-upload`,
  });

  revalidatePath('/staff');
  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${ctx.staff.id}`);
  return { status: 'success', message: 'Photo updated. It will appear on your ID card from the next render.' };
}

export async function deleteOwnPhotoAction(): Promise<void> {
  const ctx = await loadCurrentStaff();
  if (!ctx.ok) return;
  await ctx.admin.storage.from('staff-photos').remove([`${ctx.staff.id}.jpg`]);
  await ctx.admin.from('staff').update({ photo_url: null }).eq('id', ctx.staff.id);
  await logAudit({
    action: 'staff.own_photo_delete',
    targetType: 'staff',
    targetId: ctx.staff.id,
    targetLabel: `${ctx.staff.full_name} (${ctx.staff.slug})`,
  });
  revalidatePath('/staff');
  revalidatePath('/admin/staff');
}

void INITIAL;
