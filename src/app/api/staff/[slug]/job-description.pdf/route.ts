// GET /api/staff/[slug]/job-description.pdf

import { createElement } from 'react';
import { gateStaffPdf, formatIssuedDate } from '@/lib/staff/pdf-gate';
import { pdfResponse } from '@/lib/staff/pdf-stream';
import { JobDescriptionPdf } from '@/lib/staff/JobDescriptionPdf';

export const runtime = 'nodejs';

interface Ctx { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const gate = await gateStaffPdf(slug);
  if (!gate.ok) return gate.response;

  const element = createElement(JobDescriptionPdf, {
    staff: gate.staff,
    issuedDate: formatIssuedDate(),
  });
  return pdfResponse(element, `highscore-tech-${slug}-job-description.pdf`);
}
