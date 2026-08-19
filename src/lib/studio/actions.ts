'use server';

// Studio order lifecycle: create → pay → confirm.
//
// Pricing is ALWAYS resolved server-side from the catalogue. The browser posts
// a packageKey; if it posted an amount we would be letting the customer name
// their own price.

import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serviceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import {
  PACKAGE_BY_KEY, PROJECT_TYPE_BY_KEY, DELIVERY_CHANNELS,
} from '@/lib/studio/catalog';
import { COUNTRY_NAME, paymentMethodFor } from '@/lib/studio/countries';

export interface OrderFormState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

/** USD→NGN for the ALAT charge. Configurable: the rate moves. */
function usdNgnRate(): number {
  const raw = Number(process.env.STUDIO_USD_NGN_RATE);
  return Number.isFinite(raw) && raw > 0 ? raw : 1600;
}

/** How long we commit to, by package tier. Kept deliberately conservative. */
function turnaroundDays(group: string): number {
  if (group === 'start') return 3;
  if (group === 'ladder') return 7;
  return 14; // broadcast / outdoor / always-on campaigns
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Unguessable — this reference is the only key to the order's status page. */
function buildReference(): string {
  const a = randomUUID().replace(/-/g, '');
  return `HSS-${a.slice(0, 8)}-${a.slice(8, 16)}`.toUpperCase();
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function createStudioOrder(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const get = (k: string) => String(formData.get(k) ?? '').trim();

  const packageKey = get('packageKey');
  const projectType = get('projectType');
  const customerName = get('customerName');
  const customerEmail = get('customerEmail');
  const country = get('country');
  const deliveryChannel = get('deliveryChannel');
  const deliveryHandle = get('deliveryHandle');
  const neededBy = get('neededBy');

  const fieldErrors: Record<string, string> = {};

  const pkg = PACKAGE_BY_KEY[packageKey];
  if (!pkg) fieldErrors.packageKey = 'Choose what you want made.';
  if (!PROJECT_TYPE_BY_KEY[projectType]) fieldErrors.projectType = 'Tell us what it is for.';
  if (!customerName) fieldErrors.customerName = 'We need a name.';
  if (!isEmail(customerEmail)) fieldErrors.customerEmail = 'Enter a valid email — your invoice goes here.';
  if (!COUNTRY_NAME[country]) fieldErrors.country = 'Pick your country.';
  if (!DELIVERY_CHANNELS.some((c) => c.key === deliveryChannel)) {
    fieldErrors.deliveryChannel = 'Pick how we should send your work.';
  }
  if (!deliveryHandle) fieldErrors.deliveryHandle = 'We need this to send you the finished work.';

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  // Collect the branching brief. Only fields declared for THIS project type are
  // accepted, so a crafted form can't stuff arbitrary json into the row.
  const typeDef = PROJECT_TYPE_BY_KEY[projectType];
  const brief: Record<string, string> = {};
  for (const f of typeDef.fields) {
    const v = String(formData.get(`brief__${f.name}`) ?? '').trim();
    if (v) brief[f.label] = v;
  }

  const priceUsd = pkg!.priceUsd;
  if (priceUsd == null) {
    return { status: 'error', message: 'That package is quoted per campaign — please contact us directly.' };
  }

  const method = paymentMethodFor(country);
  const rate = usdNgnRate();
  const reference = buildReference();

  // Link the order to a signed-in account when there is one, but never require
  // it: most Studio customers buy without making an account.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch { /* guest checkout */ }

  const admin = serviceClient();
  const { error } = await admin.from('studio_orders').insert({
    reference,
    package_key: pkg!.key,
    package_name: pkg!.name,
    amount_usd: priceUsd,
    amount_ngn: Math.round(priceUsd * rate),
    usd_ngn_rate: rate,
    project_type: projectType,
    brief,
    customer_name: customerName,
    customer_email: customerEmail.toLowerCase(),
    country,
    user_id: userId,
    delivery_channel: deliveryChannel,
    delivery_handle: deliveryHandle,
    needed_by: neededBy || null,
    delivery_due: addDays(turnaroundDays(pkg!.group)),
    payment_method: method,
    payment_reference: reference, // one payment per order — same key both sides
    payment_status: 'pending',
    status: 'awaiting_payment',
  });

  if (error) {
    console.error('[studio] order insert failed:', error.message);
    return { status: 'error', message: 'We could not start your order. Please try again.' };
  }

  redirect(`/studio/order/${reference}`);
}

/* ── Confirming payment ─────────────────────────────────────────────────── */

/**
 * Flip an order to paid. Idempotent: safe to call from the payment callback and
 * from the status-page sweep for the same reference.
 *
 * Only ever called after the gateway has independently confirmed the payment —
 * never straight from the browser's word.
 */
export async function markStudioOrderPaid(reference: string, rawPayload?: unknown): Promise<void> {
  const admin = serviceClient();

  const { data: order } = await admin
    .from('studio_orders')
    .select('id, payment_status, reference')
    .eq('payment_reference', reference)
    .maybeSingle();

  if (!order) return;                             // unknown reference
  if (order.payment_status === 'succeeded') return; // already handled

  const { error } = await admin
    .from('studio_orders')
    .update({
      payment_status: 'succeeded',
      status: 'paid',
      paid_at: new Date().toISOString(),
      ...(rawPayload ? { raw_payload: rawPayload } : {}),
    })
    .eq('id', order.id);

  if (error) {
    console.error('[studio] mark paid failed:', error.message);
    return;
  }

  revalidatePath(`/studio/order/${order.reference}`);

  // Awaited, not fired-and-forgotten: on serverless the function freezes the
  // moment we return, which would kill an in-flight send.
  try {
    const { sendStudioOrderEmails } = await import('@/lib/studio/emails');
    await sendStudioOrderEmails(order.id);
  } catch (err) {
    console.error('[studio] confirmation email failed:', err);
  }
}

/**
 * Second chance at confirmation. The payment popup's callback is the primary
 * path, but a customer who closes the tab mid-payment never fires it — so the
 * order status page re-asks the gateway about any still-pending order.
 */
export async function sweepStudioOrder(reference: string): Promise<void> {
  const admin = serviceClient();
  const { data: order } = await admin
    .from('studio_orders')
    .select('payment_reference, payment_status, payment_method')
    .eq('reference', reference)
    .maybeSingle();

  if (!order?.payment_reference) return;
  if (order.payment_status !== 'pending') return;
  if (order.payment_method !== 'alatpay') return; // nothing to poll for manual/card

  const { verifyAlatPayTransaction } = await import('@/lib/alatpay/server');
  const result = await verifyAlatPayTransaction(order.payment_reference);
  if (result.status === 'succeeded') {
    await markStudioOrderPaid(order.payment_reference, { remote: result.raw, via: 'sweep' });
  }
}
