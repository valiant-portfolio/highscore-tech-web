// Background-removal pipeline for signatures. Takes a phone photo of an
// ink signature on white paper and returns a tight, transparent PNG that
// fits the signature slot in our HR PDFs.
//
// Algorithm:
//   1. Decode → raw RGBA
//   2. Compute per-pixel luminance (perceptual weights)
//   3. Pixels brighter than CEILING → fully transparent (paper)
//      Pixels darker than FLOOR    → opaque (the ink)
//      In between                  → linear-ramped alpha (anti-aliased edge)
//   4. Trim transparent borders
//   5. Re-encode as PNG, downscale if huge
//
// This works for any ink colour against a roughly white background. Tested
// against blue/black biro and purple gel ink.

import 'server-only';
import sharp from 'sharp';

interface Options {
  /** Pixels brighter than this become transparent. 0-255. Default 235. */
  ceiling?: number;
  /** Pixels darker than this stay fully opaque. 0-255. Default 180. */
  floor?: number;
  /** Max width of the output PNG. Defaults to 1200. */
  maxWidth?: number;
  /** Whether to invert luminance check (e.g. white ink on black). Default false. */
  invert?: boolean;
}

export async function removeSignatureBackground(
  input: Buffer,
  opts: Options = {},
): Promise<Buffer> {
  const ceiling = opts.ceiling ?? 235;
  const floor   = opts.floor   ?? 180;
  const maxW    = opts.maxWidth ?? 1200;
  const span    = Math.max(1, ceiling - floor);

  // 1. Decode to raw RGBA.
  const { data, info } = await sharp(input)
    .rotate()                  // honour EXIF orientation
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 2-3. Walk pixels, set alpha.
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = opts.invert
      ? 255 - (0.299 * r + 0.587 * g + 0.114 * b)
      : 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum >= ceiling) {
      data[i + 3] = 0;
    } else if (lum > floor) {
      data[i + 3] = Math.round(((ceiling - lum) / span) * 255);
    }
    // else: opaque (keep ink colour as-is)
  }

  // 4-5. Reassemble, trim transparent margins, resize, encode.
  let pipeline = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim();                   // crop the transparent border

  if (info.width > maxW) {
    pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });
  }

  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}
