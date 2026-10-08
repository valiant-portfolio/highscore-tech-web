'use client';

import type { FibGeometry } from './fibonacci.ts';
import { formatFibLabel } from './fibonacci.ts';

const ptsAttr = (pts: { x: number; y: number }[]): string => pts.map((p) => `${p.x},${p.y}`).join(' ');

/** Fibonacci levels as an SVG overlay, drawn from already-projected geometry
 *  (see computeFibGeometries). pointer-events-none: selection and drag go
 *  through the chart's own hit test, so this never eats a click. `digits` is a
 *  prop, not captured in a chart closure, so a late bot_quotes load relabels. */
export function FibOverlay({
  geoms,
  preview,
  digits,
  selectedId,
}: {
  geoms: FibGeometry[];
  preview: FibGeometry | null;
  digits: number;
  selectedId?: string | null;
}) {
  const all = preview ? [...geoms, preview] : geoms;
  if (all.length === 0) return null;
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
        {all.map((g) => {
          const isPreview = g === preview;
          const selected = !isPreview && g.id === selectedId;
          const handleColor = g.color ?? '#2962FF';
          return (
            <g key={isPreview ? 'preview' : g.id} opacity={isPreview ? 0.6 : 1}>
              {g.polys.map((pl, i) => (
                <polygon key={`p${i}`} points={ptsAttr(pl.pts)} fill={pl.color} fillOpacity={0.08} stroke="none" />
              ))}
              {g.bands.map((b, i) => (
                <rect
                  key={i}
                  x={g.x1} y={b.yTop}
                  width={g.x2 - g.x1} height={b.yBot - b.yTop}
                  fill={b.color}
                  fillOpacity={0.08}
                />
              ))}
              {g.levels.map((l) => (
                <line
                  key={l.ratio}
                  x1={g.x1} y1={l.y} x2={g.x2} y2={l.y}
                  stroke={l.color}
                  strokeWidth={g.width}
                  strokeDasharray={isPreview ? '5 4' : g.dash || undefined}
                />
              ))}
              {g.levels.map((l) => (
                <text
                  key={`t${l.ratio}`}
                  x={g.x1 + 4} y={l.y - 3}
                  textAnchor="start"
                  fontSize={10}
                  fontFamily="monospace"
                  fill={l.color}
                  paintOrder="stroke"
                  stroke="var(--bg-elevated)"
                  strokeWidth={3}
                >
                  {formatFibLabel(l.ratio, l.price, digits)}
                </text>
              ))}
              {g.lines.map((l, i) => (
                <line
                  key={`ln${i}`}
                  x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke={l.color}
                  strokeWidth={g.width}
                  strokeDasharray={isPreview ? '5 4' : l.dash ?? (g.dash || undefined)}
                />
              ))}
              {g.curves.map((c, i) => (
                <polyline
                  key={`cv${i}`}
                  points={ptsAttr(c.closed && c.pts.length ? [...c.pts, c.pts[0]] : c.pts)}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={g.width}
                  strokeDasharray={isPreview ? '5 4' : g.dash || undefined}
                />
              ))}
              {g.connectors.map((c, i) => (
                <line
                  key={`c${i}`}
                  x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                  stroke={g.color ?? '#787B86'}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  opacity={0.6}
                />
              ))}
              {g.texts.map((t, i) => (
                <text
                  key={`tx${i}`}
                  x={t.x} y={t.y}
                  textAnchor={t.anchor}
                  fontSize={t.size ?? 10}
                  fontWeight={t.bold ? 700 : undefined}
                  fontFamily="monospace"
                  fill={t.color}
                  paintOrder="stroke"
                  stroke="var(--bg-elevated)"
                  strokeWidth={3}
                >
                  {t.text}
                </text>
              ))}
              {(selected || isPreview) && g.handles.map((h) => (
                <circle
                  key={h.id}
                  cx={h.x} cy={h.y}
                  r={5.5}
                  fill="var(--bg-elevated)"
                  stroke={handleColor}
                  strokeWidth={2}
                />
              ))}
            </g>
          );
        })}
      </svg>
      {geoms.map((g) =>
        g.label ? (
          <span
            key={`l${g.id}`}
            className="pointer-events-none absolute z-20 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ left: g.labelX, top: g.labelY, backgroundColor: g.color ?? '#2962FF' }}
          >
            {g.label}
          </span>
        ) : null,
      )}
    </>
  );
}
