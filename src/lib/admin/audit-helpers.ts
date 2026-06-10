// Sync utilities used alongside the server-only audit logger.

// Compute a diff between two objects, only including fields that actually
// changed. Returns null when nothing differs.
export function computeDiff<T extends Record<string, unknown>>(
  before: T,
  after: T,
  fields: (keyof T)[],
): Record<string, { before: unknown; after: unknown }> | null {
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  for (const f of fields) {
    const b = before?.[f];
    const a = after?.[f];
    if (String(b ?? '') !== String(a ?? '')) {
      diff[String(f)] = { before: b ?? null, after: a ?? null };
    }
  }
  return Object.keys(diff).length === 0 ? null : diff;
}
