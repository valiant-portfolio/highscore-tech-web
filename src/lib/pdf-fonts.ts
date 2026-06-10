// Shared font loader for every @react-pdf/renderer document. Reads the
// woff files from @fontsource at module load time, encodes them as
// base64 data URIs, and registers them with react-pdf.
//
// Why data URIs?
//   • @react-pdf/font's `src` field is strictly typed as `string`. It
//     parses URLs, local paths, and data URIs — but throws when given a
//     Buffer / Uint8Array (`dataUrl.substring is not a function`).
//   • Encoding inline avoids the runtime needing to know the absolute
//     file path on the Netlify Lambda container.
//   • Data-URI strings work in browser, Node, and serverless identically.
//
// The Netlify Next plugin needs to bundle the woff files so this module
// can read them at startup — that's done via `outputFileTracingIncludes`
// in next.config.ts.

import 'server-only';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Font } from '@react-pdf/renderer';

const fsRoot = join(process.cwd(), 'node_modules', '@fontsource');

function loadAsDataUri(rel: string): string {
  const buf = readFileSync(join(fsRoot, rel));
  return `data:font/woff;base64,${buf.toString('base64')}`;
}

const interRegular   = loadAsDataUri('inter/files/inter-latin-400-normal.woff');
const interSemibold  = loadAsDataUri('inter/files/inter-latin-600-normal.woff');
const interExtrabold = loadAsDataUri('inter/files/inter-latin-800-normal.woff');
const alluraScript   = loadAsDataUri('allura/files/allura-latin-400-normal.woff');

let registered = false;

export function registerPdfFonts(): void {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Inter',
    fonts: [
      { src: interRegular,   fontWeight: 400 },
      { src: interSemibold,  fontWeight: 600 },
      { src: interExtrabold, fontWeight: 800 },
    ],
  });

  Font.register({
    family: 'Allura',
    src: alluraScript,
  });

  // Disable hyphenation — wraps mid-word inside narrow slots otherwise.
  Font.registerHyphenationCallback((w) => [w]);
}
