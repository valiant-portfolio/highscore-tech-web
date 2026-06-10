// /api/academy/[slug]/syllabus.pdf — renders the course syllabus as a real
// PDF binary using @react-pdf/renderer.

import { createElement } from 'react';
import { getCourseWithModules } from '@/lib/academy/queries';
import { SyllabusPdf } from '@/lib/academy/SyllabusPdf';
import { pdfResponse } from '@/lib/staff/pdf-stream';

export const runtime = 'nodejs';
export const revalidate = 3600;

interface Ctx {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
}

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const course = await getCourseWithModules(slug);
  if (!course) return new Response('Course not found.', { status: 404 });

  const element = createElement(SyllabusPdf, {
    course,
    siteUrl: SITE_URL,
    issuedDate: formatDate(new Date()),
  });
  return pdfResponse(element, `highscore-tech-${course.slug}-syllabus.pdf`, 3600);
}
