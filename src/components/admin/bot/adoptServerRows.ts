/** Server rows replace what the socket has shown, except where the socket's row is newer. */
export function adoptServerRows<T extends { symbol: string; updated_at: string | null }>(prev: T[], fresh: T[]): T[] {
  return fresh.map((row) => {
    const mine = prev.find((m) => m.symbol === row.symbol);
    // A null or unparseable client timestamp gives NaN, and NaN beats nothing.
    return mine && Date.parse(mine.updated_at ?? '') > Date.parse(row.updated_at ?? '') ? mine : row;
  });
}