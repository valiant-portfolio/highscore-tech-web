// GET /api/staff/me/signature-preview
//
// Returns a short-lived signed URL to the current staff member's signature
// image so the React UI can preview it without making the bucket public.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ url: null }, { status: 401 });

  const admin = serviceClient();
  const { data: staff } = await admin
    .from('staff')
    .select('signature_url')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!staff?.signature_url) return NextResponse.json({ url: null });

  const { data: signed } = await admin.storage
    .from('signatures')
    .createSignedUrl(staff.signature_url, 300);   // 5 minutes
  return NextResponse.json({ url: signed?.signedUrl ?? null });
}
