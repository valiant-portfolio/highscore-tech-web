// CSV export utilities. Pure functions; no IO. Used by admin CSV routes
// to convert row arrays into spreadsheet-friendly strings.
//
// Excel-safe quoting: every field gets wrapped in double-quotes; embedded
// quotes are doubled per RFC 4180. Newlines inside cells survive.

export function toCsv<T extends object>(
  rows: T[],
  headers: { key: keyof T & string; label: string }[],
): string {
  const escape = (v: unknown): string => {
    if (v == null) return '""';
    const s = typeof v === 'string' ? v : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = headers.map((h) => escape(h.label)).join(',');
  const body = rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h.key])).join(',')).join('\n');
  return `${head}\n${body}\n`;
}

export function csvResponse(csv: string, filename: string): Response {
  // BOM helps Excel pick up UTF-8 cleanly.
  return new Response(`﻿${csv}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
