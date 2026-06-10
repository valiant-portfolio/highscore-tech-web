// Background-removal pipeline for signatures. Takes a phone photo of an
// ink signature on ANY paper (white, cream, brown cardboard, ruled book…)
// and returns a tight, transparent PNG that fits the signature slot in
// our HR PDFs.
//
// Algorithm — adaptive, no hard-coded brightness thresholds:
//   1. Decode → raw RGBA, honour EXIF rotation.
//   2. Compute per-pixel luminance + a 256-bin histogram.
//   3. Otsu's method: find the threshold that maximises between-class
//      variance. This automatically separates "ink" from "paper" no
//      matter how light or dark the paper is.
//   4. For pixels above threshold (paper): fully transparent.
//      For pixels below threshold (ink): fully opaque, with a small
//      soft-edge ramp ±6 luminance levels on either side so the cut
//      doesn't look pixelated.
//   5. Optionally invert if the photo turned out as light ink on dark
//      paper (rare but defended against — we detect by checking which
//      class is more numerous; the more-numerous class is assumed to be
//      paper).
//   6. Trim the transparent margin, downscale, encode PNG.
//
// Result: clean ink-only PNG with a true alpha channel — no paper colour
// bleeds through when composited onto any background.

import 'server-only';
import sharp from 'sharp';

interface Options {
  /** Max width of the output PNG. Defaults to 1200. */
  maxWidth?: number;
  /** Soft-edge half-width in luminance levels. Defaults to 6. */
  edgeSoftness?: number;
  /** Force-invert (treat bright pixels as ink). Default auto-detect. */
  forceInvert?: boolean;
}

function otsuThreshold(histogram: Uint32Array, total: number): number {
  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * histogram[i];

  let sumBg = 0;
  let wBg = 0;
  let varMax = -1;
  let threshold = 127;

  for (let t = 0; t < 256; t++) {
    wBg += histogram[t];
    if (wBg === 0) continue;
    const wFg = total - wBg;
    if (wFg === 0) break;

    sumBg += t * histogram[t];
    const meanBg = sumBg / wBg;
    const meanFg = (sumAll - sumBg) / wFg;
    const variance = wBg * wFg * (meanBg - meanFg) * (meanBg - meanFg);

    if (variance > varMax) {
      varMax = variance;
      threshold = t;
    }
  }
  return threshold;
}

export async function removeSignatureBackground(
  input: Buffer,
  opts: Options = {},
): Promise<Buffer> {
  const maxW    = opts.maxWidth     ?? 1200;
  const softness = Math.max(1, opts.edgeSoftness ?? 6);

  // 1. Decode to raw RGBA.
  const { data, info } = await sharp(input)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelCount = info.width * info.height;

  // 2. Build the luminance histogram in a single pass.
  const histogram = new Uint32Array(256);
  const luminance = new Uint8Array(pixelCount);
  for (let p = 0, i = 0; p < pixelCount; p++, i += 4) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    luminance[p] = lum;
    histogram[lum]++;
  }

  // 3. Otsu threshold.
  const threshold = otsuThreshold(histogram, pixelCount);

  // Decide ink direction: assume the class with MORE pixels is paper.
  let invert = !!opts.forceInvert;
  if (opts.forceInvert === undefined) {
    let belowCount = 0;
    for (let t = 0; t < threshold; t++) belowCount += histogram[t];
    const aboveCount = pixelCount - belowCount;
    // If darker pixels are more numerous, then paper is dark → invert
    // so dark stays transparent and bright (ink) stays opaque.
    invert = belowCount > aboveCount;
  }

  // 4. Walk pixels, set alpha.
  // For non-inverted case (white/light paper, dark ink):
  //   lum >= threshold + softness  → fully transparent
  //   lum <= threshold - softness  → fully opaque
  //   between                      → ramped
  for (let p = 0, i = 0; p < pixelCount; p++, i += 4) {
    const lum = luminance[p];
    const effective = invert ? 255 - lum : lum;
    const cutoff    = invert ? 255 - threshold : threshold;

    if (effective >= cutoff + softness) {
      data[i + 3] = 0;
    } else if (effective <= cutoff - softness) {
      data[i + 3] = 255;
    } else {
      const ramp = (cutoff + softness - effective) / (softness * 2);
      data[i + 3] = Math.round(Math.max(0, Math.min(1, ramp)) * 255);
    }
  }

  // 5. Reassemble, trim, resize, encode.
  let pipeline = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 });           // crop pure-transparent borders

  if (info.width > maxW) {
    pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });
  }

  return pipeline.png({ compressionLevel: 9 }).toBuffer();
}
