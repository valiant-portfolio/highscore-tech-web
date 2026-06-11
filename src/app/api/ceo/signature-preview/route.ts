// GET /api/ceo/signature-preview — returns a 5-minute signed URL for the
// CEO's processed signature image. Any signed-in user can pull this
// (staff need it to render the agreement preview before signing). If no
// signature is uploaded yet, returns { url: null }.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

const CEO_PATH = 'ceo/signature.png';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ url: null }, { status: 401 });

  const admin = serviceClient();
  const { data, error } = await admin.storage
    .from('signatures')
    .createSignedUrl(CEO_PATH, 300);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ url: null });
  }
  return NextResponse.json({ url: data.signedUrl });
}
