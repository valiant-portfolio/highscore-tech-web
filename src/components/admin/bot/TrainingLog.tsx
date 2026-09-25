'use client';

// What the bot got wrong, and what was done about it.
//
// "We will decide whether to keep it or close, then solve the issue we've
// found." The deciding and the closing already had homes; this is the third
// part, and the one that makes the other two cumulative. Without it the same
// issue is found again next week and nobody remembers whether it was already
// addressed — a stream of screenshots rather than training.
//
// An issue is OPEN until someone writes the fix. Not until someone reads it,
// agrees with it, or means to get to it. That is the only distinction this
// screen makes, because it is the only one that changes the bot.

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { AdminCard } from '@/components/admin/AdminPage';
import { recordFixAction } from '@/lib/admin/trading-bot-actions';
import type { BotTradeAnalysisView } from '@/lib/admin/trading-bot-queries';

export function TrainingLog({ issues }: { issues: BotTradeAnalysisView[] }) {
  const open = issues.filter((i) => !i.fix);
  const solved = issues.filter((i) => i.fix);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-fg">
          Training <span className="text-sm font-normal text-fg-muted">· what the bot got wrong, and what we changed</span>
        </h2>
        <p className="mt-1 text-sm text-fg-subtle">
          Raised while an order was pending. An issue stays open until someone writes the fix.
        </p>
      </div>

      <section>
        <h3 className="mb-3 font-semibold text-fg">
          Open <span className="text-sm font-normal text-fg-muted">· {open.length}</span>
        </h3>
        {open.length === 0 ? (
          <AdminCard>
            <p className="p-8 text-center text-sm text-fg-muted">
              Nothing outstanding. Every issue raised has a fix recorded against it.
            </p>
          </AdminCard>
        ) : (
          <div className="space-y-4">
            {open.map((i) => <IssueCard key={i.ticket} issue={i} />)}
          </div>
        )}
      </section>

      {solved.length > 0 && (
        <section>
          <h3 className="mb-3 font-semibold text-fg">
            Solved <span className="text-sm font-normal text-fg-muted">· {solved.length}</span>
          </h3>
          <div className="space-y-4">
            {solved.map((i) => <IssueCard key={i.ticket} issue={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: BotTradeAnalysisView }) {
  const [fix, setFix] = useState(issue.fix ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const solved = !!issue.fix;

  const save = () => {
    setError(null);
    start(async () => {
      const res = await recordFixAction(issue.ticket, fix);
      if (!res.ok) setError(res.error);
    });
  };

  const raised = new Date(issue.updated_at).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <AdminCard>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-3">
        <span className="font-semibold text-fg">{issue.symbol}</span>
        <a href={`/trade/${issue.ticket}`} className="text-xs text-brand underline-offset-4 hover:underline">
          #{issue.ticket}
        </a>
        {issue.verdict && (
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            issue.verdict === 'close' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
          }`}>
            {issue.verdict === 'close' ? 'closed it' : 'kept it'}
          </span>
        )}
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          solved ? 'bg-surface-hover text-fg-subtle' : 'bg-brand/15 text-brand'
        }`}>
          {solved ? 'solved' : 'open'}
        </span>
        <span className="ml-auto text-[11px] text-fg-subtle">{raised}{issue.created_by ? ` · ${issue.created_by}` : ''}</span>
      </div>

      <div className="px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">The issue</p>
        <p className="mt-1 text-sm text-fg">{issue.issue}</p>

        {issue.note && (
          <>
            <p className="mt-4 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">What was seen</p>
            <p className="mt-1 text-sm text-fg-muted">{issue.note}</p>
          </>
        )}

        {issue.imageUrl && (
          <a href={issue.imageUrl} target="_blank" rel="noreferrer" className="mt-4 block">
            <Image
              src={issue.imageUrl}
              alt={`Markup for ${issue.symbol} ${issue.ticket}`}
              width={1600}
              height={900}
              unoptimized
              className="w-full rounded-md border border-border object-contain"
            />
          </a>
        )}

        <label htmlFor={`fix-${issue.ticket}`} className="mt-5 block text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
          What did we change?
        </label>
        <textarea
          id={`fix-${issue.ticket}`}
          rows={2}
          value={fix}
          onChange={(e) => setFix(e.target.value)}
          placeholder="Entry now waits for a retest of the level instead of placing into it — pending_intent, 26 Sep."
          className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={pending || fix.trim() === (issue.fix ?? '').trim()}
            className="inline-flex h-8 items-center rounded-md bg-brand px-3 text-xs font-bold text-brand-fg hover:opacity-90 disabled:opacity-40"
          >
            {pending ? 'Saving…' : solved ? 'Update the fix' : 'Mark it solved'}
          </button>
          {solved && issue.fixed_at && (
            <span className="text-[11px] text-fg-subtle">
              Solved {new Date(issue.fixed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              {issue.fixed_by ? ` · ${issue.fixed_by}` : ''}
              {' — '}clearing this reopens it, which is the honest thing if the fix did not work.
            </span>
          )}
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>
      </div>
    </AdminCard>
  );
}
