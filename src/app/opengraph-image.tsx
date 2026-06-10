// Default site OG image — used for /, /about, /services, /contact and any
// page that doesn't define its own. 1200×630 brand-styled card.

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Highscore Tech — AI development studio + Academy';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #050E14 0%, #102733 60%, #06677F 100%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Radial cyan glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(24,194,220,0.55) 0%, rgba(24,194,220,0) 70%)',
            display: 'flex',
          }}
        />
        {/* Brand mark + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: 'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: '#050E14',
            }}
          >
            H
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#18C2DC', letterSpacing: -0.5 }}>
              Highscore Tech
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', letterSpacing: 5, marginTop: 4 }}>
              AI · SOFTWARE · ACADEMY
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, color: '#FFFFFF' }}>
            We build AI.
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              background: 'linear-gradient(135deg, #6CE8FA 0%, #18C2DC 60%, #0A8EA8 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            We train builders.
          </div>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', marginTop: 8, maxWidth: 800 }}>
            AI development studio + in-house academy. Nigeria → worldwide.
          </div>
        </div>

        {/* Footer URL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 20, color: '#18C2DC', fontWeight: 700, letterSpacing: 1 }}>
            highzcore.tech
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', letterSpacing: 3 }}>
            HIGHSCORE TECH
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
