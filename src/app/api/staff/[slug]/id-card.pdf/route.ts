// GET /api/staff/[slug]/id-card.pdf

import { createElement } from 'react';
import { gateStaffPdf } from '@/lib/staff/pdf-gate';
import { pdfResponse } from '@/lib/staff/pdf-stream';
import { IdCardPdf } from '@/lib/staff/IdCardPdf';
import { serviceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

interface Ctx { params: Promise<{ slug: string }> }

function employeeIdFor(slug: string): string {
  const idx: Record<string, string> = {
    olivia:   'OPS-001',
    godswill: 'OPS-002',
    promise:  'ENG-001',
    samuel:   'ENG-002',
    vany:     'ENG-003',
  };
  return `HST-${idx[slug] ?? 'XXX-000'}`;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const gate = await gateStaffPdf(slug);
  if (!gate.ok) return gate.response;

  // Fetch staff photo path + build a public URL the PDF can embed without
  // a signed-URL round-trip. The 'staff-photos' bucket is public on read.
  let photoUrl: string | null = null;
  const admin = serviceClient();
  const { data } = await admin.from('staff').select('photo_url').eq('slug', slug).maybeSingle();
  if (data?.photo_url) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
    photoUrl = `${base}/storage/v1/object/public/staff-photos/${data.photo_url}`;
  }

  const element = createElement(IdCardPdf, {
    staff: gate.staff,
    employeeId: employeeIdFor(slug),
    photoUrl,
  });
  return pdfResponse(element, `highscore-tech-${slug}-id-card.pdf`);
}
