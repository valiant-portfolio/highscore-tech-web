'use server';

// One-time capture of a new hire's payroll + identity details, taken at the END
// of onboarding (after all three documents are signed) — NOT in the Settings tab.
//
// Deliberately does NOT require the 'profile-edit' capability: a brand-new hire
// hasn't been granted it, and this is a required onboarding step, not a profile
// edit. It only runs for an active staff member who has finished signing.
//
// Write semantics (per the agreed model):
//   • NIN document — WRITE-ONCE. If a NIN is already on file, we never overwrite
//     it here; the staff cannot replace or view it afterwards (admin can).
//   • Bank account — first write here; changes afterwards go through the normal
//     Settings flow with the 90-day lock.

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { NIGERIAN_BANKS } from './bank';
import { logAudit } from '@/lib/admin/audit';

export type DetailsState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

export async function submitOnboardingDetailsAction(
  _prev: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  void _prev;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.' };

  const admin = serviceClient();
  const [{ data: staff }, { data: me }] = await Promise.all([
    admin.from('staff')
      .select('id, slug, full_name, status, offer_signed_at, nda_signed_at, policy_signed_at, bank_name, bank_account_number')
      .eq('user_id', user.id).maybeSingle(),
    admin.from('users').select('nin_doc_url').eq('id', user.id).maybeSingle(),
  ]);
  if (!staff) return { status: 'error', message: 'You are not registered as staff.' };
  if (staff.status !== 'active') return { status: 'error', message: 'Your staff record is not active.' };
  // Must have finished signing before capturing details.
  if (!staff.offer_signed_at || !staff.nda_signed_at || !staff.policy_signed_at) {
    return { status: 'error', message: 'Please finish signing your documents first.' };
  }

  const ninOnFile  = !!(me?.nin_doc_url);
  const bankOnFile = !!staff.bank_account_number;

  const fieldErrors: Record<string, string> = {};

  // ── Bank account (first-set) ──────────────────────────────────────────────
  let bankPatch: { bank_name: string; bank_account_number: string; bank_account_name: string } | null = null;
  if (!bankOnFile) {
    const bank_name           = String(formData.get('bank_name') ?? '').trim();
    const bank_account_number = String(formData.get('bank_account_number') ?? '').replace(/\s+/g, '');
    const bank_account_name   = String(formData.get('bank_account_name') ?? '').trim();

    if (!bank_name) fieldErrors.bank_name = 'Pick a bank.';
    else if (!(NIGERIAN_BANKS as readonly string[]).includes(bank_name)) fieldErrors.bank_name = 'Pick from the list.';
    if (!/^\d{10}$/.test(bank_account_number)) fieldErrors.bank_account_number = 'Must be exactly 10 digits.';
    if (!bank_account_name || bank_account_name.length < 3) fieldErrors.bank_account_name = 'Enter the full name on the account.';

    if (!fieldErrors.bank_name && !fieldErrors.bank_account_number && !fieldErrors.bank_account_name) {
      bankPatch = { bank_name, bank_account_number, bank_account_name };
    }
  }

  // ── NIN document (write-once) ─────────────────────────────────────────────
  let ninUpload: { path: string; buffer: Buffer; contentType: string } | null = null;
  if (!ninOnFile) {
    const file = formData.get('nin_doc') as File | null;
    if (!file || file.size === 0) {
      fieldErrors.nin_doc = 'Upload your NIN slip.';
    } else if (file.size > 5 * 1024 * 1024) {
      fieldErrors.nin_doc = 'File too big (5 MB max).';
    } else if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      fieldErrors.nin_doc = 'JPG, PNG, or PDF only.';
    } else {
      const ext = file.type === 'application/pdf' ? 'pdf' : (file.type === 'image/png' ? 'png' : 'jpg');
      ninUpload = { path: `${user.id}/nin.${ext}`, buffer: Buffer.from(await file.arrayBuffer()), contentType: file.type };
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors };
  }

  // ── Persist. NIN first (upload can fail), then bank. ──────────────────────
  if (ninUpload) {
    const { error: upErr } = await admin.storage.from('nin-docs').upload(
      ninUpload.path, ninUpload.buffer, { contentType: ninUpload.contentType, upsert: false },
    );
    if (upErr) return { status: 'error', message: `NIN upload failed: ${upErr.message}` };
    await admin.from('users').update({ nin_doc_url: ninUpload.path }).eq('id', user.id);
    await logAudit({
      action: 'staff.nin_upload',
      targetType: 'staff', targetId: staff.id,
      targetLabel: `${staff.full_name} (${staff.slug})`,
      notes: 'NIN captured at onboarding (write-once)',
    });
  }

  if (bankPatch) {
    await admin.from('staff').update({
      ...bankPatch,
      bank_updated_at: new Date().toISOString(),
    }).eq('id', staff.id);
    await logAudit({
      action: 'staff.bank_account_set',
      targetType: 'staff', targetId: staff.id,
      targetLabel: `${staff.full_name} (${staff.slug})`,
      notes: `${bankPatch.bank_name} · ****${bankPatch.bank_account_number.slice(-4)} (onboarding)`,
    });
  }

  revalidatePath('/staff');
  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${staff.id}`);
  // Onboarding is now complete — into the dashboard.
  redirect('/staff');
}
