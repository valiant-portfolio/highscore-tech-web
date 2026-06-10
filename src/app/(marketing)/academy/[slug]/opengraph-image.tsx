// Per-course OG image — pulled dynamically from the courses table.

import { ImageResponse } from 'next/og';
import { getCourseWithModules, formatNgn } from '@/lib/academy/queries';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Highscore Tech Academy course';

interface Props {
  params: { slug: string };
}

export default async function Image({ params }: Props) {
  const course = await getCourseWithModules(params.slug);

  const title = course?.title ?? 'Course';
  const summary = course?.summary ?? '';
  const price = course ? formatNgn(course.price_ngn) : '';
  const duration = course?.duration_weeks ? `${course.duration_weeks} weeks` : '';
  const level = course?.level ?? '';

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

        {/* Eyebrow */}
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
              HIGHSCORE TECH ACADEMY
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: 2 }}>
              {level || 'COURSE'}{duration ? ` · ${duration.toUpperCase()}` : ''}
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, color: '#FFFFFF', marginBottom: 20 }}>
          {title}
        </div>

        {/* Summary (clamp to ~180 chars) */}
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.72)', lineHeight: 1.4, maxWidth: 1000 }}>
          {summary.length > 200 ? `${summary.slice(0, 200)}…` : summary}
        </div>

        {/* Footer: price + url */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', letterSpacing: 3, marginBottom: 6 }}>
              FEE
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: -1,
                background: 'linear-gradient(135deg, #6CE8FA 0%, #18C2DC 60%, #0A8EA8 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {price}
            </div>
          </div>
          <div style={{ fontSize: 20, color: '#18C2DC', fontWeight: 700, letterSpacing: 1 }}>
            highzcore.tech/academy
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
