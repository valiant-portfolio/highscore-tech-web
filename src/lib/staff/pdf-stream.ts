// Helper that converts a Node readable stream from @react-pdf into a Web
// stream + a NextResponse body. Used by all four staff PDF routes so we
// only write the boilerplate once.

import 'server-only';
import { renderToStream } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

export async function pdfResponse(
  // @react-pdf's element type narrows internally; the application boundary
  // is the same shape as any ReactElement.
  element: ReactElement,
  filename: string,
  cacheSeconds = 300,
): Promise<Response> {
  // @ts-expect-error react-pdf's internal element type
  const pdfStream = await renderToStream(element);
  const webStream = new ReadableStream({
    start(controller) {
      pdfStream.on('data',  (chunk) => controller.enqueue(chunk));
      pdfStream.on('end',   () => controller.close());
      pdfStream.on('error', (err) => controller.error(err));
    },
  });
  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': `private, max-age=${cacheSeconds}`,
    },
  });
}
