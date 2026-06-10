// Renders a @react-pdf React tree to a PDF Buffer + returns it as the
// Response body. Buffered (not streaming) for two reasons:
//   1. Streaming through ReadableStream had cold-start race conditions
//      on Netlify's serverless runtime.
//   2. All our PDFs are small (< 1 MB) so buffering the whole document is
//      essentially free.
//
// On any failure during render, returns a JSON error response with the
// real message + a snipped stack trace so we can see WHAT went wrong
// instead of an opaque 500.

import 'server-only';
import { renderToBuffer } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

export async function pdfResponse(
  element: ReactElement,
  filename: string,
  cacheSeconds = 300,
): Promise<Response> {
  try {
    // @ts-expect-error react-pdf's internal element type
    const buffer = await renderToBuffer(element) as Buffer;
    // Cast Buffer → Uint8Array so Response accepts it cleanly across TS lib versions.
    const body = new Uint8Array(buffer);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': body.byteLength.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': `private, max-age=${cacheSeconds}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    const stack = err instanceof Error ? (err.stack ?? '') : '';
    console.error('[pdf] render failed:', message);
    console.error(stack);

    return new Response(
      JSON.stringify(
        {
          error: 'PDF generation failed.',
          message,
          stackPreview: stack.split('\n').slice(0, 10),
          hint:
            'If you see "Yoga" or "WASM" — react-pdf bundling is wrong. ' +
            'If you see "fetch failed" — font fetch from Google failed. ' +
            'If you see Supabase / database — env vars missing on Netlify.',
        },
        null,
        2,
      ),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
