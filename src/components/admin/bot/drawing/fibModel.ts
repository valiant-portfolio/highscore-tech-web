// The Fibonacci family: what a drawing stores, and one spec per tool (menu
// label, clicks, prompts, default levels, toggles). Pure - no chart, no React -
// so node can run the tests. A new tool is a spec here, a builder in
// fibShapes.ts, an icon in fibTools.tsx and a test; the chart needs no edit.

export type FibVariant =
  | 'retracement' | 'extension' | 'extension2' | 'fan' | 'timezones' | 'channel' | 'srfan'
  | 'trendtime' | 'circles' | 'arcs' | 'wedge' | 'spiral'
  | 'gannfan' | 'gannbox' | 'gannsquare' | 'dedekind' | 'sonic' | 'supersonic' | 'goldensonic' | 'goldensupersonic'
  | 'xabcd' | 'abcd' | 'headshoulders' | 'elliottimpulse' | 'elliottcorrection'
  | 'gartley' | 'bat' | 'butterfly' | 'crab' | 'shark' | 'cypher';
export type FibToolId =
  | 'fibr' | 'fibe' | 'fibx' | 'fibf' | 'fibtz' | 'fibc' | 'fibsr'
  | 'fibtt' | 'fibo' | 'fiba' | 'fibw' | 'fibs'
  | 'gannf' | 'gannb' | 'ganns' | 'dedek' | 'sonic' | 'ssonic' | 'gsonic' | 'gssonic'
  | 'xabcd' | 'abcd' | 'hs' | 'ew5' | 'ewabc' | 'gartley' | 'bat' | 'bfly' | 'crab' | 'shark' | 'cypher';

export interface FibPoint { t: number; p: number }

export interface FibDrawing {
  id: string;
  kind: 'fib';
  variant: FibVariant;
  /** In click order: as many anchors as the variant's tool takes. */
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
  /** Mach family (model only, no UI): speed multiple, curvature cap, ratio labels. */
  mach?: number;
  maxCurvature?: number;
  showRatios?: boolean;
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
  family: 'fib' | 'gann' | 'geometry' | 'pattern';
  variant: FibVariant;
  toolId: FibToolId;
  label: string;
  clicks: number;
  /** Drawn while only some of its clicks are placed (the pattern tools). */
  partial?: true;
  glyph: string;
  levels: number[];
  timeLevels?: number[];
  prompts: string[];
  fillDefault: boolean;
  toggles: FibToggle[];
  /** Per-ratio colour and label overrides (keys are String(ratio)). */
  levelColors?: Record<string, string>;
  levelLabels?: Record<string, string>;
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
  '6.854': '#089981', '11.09': '#2962FF',
};
/** A ratio as Vela labels it: up to three decimals, no trailing zeros. */
export const formatRatio = (r: number): string => String(Math.round(r * 1000) / 1000);
export const FIB_FALLBACK_COLOR = '#2962FF';
export const fibLevelColor = (r: number): string => FIB_LEVEL_COLORS[String(r)] ?? FIB_FALLBACK_COLOR;

const T_EXTEND_RIGHT: FibToggle = { key: 'extendRight', on: 'Extend lines right', off: 'Stop extending right', default: false };
const T_EXTEND_LEFT: FibToggle = { key: 'extendLeft', on: 'Extend lines left', off: 'Stop extending left', default: false };
const T_FILL: FibToggle = { key: 'fill', on: 'Fill between levels', off: 'Hide fill', default: true };

const FIB_SPEC_LIST_RAW: FibSpec[] = [
  {
    family: 'fib', variant: 'retracement', toolId: 'fibr', label: 'Fib Retracement', clicks: 2, glyph: '⌗',
    levels: DEFAULT_RETRACEMENT_LEVELS,
    prompts: ['click the first point', 'click the second point'],
    fillDefault: true, toggles: [T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    family: 'fib', variant: 'extension2', toolId: 'fibx', label: 'Fib Extension', clicks: 2, glyph: '⇑',
    levels: DEFAULT_EXTENSION2_LEVELS,
    prompts: ['click the start of the move', 'click the end of the move'],
    fillDefault: true, toggles: [T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    family: 'fib', variant: 'extension', toolId: 'fibe', label: 'Trend-Based Fib Extension', clicks: 3, glyph: '⇶',
    levels: DEFAULT_EXTENSION_LEVELS,
    prompts: ['click the first point', 'click the second point', 'click the third point (projection anchor)'],
    fillDefault: true, toggles: [T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    family: 'fib', variant: 'fan', toolId: 'fibf', label: 'Fib Fan', clicks: 2, glyph: '◿',
    levels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1],
    prompts: ['click the fan origin', 'click the end of the trend'],
    fillDefault: true, toggles: [T_FILL], ready: true,
  },
  {
    family: 'fib', variant: 'timezones', toolId: 'fibtz', label: 'Fib Time Zones', clicks: 2, glyph: '⫼',
    levels: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
    prompts: ['click the start', 'click one interval later'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'fib', variant: 'channel', toolId: 'fibc', label: 'Fib Channel', clicks: 3, glyph: '⫽',
    levels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1, 1.618, 2.618, 3.618, 4.236],
    prompts: ['click the first point of the base line', 'click the second point', 'click where the channel edge should sit'],
    fillDefault: true, toggles: [T_EXTEND_LEFT, T_EXTEND_RIGHT, T_FILL], ready: true,
  },
  {
    family: 'fib', variant: 'srfan', toolId: 'fibsr', label: 'Fib Speed Resistance Fan', clicks: 2, glyph: '◰',
    levels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1],
    timeLevels: [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1],
    prompts: ['click the first corner', 'click the opposite corner'],
    fillDefault: false,
    toggles: [{ key: 'grid', on: 'Show grid', off: 'Hide grid', default: true }], ready: true,
  },
  {
    family: 'fib', variant: 'trendtime', toolId: 'fibtt', label: 'Trend-Based Fib Time', clicks: 3, glyph: '⫿',
    levels: [0, 0.382, 0.5, 0.618, 1, 1.382, 1.618, 2, 2.618, 3, 3.618, 4.236],
    prompts: ['click the first point', 'click the second point', 'click the third point (projection anchor)'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'fib', variant: 'circles', toolId: 'fibo', label: 'Fib Circles', clicks: 2, glyph: '◎',
    levels: [0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236],
    prompts: ['click the first point', 'click the second point'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'fib', variant: 'arcs', toolId: 'fiba', label: 'Fib Speed Resistance Arcs', clicks: 2, glyph: '◠',
    levels: [0.236, 0.382, 0.5, 0.618, 0.786, 1],
    prompts: ['click the start of the trend', 'click the end of the trend (arc centre)'],
    fillDefault: false,
    toggles: [{ key: 'fullCircle', on: 'Full circles', off: 'Half circles', default: false }], ready: true,
  },
  {
    family: 'fib', variant: 'wedge', toolId: 'fibw', label: 'Fib Wedge', clicks: 3, glyph: '◺',
    levels: [0.236, 0.382, 0.5, 0.618, 0.786, 1],
    prompts: ['click the apex', 'click the first edge', 'click the second edge'],
    fillDefault: true, toggles: [T_FILL], ready: true,
  },
  {
    family: 'fib', variant: 'spiral', toolId: 'fibs', label: 'Fib Spiral', clicks: 2, glyph: '๑',
    levels: [],
    prompts: ['click the centre', 'click where the spiral starts'],
    fillDefault: false,
    toggles: [{ key: 'ccw', on: 'Counter-clockwise', off: 'Clockwise', default: false }], ready: true,
  },
];

/** Menu order. */
export const FIB_SPEC_LIST: FibSpec[] = FIB_SPEC_LIST_RAW;

// Colours, labels and defaults below follow LuxAlgo Vela (Apache-2.0),
// https://github.com/LuxAlgo/Vela - GannFan.ts, GannBox.ts, GannSquare.ts and
// the palette files.
const GANN_GRID_LEVELS = [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1];
const GANN_GRID_COLORS: Record<string, string> = {
  '0': '#787b86', '0.25': '#f23645', '0.382': '#ff9800', '0.5': '#4caf50',
  '0.618': '#089981', '0.75': '#5b9cf6', '1': '#787b86',
};

export const GANN_SPEC_LIST: FibSpec[] = [
  {
    family: 'gann', variant: 'gannfan', toolId: 'gannf', label: 'Gann Fan', clicks: 2, glyph: '⟋',
    levels: [0.125, 0.25, 0.333, 0.5, 1, 2, 3, 4, 8],
    levelLabels: { '0.125': '1/8', '0.25': '1/4', '0.333': '1/3', '0.5': '1/2', '1': '1/1', '2': '2/1', '3': '3/1', '4': '4/1', '8': '8/1' },
    levelColors: { '0.125': '#f23645', '0.25': '#ff9800', '0.333': '#ffb74d', '0.5': '#4caf50', '1': '#b2b5be', '2': '#089981', '3': '#5b9cf6', '4': '#26a69a', '8': '#9c27b0' },
    prompts: ['click the fan origin', 'click the end of the 1/1 line'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'gann', variant: 'gannbox', toolId: 'gannb', label: 'Gann Box', clicks: 2, glyph: '⊞',
    levels: GANN_GRID_LEVELS, levelColors: GANN_GRID_COLORS,
    prompts: ['click the first corner', 'click the opposite corner'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'gann', variant: 'gannsquare', toolId: 'ganns', label: 'Gann Square', clicks: 2, glyph: '◫',
    levels: GANN_GRID_LEVELS, levelColors: GANN_GRID_COLORS,
    prompts: ['click the origin corner', 'click the opposite corner'],
    fillDefault: false, toggles: [], ready: true,
  },
];

const MACH_PROMPTS = ["click one end of the first circle's diameter", 'click the other end (expansion direction)'];
const SONIC_LEVELS = [1, 2, 3, 4, 5, 6];
const SONIC_COLORS: Record<string, string> = {
  '1': '#38c0fd', '2': '#5b9cf6', '3': '#089981', '4': '#4caf50', '5': '#ff9800', '6': '#f23645',
  '7': '#e91e63', '8': '#9c27b0', '9': '#787b86', '10': '#26a69a', '11': '#ab47bc', '12': '#ef5350',
};
const GOLDEN_SONIC_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 4.236, 6.854, 11.09];

/** Specs without a builder (ready false) show greyed in the menu. */
export const GEOMETRY_SPEC_LIST: FibSpec[] = [
  {
    family: 'geometry', variant: 'dedekind', toolId: 'dedek', label: 'Dedekind Tessellation', clicks: 2, glyph: '◠',
    levels: [],
    prompts: ['click the first corner', 'click the opposite corner (bottom edge = real axis)'],
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'geometry', variant: 'sonic', toolId: 'sonic', label: 'Sonic', clicks: 2, glyph: '◉',
    levels: SONIC_LEVELS, levelColors: SONIC_COLORS, prompts: MACH_PROMPTS,
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'geometry', variant: 'supersonic', toolId: 'ssonic', label: 'Supersonic', clicks: 2, glyph: '≻',
    levels: SONIC_LEVELS, levelColors: SONIC_COLORS, prompts: MACH_PROMPTS,
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'geometry', variant: 'goldensonic', toolId: 'gsonic', label: 'Golden Sonic', clicks: 2, glyph: '❂',
    levels: GOLDEN_SONIC_LEVELS, prompts: MACH_PROMPTS,
    fillDefault: false, toggles: [], ready: true,
  },
  {
    family: 'geometry', variant: 'goldensupersonic', toolId: 'gssonic', label: 'Golden Supersonic', clicks: 2, glyph: '⋗',
    levels: GOLDEN_SONIC_LEVELS, prompts: MACH_PROMPTS,
    fillDefault: false, toggles: [], ready: true,
  },
];


// Pattern tools. Ported from LuxAlgo Vela (Apache-2.0), https://github.com/LuxAlgo/Vela,
// src/core/drawings/toolbar.ts and types/PatternDrawing.ts. The Elliott and
// Harmonic specs stay ready:false until their builders land.
export const PATTERN_LINE_COLOR = '#38c0fd';
export const PATTERN_VALID = '#0ecb81';
export const PATTERN_INVALID = '#f6465d';
export const PATTERN_TEXT = 'var(--fg)';

const XABCD_PROMPTS = ['click X', 'click A', 'click B', 'click C', 'click D'];
const pat = (variant: FibVariant, toolId: FibToolId, label: string, glyph: string, prompts: string[], fillDefault: boolean, ready: boolean): FibSpec => ({
  family: 'pattern', variant, toolId, label, clicks: prompts.length, glyph, levels: [], prompts, fillDefault, toggles: [], partial: true, ready,
});

export const PATTERN_SPEC_LIST: FibSpec[] = [
  pat('xabcd', 'xabcd', 'XABCD Pattern', 'X', XABCD_PROMPTS, true, true),
  pat('abcd', 'abcd', 'ABCD Pattern', 'A', ['click A', 'click B', 'click C', 'click D'], false, true),
  pat('headshoulders', 'hs', 'Head & Shoulders', '\u2A53', [
    'click the start', 'click the left shoulder', 'click the first trough', 'click the head',
    'click the second trough', 'click the right shoulder', 'click the end',
  ], false, true),
];

export const ELLIOTT_SPEC_LIST: FibSpec[] = [
  pat('elliottimpulse', 'ew5', 'Elliott Impulse Wave (1-5)', '\u2464', ['click point 1', 'click point 2', 'click point 3', 'click point 4', 'click point 5'], false, true),
  pat('elliottcorrection', 'ewabc', 'Elliott Correction Wave (ABC)', '\u24D2', ['click A', 'click B', 'click C'], false, true),
];

export const HARMONIC_SPEC_LIST: FibSpec[] = [
  pat('gartley', 'gartley', 'Gartley', 'G', XABCD_PROMPTS, true, true),
  pat('bat', 'bat', 'Bat', 'B', XABCD_PROMPTS, true, true),
  pat('butterfly', 'bfly', 'Butterfly', 'F', XABCD_PROMPTS, true, true),
  pat('crab', 'crab', 'Crab', 'C', XABCD_PROMPTS, true, true),
  pat('shark', 'shark', 'Shark', 'S', XABCD_PROMPTS, true, true),
  pat('cypher', 'cypher', 'Cypher', 'Y', XABCD_PROMPTS, true, true),
];
export const ALL_SPEC_LIST: FibSpec[] = [...FIB_SPEC_LIST, ...GANN_SPEC_LIST, ...GEOMETRY_SPEC_LIST, ...PATTERN_SPEC_LIST, ...ELLIOTT_SPEC_LIST, ...HARMONIC_SPEC_LIST];
export const FIB_SPECS = Object.fromEntries(ALL_SPEC_LIST.map((s) => [s.variant, s])) as Record<FibVariant, FibSpec>;
export const FIB_TOOL_VARIANT = Object.fromEntries(ALL_SPEC_LIST.map((s) => [s.toolId, s.variant])) as Record<FibToolId, FibVariant>;

export const fibClicksNeeded = (v: FibVariant): number => FIB_SPECS[v].clicks;
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
