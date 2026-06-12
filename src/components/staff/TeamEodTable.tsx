'use client';

// Olivia's view of historical team EOD reports. Click a row to expand
// the per-staff breakdown.

import { useState } from 'react';
import { ChevronDown, UserCheck, UserX, MessageSquare } from 'lucide-react';

interface TeamEodEntry {
  staff_id: string;
  full_name: string;
  did_work: boolean;
  notes: string;
}

interface TeamEodPayload {
  summary?: string;
  entries: TeamEodEntry[];
}

interface RawRow {
  id: string;
  report_date: string;
  content: string;       // JSON string of TeamEodPayload
  created_at: string;
}

interface Props {
  rows: RawRow[];
}

function parsePayload(content: string): TeamEodPayload {
  try {
    const parsed = JSON.parse(content) as TeamEodPayload;
    return { summary: parsed.summary ?? '', entries: parsed.entries ?? [] };
  } catch {
    return { summary: '', entries: [] };
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(iso));
}

export function TeamEodTable({ rows }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface/20 p-8 text-center">
        <MessageSquare className="h-8 w-8 mx-auto text-fg-subtle" />
        <p className="mt-3 text-sm text-fg-muted">No team EODs posted yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
          <tr>
            <th className="text-left  px-4 py-3 font-bold">Date</th>
            <th className="text-right px-4 py-3 font-bold">Worked</th>
            <th className="text-right px-4 py-3 font-bold">Off</th>
            <th className="text-right px-4 py-3 font-bold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const payload = parsePayload(r.content);
            const workedCount = payload.entries.filter((e) => e.did_work).length;
            const offCount    = payload.entries.length - workedCount;
            const open        = expanded.has(r.id);

            return (
              <tr
                key={r.id}
                onClick={() => toggle(r.id)}
                className="cursor-pointer hover:bg-surface-hover/40 align-top"
              >
                <td className="px-4 py-3 font-semibold text-fg">
                  {formatDate(r.report_date)}
                  <p className="mt-0.5 text-[10px] font-normal text-fg-subtle font-mono">
                    posted {formatDate(r.created_at)}
                  </p>
                  {open && (
                    <div className="mt-4 space-y-3 max-w-[640px] normal-case">
                      {payload.summary && (
                        <div className="rounded-md border border-brand/30 bg-brand-tint/30 p-3">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-brand mb-1">Summary</p>
                          <p className="text-sm text-fg whitespace-pre-wrap leading-relaxed">{payload.summary}</p>
                        </div>
                      )}
                      <ul className="space-y-2">
                        {payload.entries.map((e) => (
                          <li
                            key={e.staff_id}
                            className={`rounded-md border p-3 ${e.did_work ? 'border-success/30 bg-success/5' : 'border-fg-subtle/20 bg-surface/40'}`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-semibold text-fg">{e.full_name}</p>
                              {e.did_work ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
                                  <UserCheck className="h-3 w-3" /> Worked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-fg-subtle">
                                  <UserX className="h-3 w-3" /> Off
                                </span>
                              )}
                            </div>
                            {e.notes && (
                              <p className="text-xs text-fg-muted whitespace-pre-wrap leading-relaxed">{e.notes}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular text-success font-bold align-top">{workedCount}</td>
                <td className="px-4 py-3 text-right font-mono tabular text-fg-subtle font-bold align-top">{offCount}</td>
                <td className="px-4 py-3 text-right align-top">
                  <ChevronDown className={`h-4 w-4 text-fg-muted transition-transform ${open ? 'rotate-180' : ''} inline-block`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
