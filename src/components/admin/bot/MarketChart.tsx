'use client';

// Candlestick chart for one market, TradingView Lightweight Charts (MIT).
//
// Data is read STRAIGHT FROM SUPABASE in the browser — no Next.js API route, so
// no Netlify Function per tick. Access is gated by admin-only RLS
// (trading-bot-db/frontend_admin_read_policies.sql): only a logged-in admin or
// trading-bot staff can SELECT these tables; the anon key alone reads nothing.
//   • history  → bot_bars (OHLCV) + this market's bot_trades
//   • live     → bot_quotes (bid/ask) + bot_market_state (floating P&L), ~3s
//
// Overlays for an open position OR a resting PENDING order: a blue ENTRY line
// (solid once filled, dashed while the order is still pending) plus dashed SL/TP,
// all drawn by default. The selected market + timeframe persist across a refresh
// (localStorage). Client-side indicators (MA/EMA/Bollinger) and manual drawings
// (h-line/trend) are drawn on top.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createBotClient } from '@/lib/supabase/bot-client';
import {
  CandlestickChart, MousePointer2, Minus, PenLine, Eraser, Maximize2, Minimize2,
  Crosshair, Search, Trash2, X, ChevronDown, LineChart, Grid3x3, BarChart3,
  Lock, Unlock, Eye, EyeOff, Type, Zap, Undo2, Redo2, Camera,
  Bookmark, FileText, Layers, Code2, Check, Star, ChevronsLeft, ChevronsRight,
  ChevronRight, Slash, MoveUpRight, ArrowLeftRight, ArrowRightToLine, ArrowLeftToLine,
  GripVertical, MoreVertical, Copy, RotateCcw, GitFork, Magnet, Circle,
} from 'lucide-react';
import { TimeAgo } from './BotBits';
import {
  computeFibGeometries, computeFibGeometry, fibHitTest, makeFibDrawing, fibClicksNeeded,
  duplicateFib, shiftFib, fibPrompt, FIB_SPECS, FIB_SPEC_LIST, FIB_TOOL_VARIANT,
  type FibDrawing, type FibGeometry, type FibPoint, type FibToolId, type FibToggle,
} from './drawing/fibonacci.ts';
import { FIB_TOOL_ICONS } from './drawing/fibTools.tsx';
import { makeFibCtx, clickToFibPoint, dragDeltaLogical } from './drawing/fibChart.ts';
import { inferBarSecs } from './drawing/barTime.ts';
import { FibOverlay } from './drawing/FibOverlay.tsx';
import {
  createChart, CandlestickSeries, LineSeries, LineStyle, createSeriesMarkers,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type Time,
  type SeriesMarker, type IPriceLine, type ISeriesMarkersPluginApi,
  type MouseEventParams,
} from 'lightweight-charts';

type Tool =
  | 'cursor' | 'hline' | 'trend' | 'text' | 'ray' | 'extended' | 'hray'
  | 'pitchfork' | 'schiff' | 'mschiff' | 'inside'
  | 'cross' | 'vline' | 'info' | 'angle' | 'arrow'
  | 'chpar' | 'chdis' | 'chflat' | 'chlin'
  | FibToolId;

/** Which channel a tool draws. All but the regression take three clicks and
 *  differ only in what the third one means — see channelSegments. */
type ChannelVariant = 'parallel' | 'disjoint' | 'flat' | 'linreg';
const CHANNEL_VARIANT: Partial<Record<Tool, ChannelVariant>> = {
  chpar: 'parallel', chdis: 'disjoint', chflat: 'flat', chlin: 'linreg',
};

/** Which fork a tool draws. All four take the same three clicks and differ
 *  only in where the median STARTS — see forkOrigin. */
type ForkVariant = 'andrews' | 'schiff' | 'mschiff' | 'inside';
const FORK_VARIANT: Partial<Record<Tool, ForkVariant>> = {
  pitchfork: 'andrews', schiff: 'schiff', mschiff: 'mschiff', inside: 'inside',
};

/** The drawing menu, in the design's order and wording. `clicks` is how many
 *  points a tool needs; `soon` is drawn but not armable, because a menu that
 *  hides what it cannot do sends you hunting for a tool that is not there. */
type DrawItem = {
  tool?: Tool; label: string; keys?: string; clicks?: 1 | 2 | 3 | 4; glyph: string; soon?: true;
};
const LINE_TOOLS: DrawItem[] = [
  { tool: 'trend', label: 'Trend Line', keys: 'Alt+T', clicks: 2, glyph: '/' },
  { tool: 'hline', label: 'Horizontal Line', keys: 'Alt+H', clicks: 1, glyph: '—' },
  { tool: 'ray', label: 'Ray', clicks: 2, glyph: '↗' },
  { tool: 'extended', label: 'Extended Line', clicks: 2, glyph: '↔' },
  { tool: 'vline', label: 'Vertical Line', keys: 'Alt+V', clicks: 1, glyph: '|' },
  { tool: 'hray', label: 'Horizontal Ray', clicks: 1, glyph: '⊢' },
  { tool: 'cross', label: 'Cross Line', clicks: 1, glyph: '+' },
  { tool: 'info', label: 'Info Line', clicks: 2, glyph: '⟋' },
  { tool: 'angle', label: 'Trend Angle', clicks: 2, glyph: '∠' },
  // A trend line that says which way it points. Two clicks like the others;
  // the head sits on the second, so the line reads as aimed rather than drawn.
  { tool: 'arrow', label: 'Arrow', clicks: 2, glyph: '↗' },
];
const CHANNEL_TOOLS: DrawItem[] = [
  { tool: 'chpar', label: 'Parallel Channel', clicks: 3, glyph: '⫽' },
  // FOUR clicks: both ends of both lines. Its second boundary is free of the
  // first, so there is no third point that could imply where it ends - that
  // has to be asked for.
  { tool: 'chdis', label: 'Disjoint Channel', clicks: 4, glyph: '≻' },
  { tool: 'chflat', label: 'Flat Top/Bottom', clicks: 3, glyph: '⊐' },
  // Two clicks: it needs a RANGE of candles, not a third point — the channel
  // is computed from the closes inside it rather than placed by hand.
  { tool: 'chlin', label: 'Linear Regression', clicks: 2, glyph: '≋' },
];
const isChannelTool = (t: Tool): boolean => t in CHANNEL_VARIANT;

const PITCHFORK_TOOLS: DrawItem[] = [
  { tool: 'pitchfork', label: 'Pitchfork', clicks: 3, glyph: '⊢E' },
  { tool: 'schiff', label: 'Schiff Pitchfork', clicks: 3, glyph: '⊢E' },
  { tool: 'mschiff', label: 'Modified Schiff Pitchfork', clicks: 3, glyph: '⊢E' },
  { tool: 'inside', label: 'Inside Pitchfork', clicks: 3, glyph: '⊣E' },
];
/** The one tool of ours the design has no name for — it is the labelled
 *  horizontal line, and it belongs with the lines. */
const EXTRA_TOOLS: DrawItem[] = [
  { tool: 'text', label: 'Labelled Level', keys: 'Alt+L', clicks: 1, glyph: 'T' },
];
/** The Fibonacci family, derived from the registry in drawing/fibModel.ts.
 *  Specs whose builder has not landed show greyed. No keyboard shortcut. */
const FIB_TOOLS: DrawItem[] = FIB_SPEC_LIST.map((s) => ({
  tool: s.toolId, label: s.label, clicks: s.clicks, glyph: s.glyph,
  ...(s.ready ? {} : { soon: true as const }),
}));
/** Gann and Geometry share the Fibonacci button in the design, so they are
 *  listed under it rather than given a button of their own. None are built;
 *  they are shown greyed for the same reason a missing fib spec is — a tool
 *  absent from the menu reads as one you misremembered. */
const GANN_TOOLS: DrawItem[] = [
  { label: 'Gann Fan', glyph: '◤', soon: true },
  { label: 'Gann Box', glyph: '▦', soon: true },
  { label: 'Gann Square', glyph: '▧', soon: true },
];
const GEOMETRY_TOOLS: DrawItem[] = [
  { label: 'Dedekind Tessellation', glyph: '◠', soon: true },
  { label: 'Sonic', glyph: '◗', soon: true },
  { label: 'Supersonic', glyph: '◖', soon: true },
  { label: 'Golden Sonic', glyph: '◑', soon: true },
  { label: 'Golden Supersonic', glyph: '◐', soon: true },
];

const isFibTool = (t: Tool): t is FibToolId => t in FIB_TOOL_VARIANT;

/** Every drawing tool in one list. The armed-tool banner and the rail's
 *  tooltip both need to turn a Tool back into its menu entry, and each kept
 *  its own hand-written spread — so Channels, added last, was missing from
 *  both and a channel announced itself as "chdis". */
const ALL_DRAW_TOOLS: DrawItem[] = [
  ...LINE_TOOLS, ...EXTRA_TOOLS, ...CHANNEL_TOOLS, ...PITCHFORK_TOOLS,
  ...FIB_TOOLS, ...GANN_TOOLS, ...GEOMETRY_TOOLS,
];

/** The rail button wears the CURRENT tool's icon, which is how the design
 *  tells you what a click will draw without a tooltip or an open menu — theirs
 *  shows a dash because Horizontal Line is selected, not because the button is
 *  a dash. */
const TOOL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  hline: Minus,
  hray: ArrowRightToLine,
  trend: Slash,
  ray: MoveUpRight,
  extended: ArrowLeftRight,
  text: Type,
  pitchfork: GitFork,
  schiff: GitFork,
  mschiff: GitFork,
  inside: GitFork,
  cross: Crosshair,
  vline: Minus,
  info: Slash,
  angle: Slash,
  arrow: MoveUpRight,
  ...FIB_TOOL_ICONS,
};

// One browser Supabase client for the module, pointed at the BOT project — the
// bot_* tables no longer live in the main app's database. There is no shared
// session across projects, so these reads are governed by the bot project's own
// RLS policies rather than by the logged-in user.
const supabase = createBotClient();

const STORE_KEY = 'bot-chart-selection'; // persists {symbol, tf} across a refresh

// v6: bot_bars now syncs 8 timeframes. The DB stores D1/W1 but Olivia's picker
// labels them Day1/WK1 — so keep label + value separate. M1 is deliberately NOT
// synced (Deriv caps its history); leaving it out avoids an empty chart.
// v7: bot_bars syncs ONLY M15 and H1 now — every other timeframe returns empty.
const TIMEFRAMES: { label: string; value: string }[] = [
  { label: 'M15', value: 'M15' },
  { label: 'H1', value: 'H1' },
];
const TF_VALUES = TIMEFRAMES.map((t) => t.value);

// The design's full timeframe menu. Only the two above have candles — bar_sync
// stores M15 and H1 (backend v7) — so the rest are listed and disabled rather
// than offered and then answered with an empty chart.
const ALL_TIMEFRAMES: { label: string; value: string }[] = [
  { label: '1m', value: 'M1' }, { label: '5m', value: 'M5' }, { label: '15m', value: 'M15' },
  { label: '30m', value: 'M30' }, { label: '1h', value: 'H1' }, { label: '4h', value: 'H4' },
  { label: '1D', value: 'D1' }, { label: '1W', value: 'W1' }, { label: '1M', value: 'MN1' },
];

// Likewise: the series is a candlestick series and the trade markers and SL/TP
// price lines hang off it, so the other six are shown and disabled.
const CHART_TYPES = [
  'Candles', 'Hollow Candles', 'Bars', 'Line', 'Area', 'Baseline', 'Heikin Ashi',
] as const;
const TF_SECONDS: Record<string, number> = {
  M15: 900, H1: 3600,
};
// The live quote only rolls a brand-new forming candle for intraday buckets,
// where UTC-epoch alignment matches the broker's bars. For H4 and higher we just
// extend the last historical bar with the live price (epoch buckets wouldn't line
// up with the broker's week/month boundaries and would paint a spurious bar).
const INTRADAY_MAX_SECS = 3600;

type Candle = { time: UTCTimestamp; open: number; high: number; low: number; close: number };

function utcTz(dateStrOrMs: string | number): UTCTimestamp {
  const ms = typeof dateStrOrMs === 'string' ? new Date(dateStrOrMs).getTime() : dateStrOrMs;
  return (Math.floor(ms / 1000) + new Date().getTimezoneOffset() * 60) as UTCTimestamp;
}
interface Trade {
  id: string; side: string; open_ts: string; open_price: number;
  close_ts: string | null; close_price: number | null; sl: number | null; tp: number | null;
  pnl: number | null; close_reason: string | null;
}

// A manual drawing, saved to localStorage so it survives a refresh. Horizontal
// lines + trend lines are stored as raw price/time so they can be re-rendered and
// dragged. Keyed per symbol+timeframe — a level drawn on VOL25 M15 is meaningless
// on EURUSD.
type Drawing =
  // `label` (optional) is what the text tool writes: a level that says WHY it
  // is there — "Asia high" — instead of a bare line you have to remember.
  /* colour, width and dash are per-drawing and optional: absent means the
   * defaults, which is what every drawing saved before the style toolbar
   * existed looks like. */
  | {
      id: string; kind: 'hline'; price: number; label?: string;
      color?: string; width?: number; style?: 'solid' | 'dashed' | 'dotted';
    }
  /* EVERY ANCHOR IN ONE ARRAY.
   *
   * These carried t1/v1 through t4/v4, a pair per click, and every function
   * that touched a drawing had to know which kind had how many: the body drag
   * listed them by hand, the anchor drag switched on a letter, duplicate
   * nudged each in turn. Adding the channel's fourth point meant editing all
   * of them, and a missed one is a drawing that warps when you move it.
   *
   * `pts` is the clicks, in order. One drag path, one hit test, one preview —
   * and a tool that wants five points needs no change to any of them.
   *
   * hline keeps `price`: it has no time, so it is not a point. Fibonacci keeps
   * its own model — that is Samuel's module and it is not ours to reshape.
   */
  | {
      id: string; kind: 'trend'; pts: DPt[];
      /* How far the line runs beyond the clicks that define it:
       *   segment  — between them and no further (the default)
       *   ray      — from the first click through the second and onward
       *   extended — both directions, across the chart
       *   hray     — flat, from one click onward */
      reach?: 'segment' | 'ray' | 'extended' | 'hray';
      color?: string; width?: number; style?: 'solid' | 'dashed' | 'dotted';
      label?: string;
      /** Info and Angle are trend lines that report on themselves, so they are
       *  this kind with a readout rather than kinds of their own. Computed at
       *  render: a stored string would describe where the line used to be. */
      readout?: 'info' | 'angle';
      /** Draws a head on the second point. */
      arrow?: true;
      /** Per drawing, not per chart: one line can be pinned while the rest
       *  stay editable, which a single global lock cannot express. */
      locked?: boolean;
    }
  /** A moment, marked. Its point carries a price nothing reads — a vertical
   *  line is about WHEN, and has no height to move. */
  | {
      id: string; kind: 'vline'; pts: DPt[]; label?: string;
      color?: string; width?: number; style?: 'solid' | 'dashed' | 'dotted';
    }
  /** A time AND a price — the two lines crossing where you clicked. */
  | {
      id: string; kind: 'cross'; pts: DPt[]; label?: string;
      color?: string; width?: number; style?: 'solid' | 'dashed' | 'dotted';
    }
  /** Andrews and the three Schiff variants: pivot, then the swing off it. */
  | {
      id: string; kind: 'pitchfork'; pts: DPt[];
      color?: string; width?: number; style?: 'solid' | 'dashed' | 'dotted';
      label?: string;
      /** Absent means Andrews — every fork saved before the variants existed. */
      variant?: ForkVariant;
    }
  /** Channels. Two points for a regression (a RANGE), three for parallel and
   *  flat, four for disjoint — whose second line is free of the first. */
  | {
      id: string; kind: 'channel'; variant: ChannelVariant; pts: DPt[];
      color?: string; width?: number; style?: 'solid' | 'dashed' | 'dotted';
      label?: string;
      /** The tint between the boundaries. On by default. */
      fill?: boolean;
    }
  | FibDrawing;

/** The palette the style toolbar offers. */
const DRAW_COLORS = ['#2962FF', '#26a69a', '#ef5350', '#f59e0b', '#a855f7', '#e5e7eb'];
const DRAW_WIDTHS = [1, 2, 3, 4] as const;
/* Dash patterns are theirs: DASH = { solid: undefined, dashed: "8 5",
 * dotted: "2 4" }. Ours were 6 4 and 2 3, which reads tighter at the same width. */
const DRAW_STYLES = [
  { key: 'solid', label: 'Solid', dash: '' },
  { key: 'dashed', label: 'Dashed', dash: '8 5' },
  { key: 'dotted', label: 'Dotted', dash: '2 4' },
] as const;
const lwStyle = (s?: string) =>
  s === 'dotted' ? LineStyle.Dotted : s === 'solid' ? LineStyle.Solid : LineStyle.Dashed;

/* THE TIMEFRAME RING.
 *
 * A dial rather than a dropdown: every timeframe is on screen at once and sits
 * in the same place every time, so picking one becomes muscle memory instead of
 * a read-then-click down a list.
 *
 * The ones with no candles are DRAWN, not hidden. bot_bars carries M15 and H1
 * only, and a ring that quietly omitted the rest would have you hunting the
 * menu for a timeframe that was never there — the same reason the dropdown it
 * replaces lists them disabled. Greyed says "not here yet"; absent says
 * "you misremembered".
 *
 * Laid out with trig off a single radius so the ring stays round at any count:
 * labels sit on a circle, each rotated to face outward the way a dial reads.
 */
function TimeframeRing({ value, live, onPick, onClose }: {
  value: string;
  live: string[];
  onPick: (v: string) => void;
  onClose: () => void;
}) {
  const R = 118;                       // label circle radius, px
  const n = ALL_TIMEFRAMES.length;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <button
        type="button"
        aria-label="Close timeframes"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />
      <div
        className="relative rounded-full border border-brand/30 bg-bg-elevated/95 shadow-2xl backdrop-blur"
        style={{ width: R * 2 + 76, height: R * 2 + 76 }}
        role="menu"
        aria-label="Timeframe"
      >
        {/* The hole. It is what makes this a dial and not a pie, and it keeps
            the current timeframe readable in the middle of the ring. */}
        <div
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-border bg-bg"
          style={{ width: R, height: R }}
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-fg-subtle">Timeframe</span>
          <span className="font-mono text-lg font-bold text-brand">{value}</span>
        </div>

        {ALL_TIMEFRAMES.map((f, i) => {
          // Start at the top and go clockwise, which is how a dial is read.
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const synced = live.includes(f.value);
          const on = f.value === value;
          return (
            <button
              key={f.value}
              type="button"
              role="menuitemradio"
              aria-checked={on}
              disabled={!synced}
              title={synced ? `Show ${f.label}` : 'No candles stored for this timeframe yet'}
              onClick={synced ? () => { onPick(f.value); onClose(); } : undefined}
              style={{
                left: `calc(50% + ${Math.cos(a) * R}px)`,
                top: `calc(50% + ${Math.sin(a) * R}px)`,
              }}
              className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                on
                  ? 'bg-brand text-brand-fg'
                  : synced
                    ? 'text-fg hover:bg-brand/15 hover:text-brand'
                    // Dimmed and inert, but present — see the note above.
                    : 'cursor-not-allowed text-fg-subtle/40'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* THE CHANNELS.
 *
 * p1-p2 is the line you drew. What follows differs by variant:
 *
 *   parallel  the second boundary is p1-p2 moved VERTICALLY to p3 — same span
 *             of time, same slope, a price offset. Not a perpendicular shift:
 *             that slides the boundary along the time axis too, so the two
 *             lines covered different stretches of chart and the channel came
 *             out as a leaning parallelogram rather than a corridor over the
 *             bars it describes.
 *   disjoint  a second line with its own two ends, p3 and p4. It starts
 *             parallel and stops being so as soon as either end moves, which
 *             is the point of it — this one can converge.
 *   flat      horizontal at p3's price, across the same span. Horizontal is the
 *             whole claim of the tool, so it is enforced here.
 *
 * Pixels, like the pitchfork: price and time carry different units, so a slope
 * matched in price space would not look matched on screen.
 */
function channelSegments(
  p1: Pt, p2: Pt, p3: Pt | null, p4: Pt | null,
  variant: ChannelVariant, id: string,
  style: { color: string; width: number; dash: string },
): { segs: Seg[]; quad: Pt[] | null } {
  const { color, width, dash } = style;
  const seg = (segId: string, a: Pt, b: Pt): Seg =>
    ({ id: segId, x1: a.x, y1: a.y, x2: b.x, y2: b.y, color, width, dash });
  if (!p3) return { segs: [seg(id, p1, p2)], quad: null };

  let q1: Pt, q2: Pt;
  if (variant === 'flat') {
    q1 = { x: p1.x, y: p3.y };
    q2 = { x: p2.x, y: p3.y };
  } else if (variant === 'disjoint') {
    /* Theirs:
     *   if (c && q4) { segs.push([c,q4]); area = a,b,c,q4 }
     *   else if (c)  { area = a,b,c }
     * With only three down - which is what the preview has - there is no second
     * line yet, just the triangle the three points make. Falling through to the
     * parallel branch here would preview a corridor and then draw a wedge. */
    if (!p4) return { segs: [seg(id, p1, p2)], quad: [p1, p2, p3] };
    q1 = p3;
    q2 = p4;
  } else {
    // Theirs, verbatim:
    //   off = c.y - (a.y + ((b.y - a.y) * (c.x - a.x)) / ((b.x - a.x) || 1))
    const off = p3.y - (p1.y + ((p2.y - p1.y) * (p3.x - p1.x)) / ((p2.x - p1.x) || 1));
    q1 = { x: p1.x, y: p1.y + off };
    q2 = { x: p2.x, y: p2.y + off };
  }
  /* Theirs orders the disjoint fill a,b,c,d and the parallel fill
   * a,b,(b+off),(a+off). Kept as they have it. */
  const quad = variant === 'disjoint' ? [p1, p2, q1, q2] : [p1, p2, q2, q1];
  return { segs: [seg(id, p1, p2), seg(`${id}#b`, q1, q2)], quad };
}

/* LINEAR REGRESSION, from the candles themselves.
 *
 * Least squares over the closes between the two clicks, with the bands at one
 * standard deviation of the residuals. Computed from the DATA, not drawn by
 * hand, which is the whole claim the tool makes — so it is recomputed whenever
 * the range or the bars change, and says nothing when there is too little to
 * fit a line to.
 */
function regressionFit(closes: number[]): { a: number; b: number; sd: number; r2: number } | null {
  const n = closes.length;
  if (n < 3) return null;                            // two points are not a trend
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += closes[i]; sxy += i * closes[i]; sxx += i * i; }
  const den = n * sxx - sx * sx;
  if (den === 0) return null;
  const b = (n * sxy - sx * sy) / den;               // slope, per bar
  const a = (sy - b * sx) / n;                       // intercept
  const mean = sy / n;
  let ss = 0, tot = 0;
  for (let i = 0; i < n; i++) {
    const r = closes[i] - (a + b * i);
    ss += r * r;
    tot += (closes[i] - mean) ** 2;
  }
  return { a, b, sd: Math.sqrt(ss / n), r2: tot === 0 ? 1 : Math.max(0, 1 - ss / tot) };
}

/* HOW TALL A FLYOUT MAY BE.
 *
 * Position is left to CSS: `absolute left-[calc(100%+6px)] top-0` pins the menu
 * to its own button and cannot drift, which measuring it in JS demonstrably
 * could — a mis-measured rect put the menu in the middle of the chart, nowhere
 * near the control that opened it.
 *
 * The floor is the CHART's bottom edge, not the window's. Measured against the
 * window, the list ran on underneath the status strip — "Trading on 9 markets"
 * sits below the chart and drew over the tail of it, so the last few tools were
 * behind the furniture rather than off the screen. The chart is the room this
 * menu is allowed to use.
 */
function flyoutMaxH(el: HTMLElement | null, within: HTMLElement | null): number {
  const fallback = Math.round(window.innerHeight * 0.6);
  if (!el) return fallback;
  const top = el.getBoundingClientRect().top;
  const floor = within ? within.getBoundingClientRect().bottom : window.innerHeight;
  return Math.max(200, floor - top - 8);
}

/* HOW MANY CLICKS A TOOL WANTS, in one place.
 *
 * It was spread across the click handler as literals — 2 here, 3 there, 4 for
 * the disjoint channel — and the banner counted separately in the JSX. Two
 * places to tell the same truth is one place to get it wrong, and the hint
 * saying "click the third point" for a four-click tool is how that shows up.
 */
function clicksNeeded(tool: Tool, all: DrawItem[]): number {
  return all.find((t) => t.tool === tool)?.clicks ?? 1;
}

/* THE DRAWING A SET OF CLICKS MAKES.
 *
 * One builder, used by the click that commits a drawing AND by the preview
 * that preceded it — the preview passes the clicks so far plus the cursor as
 * the last point, and gets back the SAME drawing the next click would produce.
 *
 * That is the whole reason it exists. Preview and commit used to be separate
 * code: a rubber band here, a ghost there, each worked out by hand per tool.
 * They drifted, and a preview that lies about what it will draw is worse than
 * none - you aim with it.
 */
function buildDrawing(tool: Tool, pts: DPt[], id: string): Drawing | null {
  if (pts.length === 0) return null;
  const fork = FORK_VARIANT[tool];
  if (fork) return { id, kind: 'pitchfork', pts, variant: fork };
  const chan = CHANNEL_VARIANT[tool];
  if (chan) return { id, kind: 'channel', variant: chan, pts, fill: true };
  switch (tool) {
    case 'hline': return { id, kind: 'hline', price: pts[0].v };
    case 'text': return { id, kind: 'hline', price: pts[0].v };
    case 'vline': return { id, kind: 'vline', pts };
    case 'cross': return { id, kind: 'cross', pts };
    case 'hray': return { id, kind: 'trend', reach: 'hray', pts: [pts[0], pts[0]] };
    case 'trend': return { id, kind: 'trend', reach: 'segment', pts };
    case 'ray': return { id, kind: 'trend', reach: 'ray', pts };
    case 'extended': return { id, kind: 'trend', reach: 'extended', pts };
    case 'info': return { id, kind: 'trend', reach: 'segment', readout: 'info', pts };
    case 'angle': return { id, kind: 'trend', reach: 'segment', readout: 'angle', pts };
    case 'arrow': return { id, kind: 'trend', reach: 'segment', arrow: true, pts };
    default: return null;
  }
}

/** How far a ray is walked before the SVG clips it. Theirs. */
const FAR = 6000;

/** One click, stored as the chart stores it: a time and a price, never a
 *  pixel — pixels are what a zoom changes. */
type DPt = { t: number; v: number };

/** A line of the overlay, in pane pixels. */
type Seg = {
  id: string; x1: number; y1: number; x2: number; y2: number;
  color: string; width: number; dash: string;
};
type Pt = { x: number; y: number };

/* ANDREWS' PITCHFORK, as pixels.
 *
 * ONE function for the committed fork and the one still being placed. They were
 * going to be two — syncLabels measuring the saved drawing, the preview drawing
 * a rubber band — and that is how a preview ends up showing something other
 * than what the click produces. The third point is the cursor until it is a
 * click; nothing else about the construction changes.
 *
 * Median: p1 through the midpoint of p2-p3. Tines: p2 and p3, parallel to it.
 * All three run forward from their own anchor, because a fork is read forward.
 * Pixels, not price, because "parallel" has to mean parallel on screen — price
 * and time have different units, so tines built in price space would splay
 * apart as soon as the axis rescaled.
 */
/* WHERE THE MEDIAN STARTS — the only thing separating the four forks.
 *
 * Every variant takes the same three clicks and draws the same three parallel
 * lines through the same two tine anchors. What moves is the origin of the
 * median, and moving it rotates the whole fork:
 *
 *   andrews  p1 itself. The original construction.
 *   schiff   halfway up the p1-p2 move, at p1's TIME. Shifting in price alone
 *            tilts the median toward the second leg without shortening it.
 *   mschiff  the true midpoint of p1-p2, in time AND price — the "modified"
 *            part is precisely that it also moves along the time axis.
 *   inside   the midpoint of p1-p3, the mirror of Schiff's shift: the handle
 *            falls inside the swing rather than running up to its start.
 *
 * ON `inside` — of the four, this is the construction whose published
 * definitions agree least. The rule above is a deliberate, stated choice, not
 * a reading of a standard, and it is one line to change if it should differ.
 */
function forkOrigin(variant: ForkVariant, p1: Pt, p2: Pt, p3: Pt): Pt {
  switch (variant) {
    case 'schiff': return { x: p1.x, y: (p1.y + p2.y) / 2 };
    case 'mschiff': return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    case 'inside': return { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 };
    default: return p1;
  }
}

function forkSegments(
  p1: Pt, p2: Pt, p3: Pt, id: string,
  style: { color: string; width: number; dash: string },
  W: number, H: number,
  variant: ForkVariant = 'andrews',
): Seg[] {
  const origin = forkOrigin(variant, p1, p2, p3);
  const mid = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
  const dx = mid.x - origin.x, dy = mid.y - origin.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return [];                       // all three on one spot
  const ux = dx / len, uy = dy / len;
  const far = (W + H) * 2;
  const { color, width, dash } = style;
  const ray = (from: Pt, segId: string): Seg => ({
    id: segId,
    x1: from.x, y1: from.y, x2: from.x + ux * far, y2: from.y + uy * far,
    color, width, dash,
  });
  return [
    // From the ORIGIN, not from p1 — on the three shifted variants those are
    // different points, and starting at p1 would draw an Andrews fork under
    // every label. The median takes the drawing's own id, which is what puts a
    // label on the median rather than on an arbitrary tine.
    ray(origin, id),
    ray(p2, `${id}#tine-a`),
    ray(p3, `${id}#tine-b`),
    /* THE CONSTRUCTION, both legs: p1 to p2 and p2 to p3.
     *
     * p1-p2 was missing, and it is the leg that SHOWS the variant. Schiff and
     * Modified Schiff lift the median's origin off p1 by a fraction of exactly
     * this segment — with it undrawn, the pivot you clicked floated unattached
     * to anything and the three forks looked like the same fan of lines in
     * slightly different places.
     *
     * Both are dashed and a touch thinner than the fork: they are the swing it
     * was built from, not lines anyone trades off. */
    {
      id: `${id}#leg`, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
      color, width: Math.max(1, width - 1), dash: '4 4',
    },
    {
      id: `${id}#base`, x1: p2.x, y1: p2.y, x2: p3.x, y2: p3.y,
      color, width: Math.max(1, width - 1), dash: '4 4',
    },
  ];
}
/** One colour for everything a PERSON drew, so it never reads as something the
 *  bot put there. The bot's own overlays keep the up/down palette. */
const DRAW_COLOR = '#2962FF';
const DRAW_KEY = (sym: string, tf: string) => `bot-chart-draw:${sym}::${tf}`;
const INDS_KEY = 'bot-chart-inds'; // active indicators persist globally (a user pref)
const FAV_KEY = 'bot-chart-favs';  // starred markets, floated to the top of the search
const IND_FAV_KEY = 'bot-chart-ind-favs'; // starred indicators, for the library's Favorites
const newDrawId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
// Pixel distance from point (px,py) to segment (ax,ay)-(bx,by) — for grabbing a trend line.
function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const fmt = (n: number | null | undefined, digits: number) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toFixed(digits);


/* ── Symbol search ────────────────────────────────────────────────────────
 * Grouping and long names are derived from the symbol itself. Nothing in the
 * database describes an instrument, and a hand-kept table would rot the day the
 * broker adds a market — so an unrecognised symbol keeps its alias and lands in
 * "Other" rather than being labelled with a guess.
 */
type AssetClass = 'fx' | 'metal' | 'index' | 'commodity' | 'other';

const CLASS_TABS: { key: AssetClass | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fx', label: 'Forex' },
  { key: 'metal', label: 'Metals' },
  { key: 'index', label: 'Indices' },
  { key: 'commodity', label: 'Commodities' },
];

const CLASS_TAG: Record<AssetClass, string> = {
  fx: 'FX', metal: 'METAL', index: 'INDEX', commodity: 'COMM', other: '',
};

const CURRENCY: Record<string, string> = {
  EUR: 'Euro', USD: 'U.S. Dollar', GBP: 'British Pound', JPY: 'Japanese Yen',
  AUD: 'Australian Dollar', NZD: 'New Zealand Dollar', CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc', XAU: 'Gold', XAG: 'Silver', XPT: 'Platinum',
  XTI: 'WTI Crude', XBR: 'Brent Crude',
};

function classify(symbol: string): AssetClass {
  const s = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const base = s.slice(0, 3);
  const quote = s.slice(3, 6);
  if (base === 'XAU' || base === 'XAG' || base === 'XPT') return 'metal';
  if (base === 'XTI' || base === 'XBR' || s.startsWith('OIL')) return 'commodity';
  if (s.length === 6 && CURRENCY[base] && CURRENCY[quote]) return 'fx';
  if (/^(VOL|US30|US50|NAS|SPX|GER|UK1|JP2|BOOM|CRASH|STEP)/.test(s)) return 'index';
  return 'other';
}

/**
 * "EURUSD" → "Euro / U.S. Dollar".
 *
 * For anything that is not a recognised pair, the broker's own full name is the
 * subtitle — "VOL25" sits above "Volatility 25 Index" — and a symbol with
 * neither gets no subtitle at all, rather than an invented one.
 */
function describe(symbol: string, alias: string): string {
  const s = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const base = CURRENCY[s.slice(0, 3)];
  const quote = CURRENCY[s.slice(3, 6)];
  if (s.length === 6 && base && quote) return `${base} / ${quote}`;
  return symbol !== alias ? symbol : '';
}

interface Quote { bid: number | null; ask: number | null; spread: number | null; updated_at: string | null; pnl: number | null; state: string | null }

/* ── Indicators (computed client-side from the loaded candles) ─────────── */
type IndId = 'sma20' | 'sma50' | 'ema20' | 'boll';
const IND_META: { id: IndId; label: string; color: string; title: string }[] = [
  { id: 'sma20', label: 'MA20', color: '#f59e0b', title: 'Simple moving average (20)' },
  { id: 'sma50', label: 'MA50', color: '#a855f7', title: 'Simple moving average (50)' },
  { id: 'ema20', label: 'EMA20', color: '#06b6d4', title: 'Exponential moving average (20)' },
  { id: 'boll', label: 'BOLL', color: '#94a3b8', title: 'Bollinger Bands (20, 2σ)' },
];
type LinePt = { time: UTCTimestamp; value: number };

function sma(bars: Candle[], period: number): LinePt[] {
  const out: LinePt[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) sum -= bars[i - period].close;
    if (i >= period - 1) out.push({ time: bars[i].time, value: sum / period });
  }
  return out;
}
function ema(bars: Candle[], period: number): LinePt[] {
  const out: LinePt[] = [];
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < bars.length; i++) {
    const c = bars[i].close;
    prev = i === 0 ? c : c * k + prev * (1 - k);
    if (i >= period - 1) out.push({ time: bars[i].time, value: prev });
  }
  return out;
}
function bollinger(bars: Candle[], period: number, mult: number): { upper: LinePt[]; mid: LinePt[]; lower: LinePt[] } {
  const upper: LinePt[] = [], mid: LinePt[] = [], lower: LinePt[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += bars[j].close;
    const m = s / period;
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) { const d = bars[j].close - m; v += d * d; }
    const sd = Math.sqrt(v / period);
    const t = bars[i].time;
    mid.push({ time: t, value: m });
    upper.push({ time: t, value: m + mult * sd });
    lower.push({ time: t, value: m - mult * sd });
  }
  return { upper, mid, lower };
}

/** Candle colours. Canvas cannot read CSS custom properties, so the palette
 *  is passed in rather than inherited — the bot desk keeps its greens, the AI
 *  workspace wears emerald. */
export interface ChartPalette { up: string; down: string; text: string }

const DESK_PALETTE: ChartPalette = { up: '#22c55e', down: '#ef4444', text: '#98A2B3' };

export function MarketChart({
  markets, openTrades = [], showGrid = true, palette = DESK_PALETTE, focusSymbol = null,
  chrome = 'desk',
}: {
  markets: { symbol: string; alias: string }[];
  openTrades?: { symbol: string; side: string }[];
  /** Grid lines. Optional and on by default, so the bot dashboard is
   *  unchanged; the AI workspace drives it from its Chart panel. */
  showGrid?: boolean;
  palette?: ChartPalette;
  /** Market the surrounding page has selected — the chart follows it. Optional:
   *  left null, the picker below the chart stays the only thing that moves it,
   *  which is how the bot dashboard uses this. */
  focusSymbol?: string | null;
  /** 'desk' — the dashboard's controls above a fixed-height card, unchanged.
   *  'workspace' — fills its container with the trading-desk chrome: top bar,
   *  vertical tool rail, status strip, and the symbol search. */
  chrome?: 'desk' | 'workspace';
}) {
  // A market's label reads "Alias — SYMBOL", but when the alias IS the symbol
  // (e.g. NZDUSD) that renders as "NZDUSD — NZDUSD". Show it once in that case.
  const label = (sym: string) => {
    const m = markets.find((x) => x.symbol === sym);
    const a = m?.alias;
    return a && a !== sym ? `${a} — ${sym}` : sym;
  };
  // Symbols that currently hold an open trade (deduped), with a side for the dot.
  const openBySymbol = new Map<string, string>();
  for (const t of openTrades) if (!openBySymbol.has(t.symbol)) openBySymbol.set(t.symbol, t.side);

  // The first market on BOTH the server and the first client render. The saved
  // market is restored in an effect below, after hydration — reading
  // localStorage in the initialiser made the server render "AUDUSD" and the
  // browser render whatever you last looked at, which is a hydration mismatch
  // and exactly the "1 Issue" the dev overlay kept reporting.
  const [symbol, setSymbol] = useState(() => markets[0]?.symbol ?? '');
  const [tf, setTf] = useState<string>('M15');

  // Restore the last-viewed market + timeframe so a refresh keeps your place.
  // setState in an effect is the point here: this reads an external store
  // (localStorage) that does not exist during SSR.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (s.symbol && markets.some((m) => m.symbol === s.symbol)) setSymbol(s.symbol as string);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (s.tf && TF_VALUES.includes(s.tf)) setTf(s.tf as string);
    } catch { /* ignore */ }
    // Once, on mount. Re-running on `markets` would undo a later pick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tapping a market anywhere in the workspace brings the chart with it —
  // otherwise you read one market's reasons beside another market's candles.
  //
  // Adjusted during render, not in an effect (the documented pattern for
  // "state that follows a prop"): applied once per CHANGE of focus, so the
  // parent rebuilding its markets array on every render cannot snap the chart
  // back and undo a pick made here. Guarded on membership so a stale symbol
  // cannot blank the chart.
  const [appliedFocus, setAppliedFocus] = useState<string | null>(null);
  if (focusSymbol && focusSymbol !== appliedFocus) {
    setAppliedFocus(focusSymbol);
    if (markets.some((m) => m.symbol === focusSymbol)) setSymbol(focusSymbol);
  }

  const [searchOpen, setSearchOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  /** Same viewport fitting as the Fibonacci flyout — the Lines menu is the
   *  longer of the two and overflowed the window first. */
  const drawBtnRef = useRef<HTMLDivElement | null>(null);
  const [drawMaxH, setDrawMaxH] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!drawOpen) { setDrawMaxH(null); return; }
    const place = () => setDrawMaxH(flyoutMaxH(drawBtnRef.current, wrapRef.current));
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [drawOpen]);
  /** Fibonacci has its own rail button, so it has its own open state and its
   *  own "last used" — arming a fib must not change what the LINE button
   *  arms, or the two controls would fight over one memory. */
  const [fibOpen, setFibOpen] = useState(false);
  /* WHERE A FLYOUT CAN ACTUALLY FIT.
   *
   * The menus hang off their rail button at top-0 and were allowed 70vh. The
   * button sits partway down the chart, so a long list ran straight off the
   * bottom of the window — and the items past the edge were unreachable no
   * matter how the inner list scrolled, because it was the BOX that overflowed,
   * not its contents.
   *
   * Measured against the viewport on open: pinned beside the button, slid up
   * only as far as it must to fit, and never taller than the window. */
  const fibBtnRef = useRef<HTMLDivElement | null>(null);
  const [fibMaxH, setFibMaxH] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!fibOpen) { setFibMaxH(null); return; }
    const place = () => setFibMaxH(flyoutMaxH(fibBtnRef.current, wrapRef.current));
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [fibOpen]);
  /* Whether a two-click tool is half-way through.
   *
   * State, not the trendStart ref the click handler uses: a ref changing does
   * not re-render, so the banner would never update from "click the first
   * point" to "click the second" — which is exactly the missing feedback that
   * made the tools look dead. */
  const [drawPending, setDrawPending] = useState(false);
  const [railHidden, setRailHidden] = useState(false);
  /* The line type the rail button arms when you just click it.
   *
   * TradingView's behaviour, and the reason it feels quick: the button is the
   * tool you last used, not a menu you have to walk through every time. The
   * chevron under it opens the list to change which one that is. */
  const [lastLine, setLastLine] = useState<Tool>('hline');
  const [lastFib, setLastFib] = useState<Tool>('fibr');
  /** OHLC of the bar under the crosshair — null when the cursor is off-chart. */
  const [hoverBar, setHoverBar] = useState<
    { open: number; high: number; low: number; close: number } | null
  >(null);
  /** The newest bar, so the legend reads the live candle when nothing is
   *  hovered. State rather than reading barsRef in render: a ref read during
   *  render is empty on the first paint, so the strip would start blank and
   *  only appear once something else happened to re-render. */
  const [lastBar, setLastBar] = useState<
    { open: number; high: number; low: number; close: number } | null
  >(null);

  // The Chart panel's switch and the rail's button are two switches on one
  // light: null means "nobody has touched the rail, follow the prop", and
  // whichever was used last wins. Derived, so there is no prop→state effect.
  const [gridOverride, setGridOverride] = useState<boolean | null>(null);
  const gridOn = gridOverride ?? showGrid;
  const setGridOn = (next: boolean | ((v: boolean) => boolean)) =>
    setGridOverride((prev) => (typeof next === 'function' ? next(prev ?? showGrid) : next));
  const [drawingsHidden, setDrawingsHidden] = useState(false);
  const drawingsHiddenRef = useRef(false);
  const [drawingsLocked, setDrawingsLocked] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [indFavs, setIndFavs] = useState<string[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setIndFavs(JSON.parse(localStorage.getItem(IND_FAV_KEY) || '[]') as string[]); } catch { /* ignore */ }
  }, []);
  const toggleIndFav = (id: string) => {
    setIndFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(IND_FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const lockedRef = useRef(false);
  useEffect(() => { lockedRef.current = drawingsLocked; }, [drawingsLocked]);
  const [digits, setDigits] = useState(5);
  /* The click and range handlers are subscribed once, so they hold the FIRST
   * render's syncLabels and would format every readout at the initial 5 dp
   * whatever the symbol turned out to need. A ref is read when it is used. */
  const digitsRef = useRef(5);
  useEffect(() => { digitsRef.current = digits; }, [digits]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  /* MAGNET. Off, weak, strong — the three the spec asks for.
   *
   * Weak only takes hold when you are already near a candle's open, high, low
   * or close; strong always takes the nearest one on the nearest bar. Weak is
   * the default-on behaviour people expect from a magnet: it helps when you
   * are aiming at a level and stays out of the way when you are not.
   *
   * A snapped point takes the candle's OWN time and price, not the cursor's
   * rounded to look like it — that is the difference between a line that sits
   * on the high and one that sits very near it. */
  const [magnet, setMagnet] = useState<'off' | 'weak' | 'strong'>('off');
  const magnetRef = useRef<'off' | 'weak' | 'strong'>('off');
  useEffect(() => { magnetRef.current = magnet; }, [magnet]);

  const [tfRingOpen, setTfRingOpen] = useState(false);
  const [tool, setTool] = useState<Tool>('cursor');
  /** The armed tool's menu entry — its name and how many clicks it wants.
   *  Declared here, below `tool`: it was above, which is a temporal dead zone
   *  and took the whole page down with "Cannot access 'tool' before
   *  initialization". */
  const armed = ALL_DRAW_TOOLS.find((t) => t.tool === tool);
  const [fs, setFs] = useState(false);
  const [inds, setInds] = useState<Set<IndId>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(INDS_KEY);
        if (raw) return new Set(JSON.parse(raw) as IndId[]);
      } catch { /* ignore */ }
    }
    return new Set();
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const liveBar = useRef<Candle | null>(null);
  const overlayLines = useRef<IPriceLine[]>([]);          // entry / SL / TP (open or pending)
  const tradeSL = useRef<number | null>(null);
  const tradeTP = useRef<number | null>(null);
  const markersApi = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const activeSide = useRef<'buy' | 'sell' | null>(null); // side of the open trade, for the live P&L line
  // Drawings (manual annotations) — data is the source of truth, chart objects are
  // rebuilt from it and dragged in place.
  const toolRef = useRef<Tool>('cursor');
  const drawings = useRef<Drawing[]>([]);
  const hlineObjs = useRef<Map<string, IPriceLine>>(new Map());
  const trendObjs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const trendStart = useRef<{ time: Time; value: number } | null>(null);
  /** The pitchfork's clicks so far. Its own ref rather than reusing trendStart,
   *  which holds one point: this needs two before the third completes it. */
  const forkPts = useRef<{ time: Time; value: number }[]>([]);
  /** The rubber band, in pane pixels. `flat` means a level rather than a line,
   *  so it is drawn edge to edge at one height. Mirrored into a ref because the
   *  pointer handler is registered once and cannot read state. */
  const [band, setBand] = useState<
    { x1: number; y1: number; x2: number; y2: number; flat: boolean } | null
  >(null);
  const bandRef = useRef<typeof band>(null);
  /* Fibonacci. Clicks collect in a ref (the click handler is registered once);
   * the step, the projected geometry and the rubber band are state for render.
   * Always built from refs, never from state captured by the chart effect. */
  const fibPts = useRef<FibPoint[]>([]);
  const [fibStep, setFibStep] = useState(0);
  const [fibGeoms, setFibGeoms] = useState<FibGeometry[]>([]);
  /** What syncLabels last computed, so hitTest need not recompute every move. */
  const fibGeomsRef = useRef<FibGeometry[]>([]);
  const [fibPreview, setFibPreview] = useState<FibGeometry | null>(null);
  const fibCtx = () => makeFibCtx(chartRef.current, seriesRef.current, barsRef.current);
  const clearPreview = () => {
    bandRef.current = null; setBand(null);
    fibPts.current = []; setFibStep(0); setFibPreview(null);
    ghostRef.current = []; setGhostState([]); setGhostFillState(null);
    previewRef.current = null;
    bandLabelRef.current = null; setBandLabelState(null);
  };

  /* THE SELECTED DRAWING — what the style toolbar acts on.
   *
   * Set when you place one (so it can be styled immediately, without hunting
   * for it again) and when you click an existing one with the crosshair. */
  /* The drawing itself, not its id. Derived-from-a-ref was the obvious shape
   * and the wrong one: the drawings live in a ref, so reading them during
   * render gives React no reason to re-render when they change — the toolbar
   * would show stale values after every edit. */
  const [selected, setSelected] = useState<Drawing | null>(null);
  /** syncLabels runs from handlers bound once, which would hold the first
   *  render's selection — i.e. none, permanently. */
  const selectedRef = useRef<Drawing | null>(null);
  /* THE DRAWING UNDER THE CURSOR.
   *
   * Handles show for the selected drawing — and for the one being pointed at,
   * which is what lets you reach straight for a grip. Selection-only meant
   * every edit took two gestures: click the line to reveal its ends, then go
   * back for the end you wanted. Hovering shows them; the grips are live as
   * soon as they are visible. */
  const [hoverId, setHoverId] = useState<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  useEffect(() => {
    selectedRef.current = selected;
    hoverRef.current = hoverId;
    syncLabels();           // repaint so the grips follow selection and hover
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, hoverId]);

  /** Where each diagonal's label sits, in pane pixels. Recomputed whenever the
   *  chart moves, because the line's midpoint moves with it. */
  const [lineLabels, setLineLabels] = useState<
    /* `readout` marks the computed ones — Info and Angle. They are a
     * MEASUREMENT rather than a name someone typed, so they get the dark
     * plate with coloured text instead of a solid chip, and they sit above
     * the line rather than centred on top of it. */
    { id: string; x: number; y: number; text: string; color: string; readout?: boolean; bare?: boolean }[]
  >([]);
  /** Readable from the pointer handlers, which run outside React's render and
   *  so cannot see `handles` state. Grabbing an anchor needs to hit-test what
   *  is actually drawn. */
  const handlesRef = useRef<{ id: string; x: number; y: number }[]>([]);

  /** The ringed dots at the points you actually clicked. */
  const [handles, setHandles] = useState<{ id: string; x: number; y: number }[]>([]);
  /* EVERY DIAGONAL, IN PIXELS.
   *
   * These were LineSeries, and that was the wrong tool. A series is DATA, so
   * extending a ray meant adding a far-future point, which grew the time
   * scale, which fired a range change, which extended it further — a loop
   * that either ran away or left the ray stopping in mid-air. It also could
   * not survive two clicks on one bar (duplicate times are rejected).
   *
   * Pixels have none of those problems: a line to the edge of the pane is a
   * line to the edge of the pane. Levels stay as price lines, because those
   * genuinely belong on the price axis and earn its badge. */
  const [segs, setSegs] = useState<{
    id: string; x1: number; y1: number; x2: number; y2: number;
    color: string; width: number; dash: string;
  }[]>([]);
  /** The same segments, readable from the pointer handlers. Those run outside
   *  React's render, so they cannot see `segs` state — and hit-testing a fork
   *  against anything other than what is drawn is how a line you can see stops
   *  being a line you can grab. */
  const segsRef = useRef<typeof segs>([]);

  /** Trend Angle's arc. An SVG path rather than a seg, because the one shape
   *  on this overlay that is not a straight line is the thing that makes an
   *  angle readable as an angle. */
  const [arcs, setArcs] = useState<{ id: string; d: string; color: string }[]>([]);
  /** The tint between a channel's boundaries. A polygon, so it cannot be a
   *  seg — and separate state so hiding fills never disturbs the lines. */
  const [fills, setFills] = useState<{ id: string; pts: Pt[]; color: string; solid?: boolean }[]>([]);

  /** Info/Angle's reading while the line is still being drawn. */
  const [bandLabel, setBandLabelState] = useState<string | null>(null);
  const bandLabelRef = useRef<string | null>(null);
  const setBandLabel = (v: string | null) => { bandLabelRef.current = v; setBandLabelState(v); };
  /** timeAtX lives inside the chart effect; the pointer handler needs it too. */
  const timeAtXRef = useRef<((x: number) => number | null) | null>(null);
  const snapRef = useRef<((t: number, v: number, y: number) => { t: number; v: number }) | null>(null);

  /** The fork being placed, previewed in full. Separate from the rubber band:
   *  that is one line, and a fork is four. */
  const [ghost, setGhostState] = useState<Seg[]>([]);
  const ghostRef = useRef<Seg[]>([]);
  /* THE DRAFT, as a real Drawing.
   *
   * Theirs previews with renderShape({id:"draft", kind: tool, pts:[...draft,
   * hover]}, true) — the SAME function that draws a committed shape, handed
   * the clicks plus the cursor. Ours had a branch per tool: a rubber band
   * here, a ghost there, each worked out separately, and they drifted.
   *
   * Held as a Drawing and appended to the list syncLabels walks, so the
   * preview is produced by the identical geometry and cannot disagree with
   * what the next click will make. */
  const previewRef = useRef<Drawing | null>(null);
  /** The preview's fill — theirs tints the area while you are still placing. */
  const [ghostFill, setGhostFillState] = useState<Pt[] | null>(null);
  const setGhostFill = (v: Pt[] | null) => setGhostFillState(v);
  const setGhost = (v: Seg[]) => { ghostRef.current = v; setGhostState(v); };

  /** The visible time window, for extending rays to the pane's edge. */
  const viewRange = (): { from: number; to: number } | null => {
    const r = chartRef.current?.timeScale().getVisibleRange();
    return r ? { from: r.from as number, to: r.to as number } : null;
  };

  /** Empties everything syncLabels draws, without projecting anything. */
  const clearOverlay = () => {
    setLineLabels([]); segsRef.current = []; setSegs([]); setHandles([]); setFibGeoms([]); fibGeomsRef.current = [];
  };
  /** Committed drawings, plus the one being placed. */
  const drawDraft = (): Drawing[] => (
    previewRef.current ? [...drawings.current, previewRef.current] : drawings.current
  );

  const syncLabels = () => {
    const s = seriesRef.current, c = chartRef.current;
    if (!s || !c) { clearOverlay(); return; }

    const W = wrapRef.current?.clientWidth ?? 0;
    const H = wrapRef.current?.clientHeight ?? 0;

    /* Each diagonal, as pane coordinates.
     *
     * A ray is the anchor plus the direction of the second click, walked to
     * whichever edge that direction leads to. An extended line is walked both
     * ways. Because this is pixels, "the edge" is literally the edge — it
     * cannot fall short, and it adds nothing to the chart's data. */
    const out: typeof segs = [];
    const quads: { id: string; pts: Pt[]; color: string; solid?: boolean }[] = [];
    const extraLabels: { id: string; x: number; y: number; text: string; color: string; readout?: boolean }[] = [];
    for (const d of drawDraft()) {
      if (d.kind !== 'trend') continue;
      const [tA, tB] = d.pts;
      if (!tA || !tB) continue;
      const ax = c.timeScale().timeToCoordinate(tA.t as UTCTimestamp);
      const ay = s.priceToCoordinate(tA.v);
      const bx = c.timeScale().timeToCoordinate(tB.t as UTCTimestamp);
      const by = s.priceToCoordinate(tB.v);
      if (ax == null || ay == null || bx == null || by == null) continue;

      let x1 = ax as number, y1 = ay as number, x2 = bx as number, y2 = by as number;
      const reach = d.reach ?? 'segment';
      if (reach === 'hray') {
        // Flat, from the click to the right-hand edge, with its price tagged.
        x2 = W; y2 = y1;
        extraLabels.push({
          id: `${d.id}#tag`,
          x: W - 2, y: y1,
          text: fmt(tA.v, digitsRef.current),
          color: d.color ?? DRAW_COLOR,
          readout: true,
        });
      } else if (reach !== 'segment') {
        /* The reference's ext(): scale the first-to-second vector out to FAR
         * and let the SVG clip it. A ray keeps its first click as the origin
         * and runs on through the second; an extended line runs both ways. */
        const k = FAR / (Math.hypot(x2 - x1, y2 - y1) || 1);
        const vx = (x2 - x1) * k, vy = (y2 - y1) * k;
        if (reach === 'extended') { x1 -= vx; y1 -= vy; }
        x2 = x1 + vx * (reach === 'extended' ? 2 : 1);
        y2 = y1 + vy * (reach === 'extended' ? 2 : 1);
      }
      /* THE HEAD, on the second click.
       * Built from the line's own angle so it stays pointing along the line
       * however the end is dragged — a head drawn at a fixed rotation would
       * come adrift the moment the line was aimed somewhere else. */
      if (d.arrow) {
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const hl = 10 + (d.width ?? 2) * 2;
        quads.push({
          id: `${d.id}#head`,
          pts: [
            { x: x2, y: y2 },
            { x: x2 - hl * Math.cos(ang - 0.4), y: y2 - hl * Math.sin(ang - 0.4) },
            { x: x2 - hl * Math.cos(ang + 0.4), y: y2 - hl * Math.sin(ang + 0.4) },
          ],
          color: d.color ?? DRAW_COLOR,
          solid: true,
        });
      }
      out.push({
        id: d.id, x1, y1, x2, y2,
        color: d.color ?? DRAW_COLOR,
        width: d.width ?? 2,
        dash: d.style === 'dashed' ? '8 5' : d.style === 'dotted' ? '2 4' : '',
      });
    }
    /* THE FORK, derived here rather than stored.
     *
     * Median: p1 through the midpoint of p2-p3. Tines: p2 and p3, each parallel
     * to it. All three are walked to the right-hand edge from their own anchor,
     * so the fork opens forward in time the way it is read — a pitchfork that
     * ran backwards over the swing that defined it would be describing history
     * it already has.
     *
     * Done in PIXELS, like the rays above, because "parallel" has to mean
     * parallel on screen. Price and time have different units and a rescale
     * changes their ratio, so tines computed in price space would splay apart
     * the moment the axis moved. */
    for (const d of drawDraft()) {
      if (d.kind !== 'pitchfork') continue;
      const pt = (t: number, v: number) => {
        const x = c.timeScale().timeToCoordinate(t as UTCTimestamp);
        const y = s.priceToCoordinate(v);
        return x == null || y == null ? null : { x: x as number, y: y as number };
      };
      const [fA, fB, fC] = d.pts;
      if (!fA || !fB || !fC) continue;
      const p1 = pt(fA.t, fA.v), p2 = pt(fB.t, fB.v), p3 = pt(fC.t, fC.v);
      if (!p1 || !p2 || !p3) continue;
      out.push(...forkSegments(p1, p2, p3, d.id, {
        color: d.color ?? DRAW_COLOR,
        width: d.width ?? 2,
        dash: d.style === 'dashed' ? '8 5' : d.style === 'dotted' ? '2 4' : '',
      }, W, H, d.variant ?? 'andrews'));
    }

    /* CHANNELS: the two boundaries, and the quad between them for the tint. */
    for (const d of drawDraft()) {
      if (d.kind !== 'channel') continue;
      const pt = (t: number, v: number): Pt | null => {
        const cx0 = c.timeScale().timeToCoordinate(t as UTCTimestamp);
        const cy0 = s.priceToCoordinate(v);
        return cx0 == null || cy0 == null ? null : { x: cx0 as number, y: cy0 as number };
      };
      const [cA, cB, cC, cD] = d.pts;
      if (!cA || !cB) continue;
      const pa = pt(cA.t, cA.v), pb = pt(cB.t, cB.v);
      if (!pa || !pb) continue;
      const style = {
        color: d.color ?? DRAW_COLOR,
        width: d.width ?? 2,
        dash: d.style === 'dashed' ? '8 5' : d.style === 'dotted' ? '2 4' : '',
      };

      if (d.variant === 'linreg') {
        /* CALCULATED, not placed. The closes between the two clicks are fitted
         * and the bands sit one standard deviation either side. Nothing is
         * drawn when the range is too short to fit a line to — a regression
         * through two points is just the two points. */
        const lo = Math.min(cA.t, cB.t), hi = Math.max(cA.t, cB.t);
        const rows = barsRef.current.filter(
          (bar) => (bar.time as number) >= lo && (bar.time as number) <= hi,
        );
        const fit = regressionFit(rows.map((bar) => bar.close));
        if (!fit) continue;
        const last = rows.length - 1;
        const ends = (off: number) => {
          const e0 = pt(rows[0].time as number, fit.a + off);
          const e1 = pt(rows[last].time as number, fit.a + fit.b * last + off);
          return e0 && e1 ? [e0, e1] as const : null;
        };
        const mid = ends(0), up = ends(fit.sd), dn = ends(-fit.sd);
        if (!mid) continue;
        out.push({ id: d.id, x1: mid[0].x, y1: mid[0].y, x2: mid[1].x, y2: mid[1].y, ...style });
        /* The bands carry the UP and DOWN colours, not the drawing's.
         * They are not two copies of one boundary: above the fit is where price
         * ran rich and below is where it ran cheap, and that is the reading the
         * tool exists to give. One tint each, meeting at the line. */
        for (const [key, e, col] of [
          ['u', up, palette.up], ['d', dn, palette.down],
        ] as const) {
          if (!e) continue;
          out.push({
            id: `${d.id}#${key}`, x1: e[0].x, y1: e[0].y, x2: e[1].x, y2: e[1].y,
            color: col, width: Math.max(1, style.width - 1), dash: style.dash,
          });
          if (d.fill !== false) {
            quads.push({
              id: `${d.id}#fill-${key}`,
              pts: [mid[0], mid[1], e[1], e[0]],
              color: col,
            });
          }
        }
        // How much of the move the line actually accounts for. At the start of
        // the fit, where the eye begins reading it.
        extraLabels.push({
          id: `${d.id}`,
          x: mid[0].x, y: mid[0].y,
          text: `R² ${Math.round(fit.r2 * 100)}%`,
          color: style.color,
          readout: true,
        });
        continue;
      }

      const pc = cC ? pt(cC.t, cC.v) : null;
      const pd = cD ? pt(cD.t, cD.v) : null;
      const r = channelSegments(pa, pb, pc, pd, d.variant, d.id, style);
      out.push(...r.segs);
      /* THE MEDIAN, half way between the boundaries. A channel is read against
       * its centre as much as its edges — price crossing the middle is the
       * signal the two outer lines only bracket. Dashed and faint: it is
       * derived, not a line anyone placed. */
      /* Theirs: <line x1={a.x} y1={a.y + off/2} x2={b.x} y2={b.y + off/2} ...
       * — half the offset off the FIRST line, dashed. */
      if (pc && (d.variant === 'parallel' || d.variant === 'flat')) {
        const offM = d.variant === 'flat'
          ? pc.y - pa.y
          : pc.y - (pa.y + ((pb.y - pa.y) * (pc.x - pa.x)) / ((pb.x - pa.x) || 1));
        out.push({
          id: `${d.id}#mid`,
          x1: pa.x, y1: pa.y + offM / 2, x2: pb.x, y2: pb.y + offM / 2,
          color: style.color, width: Math.max(1, style.width - 1), dash: '4 4',
        });
      }
      if (r.quad && d.fill !== false) {
        quads.push({ id: `${d.id}#fill`, pts: r.quad, color: style.color });
      }
    }

    /* VERTICAL LINE and CROSS LINE.
     *
     * Both run the full height (and the cross the full width) of the pane, so
     * only the anchored axis is measured — the other end is the edge. The
     * vertical is anchored in TIME alone, which is why it has no price: it
     * marks a moment, and a moment has no height. */
    for (const d of drawDraft()) {
      if (d.kind !== 'vline' && d.kind !== 'cross') continue;
      /* A cross marks a PRICE as well as a moment, so it earns an axis tag —
       * the same badge a horizontal line gets. Without it the horizontal arm
       * is a line at a price you then have to read off the scale by eye. */
      const vp = d.pts[0];
      if (!vp) continue;
      const cx = c.timeScale().timeToCoordinate(vp.t as UTCTimestamp);
      if (cx == null) continue;
      const color = d.color ?? DRAW_COLOR;
      const width = d.width ?? 2;
      const dash = d.style === 'dashed' ? '8 5' : d.style === 'dotted' ? '2 4' : '';
      // The vertical takes the drawing's own id so the label pass lands on it.
      out.push({ id: d.id, x1: cx as number, y1: 0, x2: cx as number, y2: H, color, width, dash });
      if (d.kind === 'cross') {
        const cy = s.priceToCoordinate(vp.v);
        if (cy != null) {
          out.push({
            id: `${d.id}#h`, x1: 0, y1: cy as number, x2: W, y2: cy as number,
            color, width, dash,
          });
          extraLabels.push({
            id: `${d.id}#tag`,
            x: W - 2, y: cy as number,
            text: fmt(vp.v, digitsRef.current),
            color,
            readout: true,
          });
        }
      }
    }

    /* TREND ANGLE: the baseline and the arc that make the number mean something.
     *
     * An angle is between two lines, and until now only one of them was drawn —
     * the degrees sat beside a lone diagonal with nothing to be measured
     * against. Horizontal is the reference, so horizontal gets drawn: a dashed
     * stub from the first click, and an arc sweeping from it to the line.
     *
     * The radius is a fraction of the line, capped, so a short line does not
     * get an arc bigger than itself and a long one does not get a dinner plate. */
    const arcOut: { id: string; d: string; color: string }[] = [];
    const angleAt = new Map<string, { x: number; y: number }>();
    for (const d of drawDraft()) {
      if (d.kind !== 'trend' || d.readout !== 'angle') continue;
      const [gA, gB] = d.pts;
      if (!gA || !gB) continue;
      const ax = c.timeScale().timeToCoordinate(gA.t as UTCTimestamp);
      const ay = s.priceToCoordinate(gA.v);
      const bx = c.timeScale().timeToCoordinate(gB.t as UTCTimestamp);
      const by = s.priceToCoordinate(gB.v);
      if (ax == null || ay == null || bx == null || by == null) continue;
      const x1 = ax as number, y1 = ay as number, x2 = bx as number, y2 = by as number;
      const dxA = x2 - x1, dyA = y2 - y1;
      const lenA = Math.hypot(dxA, dyA);
      if (lenA < 1) continue;
      const r = 30;                                   // theirs, fixed
      /* The reference leg runs the WIDTH of the line it measures, not a short
       * stub beside the arc. An angle is between two lines, and the one it is
       * measured from should be as present as the one you drew. */
      const legLen = Math.max(40, Math.abs(dxA));
      const color = d.color ?? DRAW_COLOR;
      // The reference leg, pointing right from the anchor — the direction the
      // angle is measured FROM. Dashed and thin: it is a reference, not a line
      // anyone drew.
      out.push({
        id: `${d.id}#base`, x1, y1, x2: x1 + legLen, y2: y1,
        color, width: 1, dash: '4 4',
      });
      // Theirs: the angle measured up from horizontal, the arc swept to match.
      const degA = (Math.atan2(y1 - y2, x2 - x1) * 180) / Math.PI;
      const rad = (-degA * Math.PI) / 180;
      arcOut.push({
        id: `${d.id}#arc`, color,
        d: `M ${x1 + r} ${y1} A ${r} ${r} 0 0 ${degA > 0 ? 0 : 1} `
          + `${x1 + r * Math.cos(rad)} ${y1 + r * Math.sin(rad)}`,
      });
      /* The degrees sit along the REFERENCE leg, just past the arc — not on
       * the arc's bisector. Measuring from horizontal is what the number
       * means, so it is written against the horizontal, and the arc is left
       * clear to show the sweep rather than carrying text across itself. */
      angleAt.set(d.id, { x: x1 + r + 6, y: y1 + (degA > 0 ? -6 : 14) });
    }
    setArcs(arcOut);

    /* THE SELECTED DRAWING, drawn so you can see it is selected.
     *
     * Nothing marked it before: you clicked a line, the style toolbar appeared,
     * and the chart looked identical — so on a chart carrying twenty drawings
     * there was no way to tell WHICH one you were about to restyle or delete.
     * Every segment of it thickens, the fork's tines and base included, because
     * what gets deleted is the whole drawing and not the line you happened to
     * hit. */
    const selId = selectedRef.current?.id;
    if (selId) {
      for (const g of out) {
        if (g.id === selId || g.id.startsWith(`${selId}#`)) g.width += 2;
      }
    }

    setFills(quads);
    segsRef.current = out;
    setSegs(out);

    // Labels: at the midpoint of the drawn line, so a ray's label sits along
    // what you can see rather than halfway to an off-screen end.
    const labels: { id: string; x: number; y: number; text: string; color: string; readout?: boolean; bare?: boolean }[] = [];
    for (const g of out) {
      const d = drawings.current.find((k) => k.id === g.id);
      if (!d || d.kind === 'hline') continue;
      /* THE READOUT, worked out here rather than stored.
       *
       * Info reports what the line spans: the price move, the same as a
       * percentage, and how many bars it took. Angle reports its slope in
       * degrees. Both are properties of where the ends currently are, so
       * computing them at render is what keeps them true after a drag —
       * a stored string would still describe where the line used to be.
       *
       * The angle is measured in PIXELS on purpose. An angle in price-over-
       * time has no meaning you can see, because the axes have different
       * units and a rescale would change the number without the line moving. */
      let text = d.label ?? '';
      if (d.kind === 'trend' && d.readout) {
        const [rA, rB] = d.pts;
        if (!rA || !rB) continue;
        const dv = rB.v - rA.v;
        const pct = rA.v !== 0 ? (dv / Math.abs(rA.v)) * 100 : 0;
        if (d.readout === 'angle') {
          const deg = -Math.atan2(g.y2 - g.y1, g.x2 - g.x1) * (180 / Math.PI);
          text = `${deg >= 0 ? '+' : ''}${deg.toFixed(1)}°`;
        } else {
          const step = barStepSecs();
          const bars = step > 0 ? Math.abs(Math.round((rB.t - rA.t) / step)) : 0;
          /* Their two rows, their wording: the move and the percentage above,
           * the bar count and the slope below. */
          const degI = (Math.atan2(g.y1 - g.y2, g.x2 - g.x1) * 180) / Math.PI;
          text = `${dv >= 0 ? '+' : ''}${fmt(dv, digitsRef.current)} (${pct.toFixed(2)}%)`
            + `
${bars} bars · ${degI.toFixed(1)}°`;
        }
        if (d.label) text = `${d.label} · ${text}`;
      }
      if (!text) continue;
      // An angle's label sits on its arc; everything else sits at the midpoint
      // of what you can see of the line.
      const at = angleAt.get(d.id);
      const readout = d.kind === 'trend' && !!d.readout;
      const mx = (Math.max(0, Math.min(W, g.x1)) + Math.max(0, Math.min(W, g.x2))) / 2;
      const my = (Math.max(0, Math.min(H, g.y1)) + Math.max(0, Math.min(H, g.y2))) / 2;
      labels.push({
        id: d.id,
        // Theirs: rect at (mx + 8, my - 30), text from mx + 14.
        x: at ? at.x : (readout ? mx + 14 : mx),
        y: at ? at.y : (readout ? my - 16 : my),
        text,
        color: g.color,
        readout,
        // The angle is written against its own reference leg, in the open —
        // a plate there would cover the arc it is describing.
        bare: !!at,
      });
    }
    setLineLabels([...labels, ...extraLabels]);

    /* HANDLES, FOR THE SELECTED DRAWING ONLY.
     *
     * Every drawing used to show its grips at once. Four channels is sixteen
     * circles sitting on top of each other's lines, and they stop reading as
     * "the ends of THIS drawing" — the chart becomes a field of dots and the
     * shapes underneath mix into one another. Worse, they all compete for the
     * same grab radius, so a drag catches whichever happens to be nearest
     * rather than the one you meant.
     *
     * Grips belong to the thing you are editing. Select a drawing and it shows
     * its own; everything else stays a clean line.
     *
     * Drawn as an overlay rather than with the series' own point markers,
     * because a ray's far end is a computed edge point, not something you
     * placed — a handle there would invite you to drag a thing that is not a
     * handle. So: the clicked points only. */
    const hs: { id: string; x: number; y: number }[] = [];
    /* Theirs: {(sel === d.id || preview) && P.map(...)} — the SELECTION, and
     * the thing being placed. Hovering does not reveal them there, so it does
     * not here either. */
    const selForHandles = selectedRef.current?.id ?? null;
    for (const d of drawDraft()) {
      if (d.kind !== 'trend' || d.id !== selForHandles) continue;
      const reach = d.reach ?? 'segment';
      const [hA, hB] = d.pts;
      if (!hA || !hB) continue;
      const x1 = c.timeScale().timeToCoordinate(hA.t as UTCTimestamp);
      const y1 = s.priceToCoordinate(hA.v);
      if (x1 != null && y1 != null) hs.push({ id: `${d.id}:0`, x: x1 as number, y: y1 as number });
      /* The second click gets a handle on a RAY and an EXTENDED line too.
       *
       * It was hidden on those, on the reasoning that their far end is a
       * computed edge rather than a point you placed. True of the end — but
       * t2/v2 is not the end, it is the real, stored point that sets the
       * DIRECTION, and with no handle on it an extended line could only be
       * carried about, never aimed. Dragging it now swings the line around its
       * other anchor, which is the whole way you point one at something.
       *
       * A flat ray is the exception: it is horizontal by definition, so a
       * second handle would only offer to break that. */
      if (reach !== 'hray') {
        const x2 = c.timeScale().timeToCoordinate(hB.t as UTCTimestamp);
        const y2 = s.priceToCoordinate(hB.v);
        if (x2 != null && y2 != null) hs.push({ id: `${d.id}:1`, x: x2 as number, y: y2 as number });
      }
    }
    /* All three of a fork's points are real clicks, so all three get a handle —
     * unlike a ray, whose far end is a computed edge. */
    for (const d of drawDraft()) {
      if (d.kind !== 'pitchfork' || d.id !== selForHandles) continue;
      d.pts.forEach((q, i) => {
        const x = c.timeScale().timeToCoordinate(q.t as UTCTimestamp);
        const y = s.priceToCoordinate(q.v);
        if (x != null && y != null) hs.push({ id: `${d.id}:${i}`, x: x as number, y: y as number });
      });
    }
    /* A CHANNEL's anchors. The regression has two — its lines are computed,
     * so there is no third point to offer. */
    for (const d of drawDraft()) {
      if (d.kind !== 'channel' || d.id !== selForHandles) continue;
      /* EVERY clicked point, as theirs does: {P.map((q, k) => <circle ...)}.
       * Ours showed the first two and put a derived grip at the middle of the
       * second boundary - so the third point you actually clicked had no
       * handle on it, and the one you could grab was somewhere you never
       * pressed. Theirs puts a grip exactly where you clicked. */
      d.pts.forEach((q, i) => {
        const hx = c.timeScale().timeToCoordinate(q.t as UTCTimestamp);
        const hy = s.priceToCoordinate(q.v);
        if (hx != null && hy != null) hs.push({ id: `${d.id}:${i}`, x: hx as number, y: hy as number });
      });

    }

    /* VERTICAL and CROSS get a handle too.
     *
     * Neither had one, so neither could be grabbed by a point — the only way
     * to shift them was to catch the line itself, and a line that spans the
     * whole pane is easy to hit by accident and hard to aim with.
     *
     * The vertical's handle rides the middle of the pane: it is anchored in
     * time alone, so there is no price along it that is more "its" than any
     * other, and the middle is the one place that stays reachable whatever the
     * price scale does. The cross puts its handle where the two lines meet,
     * which IS its anchor. */
    for (const d of drawDraft()) {
      if ((d.kind !== 'vline' && d.kind !== 'cross') || d.id !== selForHandles) continue;
      const q = d.pts[0];
      if (!q) continue;
      const hx = c.timeScale().timeToCoordinate(q.t as UTCTimestamp);
      if (hx == null) continue;
      const hy = d.kind === 'cross' ? s.priceToCoordinate(q.v) : H / 2;
      if (hy == null) continue;
      hs.push({ id: `${d.id}:0`, x: hx as number, y: hy as number });
    }

    handlesRef.current = hs;
    setHandles(hs);

    const fc = fibCtx();
    fibGeomsRef.current = fc ? computeFibGeometries(drawings.current, fc) : [];
    setFibGeoms(fibGeomsRef.current);
  };

  /** Patch one drawing, redraw it, and save. Redrawn rather than mutated in
   *  place because colour, width and style are creation options on a series —
   *  the library has no "change the style of this line" call for all of them. */
  const patchDrawing = (id: string, patch: Partial<Drawing>) => {
    const i = drawings.current.findIndex((d) => d.id === id);
    if (i < 0) return;
    const next = { ...drawings.current[i], ...patch } as Drawing;
    drawings.current[i] = next;

    /* APPLIED IN PLACE, not by rebuilding.
     *
     * This called renderDrawings(), which removes EVERY drawing and re-adds
     * them all — so anything that threw while re-adding one took the whole
     * set off the chart. Changing a colour made every line disappear.
     *
     * Colour, width and dash are all live options on a price line and on a
     * series, so none of that is necessary: set them on the object that is
     * already there. Nothing is removed, so nothing can fail to come back. */
    try {
      const col = next.color ?? DRAW_COLOR;
      if (next.kind === 'hline') {
        hlineObjs.current.get(id)?.applyOptions({
          color: col,
          lineWidth: (next.width ?? 2) as 1 | 2 | 3 | 4,
          lineStyle: lwStyle(next.style ?? 'dashed'),
          axisLabelColor: col,
          title: next.label ?? '',
        });
      }
      // A diagonal's colour, width and dash are SVG attributes, so re-measuring
      // the overlay is the whole update.
      syncLabels();
    } catch {
      // The object is missing (hidden, or a symbol change rebuilt the chart):
      // fall back to a full redraw, which is correct if slower.
      if (!drawingsHidden) renderDrawings();
    }

    persistDrawings();
    syncLabels();
    setSelected(next);            // so the toolbar shows what it just set
  };
  const deleteDrawing = (id: string) => {
    drawings.current = drawings.current.filter((d) => d.id !== id);
    setSelected(null);
    if (!drawingsHidden) renderDrawings(); else syncLabels();
    persistDrawings();
  };
  const duplicateDrawing = (id: string) => {
    const d = drawings.current.find((x) => x.id === id);
    if (!d) return;
    const copy: Drawing = d.kind === 'fib'
      ? duplicateFib(d, newDrawId())
      : { ...d, id: newDrawId() };
    // Offset a little so the copy is visibly a second line, not one hiding
    // exactly underneath the original.
    if (copy.kind === 'hline') copy.price *= 1.0005;
    // A vertical has no price to nudge, so its copy steps sideways by a bar.
    else if (copy.kind === 'vline') copy.pts = copy.pts.map((q: DPt) => ({ ...q, t: q.t + barStepSecs() }));
    else if (copy.kind !== 'fib') copy.pts = copy.pts.map((q) => ({ ...q, v: q.v * 1.0005 }));
    drawings.current.push(copy);
    if (!drawingsHidden) renderDrawings(); else syncLabels();
    persistDrawings();
    setSelected(copy);
  };

  /* Alt+T / Alt+H / Alt+L, and Escape to put the crosshair back.
   *
   * Alt, not a bare letter: this chart shares the page with a symbol search
   * and a label prompt, and a bare "t" would arm a tool mid-sentence. Skipped
   * entirely while focus is in a field, because Alt+T typed into a text box
   * was meant for the text box.
   *
   * Escape also drops a half-finished two-click line, so an accidental first
   * click is not left waiting for a second one you never meant to give. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') {
        setTool('cursor');
        trendStart.current = null;
        forkPts.current = [];
        setDrawPending(false);
        clearPreview();
        setDrawOpen(false);
        return;
      }
      /* TAP IT, THEN DELETE IT.
       *
       * The only way to remove one drawing was to select it and then find the
       * bin in the style toolbar — on a chart carrying twenty lines that is a
       * hunt, and the key everyone reaches for first did nothing at all. Both
       * keys, because Delete and Backspace are each "get rid of this" to
       * somebody. Locked drawings are left alone, same as dragging. */
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selected || lockedRef.current) return;
        e.preventDefault();
        deleteDrawing(selected.id);
        return;
      }
      if (!e.altKey) return;
      const hit = LINE_TOOLS.find((t) => t.keys?.toLowerCase() === `alt+${e.key.toLowerCase()}`);
      if (!hit) return;
      e.preventDefault();
      if (hit.tool) setTool(hit.tool);
      trendStart.current = null;
      forkPts.current = [];
      setDrawPending(false);
      clearPreview();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    /* Bound to the CURRENT selection, not an empty list.
     * With [] this handler kept the first render's `selected` — which is null,
     * forever — so Delete would have had nothing to act on no matter what was
     * highlighted. Rebinding on selection change is cheap; it happens when
     * somebody clicks a line, not on every frame. */
  }, [selected, drawingsHidden]);
  const drawKeyRef = useRef<string>('');                 // current symbol+tf storage key (read inside once-bound handlers)
  /** `anchor` set means ONE point is being moved and the drawing reshapes
   *  around it; absent means the whole drawing is being carried.
   *  `kind` is the full union so a fib can be dragged like anything else. */
  const drag = useRef<{
    id: string; kind: Drawing['kind']; lastX: number; lastY: number;
    /** Index into `pts`. */
    anchor?: number;
  } | null>(null);
  // Indicators.
  const barsRef = useRef<Candle[]>([]);

  /** Seconds per bar, read off the loaded candles rather than parsed out of the
   *  timeframe label — the data is the authority on its own spacing. 0 when
   *  there are not two bars to measure between. */
  const barStepSecs = (): number => {
    const b = barsRef.current;
    if (b.length < 2) return 0;
    return (b[b.length - 1].time as number) - (b[b.length - 2].time as number);
  };
  const indsRef = useRef<Set<IndId>>(inds);
  const indSeries = useRef<ISeriesApi<'Line'>[]>([]);

  useEffect(() => { toolRef.current = tool; }, [tool]);

  const alias = markets.find((m) => m.symbol === symbol)?.alias ?? symbol;

  // ── Manual drawings: persist / render / clear ─────────────────────────
  // All of these use only refs, so the copies captured by the once-bound chart
  // handlers stay correct across re-renders.
  const persistDrawings = () => {
    try { if (drawKeyRef.current) localStorage.setItem(drawKeyRef.current, JSON.stringify(drawings.current)); } catch { /* ignore */ }
  };
  const addDrawingObject = (d: Drawing) => {
    const series = seriesRef.current, chart = chartRef.current;
    if (!series || !chart) return;
    if (d.kind === 'hline') {
      // Dashed, and in the drawing blue rather than grey: a level someone drew
      // has to be distinguishable at a glance from the bot's own SL/TP lines,
      // which are solid and take the up/down colours. The axis label carries
      // the exact price, which is the whole reason for drawing it.
      const col = d.color ?? DRAW_COLOR;
      hlineObjs.current.set(d.id, series.createPriceLine({
        price: d.price,
        color: col,
        lineWidth: (d.width ?? 2) as 1 | 2 | 3 | 4,
        lineStyle: lwStyle(d.style ?? 'dashed'),
        axisLabelVisible: true,
        axisLabelColor: col,
        axisLabelTextColor: '#ffffff',
        title: d.label ?? '',
      }));
    }
    // Diagonals are drawn by the SVG overlay — see syncLabels. Nothing to add
    // to the chart, which is the point: no data, no time-scale side effects.
  };
  const removeDrawingObjects = () => {
    hlineObjs.current.forEach((l) => seriesRef.current?.removePriceLine(l));
    hlineObjs.current.clear();
    trendObjs.current.forEach((s) => chartRef.current?.removeSeries(s));
    trendObjs.current.clear();
  };
  /** Per-drawing try/catch: one line the library refuses (duplicate times, a
   *  disposed series) must not take the other nine off the chart with it. */
  const renderDrawings = () => {
    removeDrawingObjects();
    for (const d of drawDraft()) {
      try { addDrawingObject(d); } catch { /* skip this one, keep the rest */ }
    }
    syncLabels();
  };
  /* ANYTHING SAVED BEFORE `pts` EXISTED.
   *
   * Drawings live in localStorage, so every line anyone has already drawn is
   * still in the old shape — t1/v1 through t4/v4. Shipping without this would
   * not lose them quietly: they would load, fail to find `pts`, and vanish
   * from the chart with the data still sitting in storage.
   *
   * Converted on read and written back in the new shape by the next save.
   * hline has no points to migrate, and a fib keeps its own model. */
  const migrateDrawing = (d: Record<string, unknown>): Drawing => {
    if (!d || d.kind === 'hline' || d.kind === 'fib' || Array.isArray(d.pts)) {
      return d as unknown as Drawing;
    }
    const pts: DPt[] = [];
    for (const i of [1, 2, 3, 4]) {
      const t = d[`t${i}`], v = d[`v${i}`];
      if (typeof t !== 'number') continue;
      // A vertical line stored no price; zero is a placeholder nothing reads.
      pts.push({ t, v: typeof v === 'number' ? v : 0 });
    }
    const out: Record<string, unknown> = { ...d, pts };
    for (const i of [1, 2, 3, 4]) { delete out[`t${i}`]; delete out[`v${i}`]; }
    return out as unknown as Drawing;
  };

  const loadDrawings = (sym: string, t: string): Drawing[] => {
    try {
      const raw = localStorage.getItem(DRAW_KEY(sym, t));
      if (raw) return (JSON.parse(raw) as Record<string, unknown>[]).map(migrateDrawing);
    } catch { /* ignore */ }
    return [];
  };
  const clearDrawings = () => {
    removeDrawingObjects();
    drawings.current = [];
    trendStart.current = null;
    forkPts.current = [];
    persistDrawings();
  };

  // Undo / redo, over the drawings only — the chart's pan and zoom are not
  // edits and nobody expects ⟲ to scroll them back. Redo is dropped the moment
  // a new line is drawn, which is what every editor does.
  const redoStack = useRef<Drawing[]>([]);
  const repaint = () => { if (!drawingsHidden) renderDrawings(); else syncLabels(); persistDrawings(); };
  const undoDrawing = () => {
    const d = drawings.current.pop();
    if (!d) return;
    redoStack.current.push(d);
    repaint();
  };
  const redoDrawing = () => {
    const d = redoStack.current.pop();
    if (!d) return;
    drawings.current.push(d);
    repaint();
  };

  // A picture of the chart as it stands, drawings and all. takeScreenshot()
  // returns the composited canvas, so what saves is what you are looking at.
  // ── The rest of the top bar ───────────────────────────────────────────
  // Trade overlays (entry / SL / TP price lines and the fill marker) are a
  // layer over the candles, so the layers icon is what hides them. They are
  // rebuilt by the loader, so hiding just strips them until the next load —
  // hence the ref the loader also reads.
  const [overlaysOn, setOverlaysOn] = useState(true);
  const [reloadTick, setReloadTick] = useState(0);
  const toggleOverlays = () => {
    const next = !overlaysOn;
    setOverlaysOn(next);
    const series = seriesRef.current;
    if (!next && series) {
      overlayLines.current.forEach((l) => series.removePriceLine(l));
      overlayLines.current = [];
      markersApi.current?.setMarkers([]);
    } else if (next) {
      setReloadTick((t) => t + 1);
    }
  };

  // Favourites: the markets you actually watch, floated to the top of the
  // search. Per browser, like the drawings — nothing here is account state.
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setFavs(JSON.parse(localStorage.getItem(FAV_KEY) || '[]') as string[]); } catch { /* ignore */ }
  }, []);
  const toggleFav = () => {
    setFavs((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  /** The candles on screen, as CSV on the clipboard — the chart's data, out. */
  const copyCandles = async () => {
    const bars = barsRef.current;
    if (!bars.length) return;
    const rows = ['time,open,high,low,close']
      .concat(bars.map((b) => [
        new Date(((b.time as number) - new Date().getTimezoneOffset() * 60) * 1000).toISOString(),
        b.open, b.high, b.low, b.close,
      ].join(',')));
    try {
      await navigator.clipboard.writeText(rows.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked — nothing to recover */ }
  };
  const [copied, setCopied] = useState(false);

  /**
   * A picture of the whole panel, not just the candles.
   *
   * takeScreenshot() returns the chart's own canvas only — the top bar, rail
   * and status strip are DOM and never appear in it, so a raw save comes out a
   * nameless chart. Painting the same header and footer onto the exported
   * canvas gives an image that says what it is: which market, which timeframe,
   * the P&L, and when it was taken.
   */
  const saveScreenshot = () => {
    const shot = chartRef.current?.takeScreenshot();
    if (!shot) return;

    const HEAD = 44, FOOT = 28, PAD = 14;
    const out = document.createElement('canvas');
    out.width = shot.width;
    out.height = shot.height + HEAD + FOOT;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0b0f0d';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(shot, 0, HEAD);
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(alias, PAD, HEAD / 2);
    const w = ctx.measureText(alias).width;
    ctx.font = '13px ui-monospace, monospace';
    ctx.fillStyle = '#9AA0A6';
    ctx.fillText(tf, PAD + w + 12, HEAD / 2);

    if (quote?.pnl != null) {
      ctx.font = 'bold 14px ui-monospace, monospace';
      ctx.fillStyle = Number(quote.pnl) >= 0 ? palette.up : palette.down;
      ctx.textAlign = 'right';
      ctx.fillText(
        `${Number(quote.pnl) >= 0 ? '+' : ''}${Number(quote.pnl).toFixed(2)}`,
        out.width - PAD, HEAD / 2,
      );
      ctx.textAlign = 'left';
    }

    ctx.font = '11px ui-monospace, monospace';
    ctx.fillStyle = '#6b7280';
    const footY = HEAD + shot.height + FOOT / 2;
    ctx.fillText(
      `${stale ? 'feed stale' : 'market open'} · ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`,
      PAD, footY,
    );
    ctx.textAlign = 'right';
    ctx.fillText('highscore.ai', out.width - PAD, footY);

    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = `${alias}-${tf}-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  // Draw the active indicators from the currently-loaded candles. Clear-then-draw
  // so it's idempotent: called both when the candles reload and when a toggle flips.
  const redrawIndicators = () => {
    const chart = chartRef.current;
    if (!chart) return;
    indSeries.current.forEach((s) => chart.removeSeries(s));
    indSeries.current = [];
    const bars = barsRef.current;
    if (!bars.length) return;
    const addLine = (data: LinePt[], color: string, dashed = false) => {
      const s = chart.addSeries(LineSeries, {
        color, lineWidth: dashed ? 1 : 2,
        lineStyle: dashed ? LineStyle.Dashed : LineStyle.Solid,
        priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
      });
      s.setData(data);
      indSeries.current.push(s);
    };
    for (const id of indsRef.current) {
      if (id === 'boll') {
        const { upper, mid, lower } = bollinger(bars, 20, 2);
        addLine(upper, '#94a3b8', true);
        addLine(mid, '#94a3b8', false);
        addLine(lower, '#94a3b8', true);
      } else if (id === 'sma20') {
        addLine(sma(bars, 20), '#f59e0b');
      } else if (id === 'sma50') {
        addLine(sma(bars, 50), '#a855f7');
      } else if (id === 'ema20') {
        addLine(ema(bars, 20), '#06b6d4');
      }
    }
  };

  const toggleInd = (id: IndId) => setInds((prev) => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  useEffect(() => {
    indsRef.current = inds;
    redrawIndicators();
    try { localStorage.setItem(INDS_KEY, JSON.stringify([...inds])); } catch { /* ignore */ }
  }, [inds]);

  // Fullscreen (native) on the chart card.
  const toggleFullscreen = () => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  };
  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Persist the selection.
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ symbol, tf })); } catch { /* ignore */ }
  }, [symbol, tf]);

  // The grid toggles without rebuilding the chart — a rebuild would drop the
  // drawings and reset the view, which is not what "hide the grid" means.
  useEffect(() => {
    chartRef.current?.applyOptions({
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)', visible: gridOn },
        horzLines: { color: 'rgba(255,255,255,0.05)', visible: gridOn },
      },
    });
  }, [gridOn]);

  // The eye hides the drawings without deleting them: the objects come off the
  // chart, the list in `drawings` (and localStorage) is untouched, so showing
  // them again brings back exactly what was there. Deleting is the trash.
  useEffect(() => {
    drawingsHiddenRef.current = drawingsHidden;
    if (!chartRef.current || !seriesRef.current) return;
    if (drawingsHidden) removeDrawingObjects();
    else renderDrawings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawingsHidden]);

  // ── Create the chart once ─────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;
    const chart = createChart(wrapRef.current, {
      autoSize: true,
      // attributionLogo: lightweight-charts v5 paints a TradingView mark into
      // the bottom-left of the canvas by default. It sits on the candles and
      // reads as this desk being a TradingView screen, which it is not.
      layout: {
        background: { color: 'transparent' },
        textColor: palette.text,
        fontFamily: 'inherit',
        attributionLogo: false,
      },
      // Created visible; the effect above applies the current setting on
      // mount. Reading the prop here would make the chart depend on it and
      // rebuild — dropping every drawing — each time the grid is toggled.
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.05)', visible: true },
        horzLines: { color: 'rgba(255,255,255,0.05)', visible: true },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 0 },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: palette.up, downColor: palette.down, wickUpColor: palette.up, wickDownColor: palette.down,
      borderVisible: false,
    });
    chartRef.current = chart;
    seriesRef.current = series;

    // Drawing: a click places a horizontal line at the price, or the two ends of
    // a trend line. Reads the current tool from a ref so we subscribe only once.
    /* THE TIME UNDER A CLICK — including past the last candle.
     *
     * param.time is set only when the click lands ON a bar. Click the gap to
     * the right of the newest candle, which is exactly where you point a fork
     * or a ray, and it is undefined — so the handler below used to bail and
     * the click vanished. The preview already solved this in pixels and said
     * so in its own comment; the click path never got the same treatment, and
     * a tool that drops half your clicks reads as a tool that does nothing.
     *
     * Past the last bar there is no bar to ask, so the time is extrapolated
     * from the last two: their spacing is the timeframe, and barSpacing is how
     * wide a bar is on screen. That keeps the anchor a real timestamp rather
     * than a pixel, which is what lets it survive a zoom. */
    const timeAtX = (x: number): number | null => {
      const ts = chart.timeScale();
      const onBar = ts.coordinateToTime(x);
      if (onBar != null) return onBar as number;
      const bars = barsRef.current;
      if (bars.length < 2) return null;
      const last = bars[bars.length - 1].time as number;
      const step = last - (bars[bars.length - 2].time as number);
      const lastX = ts.timeToCoordinate(last as UTCTimestamp);
      const spacing = ts.options().barSpacing;
      if (lastX == null || step <= 0 || !spacing) return null;
      return last + Math.round((x - (lastX as number)) / spacing) * step;
    };
    timeAtXRef.current = timeAtX;

    /** The nearest candle level to a click, when the magnet is on. */
    const snapPoint = (t: number, v: number, y: number): { t: number; v: number } => {
      const mode = magnetRef.current;
      const bars = barsRef.current;
      if (mode === 'off' || bars.length === 0) return { t, v };
      // Nearest bar in time.
      let best = bars[0];
      for (const bar of bars) {
        if (Math.abs((bar.time as number) - t) < Math.abs((best.time as number) - t)) best = bar;
      }
      // Nearest of its four levels, measured in PIXELS — price distance means
      // different things on different markets, pixels mean the same everywhere.
      const levels = [best.open, best.high, best.low, best.close];
      let pick = levels[0], bestPx = Infinity;
      for (const lv of levels) {
        const ly = series.priceToCoordinate(lv);
        if (ly == null) continue;
        const dpx = Math.abs((ly as number) - y);
        if (dpx < bestPx) { bestPx = dpx; pick = lv; }
      }
      // Weak holds only when you are already close; strong always takes it.
      if (mode === 'weak' && bestPx > 14) return { t, v };
      return { t: best.time as number, v: pick };
    };
    snapRef.current = snapPoint;

    const onClick = (param: MouseEventParams) => {
      const t = toolRef.current;
      // Cursor is a plain crosshair now; SL/TP overlays are always drawn.
      if (t === 'cursor') return;
      if (isFibTool(t)) {
        // Before the `param.time` guard below: a fib anchor is a LOGICAL bar
        // slot, so clicking right of the last candle (where param.time is
        // undefined) is exactly where a projection wants to go.
        if (!param.point) return;
        const pt = clickToFibPoint(chartRef.current, seriesRef.current, param.point, barsRef.current);
        if (!pt) return;
        const variant = FIB_TOOL_VARIANT[t];
        fibPts.current.push(pt);
        const n = fibPts.current.length;
        if (n < fibClicksNeeded(variant)) {
          setDrawPending(true);
          setFibStep(n);
          return;
        }
        const d: Drawing = makeFibDrawing(variant, fibPts.current, newDrawId());
        drawings.current.push(d); persistDrawings(); setSelected(d);
        clearPreview();
        setDrawPending(false);
        syncLabels();
        return;
      }
      if (!param.point) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price == null) return;
      const rawTime = (param.time as number | undefined) ?? timeAtX(param.point.x);
      if (rawTime == null) return;
      // The magnet applies at the moment a point is placed, so what is STORED
      // is the candle's own time and price — not the cursor's, nudged to look
      // like it.
      const snapped = snapPoint(rawTime, price as number, param.point.y);
      const time = snapped.t;
      const sPrice = snapped.v as typeof price;
      /* THEIR onDown, generalised: push the click, and when there are as many
       * as the tool needs, build the drawing from them. One path for every
       * tool instead of a branch each — and the same buildDrawing() the
       * preview uses, so what you aimed at is what you get. */
      const need = clicksNeeded(t, ALL_DRAW_TOOLS);
      forkPts.current.push({ time: time as Time, value: sPrice });
      if (forkPts.current.length < need) { setDrawPending(true); return; }

      // The one tool that asks a question before it draws.
      let typed: string | undefined;
      if (t === 'text') {
        const answer = window.prompt('Label for this level');
        if (answer == null || !answer.trim()) { forkPts.current = []; setDrawPending(false); return; }
        typed = answer.trim();
      }

      const pts: DPt[] = forkPts.current.map((q) => ({ t: q.time as number, v: q.value }));
      const made = buildDrawing(t, pts, newDrawId());
      forkPts.current = [];
      previewRef.current = null;
      setDrawPending(false);
      clearPreview();
      if (!made) return;
      if (typed) (made as { label?: string }).label = typed;
      drawings.current.push(made);
      addDrawingObject(made);
      persistDrawings();
      setSelected(made);
      syncLabels();
    };
    chart.subscribeClick(onClick);

    /* THE BAR UNDER THE CURSOR.
     *
     * Open, high, low, close and the change across that one candle. Every
     * other number on this desk is about the account; this is the only place
     * that answers "what did THIS bar actually do", which is the question you
     * are asking whenever you put the crosshair on one.
     *
     * Falls back to the last bar when the cursor leaves the chart, so the
     * strip reads the current candle rather than emptying. */
    const onCrosshair = (param: MouseEventParams) => {
      const d = param.seriesData.get(series) as
        | { open: number; high: number; low: number; close: number } | undefined;
      setHoverBar(d ?? null);

      // The rubber-band preview is an SVG overlay now, not a chart series:
      // see the pointermove handler below.
    };
    chart.subscribeCrosshairMove(onCrosshair);

    // A label sits at its line's midpoint in PIXELS, so panning or zooming
    // moves it. Re-measured whenever the visible range changes.
    const onRange = () => syncLabels();
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);

    // ── Drag-to-move a drawing (cursor tool only) ─────────────────────────
    // Grab a line by clicking within a few px of it, then drag. While dragging we
    // freeze the chart's own pan/zoom so the move doesn't scroll the candles.
    const el = wrapRef.current;
    // 12px, matching the reference: a 2px line is a hard thing to hit and a
    // miss reads as the drawing being unselectable rather than as a near miss.
    const HIT = 12;
    const localXY = (e: PointerEvent) => {
      const r = el!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hitTest = (x: number, y: number): { id: string; kind: Drawing['kind'] } | null => {
      const s = seriesRef.current, c = chartRef.current;
      if (!s || !c) return null;
      for (const d of drawDraft()) {
        if (d.kind !== 'hline') continue;
        const cy = s.priceToCoordinate(d.price);
        if (cy != null && Math.abs(cy - y) <= HIT) return { id: d.id, kind: 'hline' };
      }
      for (const d of drawDraft()) {
        if (d.kind !== 'trend') continue;
        const [kA, kB] = d.pts;
        if (!kA || !kB) continue;
        const x1 = c.timeScale().timeToCoordinate(kA.t as UTCTimestamp);
        const x2 = c.timeScale().timeToCoordinate(kB.t as UTCTimestamp);
        const y1 = s.priceToCoordinate(kA.v), y2 = s.priceToCoordinate(kB.v);
        if (x1 == null || x2 == null || y1 == null || y2 == null) continue;
        if (distToSeg(x, y, x1, y1, x2, y2) <= HIT) return { id: d.id, kind: 'trend' };
      }
      const fibId = drawingsHiddenRef.current ? null : fibHitTest(fibGeomsRef.current, x, y, HIT);
      if (fibId) return { id: fibId, kind: 'fib' };
      /* A fork is grabbed by any of its lines. Tested against what is ON SCREEN
       * — the segments syncLabels already computed — rather than re-deriving
       * the geometry here, so the thing you can see and the thing you can grab
       * cannot disagree. */
      for (const d of drawDraft()) {
        if (d.kind !== 'pitchfork' && d.kind !== 'vline' && d.kind !== 'cross'
          && d.kind !== 'channel') continue;
        const mine = segsRef.current.filter(
          (g) => g.id === d.id || g.id.startsWith(`${d.id}#`),
        );
        for (const g of mine) {
          if (distToSeg(x, y, g.x1, g.y1, g.x2, g.y2) <= HIT) {
            return { id: d.id, kind: 'trend' };
          }
        }
      }
      return null;
    };
    const onDown = (e: PointerEvent) => {
      if (toolRef.current !== 'cursor') return;
      // Locked: the lines stay where they are. Without this, a pan that starts
      // near a level silently drags the level instead of the chart.
      if (lockedRef.current) return;
      const { x, y } = localXY(e);

      /* AN ANCHOR FIRST, THE BODY SECOND.
       *
       * Grabbing an end has to beat grabbing the line, because the end sits ON
       * the line — test the body first and you could never catch a handle at
       * all. This is what makes a drawing RESHAPE instead of only travelling:
       * an extended line dragged by one end swings about the other, which is
       * how aiming one works and what moving the whole thing cannot do.
       *
       * A slightly fatter radius than the line's, because a 9px dot is a small
       * thing to ask anyone to hit. */
      const HANDLE_HIT = HIT + 4;
      for (const h of handlesRef.current) {
        if (Math.hypot(h.x - x, h.y - y) > HANDLE_HIT) continue;
        const [id, key] = h.id.split(':');
        const d = drawings.current.find((k) => k.id === id);
        if (!d) continue;
        e.preventDefault();
        setSelected(d);
        drag.current = {
          id, kind: 'trend', lastX: x, lastY: y, anchor: Number(key),
        };
        chart.applyOptions({ handleScroll: false, handleScale: false });
        try { el!.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        return;
      }

      const hit = hitTest(x, y);
      // Clicking a line selects it — that is how the style toolbar knows what
      // to act on. Clicking empty space clears the selection, so the toolbar
      // goes away rather than hovering over nothing.
      setSelected(hit ? drawings.current.find((k) => k.id === hit.id) ?? null : null);
      if (!hit) return;                       // nothing grabbed → let the chart pan
      e.preventDefault();
      drag.current = { id: hit.id, kind: hit.kind, lastX: x, lastY: y };
      chart.applyOptions({ handleScroll: false, handleScale: false });
      try { el!.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    const onMove = (e: PointerEvent) => {
      const s = seriesRef.current, c = chartRef.current;
      if (!s || !c) return;
      const { x, y } = localXY(e);

      /* THE RUBBER BAND, IN PIXELS.
       *
       * This was a chart series driven by the crosshair event, and it kept not
       * drawing: that path needs the time scale to resolve the cursor to a bar,
       * which returns nothing while data is loading, in the gap right of the
       * last candle, or when both ends land on one bar. Three different silent
       * failures, all of which look identical — a tool that ignores you.
       *
       * Pixels always resolve. The anchor is converted to screen coordinates
       * each frame, so the band tracks the cursor whatever the chart is doing. */
      const t = toolRef.current;
      if (t === 'cursor') {
        if (previewRef.current) { previewRef.current = null; syncLabels(); }
      } else if (!isFibTool(t)) {
        /* ONE preview for every tool: the clicks so far, plus the cursor as
         * the next point, built into the drawing it will become. */
        const pr = s.coordinateToPrice(y);
        const tt = timeAtXRef.current?.(x) ?? null;
        if (pr != null && tt != null) {
          const sn = snapRef.current?.(tt, pr as number, y) ?? { t: tt, v: pr as number };
          const pts: DPt[] = [
            ...forkPts.current.map((q) => ({ t: q.time as number, v: q.value })),
            { t: sn.t, v: sn.v },
          ];
          previewRef.current = buildDrawing(t, pts, 'draft');
          syncLabels();
        }
      }

      const dg = drag.current;
      if (!dg) {
        if (toolRef.current === 'cursor') {
          const over = hitTest(x, y);
          el!.style.cursor = over ? 'grab' : '';
          // Only on change: this fires on every mouse move, and setting state
          // each time would re-render the chart continuously.
          if ((over?.id ?? null) !== hoverRef.current) {
            hoverRef.current = over?.id ?? null;
            setHoverId(over?.id ?? null);
          }
        } else if (hoverRef.current) {
          hoverRef.current = null;
          setHoverId(null);
        }
        return;
      }
      const d = drawings.current.find((k) => k.id === dg.id);
      if (!d) return;
      if (d.kind === 'hline') {
        const p = s.coordinateToPrice(y);
        if (p == null) return;
        d.price = p;
        hlineObjs.current.get(d.id)?.applyOptions({ price: p });
      } else if (d.kind === 'fib') {
        // A fib carries as a whole; it has its own anchor handling.
        const pNow = s.coordinateToPrice(y), pLast = s.coordinateToPrice(dg.lastY);
        const dv = pNow != null && pLast != null ? pNow - pLast : 0;
        shiftFib(d, dragDeltaLogical(c, dg.lastX, x), dv, barsRef.current, inferBarSecs(barsRef.current));
        syncLabels();
      } else if (dg.anchor != null) {
        /* ONE END, FOLLOWING THE CURSOR. Everything derived from the drawing is
         * recomputed, so a fork's median and tines swing, an extended line
         * pivots about its other end, and a channel's boundary follows. */
        const pr = s.coordinateToPrice(y);
        const rawT = timeAtXRef.current?.(x) ?? null;
        const q = d.pts[dg.anchor];
        if (pr != null && rawT != null && q) {
          // Same magnet when REshaping as when placing: an anchor that snapped
          // on the way down and not on the way back would not stay put.
          const sn = snapRef.current?.(rawT, pr as number, y) ?? { t: rawT, v: pr as number };
          const tt = sn.t;
          q.t = tt;
          // A vertical line has no height to move; only its moment changes.
          if (d.kind !== 'vline') q.v = sn.v;
          syncLabels();
        }
      } else {
        /* EVERY anchor, whatever the drawing has. This listed v1/v2 and t1/t2
         * by hand and had to be edited each time a kind gained a point — a
         * missed one is a drawing that warps when you merely move it. */
        const pNow = s.coordinateToPrice(y), pLast = s.coordinateToPrice(dg.lastY);
        if (pNow != null && pLast != null) {
          const dv = pNow - pLast;
          if (d.kind !== 'vline') for (const q of d.pts) q.v += dv;
        }
        const tNow = c.timeScale().coordinateToTime(x), tLast = c.timeScale().coordinateToTime(dg.lastX);
        if (tNow != null && tLast != null) {
          const dt = (tNow as number) - (tLast as number);
          for (const q of d.pts) q.t += dt;
        }
        // The overlay owns diagonals now, so moving one is just re-measuring.
        syncLabels();
      }
      dg.lastX = x; dg.lastY = y;
      el!.style.cursor = 'grabbing';
    };
    const endDrag = (e: PointerEvent) => {
      if (!drag.current) return;
      drag.current = null;
      chart.applyOptions({ handleScroll: true, handleScale: true });
      el!.style.cursor = '';
      try { el!.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      persistDrawings();
    };
    el?.addEventListener('pointerdown', onDown);
    el?.addEventListener('pointermove', onMove);
    el?.addEventListener('pointerup', endDrag);
    el?.addEventListener('pointercancel', endDrag);

    return () => {
      el?.removeEventListener('pointerdown', onDown);
      el?.removeEventListener('pointermove', onMove);
      el?.removeEventListener('pointerup', endDrag);
      el?.removeEventListener('pointercancel', endDrag);
      chart.remove(); chartRef.current = null; seriesRef.current = null;
    };
  }, []);

  // ── Load history + trades when symbol/timeframe changes ───────────────
  useEffect(() => {
    if (!symbol) return;
    let alive = true;
    setLoading(true);
    liveBar.current = null;
    // A half-drawn line or fib belongs to the market it was started on.
    trendStart.current = null; fibPts.current = []; forkPts.current = [];
    // Detach the previous market's drawing objects (keep them saved), then switch
    // the storage key and load this market/timeframe's saved drawings. They are
    // rendered after the candles load (trend lines need the time axis).
    removeDrawingObjects();
    drawKeyRef.current = DRAW_KEY(symbol, tf);
    drawings.current = loadDrawings(symbol, tf);
    clearOverlay(); // the old market's overlay must not linger, or stay hit-testable

    (async () => {
      // Read straight from Supabase (admin-gated by RLS) — no Netlify Function.
      const [barsRes, tradesRes, quoteRes, stateRes] = await Promise.all([
        // Order DESCENDING then flip to ascending below: `.limit()` keeps the rows
        // the DB returns FIRST, so ascending+limit would hand back the OLDEST 1500
        // bars and cut off everything recent (the chart froze days in the past).
        supabase.from('bot_bars').select('ts,open,high,low,close')
          .eq('symbol', symbol).eq('timeframe', tf).order('ts', { ascending: false }).limit(1500),
        supabase.from('bot_trades').select('id,side,open_ts,open_price,close_ts,close_price,sl,tp,pnl,close_reason')
          .eq('symbol', symbol).order('open_ts', { ascending: false }).limit(300),
        supabase.from('bot_quotes').select('digits').eq('symbol', symbol).maybeSingle(),
        // bot_trades only carries orders the bot placed itself. A position it
        // adopted from the broker exists only here, as state='active'.
        supabase.from('bot_market_state').select('state,level,latest_signal,sl,tp')
          .eq('symbol', symbol).maybeSingle(),
      ]);
      if (!alive) return;
      const series = seriesRef.current;
      if (!series) return;

      const fetchedDigits = (quoteRes.data?.digits as number) ?? 5;
      setDigits(fetchedDigits);
      series.applyOptions({
        priceFormat: {
          type: 'price',
          precision: fetchedDigits,
          minMove: 1 / Math.pow(10, fetchedDigits),
        },
      });
      // Fetched newest-first; flip to oldest-first — lightweight-charts requires
      // ascending time order.
      const bars: Candle[] = (barsRes.data ?? []).map((b) => ({
        time: utcTz(b.ts as string),
        open: Number(b.open), high: Number(b.high), low: Number(b.low), close: Number(b.close),
      })).reverse();
      barsRef.current = bars;
      setHasHistory(bars.length > 0);
      setLastBar(bars.length ? bars[bars.length - 1] : null);
      series.setData(bars);
      redrawIndicators(); // recompute active indicators for the new candles
      renderDrawings();   // re-draw saved manual annotations for this market/timeframe

      // CLEAR every overlay from the previous market/timeframe first — otherwise
      // price lines (entry/SL/TP) and markers pile up on the axis and lines from
      // other markets linger. This was the "so many SL/TP" bug.
      overlayLines.current.forEach((l) => series.removePriceLine(l));
      overlayLines.current = [];
      activeSide.current = null;

      if (bars.length) {
        liveBar.current = bars[bars.length - 1];
        chartRef.current?.timeScale().fitContent();

        // If the timeframe is short enough, draw all historical trades as arrows on
        // the candles. (On H4/D1, zooming way out to see years of history means the
        // Also fetched newest-first; flip to oldest-first so trades[last] is the latest.
        const trades: Trade[] = ((tradesRes.data ?? []) as Trade[]).slice().reverse();

        // ONLY the latest trade is marked. Plotting every trade in history buried
        // the candles under BUY/SELL arrows — on an active market that is
        // hundreds of them, and the older ones tell you nothing about now.
        // Snap the trade's open time onto the candle it falls in, so the arrow
        // sits exactly on that bar. open_ts is the precise fill moment, not a bar
        // boundary, so without this the marker floats between candles.
        const snapToBar = (iso: string): UTCTimestamp => {
          const t = utcTz(iso) as number;
          let chosen = bars[0].time;
          for (const b of bars) { if ((b.time as number) <= t) chosen = b.time; else break; }
          return chosen;
        };
        const latest = trades.length ? [trades[trades.length - 1]] : [];
        const markers = latest.map((t) => {
          const buy = t.side === 'buy';
          return {
            time: snapToBar(t.open_ts),
            position: buy ? 'belowBar' : 'aboveBar',
            color: buy ? palette.up : palette.down,
            shape: buy ? 'arrowUp' : 'arrowDown',
            text: buy ? 'BUY' : 'SELL',
          } as SeriesMarker<Time>;
        }).sort((a, b) => (a.time as number) - (b.time as number));
        if (markersApi.current) markersApi.current.setMarkers(markers);
        else markersApi.current = createSeriesMarkers(series, markers);

        // Entry / SL / TP overlay — for an OPEN position AND for a resting PENDING
        // order. bot_market_state is the authority: `level` is the entry (pending
        // or filled), and it stays correct for positions the bot adopted and after
        // the profit lock ratchets the stop. bot_trades is the fallback.
        const openRow = trades.find((t) => !t.close_ts);
        const live = stateRes.data as
          { state?: string; level?: number; latest_signal?: string; sl?: number | null; tp?: number | null } | null;

        const hasPosition = live?.state === 'active' || !!openRow;   // a trade is open
        const hasPending = live?.level != null && !hasPosition;      // limit order resting, not yet filled

        const entry = live?.level != null ? Number(live.level)
          : openRow ? Number(openRow.open_price) : null;
        const sl = live?.sl ?? openRow?.sl ?? null;
        const tp = live?.tp ?? openRow?.tp ?? null;
        tradeSL.current = sl != null ? Number(sl) : null;
        tradeTP.current = tp != null ? Number(tp) : null;

        if (entry != null && (hasPosition || hasPending)) {
          const sig = (live?.latest_signal ?? '').toUpperCase();
          activeSide.current = openRow
            ? (openRow.side === 'sell' ? 'sell' : 'buy')
            : (sig.startsWith('SHORT') || sig.startsWith('SELL') ? 'sell' : 'buy');
          const sideStr = activeSide.current === 'sell' ? 'SELL' : 'BUY';
          // Entry line: solid once filled, dashed while the order is still pending.
          overlayLines.current.push(series.createPriceLine({
            price: entry, color: '#3b9de7', lineWidth: 2,
            lineStyle: hasPending ? LineStyle.Dashed : LineStyle.Solid,
            axisLabelVisible: true, title: hasPending ? `${sideStr} · pending` : sideStr,
          }));
          // SL / TP are now drawn by default (pending and open alike) — no click needed.
          if (tradeSL.current != null) overlayLines.current.push(series.createPriceLine({ price: tradeSL.current, color: palette.down, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'SL' }));
          if (tradeTP.current != null) overlayLines.current.push(series.createPriceLine({ price: tradeTP.current, color: palette.up, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'TP' }));
        }
      }

      setLoading(false);
    })();

    return () => { alive = false; };
    // reloadTick: turning the trade overlays back on rebuilds them from the
    // same query that drew them in the first place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, tf, reloadTick]);

  // ── Poll the live quote; move the forming candle + price line ─────────
  useEffect(() => {
    if (!symbol) return;
    let alive = true;

    const tick = async () => {
      // Live quote + floating P&L, read directly from Supabase (no Netlify Function).
      const [qRes, msRes] = await Promise.all([
        supabase.from('bot_quotes').select('bid,ask,spread,updated_at').eq('symbol', symbol).maybeSingle(),
        supabase.from('bot_market_state').select('pnl,state').eq('symbol', symbol).maybeSingle(),
      ]);
      if (!alive) return;
      const qd = qRes.data;
      const q: Quote = {
        bid: (qd?.bid as number) ?? null,
        ask: (qd?.ask as number) ?? null,
        spread: (qd?.spread as number) ?? null,
        updated_at: (qd?.updated_at as string) ?? null,
        pnl: (msRes.data?.pnl as number) ?? null,
        state: (msRes.data?.state as string) ?? null,
      };
      setQuote(q);
      const price = q.bid;
      const series = seriesRef.current;
      // Only move the chart when the quote is genuinely fresh — a stale feed
      const fresh = q.updated_at && Date.now() - new Date(q.updated_at).getTime() < 300_000;
      if (fresh && series && price != null && Number.isFinite(price)) {
        const secs = TF_SECONDS[tf] ?? 900;
        const lb = liveBar.current;
        const nowUtcSecs = Math.floor(Date.now() / 1000) + new Date().getTimezoneOffset() * 60;
        const bucket = (Math.floor(nowUtcSecs / secs) * secs) as UTCTimestamp;
        // Intraday: roll into a fresh bucket when the clock crosses it. H4+ : just
        // extend the last historical bar (epoch buckets don't match broker weeks/months).
        if (!lb) {
          liveBar.current = { time: bucket, open: price, high: price, low: price, close: price };
        } else if (secs <= INTRADAY_MAX_SECS && (bucket as number) > (lb.time as number)) {
          liveBar.current = { time: bucket, open: price, high: price, low: price, close: price };
        } else {
          liveBar.current = { time: lb.time, open: lb.open, high: Math.max(lb.high, price), low: Math.min(lb.low, price), close: price };
        }
        series.update(liveBar.current);
        // The legend's C should track the live price, not the last close.
        setLastBar({ ...liveBar.current });
      }
    };

    tick();
    const id = setInterval(tick, 3000); // v7: 3s (was 1.5s) to stay under the free-tier request budget
    return () => { alive = false; clearInterval(id); };
  }, [symbol, tf]);

  const stale = quote?.updated_at ? Date.now() - new Date(quote.updated_at).getTime() > 300_000 : true;
  // Nothing to draw: no candle history AND no live feed to build one from.
  const showEmpty = hasHistory === false && stale && !loading;

  /* ── Workspace chrome ───────────────────────────────────────────────────
   * The trading-desk layout: a top bar, a vertical tool rail, and a status
   * strip. Opt-in, so the admin dashboard keeps the controls it has.
   */
  if (chrome === 'workspace') {
    const canvas = (
      <div className="relative min-w-0 flex-1">
        <div
          ref={wrapRef}
          className={`h-full w-full transition-opacity ${showEmpty ? 'opacity-0' : 'opacity-100'}`}
          style={tool !== 'cursor' ? { cursor: 'crosshair' } : undefined}
        />

        {/* Diagonals and their handles. Clipped by the SVG viewport, which is
            how a ray reaches the edge without existing beyond it. */}
        {!drawingsHidden
          && (segs.length > 0 || handles.length > 0
            || arcs.length > 0 || fills.length > 0) && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
            {/* Tints first, so a boundary is never drawn under its own fill. */}
            {fills.map((f) => (
              <polygon
                key={f.id}
                points={f.pts.map((q) => `${q.x},${q.y}`).join(' ')}
                fill={f.color}
                fillOpacity={f.solid ? 1 : 0.12}
                stroke="none"
              />
            ))}
            {segs.map((g) => (
              <line
                key={g.id}
                x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
                stroke={g.color}
                strokeWidth={g.width}
                /* Theirs: strokeDasharray = preview ? "4 4" : DASH[...].
                 * The draft is the only thing on this layer that is not yet a
                 * drawing, so it is the only thing drawn provisionally. */
                strokeDasharray={
                  g.id === 'draft' || g.id.startsWith('draft#') ? '4 4' : (g.dash || undefined)
                }
                strokeLinecap="round"
              />
            ))}
            {arcs.map((a) => (
              <path
                key={a.id}
                d={a.d}
                fill="none"
                stroke={a.color}
                strokeWidth={1.5}
              />
            ))}
            {handles.map((h) => (
              <circle
                key={h.id}
                cx={h.x}
                cy={h.y}
                r={5}
                fill="#0b0f0d"
                stroke={DRAW_COLOR}
                strokeWidth={2}
              />
            ))}
          </svg>
        )}

        {/* Fibonacci levels: projected through logical bar slots, so they keep
            working right of the last candle. */}
        {!drawingsHidden && (
          <FibOverlay geoms={fibGeoms} preview={fibPreview} digits={digits} selectedId={selected?.id ?? null} />
        )}

        {/* Diagonal labels, at each line's midpoint. */}
        {!drawingsHidden && lineLabels.map((l) => (
          <span
            key={l.id}
            className={`pointer-events-none absolute z-20 -translate-y-1/2 whitespace-nowrap rounded text-[10px] font-bold ${
              l.bare
                ? 'font-mono'                       // the angle: no plate at all
                : l.readout
                  // Left-aligned, as theirs anchors its text at mx + 14.
                  ? 'border bg-bg-elevated/95 px-1.5 py-0.5 font-mono'
                  : '-translate-x-1/2 px-1.5 py-0.5 text-white'
            }`}
            style={l.bare || l.readout
              ? { left: l.x, top: l.y, color: l.color, ...(l.bare ? {} : { borderColor: l.color }) }
              : { left: l.x, top: l.y, backgroundColor: l.color }}
          >
            {l.text.split(String.fromCharCode(10)).map((row, i) => (
              <span key={row + i} className="block">{row}</span>
            ))}
          </span>
        ))}

        {tfRingOpen && (
          <TimeframeRing
            value={tf}
            live={TF_VALUES}
            onPick={setTf}
            onClose={() => setTfRingOpen(false)}
          />
        )}

        {/* The rubber band. pointer-events-none so it never eats the click that
            is about to commit the line it is previewing. */}
        {/* WHAT YOU ARE DRAWING RIGHT NOW.
            Outside the drawings overlay on purpose: that one is gated by the
            hide-drawings eye, and hiding what is already saved must not hide
            the thing still following your cursor. It is also never clipped by
            the saved-drawings layer, so it is always the clearest line on the
            chart - which is the one you are aiming. */}
        {(ghost.length > 0 || ghostFill) && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
            {ghostFill && (
              <polygon
                points={ghostFill.map((q) => `${q.x},${q.y}`).join(' ')}
                fill={DRAW_COLOR}
                fillOpacity={0.12}
                stroke="none"
              />
            )}
            {ghost.map((g) => (
              <line
                key={g.id}
                x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
                stroke={g.color}
                strokeWidth={g.width}
                /* Theirs: strokeDasharray = preview ? "4 4" : DASH[...].
                 * A preview reads as provisional because it is DASHED, not
                 * because it is faint. */
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            ))}
          </svg>
        )}

        {band && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <line
              x1={band.flat ? 0 : band.x1}
              y1={band.y1}
              x2={band.flat ? '100%' : band.x2}
              y2={band.y2}
              stroke={DRAW_COLOR}
              /* SOLID, and the same weight as the line it is previewing.
               * It was thin and dashed, so a trend line looked dashed while
               * you drew it and solid once placed — two different lines as far
               * as anyone watching is concerned, and the reason the tool got
               * reported as drawing dashes. */
              strokeWidth={2}
            />
            {!band.flat && (
              <circle cx={band.x1} cy={band.y1} r={4} fill="none" stroke={DRAW_COLOR} strokeWidth={2} />
            )}
          </svg>
        )}
        {/* The live reading, on the plate it will keep once the line is placed
            — so what you are reading while you aim is what you end up with. */}
        {band && bandLabel && (
          <span
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border bg-bg-elevated/95 px-1.5 py-0.5 font-mono text-[10px] font-bold"
            style={{
              left: (band.x1 + band.x2) / 2,
              top: (band.y1 + band.y2) / 2 - 16,
              color: DRAW_COLOR,
              borderColor: DRAW_COLOR,
            }}
          >
            {bandLabel}
          </span>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-fg-muted">
            Loading {alias}…
          </div>
        )}
        {showEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
              <CandlestickChart className="h-6 w-6 text-fg-subtle" />
            </div>
            <p className="text-sm font-semibold text-fg">No candles for {alias}</p>
            <p className="max-w-md text-xs leading-relaxed text-fg-muted">
              No history in <code className="font-mono text-fg-subtle">bot_bars</code> for this
              market/timeframe. Candles are synced by{' '}
              <code className="font-mono text-fg-subtle">scripts.bar_sync</code> on the VM — if it
              isn’t running, history stops refreshing.
            </p>
          </div>
        )}
      </div>
    );

    return (
      <div
        ref={cardRef}
        className={`relative flex h-full min-h-0 flex-col overflow-hidden bg-bg ${fs ? 'h-screen' : ''}`}
      >
        {/* Top bar */}
        <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            title="Change market"
            className="flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors hover:bg-brand/10"
          >
            {/* The ticker, not the broker's full name: MT5 calls this market
                "Volatility 25 Index", which shoves the rest of the bar off the
                edge. The long name lives in the search list. */}
            <SymbolAvatar symbol={alias} />
            <span className="max-w-[10rem] truncate text-sm font-bold text-fg" title={symbol}>
              {alias}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
          </button>

          {/* Timeframe, as a dial. Every one is on the ring in a fixed place,
              so choosing becomes muscle memory; the ones bar_sync does not
              store are greyed rather than dropped, so a missing timeframe
              reads as "not yet" instead of "not found". */}
          <button
            type="button"
            onClick={() => setTfRingOpen(true)}
            title="Timeframe"
            className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm font-bold text-fg transition-colors hover:bg-brand/10"
          >
            {tf}
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
          </button>

          {/* Chart type. The series is a candlestick series and its markers and
              price lines hang off it, so Line and Area are listed as the design
              lists them, and disabled because picking one would change nothing. */}
          <TopMenu label="Candles">
            {() => CHART_TYPES.map((t) => (
              <MenuItem
                key={t}
                active={t === 'Candles'}
                disabled={t !== 'Candles'}
                title={t === 'Candles' ? undefined : 'not drawn yet — the series is a candlestick series'}
              >
                <CandlestickChart className="mr-2 inline-block h-3.5 w-3.5 align-middle text-brand" />
                {t}
              </MenuItem>
            ))}
          </TopMenu>

          {/* Layout: what the chart shows, as opposed to what it plots. */}
          <TopMenu label="Layout">
            {(close) => (
              <>
                <MenuItem onClick={() => { chartRef.current?.timeScale().fitContent(); close(); }}>
                  Fit to data
                </MenuItem>
                <MenuItem onClick={() => { chartRef.current?.timeScale().scrollToRealTime(); close(); }}>
                  Jump to latest
                </MenuItem>
                {/* Not `active`: these are actions, and a green "Hide grid"
                    reads as "the grid is hidden" — the opposite of the truth. */}
                <MenuItem onClick={() => { setGridOn((v) => !v); close(); }}>
                  {gridOn ? 'Hide grid' : 'Show grid'}
                </MenuItem>
                <MenuItem onClick={() => { toggleOverlays(); close(); }}>
                  {overlaysOn ? 'Hide trade overlays' : 'Show trade overlays'}
                </MenuItem>
              </>
            )}
          </TopMenu>

          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm text-fg transition-colors hover:bg-brand/10 hover:text-brand"
          >
            <LineChart className="h-3.5 w-3.5" />
            Indicators
          </button>

          <RailBtn
            active={favs.includes(symbol)}
            onClick={toggleFav}
            title={favs.includes(symbol) ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Bookmark className={`h-4 w-4 ${favs.includes(symbol) ? 'fill-current' : ''}`} />
          </RailBtn>

          <RailBtn onClick={undoDrawing} title="Undo drawing">
            <Undo2 className="h-4 w-4" />
          </RailBtn>
          <RailBtn onClick={redoDrawing} title="Redo drawing">
            <Redo2 className="h-4 w-4" />
          </RailBtn>

          <div className="ml-auto flex items-center gap-1 pr-1">
            {quote?.pnl != null && (
              <span className="text-right leading-tight">
                <span className="block text-[9px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
                  Open P&amp;L
                </span>
                <span
                  className={`block font-mono tabular text-sm font-bold ${
                    Number(quote.pnl) >= 0 ? 'text-brand' : 'text-danger'
                  }`}
                >
                  {Number(quote.pnl) >= 0 ? '+' : ''}{Number(quote.pnl).toFixed(2)}
                </span>
              </span>
            )}
            <a
              href={`/bot/${encodeURIComponent(symbol)}`}
              title={`${alias} — the bot's full read on this market`}
              className="flex h-9 w-9 items-center justify-center rounded-sm text-fg-muted transition-colors hover:bg-brand/10 hover:text-brand"
            >
              <FileText className="h-4 w-4" />
            </a>
            <RailBtn
              active={overlaysOn}
              onClick={toggleOverlays}
              title={overlaysOn ? 'Hide entry / SL / TP overlays' : 'Show entry / SL / TP overlays'}
            >
              <Layers className="h-4 w-4" />
            </RailBtn>
            <RailBtn onClick={copyCandles} title={copied ? 'Copied' : 'Copy these candles as CSV'}>
              {copied ? <Check className="h-4 w-4 text-brand" /> : <Code2 className="h-4 w-4" />}
            </RailBtn>
            <RailBtn onClick={saveScreenshot} title="Save a picture of this chart">
              <Camera className="h-4 w-4" />
            </RailBtn>
            <RailBtn onClick={toggleFullscreen} title={fs ? 'Exit full screen' : 'Full screen'}>
              {fs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </RailBtn>
          </div>
        </div>

        {/* Canvas, with the tool rail floating ON it rather than beside it —
            the rail belongs to the chart, and a bordered column outside it
            just eats width from the candles. */}
        {/* pl-12 clears the rail: it is absolutely positioned, so without this
            it would sit on top of the left-most candles and the price axis. */}
        <div className="relative flex min-h-0 flex-1 pl-12">
          {canvas}

          {/* Flush to the chart's left edge and full height, as in the design.
              Inset-and-floating left a band of dead canvas beside it. */}
          {/* Collapsed: one button to bring it back, so the rail can get out
              of the way on a narrow screen without being gone for good. */}
          {railHidden && (
            <div className="absolute left-0 top-2 z-20">
              <button
                type="button"
                onClick={() => setRailHidden(false)}
                title="Show drawing tools"
                aria-label="Show drawing tools"
                className="flex h-9 w-7 items-center justify-center rounded-r-md border border-l-0 border-border bg-bg-elevated/95 text-fg-muted backdrop-blur-sm transition-colors hover:text-brand"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* overflow-VISIBLE, deliberately.
              This was overflow-y-auto, and CSS computes the other axis to auto
              alongside it — so the drawing menu, which opens to the RIGHT of a
              48px column, was clipped to that column and invisible. Clicking
              the chevron did open it; there was simply nothing to see.
              The tools now fit without scrolling, so the scroll is not needed. */}
          <div
            className={`absolute inset-y-0 left-0 z-20 w-12 flex-col items-center gap-0.5 overflow-visible border-r border-border bg-bg-elevated/95 py-2 backdrop-blur-sm ${
              railHidden ? 'hidden' : 'flex'
            }`}
          >
            <RailBtn active={tool === 'cursor'} onClick={() => setTool('cursor')} title="Crosshair">
              <Crosshair className="h-4 w-4" />
            </RailBtn>
            {/* SPLIT BUTTON. The icon arms the line type you last used — one
                click, no menu, no shortcut to remember. The chevron beneath it
                opens the list, and picking from there becomes the new default.
                The rail cannot hold nine line types as nine icons, and making
                you walk a menu for every line is the thing that makes drawing
                tools feel slow. */}
            <div
              ref={drawBtnRef}
              className={`group relative flex h-9 items-center rounded-sm transition-colors ${
                tool !== 'cursor' ? 'bg-brand/15 ring-1 ring-brand/40' : 'hover:bg-brand/10'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setTool(lastLine);
                  trendStart.current = null;
                  forkPts.current = [];
                  setDrawPending(false);
                  clearPreview();
                }}
                title={`${ALL_DRAW_TOOLS.find((t) => t.tool === lastLine)?.label ?? 'Draw'}`
                  + (tool === 'cursor' ? ' — click to arm' : ' — armed')}
                className={`flex h-9 w-8 items-center justify-center rounded-l-sm transition-colors ${
                  tool !== 'cursor' ? 'text-brand' : 'text-fg-muted group-hover:text-brand'
                }`}
              >
                {(() => {
                  const Icon = TOOL_ICON[lastLine] ?? PenLine;
                  return <Icon className="h-4 w-4" />;
                })()}
              </button>
              {/* At the RIGHT EDGE of the icon, not under it — one control, two
                  halves, the way the design has it. */}
              <button
                type="button"
                onClick={() => setDrawOpen((v) => !v)}
                title="Choose a line type"
                aria-label="Choose a line type"
                className={`flex h-9 w-3.5 items-center justify-center rounded-r-sm transition-colors ${
                  drawOpen ? 'text-brand' : 'text-fg-subtle group-hover:text-brand'
                }`}
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              {drawOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Dismiss drawing tools"
                    onClick={() => setDrawOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    style={drawMaxH ? { maxHeight: drawMaxH } : undefined}
                    className="absolute left-[calc(100%+6px)] top-0 z-[60] w-64 overflow-y-auto overscroll-contain rounded-sm border border-border bg-surface-raised py-2 shadow-xl"
                  >
                    {([
                      ['Lines', [...LINE_TOOLS, ...EXTRA_TOOLS]],
                      ['Channels', CHANNEL_TOOLS],
                      ['Pitchforks', PITCHFORK_TOOLS],
                    ] as const).map(([group, items]) => (
                      <div key={group}>
                        <p className="px-3 pb-1 pt-3 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle first:pt-1">
                          {group}
                        </p>
                        {items.map((t) => (
                          <button
                            key={t.label}
                            type="button"
                            disabled={t.soon}
                            title={t.soon ? 'Not built yet' : undefined}
                            onClick={() => {
                              if (!t.tool) return;
                              // Picking from the list arms it AND becomes what
                              // the rail button arms next time.
                              setTool(t.tool);
                              setLastLine(t.tool);
                              setDrawOpen(false);
                              trendStart.current = null;
                              forkPts.current = [];
                              setDrawPending(false);
                              clearPreview();
                            }}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[15px] transition-colors ${
                              tool === t.tool && !t.soon
                                ? 'bg-brand/15 font-semibold text-brand'
                                : t.soon
                                  ? 'cursor-not-allowed text-fg-subtle/50'
                                  : 'text-fg hover:bg-brand/10 hover:text-brand'
                            }`}
                          >
                            <span className="w-4 shrink-0 text-center font-mono text-fg-subtle">{t.glyph}</span>
                            <span className="truncate">{t.label}</span>
                            <span className="ml-auto flex shrink-0 items-center gap-1.5">
                              {tool === t.tool && !t.soon && <Check className="h-3.5 w-3.5" />}
                              {t.keys && <span className="font-mono text-[11px] text-fg-subtle">{t.keys}</span>}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* FIBONACCI, on its own control.
                It was a section inside the line menu, which buried eleven
                tools two levels down under an icon that draws lines — and a
                fib is not a line type. Same split-button shape as the one
                above: the icon arms the fib you last used, the chevron opens
                the list. Its own `lastFib`, so arming a fib does not change
                what the line button arms. */}
            <div
              ref={fibBtnRef}
              className={`group relative flex h-9 items-center rounded-sm transition-colors ${
                isFibTool(tool) ? 'bg-brand/15 ring-1 ring-brand/40' : 'hover:bg-brand/10'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setTool(lastFib);
                  trendStart.current = null;
                  forkPts.current = [];
                  setDrawPending(false);
                  clearPreview();
                }}
                title={`${FIB_TOOLS.find((t) => t.tool === lastFib)?.label ?? 'Fibonacci'}`
                  + (isFibTool(tool) ? ' — armed' : ' — click to arm')}
                className={`flex h-9 w-8 items-center justify-center rounded-l-sm transition-colors ${
                  isFibTool(tool) ? 'text-brand' : 'text-fg-muted group-hover:text-brand'
                }`}
              >
                {(() => {
                  const Icon = TOOL_ICON[lastFib] ?? FIB_TOOL_ICONS.fibr;
                  return <Icon className="h-4 w-4" />;
                })()}
              </button>
              <button
                type="button"
                onClick={() => setFibOpen((v) => !v)}
                title="Choose a Fibonacci tool"
                aria-label="Choose a Fibonacci tool"
                className={`flex h-9 w-3.5 items-center justify-center rounded-r-sm transition-colors ${
                  fibOpen ? 'text-brand' : 'text-fg-subtle group-hover:text-brand'
                }`}
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              {fibOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Dismiss Fibonacci tools"
                    onClick={() => setFibOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    style={fibMaxH ? { maxHeight: fibMaxH } : undefined}
                    className="absolute left-[calc(100%+6px)] top-0 z-[60] w-72 overflow-y-auto overscroll-contain rounded-sm border border-border bg-surface-raised py-2 shadow-xl"
                  >
                    {([
                      ['Fibonacci', FIB_TOOLS],
                      ['Gann', GANN_TOOLS],
                      ['Geometry', GEOMETRY_TOOLS],
                    ] as const).map(([group, items]) => (
                      <div key={group}>
                        <p className="px-3 pb-1 pt-3 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle first:pt-1">
                          {group}
                        </p>
                        {items.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        disabled={t.soon}
                        title={t.soon ? 'Not built yet' : undefined}
                        onClick={() => {
                          if (!t.tool) return;
                          setTool(t.tool);
                          setLastFib(t.tool);
                          setFibOpen(false);
                          trendStart.current = null;
                          forkPts.current = [];
                                  setDrawPending(false);
                          clearPreview();
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[15px] transition-colors ${
                          tool === t.tool && !t.soon
                            ? 'bg-brand/15 font-semibold text-brand'
                            : t.soon
                              ? 'cursor-not-allowed text-fg-subtle/50'
                              : 'text-fg hover:bg-brand/10 hover:text-brand'
                        }`}
                      >
                        <span className="w-4 shrink-0 text-center font-mono text-fg-subtle">{t.glyph}</span>
                        <span className="truncate">{t.label}</span>
                        {tool === t.tool && !t.soon && (
                          <Check className="ml-auto h-3.5 w-3.5 shrink-0" />
                        )}
                      </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* The standalone Horizontal Line and Labelled Level buttons are
                gone: they are in the split button's menu, and having both meant
                arming one tool lit TWO buttons green — which reads as
                everything being selected at once. One tool, one lit control. */}
            {/* MAGNET: off -> weak -> strong -> off.
                One button rather than three, because they are states of one
                setting; the icon says which by how loud it is. */}
            <RailBtn
              active={magnet !== 'off'}
              onClick={() => setMagnet((m) => (m === 'off' ? 'weak' : m === 'weak' ? 'strong' : 'off'))}
              title={
                magnet === 'off' ? 'Magnet off — click to snap near candle levels'
                  : magnet === 'weak' ? 'Magnet weak — snaps when close to a candle O/H/L/C'
                    : 'Magnet strong — always snaps to the nearest candle level'
              }
            >
              <Magnet className={`h-4 w-4 ${magnet === 'strong' ? 'fill-current' : ''}`} />
            </RailBtn>
            <RailBtn active={gridOn} onClick={() => setGridOn((v) => !v)} title={gridOn ? 'Hide grid' : 'Show grid'}>
              <Grid3x3 className="h-4 w-4" />
            </RailBtn>
            <RailBtn onClick={toggleFullscreen} title={fs ? 'Exit full screen' : 'Full screen'}>
              <Maximize2 className="h-4 w-4" />
            </RailBtn>
            {/* Same destination as the top bar's Indicators — one library, two
                ways in, rather than two different indicator UIs. */}
            <RailBtn active={inds.size > 0} onClick={() => setLibraryOpen(true)} title="Indicators">
              <BarChart3 className="h-4 w-4" />
            </RailBtn>

            <span className="my-1.5 h-px w-7 bg-border" />

            {/* Snap back to the live edge after scrolling into history. */}
            <RailBtn
              onClick={() => chartRef.current?.timeScale().scrollToRealTime()}
              title="Jump to the latest candle"
            >
              <Zap className="h-4 w-4" />
            </RailBtn>

            {/* These act on YOUR drawings: freeze them, hide them, delete them.
                Hiding keeps the list; only the trash empties it. */}
            <RailBtn
              active={drawingsLocked}
              onClick={() => setDrawingsLocked((v) => !v)}
              title={drawingsLocked ? 'Unlock drawings' : 'Lock drawings in place'}
            >
              {drawingsLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </RailBtn>
            <RailBtn
              active={drawingsHidden}
              onClick={() => setDrawingsHidden((v) => !v)}
              title={drawingsHidden ? 'Show drawings' : 'Hide drawings'}
            >
              {drawingsHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </RailBtn>

            <span className="my-1.5 h-px w-7 bg-border" />

            <RailBtn onClick={clearDrawings} title="Delete all drawings">
              <Trash2 className="h-4 w-4" />
            </RailBtn>

            {/* Pushed to the bottom, as in the design: the rail folds away when
                you want the candles and not the tools. */}
            <span className="mt-auto" />
            <RailBtn onClick={() => setRailHidden(true)} title="Hide the toolbar">
              <ChevronsLeft className="h-4 w-4" />
            </RailBtn>
          </div>
        </div>

        {/* STYLE TOOLBAR — appears when a drawing is selected, acts on that
            one. Floated over the candles rather than docked, so it is next to
            the thing it edits. */}
        {selected && (
          <div className="absolute left-1/2 top-3 z-40 -translate-x-1/2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-elevated/95 px-1.5 py-1 shadow-xl backdrop-blur-sm">
              <GripVertical className="h-4 w-4 shrink-0 text-fg-subtle" />

              {/* Colour */}
              <DrawMenu label={<span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: selected.color ?? DRAW_COLOR }} />}>
                {(close) => (
                  <div className="flex items-center gap-1.5 p-2">
                    {DRAW_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={c}
                        onClick={() => { patchDrawing(selected.id, { color: c }); close(); }}
                        className={`h-5 w-5 rounded-sm ring-offset-1 ring-offset-bg-elevated transition-all ${
                          (selected.color ?? DRAW_COLOR) === c ? 'ring-2 ring-fg' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </DrawMenu>

              {/* Width */}
              <DrawMenu label={<span className="font-mono text-[11px]">{selected.width ?? (selected.kind === 'fib' ? 1 : 2)}px</span>}>
                {(close) => DRAW_WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => { patchDrawing(selected.id, { width: w }); close(); }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      (selected.width ?? (selected.kind === 'fib' ? 1 : 2)) === w ? 'bg-brand/15 text-brand' : 'text-fg hover:bg-brand/10'
                    }`}
                  >
                    <span className="w-6 shrink-0 rounded bg-current" style={{ height: w }} />
                    {w}px
                  </button>
                ))}
              </DrawMenu>

              {/* Dash pattern */}
              <DrawMenu label={<Minus className="h-3.5 w-3.5" />}>
                {(close) => DRAW_STYLES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => { patchDrawing(selected.id, { style: s.key }); close(); }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      (selected.style ?? (selected.kind === 'hline' ? 'dashed' : 'solid')) === s.key
                        ? 'bg-brand/15 text-brand' : 'text-fg hover:bg-brand/10'
                    }`}
                  >
                    <svg width="24" height="2" className="shrink-0">
                      <line x1="0" y1="1" x2="24" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray={s.dash} />
                    </svg>
                    {s.label}
                  </button>
                ))}
              </DrawMenu>

              <span className="mx-0.5 h-5 w-px bg-border" />

              {/* Label. Only a horizontal line carries one — it is drawn on the
                  price axis, which a diagonal has no place on. */}
              {/* Any drawing can be labelled now. A level's label rides the
                  price axis; a diagonal's is drawn at its midpoint by the
                  overlay below, which is why this was limited before. */}
              <button
                type="button"
                title="Label this drawing"
                onClick={() => {
                  const next = window.prompt('Label', selected.label ?? '');
                  if (next == null) return;
                  patchDrawing(selected.id, { label: next.trim() || undefined });
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${
                  selected.label ? 'bg-brand/15 text-brand' : 'text-fg hover:bg-brand/10 hover:text-brand'
                }`}
              >
                <Type className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDrawingsLocked((v) => !v)}
                title={drawingsLocked ? 'Unlock drawings' : 'Lock drawings'}
                className={`flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${
                  drawingsLocked ? 'bg-brand/15 text-brand' : 'text-fg hover:bg-brand/10 hover:text-brand'
                }`}
              >
                {drawingsLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => deleteDrawing(selected.id)}
                title="Delete this drawing"
                className="flex h-7 w-7 items-center justify-center rounded-sm text-danger transition-colors hover:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <DrawMenu label={<MoreVertical className="h-3.5 w-3.5" />} align="right">
                {(close) => (
                  <>
                    <button
                      type="button"
                      onClick={() => { duplicateDrawing(selected.id); close(); }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-fg transition-colors hover:bg-brand/10"
                    >
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        patchDrawing(selected.id, { color: undefined, width: undefined, style: undefined });
                        close();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-fg transition-colors hover:bg-brand/10"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset settings
                    </button>
                    {selected.kind === 'fib' && FIB_SPECS[selected.variant]?.toggles.map((tg) => {
                      const isOn = selected[tg.key] ?? tg.default;
                      const TgIcon = { extendRight: ArrowRightToLine, extendLeft: ArrowLeftToLine, fill: Layers, grid: Grid3x3, fullCircle: Circle, ccw: RotateCcw }[tg.key];
                      return (
                        <button
                          key={tg.key}
                          type="button"
                          onClick={() => { patchDrawing(selected.id, { [tg.key]: !isOn } as Pick<FibDrawing, FibToggle['key']>); close(); }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-fg transition-colors hover:bg-brand/10"
                        >
                          <TgIcon className="h-3.5 w-3.5" />
                          {isOn ? tg.off : tg.on}
                        </button>
                      );
                    })}
                    {/* Bring to front / send to back are in the design and not
                        here: this library draws each drawing as its own series
                        and gives no z-order control over them. Listing them as
                        dead menu items would be worse than leaving them out. */}
                  </>
                )}
              </DrawMenu>
            </div>
          </div>
        )}

        {/* OHLC of the hovered bar, top-left over the candles, as the design
            has it. The change is against that bar's own open — what this
            candle did — not against yesterday's close. */}
        {(() => {
          const bar = hoverBar ?? lastBar;
          if (!bar) return null;
          const chg = bar.close - bar.open;
          const pct = bar.open ? (chg / bar.open) * 100 : 0;
          const cls = chg > 0 ? 'text-brand' : chg < 0 ? 'text-danger' : 'text-fg-muted';
          return (
            <div className="pointer-events-none absolute left-14 top-14 z-30 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px]">
              {([['O', bar.open], ['H', bar.high], ['L', bar.low], ['C', bar.close]] as const).map(
                ([k, v]) => (
                  <span key={k} className="whitespace-nowrap">
                    <span className="text-fg-subtle">{k} </span>
                    <span className={cls}>{fmt(v, digits)}</span>
                  </span>
                ),
              )}
              <span className={`whitespace-nowrap ${cls}`}>
                {chg >= 0 ? '+' : ''}{fmt(chg, digits)} ({chg >= 0 ? '+' : ''}{pct.toFixed(2)}%)
              </span>
            </div>
          );
        })()}

        {/* ARMED-TOOL BANNER.
            A two-click tool takes one click and draws nothing — correct, and
            indistinguishable from broken when nothing on screen says a tool is
            even armed. The old desk toolbar had this hint; the new chrome
            never got it, so every drawing tool looked dead. */}
        {tool !== 'cursor' && (
          <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2">
            <span className="flex items-center gap-2 rounded-full border border-brand/40 bg-bg-elevated/95 px-3 py-1.5 text-[11px] shadow-lg backdrop-blur-sm">
              <PenLine className="h-3.5 w-3.5 text-brand" />
              <span className="font-semibold text-brand">{armed?.label ?? tool}</span>
              <span className="text-fg-muted">
                {isFibTool(tool)
                  // Each fib tool words its own prompt (see fibModel.ts).
                  ? fibPrompt(FIB_TOOL_VARIANT[tool], drawPending ? fibStep : 0)
                  : (() => {
                    /* COUNTED DOWN, not named. "Click the third point" has to
                     * be extended by hand for every tool that wants a fourth,
                     * and says nothing about how much is left. How many more
                     * clicks it needs answers both, for any count. */
                    const need = clicksNeeded(tool, ALL_DRAW_TOOLS);
                    const left = Math.max(0, need - forkPts.current.length - (trendStart.current ? 1 : 0));
                    if (need <= 1) return 'click a price on the chart';
                    return `click ${left} more point${left === 1 ? '' : 's'}`;
                  })()}
              </span>
              <span className="text-fg-subtle">· Esc to cancel</span>
            </span>
          </div>
        )}

        {/* Status strip. "Market open" is the quote feed moving — the only
            evidence this page actually has that the market is trading. */}
        <div className="flex h-8 shrink-0 items-center gap-3 border-t border-border px-3 text-[11px]">
          <span className={`flex items-center gap-1.5 font-semibold ${stale ? 'text-danger' : 'text-brand'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stale ? 'bg-danger' : 'bg-brand'}`} />
            {stale ? 'Feed stale' : 'Market open'}
          </span>
          <span className="font-mono text-fg-subtle">
            {quote?.updated_at ? <>Last update <TimeAgo iso={quote.updated_at} /></> : 'No quote yet'}
          </span>
          <span className="ml-auto font-mono text-fg-subtle">
            {quote?.updated_at ? `${new Date(quote.updated_at).toISOString().slice(11, 19)} UTC` : '—'}
          </span>
          <span className="rounded-sm bg-surface-hover px-1.5 py-0.5 font-mono font-bold text-fg-muted">
            {tf}
          </span>
        </div>

        {libraryOpen && (
          <IndicatorLibrary
            active={inds}
            favs={indFavs}
            onToggle={toggleInd}
            onFav={toggleIndFav}
            onClose={() => setLibraryOpen(false)}
          />
        )}

        {searchOpen && (
          <SymbolSearch
            markets={markets}
            current={symbol}
            favs={favs}
            onPick={(s) => { setSymbol(s); setSearchOpen(false); }}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Controls + ticker */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm font-semibold text-fg outline-none focus:border-brand">
          {markets.map((m) => <option key={m.symbol} value={m.symbol}>{label(m.symbol)}{openBySymbol.has(m.symbol) ? '  ●' : ''}</option>)}
        </select>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {TIMEFRAMES.map((f) => (
            <button key={f.value} type="button" onClick={() => setTf(f.value)}
              className={`px-2.5 py-1.5 text-xs font-bold ${tf === f.value ? 'bg-brand text-brand-fg' : 'text-fg-muted hover:bg-surface-hover'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm">
          {quote?.pnl != null && (
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono tabular text-sm font-bold ${Number(quote.pnl) >= 0 ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
              P/L {Number(quote.pnl) >= 0 ? '+' : ''}{Number(quote.pnl).toFixed(2)}
            </span>
          )}
          <span className="font-mono tabular">
            <span className="text-fg-subtle text-xs">BID </span><span className="font-bold text-fg">{fmt(quote?.bid, digits)}</span>
            <span className="text-fg-subtle text-xs ml-3">ASK </span><span className="font-bold text-fg">{fmt(quote?.ask, digits)}</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${stale ? 'text-danger' : 'text-success'}`}>
            <span className={`h-2 w-2 rounded-full ${stale ? 'bg-danger' : 'bg-success'}`} />{stale ? 'feed stale' : 'live'}
          </span>
        </div>
      </div>

      {/* Jump straight to a market that has an ongoing trade, then watch the
          candle move live with its entry/SL/TP overlaid. */}
      {openBySymbol.size > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-fg-subtle">Ongoing trades:</span>
          {[...openBySymbol.entries()].map(([sym, side]) => (
            <button key={sym} type="button" onClick={() => setSymbol(sym)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold transition-colors ${symbol === sym ? 'border-brand text-brand' : 'border-border text-fg-muted hover:text-fg hover:bg-surface-hover'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${side === 'sell' ? 'bg-danger' : 'bg-success'}`} />
              {label(sym)}
            </button>
          ))}
        </div>
      )}

      <div
        ref={cardRef}
        className={`relative flex flex-col rounded-lg border border-border bg-bg-elevated overflow-hidden ${fs ? 'h-screen rounded-none' : 'h-[560px] md:h-[680px]'}`}
      >
        {/* Chart toolbar: drawing tools · indicators (left) + fullscreen (right).
            In fullscreen the outer controls are hidden, so the market picker,
            timeframe toggle and live quote are mirrored into the toolbar here. */}
        <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
          {fs && (
            <>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="rounded-md border border-border bg-bg px-2 py-1 text-xs font-semibold text-fg outline-none focus:border-brand">
                {markets.map((m) => <option key={m.symbol} value={m.symbol}>{label(m.symbol)}</option>)}
              </select>
              <div className="ml-1 inline-flex rounded-md border border-border overflow-hidden">
                {TIMEFRAMES.map((f) => (
                  <button key={f.value} type="button" onClick={() => setTf(f.value)}
                    className={`px-2 py-1 text-[11px] font-bold ${tf === f.value ? 'bg-brand text-brand-fg' : 'text-fg-muted hover:bg-surface-hover'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="mx-1 h-5 w-px bg-border" />
            </>
          )}
          <ToolBtn active={tool === 'cursor'} onClick={() => setTool('cursor')} title="Cursor"><MousePointer2 className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={tool === 'hline'} onClick={() => setTool('hline')} title="Horizontal line — click a price"><Minus className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={tool === 'trend'} onClick={() => setTool('trend')} title="Trend line — click two points"><PenLine className="h-4 w-4" /></ToolBtn>
          <ToolBtn active={false} onClick={clearDrawings} title="Clear drawings"><Eraser className="h-4 w-4" /></ToolBtn>

          <span className="mx-1 h-5 w-px bg-border" />
          {/* The 4 indicators. */}
          {IND_META.map((m) => (
            <button key={m.id} type="button" onClick={() => toggleInd(m.id)} title={m.title}
              className={`inline-flex h-8 items-center rounded-md px-2 text-[11px] font-bold transition-colors ${inds.has(m.id) ? 'text-brand-fg' : 'text-fg-muted hover:text-fg hover:bg-surface-hover'}`}
              style={inds.has(m.id) ? { backgroundColor: m.color } : undefined}>
              {m.label}
            </button>
          ))}

          {tool === 'trend' && trendStart.current && <span className="ml-1 text-[11px] text-fg-subtle">click the second point…</span>}
          {fs && quote && (
            <span className="ml-auto mr-2 flex items-center gap-3 font-mono text-xs">
              {quote.pnl != null && (
                <span className={`font-bold ${Number(quote.pnl) >= 0 ? 'text-success' : 'text-danger'}`}>P/L {Number(quote.pnl) >= 0 ? '+' : ''}{Number(quote.pnl).toFixed(2)}</span>
              )}
              <span><span className="text-fg-subtle">BID </span><span className="font-bold text-fg">{fmt(quote.bid, digits)}</span></span>
              <span className={`inline-flex items-center gap-1 font-semibold ${stale ? 'text-danger' : 'text-success'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stale ? 'bg-danger' : 'bg-success'}`} />{stale ? 'stale' : 'live'}
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={fs ? 'Exit full screen' : 'Full screen'}
            className={`${fs ? '' : 'ml-auto'} inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover`}
          >
            {fs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Canvas — fills remaining height; hidden behind the placeholder when empty. */}
        <div
          ref={wrapRef}
          className={`flex-1 w-full transition-opacity ${showEmpty ? 'opacity-0' : 'opacity-100'}`}
          style={tool !== 'cursor' ? { cursor: 'crosshair' } : undefined}
        />

        {loading && <div className="absolute inset-0 flex items-center justify-center text-sm text-fg-muted">Loading {alias}…</div>}

        {showEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
              <CandlestickChart className="h-6 w-6 text-fg-subtle" />
            </div>
            <p className="text-sm font-semibold text-fg">No candles for {alias}</p>
            <p className="max-w-md text-xs text-fg-muted leading-relaxed">
              No history in <code className="font-mono text-fg-subtle">bot_bars</code> for this market/timeframe.
              Candles are synced by <code className="font-mono text-fg-subtle">scripts.bar_sync</code> on the VM —
              if it isn’t running, history stops refreshing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** The two-letter square the mock puts before a symbol. */
function SymbolAvatar({ symbol, size = 'sm' }: { symbol: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-brand/15 font-bold text-brand ${
        size === 'md' ? 'h-8 w-8 text-[11px]' : 'h-6 w-6 text-[10px]'
      }`}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </span>
  );
}

/** Full-panel symbol picker: type to filter, or narrow by asset class. */
function SymbolSearch({ markets, current, favs, onPick, onClose }: {
  markets: { symbol: string; alias: string }[];
  current: string;
  favs: string[];
  onPick: (symbol: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [cls, setCls] = useState<AssetClass | 'all'>('all');

  const needle = q.trim().toLowerCase();
  const rows = markets
    .map((m) => ({ ...m, cls: classify(m.symbol), desc: describe(m.symbol, m.alias) }))
    .filter((m) => (cls === 'all' ? true : m.cls === cls))
    .filter((m) =>
      !needle
      || m.symbol.toLowerCase().includes(needle)
      || m.alias.toLowerCase().includes(needle)
      || m.desc.toLowerCase().includes(needle))
    // Starred markets first — that is the whole point of starring one.
    .sort((a, b) => Number(favs.includes(b.symbol)) - Number(favs.includes(a.symbol)));

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center overflow-hidden p-4 sm:p-8">
      {/* Backdrop: dismisses, and keeps the chart visible behind the card so
          the picker reads as a layer over it rather than a new screen. */}
      <button
        type="button"
        aria-label="Dismiss symbol search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div className="relative flex max-h-full w-full max-w-[460px] flex-col overflow-hidden rounded-sm border border-border bg-bg-elevated shadow-xl">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-fg">Symbol Search</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close symbol search"
          className="ml-auto rounded-sm p-1 text-fg-subtle transition-colors hover:bg-brand/10 hover:text-brand"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-3">
        {/* Neutral until it is focused — a permanent green outline reads as a
            validation state on a field that has nothing to validate. */}
        <div className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 focus-within:border-brand">
          <Search className="h-4 w-4 shrink-0 text-fg-subtle" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && rows[0]) onPick(rows[0].symbol);
            }}
            placeholder="Search symbols"
            // focus-visible:outline-none — the global focus ring would draw a
            // second green outline inside the box that already shows focus.
            // Inline, not a class: globals.css paints a 3px brand ring on every
            // :focus-visible input, and the box around this one already shows
            // focus — two green rings, one inside the other.
            style={{ outline: 'none', boxShadow: 'none' }}
            className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle"
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          {CLASS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setCls(t.key)}
              className={`rounded-sm px-2.5 py-1 text-[13px] transition-colors ${
                cls === t.key
                  ? 'bg-brand/15 font-semibold text-brand'
                  : 'text-fg-muted hover:bg-brand/10 hover:text-brand'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-fg-subtle">
            Nothing matches “{q}”. Only markets the bot follows are listed.
          </p>
        ) : (
          <ul>
            {rows.map((m) => (
              <li key={m.symbol}>
                <button
                  type="button"
                  onClick={() => onPick(m.symbol)}
                  className={`flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left transition-colors hover:bg-brand/10 ${
                    m.symbol === current ? 'bg-brand/10' : ''
                  }`}
                >
                  <SymbolAvatar symbol={m.alias} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 truncate text-sm font-bold text-fg">
                      {m.alias}
                      {favs.includes(m.symbol) && <Bookmark className="h-3 w-3 shrink-0 fill-current text-brand" />}
                    </span>
                    {m.desc && <span className="block truncate text-[11px] text-fg-subtle">{m.desc}</span>}
                  </span>
                  {CLASS_TAG[m.cls] && (
                    <span className="ml-auto shrink-0 rounded-sm bg-surface-hover px-1.5 py-0.5 text-[10px] font-bold text-fg-muted">
                      {CLASS_TAG[m.cls]}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
}

/**
 * The indicator library.
 *
 * The design's shape — search, categories down the side, star-to-favourite —
 * over what this chart can actually plot: four, computed in the browser from
 * the loaded candles. A category with nothing in it says so rather than
 * listing names that would draw nothing. Orderflow needs tick data the bot
 * does not store; the Highscore library is where the bot's own features
 * (ADX, RSI, EMA50/200 — it computes them, it just never saves them per bar)
 * would land once they are persisted.
 */
const IND_CATEGORIES: { key: string; label: string; note?: string }[] = [
  { key: 'favorites', label: 'Favorites' },
  { key: 'basic', label: 'Basic' },
  { key: 'orderflow', label: 'Orderflow', note: 'Needs tick-level data. bot_bars stores OHLC candles only.' },
  { key: 'highscore', label: 'Highscore', note: 'The bot computes ADX, RSI and its EMAs to decide trades, but stores no per-bar history of them yet.' },
];

function IndicatorLibrary({ active, favs, onToggle, onFav, onClose }: {
  active: Set<IndId>;
  favs: string[];
  onToggle: (id: IndId) => void;
  onFav: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('basic');

  const needle = q.trim().toLowerCase();
  const rows = IND_META
    .filter((m) => (cat === 'favorites' ? favs.includes(m.id) : cat === 'basic'))
    .filter((m) => !needle || m.label.toLowerCase().includes(needle) || m.title.toLowerCase().includes(needle));
  const note = IND_CATEGORIES.find((c) => c.key === cat)?.note;

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center overflow-hidden p-4 sm:p-8">
      <button
        type="button"
        aria-label="Dismiss indicators"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div className="relative flex max-h-full w-full max-w-[620px] flex-col overflow-hidden rounded-sm border border-border bg-bg-elevated shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <h3 className="text-sm font-bold text-fg">Indicators</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close indicators"
            className="ml-auto rounded-sm p-1 text-fg-subtle transition-colors hover:bg-brand/10 hover:text-brand"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 focus-within:border-brand">
            <Search className="h-4 w-4 shrink-0 text-fg-subtle" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
              placeholder="Search indicators"
              // Inline, not a class: globals.css paints a 3px brand ring on every
            // :focus-visible input, and the box around this one already shows
            // focus — two green rings, one inside the other.
            style={{ outline: 'none', boxShadow: 'none' }}
            className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-3 px-4 py-3">
          <nav className="w-36 shrink-0">
            {IND_CATEGORIES.map((c, i) => (
              <div key={c.key}>
                {i === 1 && (
                  <p className="px-2 pb-1 pt-3 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
                    Built-ins
                  </p>
                )}
                {i === 3 && (
                  <p className="px-2 pb-1 pt-3 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
                    Library
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setCat(c.key)}
                  className={`block w-full rounded-sm px-2 py-1.5 text-left text-sm transition-colors ${
                    cat === c.key ? 'bg-brand/15 font-semibold text-brand' : 'text-fg-muted hover:bg-brand/10 hover:text-brand'
                  }`}
                >
                  {c.label}
                </button>
              </div>
            ))}
          </nav>

          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto border-l border-border pl-3">
            {rows.length === 0 ? (
              <p className="px-2 py-8 text-center text-[13px] leading-relaxed text-fg-subtle">
                {note ?? (cat === 'favorites' ? 'Star an indicator to keep it here.' : 'Nothing matches.')}
              </p>
            ) : (
              <ul>
                {rows.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 rounded-sm px-2 py-2 hover:bg-brand/10">
                    <button type="button" onClick={() => onToggle(m.id)} className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: active.has(m.id) ? m.color : 'transparent', boxShadow: `inset 0 0 0 1px ${m.color}` }}
                        />
                        <span className={`truncate text-sm ${active.has(m.id) ? 'font-bold text-fg' : 'text-fg'}`}>
                          {m.title}
                        </span>
                      </span>
                      <span className="mt-0.5 block pl-4 text-[11px] text-fg-subtle">
                        {active.has(m.id) ? 'On the chart' : 'Built-in'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onFav(m.id)}
                      aria-label={favs.includes(m.id) ? 'Unstar' : 'Star'}
                      className="shrink-0 rounded-sm p-1 text-fg-subtle transition-colors hover:text-brand"
                    >
                      <Star className={`h-4 w-4 ${favs.includes(m.id) ? 'fill-current text-brand' : ''}`} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A small dropdown for the style toolbar: a button, and a panel under it. */
function DrawMenu({ label, align = 'left', children }: {
  label: React.ReactNode;
  align?: 'left' | 'right';
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-7 items-center gap-1 rounded-sm px-1.5 transition-colors ${
          open ? 'bg-brand/15 text-brand' : 'text-fg hover:bg-brand/10 hover:text-brand'
        }`}
      >
        {label}
        <ChevronDown className="h-3 w-3 text-fg-subtle" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            className={`absolute top-[calc(100%+6px)] z-50 min-w-[9rem] overflow-hidden rounded-md border border-border bg-surface-raised py-1 shadow-xl ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

/** A labelled dropdown in the chart's top bar. */
function TopMenu({ label, icon, children }: {
  label: string;
  icon?: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm transition-colors ${
          open ? 'bg-brand/10 text-brand' : 'text-fg hover:bg-brand/10 hover:text-brand'
        }`}
      >
        {icon}
        {label}
        <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Dismiss menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute left-0 top-[calc(100%+4px)] z-40 w-40 overflow-hidden rounded-sm border border-border bg-surface-raised py-1 shadow-xl">
            {children(() => setOpen(false))}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ active, disabled, title, onClick, children }: {
  active?: boolean;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
        active ? 'bg-brand/15 font-semibold text-brand' : 'text-fg'
      } ${disabled ? 'cursor-not-allowed opacity-45' : 'hover:bg-brand/10 hover:text-brand'}`}
    >
      {children}
    </button>
  );
}

/** Vertical tool rail. Every button here does something — the mock's extra
 *  glyphs are left out rather than drawn dead. */
function RailBtn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-9 w-9 items-center justify-center rounded-sm transition-colors ${
        active
          ? 'bg-brand/15 text-brand ring-1 ring-brand/40'
          : 'text-fg-muted hover:bg-brand/10 hover:text-brand'
      }`}
    >
      {children}
    </button>
  );
}

function ToolBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${active ? 'bg-brand text-brand-fg' : 'text-fg-muted hover:text-fg hover:bg-surface-hover'}`}
    >
      {children}
    </button>
  );
}
