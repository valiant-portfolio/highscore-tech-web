// /api/academy/[slug]/syllabus.pdf — renders the course syllabus as a real
// PDF binary using @react-pdf/renderer.
//
// Runs on the Node runtime (react-pdf needs node primitives). Generated on
// the fly per request and cached for 1 hour at the edge — courses don't
// change often, so re-rendering on every download is wasteful.

import { renderToStream } from '@react-pdf/renderer';
import { createElement } from 'react';
import { getCourseWithModules } from '@/lib/academy/queries';
import { SyllabusPdf } from '@/lib/academy/SyllabusPdf';

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

  if (!course) {
    return new Response('Course not found.', { status: 404 });
  }

  const issuedDate = formatDate(new Date());
  const element = createElement(SyllabusPdf, { course, siteUrl: SITE_URL, issuedDate });
  // @ts-expect-error — renderToStream's element type narrows to its internal
  // ReactElement; ours type-checks fine at the application level.
  const pdfStream = await renderToStream(element);

  // Pipe Node stream → web Response stream so Next can return it.
  const webStream = new ReadableStream({
    start(controller) {
      pdfStream.on('data',  (chunk) => controller.enqueue(chunk));
      pdfStream.on('end',   () => controller.close());
      pdfStream.on('error', (err) => controller.error(err));
    },
  });

  const filename = `highscore-tech-${course.slug}-syllabus.pdf`;
  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
