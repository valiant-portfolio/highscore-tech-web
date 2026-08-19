// Composes the Studio hero backdrop as artwork rather than a photo.
//
//   node scripts/make-studio-hero.mjs
//
// Everything is drawn here, so there is no stock-photo licence attached to the
// site's most prominent image. The motifs are the ones that read as "recording
// studio" at a glance: acoustic foam wedges on the back wall, the soft pool of
// a ceiling light, and monitor cones either side.
//
// It sits under a heavy dark overlay in the hero, so it is deliberately low
// contrast — anything punchier fights the headline.

import sharp from 'sharp';

const W = 2400;
const H = 1350;

const INK = '#050E14';
const CYAN = '#18C2DC';

// Acoustic foam: two offset rows of wedges, the classic studio back wall.
function foam(y, size, opacity, phase = 0) {
  let d = '';
  for (let x = -size + phase; x < W + size; x += size) {
    d += `M ${x} ${y + size} L ${x + size / 2} ${y} L ${x + size} ${y + size} Z `;
  }
  return `<path d="${d}" fill="#7FE3F2" opacity="${opacity}" />`;
}

// A monitor / speaker cone suggested by concentric rings.
function cone(cx, cy, r, opacity) {
  let s = '';
  for (let i = 5; i >= 1; i--) {
    s += `<circle cx="${cx}" cy="${cy}" r="${(r * i) / 5}" fill="none"
            stroke="#8FEBF8" stroke-width="${1 + i * 0.6}" opacity="${opacity * (1 - i * 0.12)}" />`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.16}" fill="#8FEBF8" opacity="${opacity * 1.6}" />`;
  return s;
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#08161F"/>
      <stop offset="55%"  stop-color="${INK}"/>
      <stop offset="100%" stop-color="#03080C"/>
    </linearGradient>

    <!-- The ceiling light pooling down over the room. -->
    <radialGradient id="keyLight" cx="50%" cy="4%" r="62%">
      <stop offset="0%"   stop-color="${CYAN}" stop-opacity="0.40"/>
      <stop offset="45%"  stop-color="${CYAN}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${CYAN}" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="warmL" cx="8%" cy="72%" r="42%">
      <stop offset="0%"   stop-color="#2BA7C4" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#2BA7C4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warmR" cx="94%" cy="66%" r="44%">
      <stop offset="0%"   stop-color="#1D7F99" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#1D7F99" stop-opacity="0"/>
    </radialGradient>

    <!-- Keeps the corners heavy so the copy sits in the calm middle. -->
    <radialGradient id="vignette" cx="50%" cy="45%" r="78%">
      <stop offset="55%"  stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.72"/>
    </radialGradient>

    <!-- Fades the foam out toward the top so it reads as a far wall. -->
    <linearGradient id="foamFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
      <stop offset="40%"  stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="foamMask">
      <rect width="${W}" height="${H}" fill="url(#foamFade)"/>
    </mask>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#base)"/>
  <rect width="${W}" height="${H}" fill="url(#keyLight)"/>

  <!-- Back wall: rows of acoustic wedges receding upward. -->
  <g mask="url(#foamMask)">
    ${foam(H * 0.50, 150, 0.055)}
    ${foam(H * 0.50 + 150, 150, 0.068, 75)}
    ${foam(H * 0.50 + 300, 150, 0.082)}
    ${foam(H * 0.50 + 450, 150, 0.096, 75)}
    ${foam(H * 0.50 + 600, 150, 0.11)}
  </g>

  <!-- Studio monitors flanking the room. -->
  ${cone(W * 0.14, H * 0.60, 190, 0.14)}
  ${cone(W * 0.86, H * 0.57, 165, 0.12)}

  <rect width="${W}" height="${H}" fill="url(#warmL)"/>
  <rect width="${W}" height="${H}" fill="url(#warmR)"/>

  <!-- Desk edge: the horizon the room sits on. -->
  <rect x="0" y="${H * 0.845}" width="${W}" height="2" fill="#8FEBF8" opacity="0.06"/>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>`;

const out = 'public/studio-hero.jpg';

await sharp(Buffer.from(svg))
  .resize(W, H)
  // A little blur keeps it as atmosphere rather than competing geometry.
  .blur(1.6)
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile(out);

const { size } = await sharp(out).metadata().then(async (m) => ({
  ...m,
  size: (await import('node:fs')).statSync(out).size,
}));

console.log(`✓ ${out}  ${W}x${H}  ${Math.round(size / 1024)}kb`);
