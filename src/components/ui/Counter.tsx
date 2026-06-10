'use client';

// Counter — animated number ticker. Use for stat cards and hero metrics.
// Animates from 0 to `value` over `dur-cinematic` on first viewport entry.

import { useEffect, useRef, useState } from 'react';
import { easeOut, dur } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface CounterProps {
  value: number;
  /** Starting value (default 0). */
  from?: number;
  /** Decimals to render. Default 0. */
  decimals?: number;
  /** Locale used for formatting. Default 'en'. */
  locale?: string;
  /** Prefix/suffix shown literally next to the number. */
  prefix?: string;
  suffix?: string;
  /** Re-trigger animation when value changes. Default true. */
  reanimate?: boolean;
  className?: string;
}

function easeOutCubicBezier(t: number): number {
  // Match easeOut [0.22, 1, 0.36, 1] approximately via cubic-out.
  return 1 - Math.pow(1 - t, 3);
}

export function Counter({
  value,
  from = 0,
  decimals = 0,
  locale = 'en',
  prefix = '',
  suffix = '',
  reanimate = true,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<number>(from);
  const animatedOnce = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && (!animatedOnce.current || reanimate)) {
          animatedOnce.current = true;
          const duration = dur.cinematic * 1000;
          const start = performance.now();
          const target = value;
          const startValue = from;
          let frame = 0;
          const tick = (now: number) => {
            const elapsed = Math.min(1, (now - start) / duration);
            const eased = easeOutCubicBezier(elapsed);
            setDisplay(startValue + (target - startValue) * eased);
            if (elapsed < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
          return () => cancelAnimationFrame(frame);
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
    // We intentionally watch `value` so a fresh viewport-entry after a value
    // change re-triggers when reanimate is true.
    // easeOut import is referenced for callsite parity; suppress lint warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, from, reanimate]);

  // Suppress unused-import lint for easeOut (kept for parity with motion API).
  void easeOut;

  return (
    <span ref={ref} className={cn('tabular', className)}>
      {prefix}
      {new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(display)}
      {suffix}
    </span>
  );
}
