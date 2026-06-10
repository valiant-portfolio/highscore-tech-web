// Shared font loader for every @react-pdf/renderer document. Reads the
// woff files from @fontsource at module load time so PDF rendering needs
// no network access. The previous setup fetched from fonts.gstatic.com
// which started returning 404 when Google rotated their font hashes —
// local files are immune.
//
// The Next.js + Netlify bundler includes these specific files in the
// function output via `outputFileTracingIncludes` in next.config.ts.
//
// We resolve the file paths via process.cwd() + a string join (not
// require.resolve) so Turbopack doesn't try to parse the .woff files as
// JavaScript modules — that would fail at build time. The files are
// present on disk at runtime because outputFileTracingIncludes explicitly
// names them.

import 'server-only';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Font } from '@react-pdf/renderer';

const fsRoot = join(process.cwd(), 'node_modules', '@fontsource');

const interRegular   = readFileSync(join(fsRoot, 'inter',  'files', 'inter-latin-400-normal.woff'));
const interSemibold  = readFileSync(join(fsRoot, 'inter',  'files', 'inter-latin-600-normal.woff'));
const interExtrabold = readFileSync(join(fsRoot, 'inter',  'files', 'inter-latin-800-normal.woff'));
const alluraScript   = readFileSync(join(fsRoot, 'allura', 'files', 'allura-latin-400-normal.woff'));

let registered = false;

export function registerPdfFonts(): void {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Inter',
    fonts: [
      { src: interRegular   as unknown as string, fontWeight: 400 },
      { src: interSemibold  as unknown as string, fontWeight: 600 },
      { src: interExtrabold as unknown as string, fontWeight: 800 },
    ],
  });

  Font.register({
    family: 'Allura',
    src: alluraScript as unknown as string,
  });

  // Disable hyphenation — react-pdf otherwise wraps mid-word in tight slots.
  Font.registerHyphenationCallback((w) => [w]);
}
