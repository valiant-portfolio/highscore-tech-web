// GET /api/staff/[slug]/policy.pdf — Company Policy & Staff Agreement.

import { createElement } from 'react';
import { gateStaffPdf, formatIssuedDate } from '@/lib/staff/pdf-gate';
import { pdfResponse } from '@/lib/staff/pdf-stream';
import { PolicyPdf } from '@/lib/staff/PolicyPdf';
import {
  getCeoSignatureBuffer, getStaffSignatureBuffer, bufferToDataUri,
} from '@/lib/staff/signature-loader';

export const runtime = 'nodejs';

interface Ctx { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const gate = await gateStaffPdf(slug);
  if (!gate.ok) return gate.response;

  const [ceoSig, staffSig] = await Promise.all([
    getCeoSignatureBuffer(),
    getStaffSignatureBuffer(gate.staff.signature_url),
  ]);

  const element = createElement(PolicyPdf, {
    staff: gate.staff,
    issuedDate: formatIssuedDate(),
    ceoSignatureDataUri:   ceoSig   ? bufferToDataUri(ceoSig)   : null,
    staffSignatureDataUri: staffSig ? bufferToDataUri(staffSig) : null,
  });
  return pdfResponse(element, `highscore-tech-${slug}-policy.pdf`);
}
