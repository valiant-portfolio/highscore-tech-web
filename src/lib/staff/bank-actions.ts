'use server';

// Staff bank-account self-update. First write is always allowed. After
// that, the staff is locked out for BANK_EDIT_LOCK_DAYS (90) to prevent
// social-engineered payroll redirection. Admin can override via the
// admin staff edit page (TODO if we add that — for now admin doesn't
// touch bank details directly).

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { NIGERIAN_BANKS, canUpdateBank } from './bank';
import { logAudit } from '@/lib/admin/audit';

export type BankActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }
  | { status: 'success'; message: string };

const INITIAL: BankActionState = { status: 'idle' };

async function loadCurrentStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'Sign in first.' };

  const admin = serviceClient();
  const [{ data: staff }, { data: me }] = await Promise.all([
    admin.from('staff').select('id, slug, full_name, status, bank_name, bank_updated_at').eq('user_id', user.id).maybeSingle(),
    admin.from('users').select('admin_sections').eq('id', user.id).maybeSingle(),
  ]);
  if (!staff) return { ok: false as const, error: 'You are not registered as staff.' };
  if (staff.status !== 'active') return { ok: false as const, error: 'Your staff record is not active.' };
  if (!((me?.admin_sections as string[] | null) ?? []).includes('profile-edit')) {
    return { ok: false as const, error: 'You do not have access to edit your profile. Ask an admin to grant it.' };
  }
  return { ok: true as const, admin, staff };
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(iso));
}

export async function updateBankAccountAction(
  _prev: BankActionState,
  formData: FormData,
): Promise<BankActionState> {
  void _prev;
  const ctx = await loadCurrentStaff();
  if (!ctx.ok) return { status: 'error', message: ctx.error };

  // Lock check.
  const lock = canUpdateBank(ctx.staff.bank_updated_at as string | null);
  if (!lock.allowed) {
    return {
      status: 'error',
      message: `Your bank details can only be changed every 90 days. Next allowed change is on ${formatDate(lock.nextAllowedAt)}.`,
    };
  }

  const bank_name           = String(formData.get('bank_name')           ?? '').trim();
  const bank_account_number = String(formData.get('bank_account_number') ?? '').replace(/\s+/g, '');
  const bank_account_name   = String(formData.get('bank_account_name')   ?? '').trim();

  const fieldErrors: Record<string, string> = {};
  if (!bank_name) fieldErrors.bank_name = 'Pick a bank.';
  else if (!(NIGERIAN_BANKS as readonly string[]).includes(bank_name)) {
    fieldErrors.bank_name = 'Pick from the list.';
  }
  if (!/^\d{10}$/.test(bank_account_number)) {
    fieldErrors.bank_account_number = 'Must be exactly 10 digits.';
  }
  if (!bank_account_name || bank_account_name.length < 3) {
    fieldErrors.bank_account_name = 'Enter the full name on the account.';
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const isFirstSet = !ctx.staff.bank_name;

  await ctx.admin.from('staff').update({
    bank_name,
    bank_account_number,
    bank_account_name,
    bank_updated_at: new Date().toISOString(),
  }).eq('id', ctx.staff.id);

  // Audit log. We do NOT log the full account number — just the bank +
  // last 4 + actor. Plenty for traceability without leaking PII.
  await logAudit({
    action: isFirstSet ? 'staff.bank_account_set' : 'staff.bank_account_update',
    targetType: 'staff',
    targetId: ctx.staff.id,
    targetLabel: `${ctx.staff.full_name} (${ctx.staff.slug})`,
    notes: `${bank_name} · ****${bank_account_number.slice(-4)}`,
  });

  revalidatePath('/staff');
  revalidatePath('/admin/staff');
  revalidatePath(`/admin/staff/${ctx.staff.id}`);

  return {
    status: 'success',
    message: isFirstSet
      ? 'Bank account saved. Salary will be paid here from the next payday.'
      : 'Bank account updated. Next change allowed in 90 days.',
  };
}

void INITIAL;
