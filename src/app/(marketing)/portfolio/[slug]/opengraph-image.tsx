// Per-project OG image — pulled from portfolio_projects.

import { ImageResponse } from 'next/og';
import { getProject } from '@/lib/portfolio/queries';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Highscore Tech portfolio project';

interface Props {
  params: { slug: string };
}

export default async function Image({ params }: Props) {
  const project = await getProject(params.slug);

  const title = project?.title ?? 'Case study';
  const summary = project?.summary ?? '';
  const client = project?.client ?? '';
  const category = project?.category ?? '';
  const year = project?.year ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 72,
          background: 'linear-gradient(135deg, #050E14 0%, #102733 60%, #06677F 100%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
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

        {/* Eyebrow + brand mark */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: 'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              color: '#050E14',
            }}
          >
            H
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, color: '#18C2DC', fontWeight: 700, letterSpacing: 3 }}>
              HIGHSCORE TECH · CASE STUDY
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: 2 }}>
              {(category || 'PORTFOLIO').toUpperCase()}{year ? ` · ${year}` : ''}
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, color: '#FFFFFF', marginBottom: 16 }}>
          {title}
        </div>

        {/* Client */}
        {client && (
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>
            For <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{client}</span>
          </div>
        )}

        {/* Summary */}
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, maxWidth: 1000 }}>
          {summary.length > 220 ? `${summary.slice(0, 220)}…` : summary}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ fontSize: 20, color: '#18C2DC', fontWeight: 700, letterSpacing: 1 }}>
            highzcore.tech/portfolio
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', letterSpacing: 3 }}>
            BUILT BY HIGHSCORE TECH
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
