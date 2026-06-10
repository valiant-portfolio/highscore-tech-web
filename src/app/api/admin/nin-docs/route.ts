// GET /api/admin/nin-docs?userId=… — returns a 5-minute signed URL for the
// student's NIN document. Admin only.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ url: null }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ url: null }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ url: null }, { status: 400 });

  const admin = serviceClient();
  const { data: student } = await admin.from('users').select('nin_doc_url').eq('id', userId).maybeSingle();
  if (!student?.nin_doc_url) return NextResponse.json({ url: null });

  const { data: signed } = await admin.storage.from('nin-docs').createSignedUrl(student.nin_doc_url, 300);
  return NextResponse.json({ url: signed?.signedUrl ?? null });
}
