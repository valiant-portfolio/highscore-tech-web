// One-shot: reads public/signature-source-ceo.jpg (or .png), processes it
// with the same luminance pipeline used for staff signatures, and writes
// the result to public/sigs/ceo.png. After this runs successfully the
// offer letter and contract PDFs will embed the real ink signature in
// place of the Allura cursive fallback.
//
// Usage:
//   node scripts/process-ceo-signature.mjs
//   node scripts/process-ceo-signature.mjs --ceiling 230 --floor 170

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const argv = process.argv.slice(2);
function arg(name, def) {
  const i = argv.indexOf(name);
  if (i < 0) return def;
  return Number(argv[i + 1]);
}
const ceiling = arg('--ceiling', 235);
const floor   = arg('--floor', 180);

const candidates = [
  '_secrets/signature-source-ceo.jpg',
  '_secrets/signature-source-ceo.png',
  '_secrets/signature-source-ceo.jpeg',
];
const source = candidates.find((p) => existsSync(p));
if (!source) {
  console.error('✗ No source signature found.');
  console.error('  Drop your photo at one of:');
  for (const c of candidates) console.error(`    ${c}`);
  process.exit(1);
}
console.log(`• Source: ${source}`);
console.log(`  Ceiling: ${ceiling}  Floor: ${floor}`);

const input = await readFile(source);

const { data, info } = await sharp(input).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const span = Math.max(1, ceiling - floor);
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum >= ceiling) data[i + 3] = 0;
  else if (lum > floor) data[i + 3] = Math.round(((ceiling - lum) / span) * 255);
}

const out = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim()
  .resize({ width: 1200, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toBuffer();

await mkdir('_secrets/sigs', { recursive: true });
await writeFile('_secrets/sigs/ceo.png', out);

console.log(`✓ Written _secrets/sigs/ceo.png (${(out.length / 1024).toFixed(1)} KB)`);
console.log('  Reload the offer letter or contract PDF to see it.');
console.log('  If too much white remains: lower --ceiling (e.g. 220).');
console.log('  If ink got eaten: raise --floor (e.g. 200).');
