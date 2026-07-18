'use client';

// Small presentational + live pieces shared by the trading-bot monitor.
// Client components so the relative times tick and the page can auto-refresh.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// The bot writes each market every ~60s; older than this = something's wrong.
export const STALE_MS = 3 * 60_000;

function since(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Date.now() - t : null;
}

/** Live "12s ago" that updates itself every second. */
export function TimeAgo({ iso, className = '' }: { iso: string | null | undefined; className?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = since(iso);
  if (ms === null) return <span className={className}>never</span>;
  const s = Math.floor(ms / 1000);
  const label = s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s / 60)}m ago` : s < 86400 ? `${Math.floor(s / 3600)}h ago` : `${Math.floor(s / 86400)}d ago`;
  return <span className={className}>{label}</span>;
}

/** Trend pill: green up / red down / grey none. */
export function TrendChip({ trend, label }: { trend: string | null; label?: string }) {
  const t = (trend ?? '').toLowerCase();
  const up = t.includes('up');
  const down = t.includes('down');
  const cls = up ? 'bg-success/15 text-success' : down ? 'bg-danger/15 text-danger' : 'bg-surface-hover text-fg-muted';
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${cls}`}>
      <Icon className="h-3 w-3" />
      {label ? <span className="opacity-70">{label}</span> : null}
      {up ? 'Up' : down ? 'Down' : 'Flat'}
    </span>
  );
}

const STATE_STYLE: Record<string, { cls: string; label: string }> = {
  watching:    { cls: 'bg-surface-hover text-fg-muted',   label: 'Watching' },
  held:        { cls: 'bg-warning/15 text-warning',       label: 'Held' },
  setup_ready: { cls: 'bg-brand/15 text-brand',           label: 'Setup ready' },
  order:       { cls: 'bg-warning/15 text-warning',       label: 'Order resting' },
  position:    { cls: 'bg-success/15 text-success',       label: 'In position' },
};

/** State badge with the meanings from FRONTEND.md. */
export function StateBadge({ state }: { state: string | null }) {
  const s = STATE_STYLE[(state ?? '').toLowerCase()] ?? { cls: 'bg-surface-hover text-fg-muted', label: state ?? '—' };
  return <span className={`inline-flex h-6 items-center rounded-md px-2 text-[11px] font-bold ${s.cls}`}>{s.label}</span>;
}

/**
 * Whole-bot online indicator + auto-refresh. The bot writes continuously; if the
 * newest write is older than STALE_MS it's offline. Also refreshes the server
 * component every `intervalMs` so the monitor stays live without a manual reload.
 */
export function BotStatus({ lastUpdate, intervalMs = 30_000 }: { lastUpdate: string | null; intervalMs?: number }) {
  const router = useRouter();
  const [, tick] = useState(0);

  useEffect(() => {
    const clock = setInterval(() => tick((n) => n + 1), 1000);
    const refresh = setInterval(() => router.refresh(), intervalMs);
    return () => { clearInterval(clock); clearInterval(refresh); };
  }, [router, intervalMs]);

  const ms = since(lastUpdate);
  const online = ms !== null && ms < STALE_MS;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
        online ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger'
      }`}
    >
      <span className={`relative flex h-2 w-2`}>
        {online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${online ? 'bg-success' : 'bg-danger'}`} />
      </span>
      {online ? 'Bot online' : 'Bot offline'} · <TimeAgo iso={lastUpdate} className="font-semibold opacity-80" />
    </span>
  );
}

/** Small inline sparkline for the equity curve (no chart lib needed). */
export function Sparkline({ values, width = 260, height = 56 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <div className="text-xs text-fg-subtle">Not enough data yet.</div>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * height).toFixed(1)}`);
  const up = values[values.length - 1] >= values[0];
  const stroke = up ? 'var(--color-success, #4ADE80)' : 'var(--color-danger, #F87171)';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="max-w-full">
      <polyline points={pts.join(' ')} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
