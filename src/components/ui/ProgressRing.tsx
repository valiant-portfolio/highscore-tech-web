// ProgressRing — circular progress indicator. Used for project completion %,
// worker tier progress, etc. Pure SVG, no animation library.

import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  /** 0 – 1 */
  value: number;
  size?: number;        // px
  strokeWidth?: number; // px
  /** Color of the filled track. Defaults to brand. */
  color?: string;
  /** Color of the unfilled track. Defaults to a graphite. */
  trackColor?: string;
  label?: string;       // text rendered inside the ring
  className?: string;
}

export function ProgressRing({
  value,
  size = 72,
  strokeWidth = 6,
  color = 'var(--brand)',
  trackColor = 'var(--surface-active)',
  label,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 360ms var(--ease-out)' }}
        />
      </svg>
      {label !== undefined && (
        <span className="absolute inset-0 inline-flex items-center justify-center text-sm font-semibold text-fg tabular">
          {label}
        </span>
      )}
    </span>
  );
}
