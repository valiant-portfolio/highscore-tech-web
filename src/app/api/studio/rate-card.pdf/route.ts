// GET /api/studio/rate-card.pdf
//
// The whole Studio menu as a PDF — every package, what it includes, what it
// does not, and the price. Public on purpose: it is a sales document, meant to
// be downloaded and forwarded.
//
// Generated from the same catalogue the site renders, so the PDF can never
// quote a price the website has moved on from.

import { createElement } from 'react';
import { RateCardPdf } from '@/lib/studio/RateCardPdf';
import { pdfResponse } from '@/lib/staff/pdf-stream';

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export async function GET() {
  const generatedOn = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const element = createElement(RateCardPdf, { siteUrl: SITE_URL, generatedOn });

  // Cached for an hour: prices change rarely, and this is hit from a public
  // button that people will click more than once.
  return pdfResponse(element, 'highscore-studio-packages-and-prices.pdf', 3600);
}
