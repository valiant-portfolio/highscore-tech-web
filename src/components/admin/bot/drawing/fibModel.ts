// The Fibonacci family: what a drawing stores, and one spec per tool (menu
// label, clicks, prompts, default levels, toggles). Pure - no chart, no React -
// so node can run the tests. A new tool is a spec here, a builder in
// fibShapes.ts, an icon in fibTools.tsx and a test; the chart needs no edit.

export type FibVariant =
  | 'retracement' | 'extension' | 'extension2' | 'fan' | 'timezones' | 'channel' | 'srfan'
  | 'trendtime' | 'circles' | 'arcs' | 'wedge' | 'spiral';
export type FibToolId =
  | 'fibr' | 'fibe' | 'fibx' | 'fibf' | 'fibtz' | 'fibc' | 'fibsr'
  | 'fibtt' | 'fibo' | 'fiba' | 'fibw' | 'fibs';

export interface FibPoint { t: number; p: number }

export interface FibDrawing {
  id: string;
  kind: 'fib';
  variant: FibVariant;
  /** In click order: two or three anchors depending on the variant. */
  points: FibPoint[];
  /** Absent means the defaults for the variant. */
  levels?: number[];
  extendRight?: boolean;
  extendLeft?: boolean;
  fill?: boolean;
  /** Ratios to leave out. Model only, no UI in v1. */
  hidden?: number[];
  /** Speed-resistance fan: the time ratios. */
  timeLevels?: number[];
  grid?: boolean;
  fullCircle?: boolean;
  ccw?: boolean;
  // Same names as the trend line so the style toolbar compiles unchanged.
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  label?: string;
}

export interface FibToggle {
  key: 'extendRight' | 'extendLeft' | 'fill' | 'grid' | 'fullCircle' | 'ccw';
  /** Menu text while the option is off / on. */
  on: string;
  off: string;
  default: boolean;
}

export interface FibSpec {
  variant: FibVariant;
  toolId: FibToolId;
  label: string;
  clicks: 2 | 3;
  glyph: string;
  levels: number[];
  timeLevels?: number[];
  prompts: string[];
  fillDefault: boolean;
  toggles: FibToggle[];
  /** False greys the tool out in the menu until its builder lands. */
  ready: boolean;
}

export const DEFAULT_RETRACEMENT_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
export const DEFAULT_EXTENSION_LEVELS = [0, 0.618, 1, 1.272, 1.618, 2, 2.618];
export const DEFAULT_EXTENSION2_LEVELS = [0, 1, 1.272, 1.618, 2, 2.618, 3.618, 4.236];
export const FIB_LEVEL_COLORS: Record<string, string> = {
  '0': '#787B86', '0.236': '#F23645', '0.25': '#FF9800', '0.382': '#FF9800', '0.5': '#4CAF50',
  '0.618': '#089981', '0.75': '#00BCD4', '0.786': '#00BCD4', '1': '#787B86', '1.272': '#9C27B0',
  '1.382': '#9C27B0', '1.618': '#2962FF', '2': '#E91E63',
  '2.618': '#F23645', '3.618': '#E91E63', '4.236': '#F23645',
};
export const FIB_FALLBACK_COLOR = '#2962FF';
export const fibLevelColor = (r: number): string => FIB_LEVEL_COLORS[String(r)] ?? FIB_FALLBACK_COLOR;

const T_EXTEND_RIGHT: FibToggle = { key: 'extendRight', on: 'Extend lines right', off: 'Stop extending right', default: false };
const T_EXTEND_LEFT: FibToggle = { key: 'extendLeft', on: 'Extend lines left', off: 'Stop extending left', default: false };
const T_FILL: FibToggle = { key: 'fill', on: 'Fill between levels', off: 'Hide fill', default: true };

const FIB_SPEC_LIST_RAW: FibSpec[] = [
  {
    variant: 'retracement', toolId: 'fibr', label: 'Fib Retracement', clicks: 2, glyph: '⌗',
    levels: DEFAULT_RETRACEMENT_LEVELS,
    prompts: ['click the first point', 'click the second point'],
    fillDefault: true, toggles: [T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    variant: 'extension2', toolId: 'fibx', label: 'Fib Extension', clicks: 2, glyph: '⇑',
    levels: DEFAULT_EXTENSION2_LEVELS,
    prompts: ['click the start of the move', 'click the end of the move'],
    fillDefault: true, toggles: [T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    variant: 'extension', toolId: 'fibe', label: 'Trend-Based Fib Extension', clicks: 3, glyph: '⇶',
    levels: DEFAULT_EXTENSION_LEVELS,
    prompts: ['click the first point', 'click the second point', 'click the third point (projection anchor)'],
    fillDefault: true, toggles: [T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    variant: 'fan', toolId: 'fibf', label: 'Fib Fan', clicks: 2, glyph: '◿',
    levels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1],
    prompts: ['click the fan origin', 'click the end of the trend'],
    fillDefault: true, toggles: [T_FILL], ready: true,
  },
  {
    variant: 'timezones', toolId: 'fibtz', label: 'Fib Time Zones', clicks: 2, glyph: '⫼',
    levels: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
    prompts: ['click the start', 'click one interval later'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    variant: 'channel', toolId: 'fibc', label: 'Fib Channel', clicks: 3, glyph: '⫽',
    levels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1, 1.618, 2.618, 3.618, 4.236],
    prompts: ['click the first point of the base line', 'click the second point', 'click where the channel edge should sit'],
    fillDefault: true, toggles: [T_EXTEND_LEFT, T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    variant: 'srfan', toolId: 'fibsr', label: 'Fib Speed Resistance Fan', clicks: 2, glyph: '◰',
    levels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1],
    timeLevels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1],
    prompts: ['click the first corner', 'click the opposite corner'],
    fillDefault: false,
    toggles: [{ key: 'grid', on: 'Show grid', off: 'Hide grid', default: true }], ready: true,
  },
  {
    variant: 'trendtime', toolId: 'fibtt', label: 'Trend-Based Fib Time', clicks: 3, glyph: '⫿',
    levels: [0, 0.382, 0.5, 0.618, 1, 1.382, 1.618, 2, 2.618, 3, 3.618, 4.236],
    prompts: ['click the first point', 'click the second point', 'click the third point (projection anchor)'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    variant: 'circles', toolId: 'fibo', label: 'Fib Circles', clicks: 2, glyph: '◎',
    levels: [0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236],
    prompts: ['click the first point', 'click the second point'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    variant: 'arcs', toolId: 'fiba', label: 'Fib Speed Resistance Arcs', clicks: 2, glyph: '◠',
    levels: [0.236, 0.382, 0.5, 0.618, 0.786, 1],
    prompts: ['click the start of the trend', 'click the end of the trend (arc centre)'],
    fillDefault: false,
    toggles: [{ key: 'fullCircle', on: 'Full circles', off: 'Half circles', default: false }], ready: true,
  },
  {
    variant: 'wedge', toolId: 'fibw', label: 'Fib Wedge', clicks: 3, glyph: '◺',
    levels: [0.236, 0.382, 0.5, 0.618, 0.786, 1],
    prompts: ['click the apex', 'click the first edge', 'click the second edge'],
    fillDefault: true, toggles: [T_FILL], ready: true,
  },
  {
    variant: 'spiral', toolId: 'fibs', label: 'Fib Spiral', clicks: 2, glyph: '๑',
    levels: [],
    prompts: ['click the centre', 'click where the spiral starts'],
    fillDefault: false,
    toggles: [{ key: 'ccw', on: 'Counter-clockwise', off: 'Clockwise', default: false }], ready: true,
  },
];

/** Menu order. */
export const FIB_SPEC_LIST: FibSpec[] = FIB_SPEC_LIST_RAW;
export const FIB_SPECS = Object.fromEntries(FIB_SPEC_LIST.map((s) => [s.variant, s])) as Record<FibVariant, FibSpec>;
export const FIB_TOOL_VARIANT = Object.fromEntries(FIB_SPEC_LIST.map((s) => [s.toolId, s.variant])) as Record<FibToolId, FibVariant>;

export const fibClicksNeeded = (v: FibVariant): 2 | 3 => FIB_SPECS[v].clicks;
export const fibPrompt = (v: FibVariant, placed: number): string =>
  FIB_SPECS[v].prompts[Math.min(placed, FIB_SPECS[v].clicks - 1)];

/** r = 0 is B, r = 1 is A, in either direction. */
export function fibRetracementPrice(a: number, b: number, r: number): number {
  return b - r * (b - a);
}

/** Trend-based: level r sits at C + r * (B - A). */
export function fibExtensionPrice(a: number, b: number, c: number, r: number): number {
  return c + r * (b - a);
}

/** Two-point extension: 0 at A, 100% at B, beyond B in the move direction. */
export function fibExtension2Price(a: number, b: number, r: number): number {
  return a + r * (b - a);
}

/** The ratios a drawing shows: its own levels (or the spec's) minus hidden. */
export function fibRatios(d: FibDrawing): number[] {
  const base = d.levels ?? FIB_SPECS[d.variant]?.levels ?? [];
  const hidden = d.hidden ?? [];
  return base.filter((r) => !hidden.includes(r));
}

/** Speed-resistance fan: the time ratios (own or the spec's), minus nothing. */
export const fibTimeRatios = (d: FibDrawing): number[] => d.timeLevels ?? FIB_SPECS[d.variant]?.timeLevels ?? [];

function levelPrice(d: FibDrawing, r: number): number | null {
  const [a, b, c] = d.points;
  if (d.variant === 'extension') return a && b && c ? fibExtensionPrice(a.p, b.p, c.p, r) : null;
  if (d.variant === 'extension2') return a && b ? fibExtension2Price(a.p, b.p, r) : null;
  if (d.variant === 'retracement') return a && b ? fibRetracementPrice(a.p, b.p, r) : null;
  return null;
}

/** Horizontal price levels (retracement, extension, extension2). Other
 *  variants have none and return an empty list. */
export function fibLevels(d: FibDrawing): { ratio: number; price: number; color: string }[] {
  const out: { ratio: number; price: number; color: string }[] = [];
  for (const ratio of fibRatios(d)) {
    const price = levelPrice(d, ratio);
    if (price === null) continue;
    out.push({ ratio, price, color: d.color ?? fibLevelColor(ratio) });
  }
  return out;
}

export const formatFibPct = (r: number): string => Number((r * 100).toFixed(1)).toString();
export const formatFibLabel = (r: number, price: number, digits: number): string =>
  `${formatFibPct(r)}% ${price.toFixed(digits)}`;
