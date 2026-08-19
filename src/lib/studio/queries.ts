import 'server-only';

// Reads for Studio orders. Orders are placed by guests, so there is no
// auth.uid() to filter on — the unguessable reference in the customer's URL is
// the capability. Everything here goes through the service role.

import { serviceClient } from '@/lib/supabase/service';

export interface StudioOrder {
  id: string;
  reference: string;
  package_key: string;
  package_name: string;
  amount_ngn: number;
  addons: { key: string; name: string; price_ngn: number }[];
  project_type: string;
  brief: Record<string, string>;
  customer_name: string;
  customer_email: string;
  country: string;
  delivery_channel: string;
  delivery_handle: string;
  needed_by: string | null;
  delivery_due: string | null;
  payment_method: 'alatpay' | 'card' | 'manual';
  payment_reference: string | null;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paid_at: string | null;
  status: 'awaiting_payment' | 'paid' | 'in_progress' | 'delivered' | 'cancelled';
  delivered_at: string | null;
  created_at: string;
}

const COLS =
  'id, reference, package_key, package_name, amount_ngn, addons, project_type, brief, ' +
  'customer_name, customer_email, country, delivery_channel, delivery_handle, needed_by, delivery_due, ' +
  'payment_method, payment_reference, payment_status, paid_at, status, delivered_at, created_at';

export async function getStudioOrder(reference: string): Promise<StudioOrder | null> {
  const admin = serviceClient();
  const { data } = await admin
    .from('studio_orders')
    .select(COLS)
    .eq('reference', reference)
    .maybeSingle();
  return (data as StudioOrder | null) ?? null;
}

export interface StudioWork {
  id: string;
  title: string;
  client: string | null;
  project_type: string | null;
  summary: string | null;
  media_type: 'video' | 'audio' | 'image';
  video_url: string | null;
  audio_url: string | null;
  poster_url: string | null;
}

/** Published portfolio pieces — the shop window. Media is served by Cloudinary. */
export async function listStudioWorks(): Promise<StudioWork[]> {
  const admin = serviceClient();
  const { data, error } = await admin
    .from('studio_works')
    .select('id, title, client, project_type, summary, media_type, video_url, audio_url, poster_url')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  // The gallery is not worth a 500 — an empty shelf is better than a broken page.
  if (error) {
    console.error('[studio] listStudioWorks failed:', error.message);
    return [];
  }
  return (data ?? []) as unknown as StudioWork[];
}

/** Newest first — the admin queue. */
export async function listStudioOrders(limit = 200): Promise<StudioOrder[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('studio_orders')
    .select(COLS)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as StudioOrder[];
}
