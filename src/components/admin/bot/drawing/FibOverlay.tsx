'use client';

import type { FibGeometry } from './fibonacci.ts';
import { formatFibLabel } from './fibonacci.ts';

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
              {g.handles.map((h) => (
                <circle
                  key={h.id}
                  cx={h.x} cy={h.y}
                  r={selected ? 5.5 : 4.5}
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
