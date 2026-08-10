'use client';

// Small presentational + live pieces shared by the trading-bot monitor.
// Client components so the relative times tick and the page can auto-refresh.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// The bot writes each market every ~60s; older than this = something's wrong.
export const STALE_MS = 3 * 60_000;

function since(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Date.now() - t : null;
}

/**
 * "as of 12s ago", turning amber once the data is stale.
 *
 * Its own ticker, so it keeps re-evaluating rather than freezing at whatever the
 * last render computed — the whole point is to expose a page that has stopped
 * refreshing, which is exactly when a parent's render-time check would be stuck
 * too. Reads the clock in an effect, not during render.
 */
export function AsOfTag({ iso }: { iso: string | null | undefined }) {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const check = () => setStale(!!iso && Date.now() - new Date(iso).getTime() > STALE_MS);
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [iso]);

  if (!iso) return null;
  return (
    <span className={`ml-2 font-normal ${stale ? 'font-semibold text-warning' : 'text-fg-subtle'}`}>
      {stale && '⚠ '}as of <TimeAgo iso={iso} />{stale && ' — reload'}
    </span>
  );
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

/**
 * How long something has been running, to the minute: `5h14m`.
 *
 * Distinct from TimeAgo on purpose. "5h ago" is fine for a timestamp, but a trade
 * that has been open 5h59m is not the same trade as one open 5h01m — position age
 * is read against the session and the timeframe, so the minutes matter.
 */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (d > 0) return `${d}d ${h}h${pad(m)}m`;
  if (h > 0) return `${h}h${pad(m)}m`;
  if (m > 0) return `${m}m${pad(s)}s`;
  return `${s}s`;
}

/** Live trade duration counted from `from`, ticking every second. */
export function Duration({ from, className = '' }: { from: string | null | undefined; className?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = since(from);
  // A negative age means the clock disagrees with the broker's, not a 0s trade;
  // don't dress that up as a duration.
  if (ms === null || ms < 0) return <span className={className}>—</span>;
  return <span className={className}>{formatDuration(ms)}</span>;
}

// v7: three trend states only — 🟢 Uptrend, ⚪ Sideways, 🔴 Downtrend. Strength
// tiers were dropped. Keyed on the exact strings the bot writes to
// bot_market_state.entry_trend / htf_trend.
const TREND_STYLE: Record<string, { cls: string; dot: string }> = {
  'uptrend':   { cls: 'bg-success/20 text-success',     dot: '🟢' },
  'sideways':  { cls: 'bg-surface-hover text-fg-muted', dot: '⚪' },
  'downtrend': { cls: 'bg-danger/20 text-danger',       dot: '🔴' },
};

/** Trend pill carrying the full tier name. */
export function TrendChip({ trend, label }: { trend: string | null; label?: string }) {
  const s = TREND_STYLE[(trend ?? '').toLowerCase()];
  if (!s) {
    return (
      <span className="inline-flex items-center rounded-md bg-surface-hover px-2 py-0.5 text-[11px] font-bold text-fg-subtle">
        {trend ?? '—'}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${s.cls}`}>
      <span aria-hidden>{s.dot}</span>
      {label ? <span className="opacity-70">{label}</span> : null}
      {trend}
    </span>
  );
}

const STATE_STYLE: Record<string, { cls: string; label: string }> = {
  monitoring: { cls: 'bg-surface-hover text-fg-muted', label: 'Monitoring' },
  ready:      { cls: 'bg-brand/15 text-brand',         label: 'Ready' },
  active:     { cls: 'bg-success/15 text-success',     label: 'Active' },
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
export function BotStatus({ lastUpdate, intervalMs = 30_000, compact = false }: { lastUpdate: string | null; intervalMs?: number; compact?: boolean }) {
  const router = useRouter();
  const [, tick] = useState(0);

  useEffect(() => {
    const clock = setInterval(() => tick((n) => n + 1), 1000);
    const refresh = setInterval(() => router.refresh(), intervalMs);

    // Browsers throttle or suspend timers in a backgrounded tab, so the interval
    // above stops firing while you are elsewhere. Coming back to a dashboard
    // frozen minutes ago is actively misleading here — it can show a closed
    // trade as still open. Refresh immediately on return to the tab.
    const onVisible = () => { if (document.visibilityState === 'visible') router.refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      clearInterval(clock);
      clearInterval(refresh);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [router, intervalMs]);

  const ms = since(lastUpdate);
  const online = ms !== null && ms < STALE_MS;

  // Compact: just a pulsing dot (title carries the detail). Keeps the top tight
  // while still auto-refreshing the page every intervalMs.
  if (compact) {
    return (
      <span
        title={online ? 'Bot online' : 'Bot offline'}
        aria-label={online ? 'Bot online' : 'Bot offline'}
        className="relative flex h-2.5 w-2.5 shrink-0"
      >
        {online && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${online ? 'bg-success' : 'bg-danger'}`} />
      </span>
    );
  }

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
