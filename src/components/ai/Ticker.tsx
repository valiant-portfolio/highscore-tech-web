// The live price strip.
//
// One cell per market: symbol with its change stacked beneath, the price, and a
// sparkline coloured by direction — divided by hairlines and sliding
// continuously.
//
// Two identical tracks scroll as one, so the loop has no seam: the moment the
// first track's tail leaves the viewport the second is already in its place.
// The edges are masked rather than cut, because a price sliced in half at the
// border reads as a rendering fault.
//
// Prices and shapes are placeholders until the Binance websocket is wired, and
// they are deliberately static rather than jittered — a fake tick on a finance
// page is the one lie a visitor can catch.

interface Row {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
  /** Normalised 0–1 path, oldest → newest. Fixed, not random: this renders on
   *  the server and again on the client, and Math.random() would disagree with
   *  itself between the two. */
  spark: number[];
}

const ROWS: Row[] = [
  { symbol: 'BTC',    price: '$68,420.18', change: '+2.84%', up: true,  spark: [0.20, 0.28, 0.24, 0.42, 0.38, 0.55, 0.62, 0.58, 0.74, 0.86] },
  { symbol: 'ETH',    price: '$3,788.42',  change: '+1.16%', up: true,  spark: [0.30, 0.26, 0.40, 0.36, 0.52, 0.48, 0.60, 0.56, 0.70, 0.78] },
  { symbol: 'SOL',    price: '$148.60',    change: '−0.72%', up: false, spark: [0.82, 0.74, 0.78, 0.62, 0.58, 0.64, 0.46, 0.40, 0.34, 0.22] },
  { symbol: 'XAU',    price: '$2,658.40',  change: '+0.38%', up: true,  spark: [0.34, 0.30, 0.44, 0.40, 0.50, 0.58, 0.54, 0.66, 0.72, 0.80] },
  { symbol: 'EURUSD', price: '1.08240',    change: '−0.14%', up: false, spark: [0.70, 0.76, 0.66, 0.58, 0.62, 0.48, 0.44, 0.50, 0.36, 0.28] },
  { symbol: 'GBPJPY', price: '208.594',    change: '−0.34%', up: false, spark: [0.78, 0.68, 0.72, 0.60, 0.54, 0.58, 0.42, 0.46, 0.32, 0.24] },
];

export function Ticker() {
  return (
    <section
      id="markets"
      aria-label="Market prices"
      className="relative scroll-mt-20 overflow-hidden border-y border-border bg-bg-elevated/50"
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
      }}
    >
      <div className="ai-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {ROWS.map((r) => (
              <Cell key={r.symbol} row={r} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Cell({ row }: { row: Row }) {
  const tone = row.up ? 'text-brand' : 'text-danger';
  return (
    <div className="flex items-center gap-6 border-r border-border px-8 py-4">
      <div>
        <p className="text-[13px] font-bold tracking-wide text-fg">{row.symbol}</p>
        <p className={`font-mono text-[11px] font-semibold ${tone}`}>{row.change}</p>
      </div>
      <p className="font-mono text-[15px] text-fg">{row.price}</p>
      <Spark values={row.spark} up={row.up} />
    </div>
  );
}

/** Ten points, 2px stroke, no axes. It shows shape, and shape is all it claims. */
function Spark({ values, up }: { values: number[]; up: boolean }) {
  const w = 96;
  const h = 28;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - v * (h - 4) - 2).toFixed(1)}`)
    .join(' ');

  return (
    <svg aria-hidden width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={up ? 'var(--brand)' : 'var(--danger, #F87171)'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
