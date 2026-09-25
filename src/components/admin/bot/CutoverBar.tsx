'use client';

// The line between the old strategy's record and the new one's.
//
// Nothing was deleted to get this. The trades before the cutover are the
// evidence of what did not work, which is most of what this project has
// produced so far — so the dashboard measures the current strategy on its own
// by DEFAULT, and the whole record stays one click away.
//
// Editing is deliberately understated: the date moves only when the strategy
// changes materially, which is rare, and a prominent control would invite
// fiddling with the denominator of every number on the page.

import { useState, useTransition } from 'react';
import { setCutoverAction } from '@/lib/admin/trading-bot-actions';

interface Props {
  cutoverAt: string | null;
  showingAll: boolean;
  onToggle: (showAll: boolean) => void;
  /** How many trades each view holds, so the toggle says what it will do. */
  sinceCount: number;
  totalCount: number;
}

export function CutoverBar({ cutoverAt, showingAll, onToggle, sinceCount, totalCount }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cutoverAt ? cutoverAt.slice(0, 10) : '');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = (iso: string | null) => {
    setError(null);
    start(async () => {
      const res = await setCutoverAction(iso);
      if (res.ok) setEditing(false);
      else setError(res.error);
    });
  };

  const pretty = cutoverAt
    ? new Date(cutoverAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-surface-hover/30 px-4 py-2.5">
      {pretty ? (
        <>
          <span className="text-sm text-fg">
            {showingAll ? (
              <>Showing <span className="font-semibold">all {totalCount}</span> trades, including the previous strategy&apos;s record.</>
            ) : (
              <>Measuring the current strategy: <span className="font-semibold">{sinceCount}</span> trades since {pretty}.</>
            )}
          </span>
          <button
            type="button"
            onClick={() => onToggle(!showingAll)}
            className="text-xs font-semibold text-brand underline-offset-4 hover:underline"
          >
            {showingAll ? `Since ${pretty}` : 'Show everything'}
          </button>
        </>
      ) : (
        <span className="text-sm text-fg-muted">
          Showing all {totalCount} trades — no cutover set, so this mixes every strategy ever run.
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {editing ? (
          <>
            <input
              type="date"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="rounded border border-border bg-bg px-2 py-1 text-xs text-fg"
            />
            <button
              type="button" disabled={pending || !draft}
              onClick={() => save(new Date(`${draft}T00:00:00Z`).toISOString())}
              className="rounded bg-brand px-2 py-1 text-xs font-bold text-brand-fg disabled:opacity-40"
            >
              Save
            </button>
            {cutoverAt && (
              <button type="button" disabled={pending} onClick={() => save(null)} className="text-xs text-fg-muted hover:text-fg">
                Clear
              </button>
            )}
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-fg-subtle hover:text-fg">
              Cancel
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="text-xs text-fg-subtle hover:text-fg">
            {pretty ? 'Change cutover' : 'Set cutover'}
          </button>
        )}
      </div>
      {error && <span className="w-full text-xs text-danger">{error}</span>}
    </div>
  );
}
