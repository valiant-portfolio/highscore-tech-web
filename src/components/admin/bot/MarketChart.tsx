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

import { useEffect, useRef, useState } from 'react';
import { createBotClient } from '@/lib/supabase/bot-client';
import {
  CandlestickChart, MousePointer2, Minus, PenLine, Eraser, Maximize2, Minimize2,
  Crosshair, Search, Trash2, X, ChevronDown, LineChart, Grid3x3, BarChart3,
  Lock, Unlock, Eye, EyeOff, Type, Zap, Undo2, Redo2, Camera,
  Bookmark, FileText, Layers, Code2, Check, Star,
} from 'lucide-react';
import { TimeAgo } from './BotBits';
import {
  createChart, CandlestickSeries, LineSeries, LineStyle, createSeriesMarkers,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type Time,
  type SeriesMarker, type IPriceLine, type ISeriesMarkersPluginApi,
  type MouseEventParams,
} from 'lightweight-charts';

type Tool = 'cursor' | 'hline' | 'trend' | 'text';

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
  | { id: string; kind: 'hline'; price: number; label?: string }
  | { id: string; kind: 'trend'; t1: number; v1: number; t2: number; v2: number };
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
  // The Chart panel's switch and the rail's button are two switches on one
  // light: null means "nobody has touched the rail, follow the prop", and
  // whichever was used last wins. Derived, so there is no prop→state effect.
  const [gridOverride, setGridOverride] = useState<boolean | null>(null);
  const gridOn = gridOverride ?? showGrid;
  const setGridOn = (next: boolean | ((v: boolean) => boolean)) =>
    setGridOverride((prev) => (typeof next === 'function' ? next(prev ?? showGrid) : next));
  const [drawingsHidden, setDrawingsHidden] = useState(false);
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
  const [quote, setQuote] = useState<Quote | null>(null);
  const [hasHistory, setHasHistory] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [tool, setTool] = useState<Tool>('cursor');
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
  const drawKeyRef = useRef<string>('');                 // current symbol+tf storage key (read inside once-bound handlers)
  const drag = useRef<{ id: string; kind: 'hline' | 'trend'; lastX: number; lastY: number } | null>(null);
  // Indicators.
  const barsRef = useRef<Candle[]>([]);
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
      hlineObjs.current.set(d.id, series.createPriceLine({ price: d.price, color: '#94a3b8', lineWidth: 1, lineStyle: LineStyle.Solid, axisLabelVisible: true, title: d.label ?? '' }));
    } else {
      const line = chart.addSeries(LineSeries, { color: '#eab308', lineWidth: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
      line.setData([{ time: d.t1 as UTCTimestamp, value: d.v1 }, { time: d.t2 as UTCTimestamp, value: d.v2 }].sort((a, b) => (a.time as number) - (b.time as number)));
      trendObjs.current.set(d.id, line);
    }
  };
  const removeDrawingObjects = () => {
    hlineObjs.current.forEach((l) => seriesRef.current?.removePriceLine(l));
    hlineObjs.current.clear();
    trendObjs.current.forEach((s) => chartRef.current?.removeSeries(s));
    trendObjs.current.clear();
  };
  const renderDrawings = () => { removeDrawingObjects(); drawings.current.forEach(addDrawingObject); };
  const loadDrawings = (sym: string, t: string): Drawing[] => {
    try { const raw = localStorage.getItem(DRAW_KEY(sym, t)); if (raw) return JSON.parse(raw) as Drawing[]; } catch { /* ignore */ }
    return [];
  };
  const clearDrawings = () => {
    removeDrawingObjects();
    drawings.current = [];
    trendStart.current = null;
    persistDrawings();
  };

  // Undo / redo, over the drawings only — the chart's pan and zoom are not
  // edits and nobody expects ⟲ to scroll them back. Redo is dropped the moment
  // a new line is drawn, which is what every editor does.
  const redoStack = useRef<Drawing[]>([]);
  const repaint = () => { if (!drawingsHidden) renderDrawings(); persistDrawings(); };
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
    const onClick = (param: MouseEventParams) => {
      const t = toolRef.current;
      // Cursor is a plain crosshair now; SL/TP overlays are always drawn.
      if (t === 'cursor') return;
      if (!param.point || param.time === undefined) return;
      const price = series.coordinateToPrice(param.point.y);
      if (price == null) return;
      if (t === 'hline') {
        const d: Drawing = { id: newDrawId(), kind: 'hline', price };
        drawings.current.push(d); addDrawingObject(d); persistDrawings();
      } else if (t === 'text') {
        // A labelled level. Cancelling the prompt places nothing — an empty
        // label would just be a plain line the text tool pretended to name.
        const label = window.prompt('Label for this level');
        if (label == null || !label.trim()) return;
        const d: Drawing = { id: newDrawId(), kind: 'hline', price, label: label.trim() };
        drawings.current.push(d); addDrawingObject(d); persistDrawings();
      } else if (t === 'trend') {
        if (!trendStart.current) { trendStart.current = { time: param.time as Time, value: price }; return; }
        const d: Drawing = {
          id: newDrawId(), kind: 'trend',
          t1: trendStart.current.time as number, v1: trendStart.current.value,
          t2: param.time as number, v2: price,
        };
        drawings.current.push(d); addDrawingObject(d); persistDrawings();
        trendStart.current = null;
      }
    };
    chart.subscribeClick(onClick);

    // ── Drag-to-move a drawing (cursor tool only) ─────────────────────────
    // Grab a line by clicking within a few px of it, then drag. While dragging we
    // freeze the chart's own pan/zoom so the move doesn't scroll the candles.
    const el = wrapRef.current;
    const HIT = 7; // px proximity to grab a line
    const localXY = (e: PointerEvent) => {
      const r = el!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hitTest = (x: number, y: number): { id: string; kind: 'hline' | 'trend' } | null => {
      const s = seriesRef.current, c = chartRef.current;
      if (!s || !c) return null;
      for (const d of drawings.current) {
        if (d.kind !== 'hline') continue;
        const cy = s.priceToCoordinate(d.price);
        if (cy != null && Math.abs(cy - y) <= HIT) return { id: d.id, kind: 'hline' };
      }
      for (const d of drawings.current) {
        if (d.kind !== 'trend') continue;
        const x1 = c.timeScale().timeToCoordinate(d.t1 as UTCTimestamp);
        const x2 = c.timeScale().timeToCoordinate(d.t2 as UTCTimestamp);
        const y1 = s.priceToCoordinate(d.v1), y2 = s.priceToCoordinate(d.v2);
        if (x1 == null || x2 == null || y1 == null || y2 == null) continue;
        if (distToSeg(x, y, x1, y1, x2, y2) <= HIT) return { id: d.id, kind: 'trend' };
      }
      return null;
    };
    const onDown = (e: PointerEvent) => {
      if (toolRef.current !== 'cursor') return;
      // Locked: the lines stay where they are. Without this, a pan that starts
      // near a level silently drags the level instead of the chart.
      if (lockedRef.current) return;
      const { x, y } = localXY(e);
      const hit = hitTest(x, y);
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
      const dg = drag.current;
      if (!dg) {
        if (toolRef.current === 'cursor') el!.style.cursor = hitTest(x, y) ? 'grab' : '';
        return;
      }
      const d = drawings.current.find((k) => k.id === dg.id);
      if (!d) return;
      if (d.kind === 'hline') {
        const p = s.coordinateToPrice(y);
        if (p == null) return;
        d.price = p;
        hlineObjs.current.get(d.id)?.applyOptions({ price: p });
      } else {
        const pNow = s.coordinateToPrice(y), pLast = s.coordinateToPrice(dg.lastY);
        if (pNow != null && pLast != null) { const dv = pNow - pLast; d.v1 += dv; d.v2 += dv; }
        const tNow = c.timeScale().coordinateToTime(x), tLast = c.timeScale().coordinateToTime(dg.lastX);
        if (tNow != null && tLast != null) { const dt = (tNow as number) - (tLast as number); d.t1 += dt; d.t2 += dt; }
        trendObjs.current.get(d.id)?.setData(
          [{ time: d.t1 as UTCTimestamp, value: d.v1 }, { time: d.t2 as UTCTimestamp, value: d.v2 }].sort((a, b) => (a.time as number) - (b.time as number)),
        );
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
    // Detach the previous market's drawing objects (keep them saved), then switch
    // the storage key and load this market/timeframe's saved drawings. They are
    // rendered after the candles load (trend lines need the time axis).
    removeDrawingObjects();
    drawKeyRef.current = DRAW_KEY(symbol, tf);
    drawings.current = loadDrawings(symbol, tf);

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

          {/* Timeframe. bot_bars syncs M15 and H1 only (backend v7), so the
              menu lists two — a wider one would be a menu of dead entries. */}
          <TopMenu label={tf}>
            {(close) => ALL_TIMEFRAMES.map((f) => {
              const synced = TF_VALUES.includes(f.value);
              return (
                <MenuItem
                  key={f.value}
                  active={tf === f.value}
                  disabled={!synced}
                  title={synced ? undefined : 'bar_sync stores M15 and H1 only — no candles exist for this'}
                  onClick={synced ? () => { setTf(f.value); close(); } : undefined}
                >
                  {f.label}
                </MenuItem>
              );
            })}
          </TopMenu>

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
          <div className="absolute inset-y-0 left-0 z-20 flex w-12 flex-col items-center gap-0.5 overflow-y-auto border-r border-border bg-bg-elevated/95 py-2 backdrop-blur-sm scrollbar-none">
            <RailBtn active={tool === 'cursor'} onClick={() => setTool('cursor')} title="Crosshair">
              <Crosshair className="h-4 w-4" />
            </RailBtn>
            <RailBtn active={tool === 'trend'} onClick={() => setTool('trend')} title="Trend line — click two points">
              <PenLine className="h-4 w-4" />
            </RailBtn>
            <RailBtn active={tool === 'hline'} onClick={() => setTool('hline')} title="Horizontal line — click a price">
              <LineChart className="h-4 w-4" />
            </RailBtn>
            <RailBtn active={gridOn} onClick={() => setGridOn((v) => !v)} title={gridOn ? 'Hide grid' : 'Show grid'}>
              <Grid3x3 className="h-4 w-4" />
            </RailBtn>
            <RailBtn onClick={toggleFullscreen} title={fs ? 'Exit full screen' : 'Full screen'}>
              <Maximize2 className="h-4 w-4" />
            </RailBtn>

            <RailBtn active={tool === 'text'} onClick={() => setTool('text')} title="Label a level — click a price, then name it">
              <Type className="h-4 w-4" />
            </RailBtn>
            {/* Same destination as the top bar's Indicators — one library, two
                ways in, rather than two different indicator UIs. */}
            <RailBtn active={inds.size > 0} onClick={() => setLibraryOpen(true)} title="Indicators">
              <BarChart3 className="h-4 w-4" />
            </RailBtn>

            <span className="my-1 h-px w-6 bg-border" />

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

            <span className="my-1 h-px w-6 bg-border" />

            <RailBtn onClick={clearDrawings} title="Delete all drawings">
              <Trash2 className="h-4 w-4" />
            </RailBtn>
          </div>
        </div>

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
