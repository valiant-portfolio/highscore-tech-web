'use client';

// A setup the bot wants to take, waiting on a person.
//
// Nothing is at the broker while this sits here — that is the whole point of
// approval mode. Approving places it; rejecting drops it for good.
//
// The reading is shown open, not behind a click, because unlike a resting
// order this is a decision being asked for RIGHT NOW: hiding the evidence
// behind an expander adds a step to the one thing that must not feel like
// friction.
//
// Rejections take a reason. "It bought into resistance at 1.2840" is the shape
// that fixes the bot later; "no" on its own teaches nobody anything.

import { useState, useTransition } from 'react';
import { Check, X, CandlestickChart } from 'lucide-react';
import { AdminCard } from '@/components/admin/AdminPage';
import { IndicatorTable, agreementTone } from './IndicatorTable';
import { TimeAgo } from './BotBits';
import { decideProposalAction } from '@/lib/admin/trading-bot-actions';
import type { BotProposal } from '@/lib/admin/trading-bot-queries';

const px = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 5 });

export function ProposalCard({
  proposal, onOpenChart,
}: {
  proposal: BotProposal;
  onOpenChart: (symbol: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const decide = (approved: boolean) => {
    setError(null);
    start(async () => {
      const res = await decideProposalAction(proposal.id, approved, approved ? undefined : note);
      if (!res.ok) setError(res.error);
      else setRejecting(false);
    });
  };

  const isBuy = proposal.side.startsWith('buy');
  const name = proposal.alias ?? proposal.symbol;
  const verdict = proposal.trend_agreement ?? '';

  return (
    <AdminCard>
      <div className="border-b border-border px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={`text-sm font-bold ${isBuy ? 'text-success' : 'text-danger'}`}>
            {isBuy ? 'BUY LIMIT' : 'SELL LIMIT'}
          </span>
          <span className="font-semibold text-fg">{name}</span>
          <span className="tabular text-sm text-fg-muted">@ {px(proposal.level)}</span>
          {verdict && (
            <span className={`rounded bg-surface-hover px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${agreementTone(verdict)}`}>
              {verdict}
            </span>
          )}
          <span className="ml-auto text-[11px] text-fg-subtle">
            asked <TimeAgo iso={proposal.created_at} />
          </span>
        </div>
        <p className="mt-1 text-xs text-fg-subtle">
          Nothing is at the broker. It places only if you approve.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 text-sm sm:grid-cols-4">
        <Fact label="Entry level" value={px(proposal.level)} />
        <Fact label="Stop" value={px(proposal.sl)} />
        <Fact label="Target" value={px(proposal.tp)} />
        <Fact label="R:R" value={proposal.rr == null ? '—' : `${Number(proposal.rr).toFixed(2)}`} />
      </dl>

      {proposal.snapshot && (
        <div className="border-t border-border">
          <IndicatorTable
            snapshot={proposal.snapshot}
            side={proposal.side}
            htfTrend={proposal.htf_trend}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => decide(true)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-success px-3 text-xs font-bold text-bg hover:opacity-90 disabled:opacity-40"
        >
          <Check className="h-4 w-4" /> Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setRejecting((v) => !v)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-danger/40 px-3 text-xs font-bold text-danger hover:bg-danger/10 disabled:opacity-40"
        >
          <X className="h-4 w-4" /> Reject
        </button>
        <button
          type="button"
          onClick={() => onOpenChart(proposal.symbol)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-fg-muted hover:bg-surface-hover"
        >
          <CandlestickChart className="h-4 w-4" /> Open chart
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>

      {rejecting && (
        <div className="border-t border-border px-5 py-4">
          <label htmlFor={`why-${proposal.id}`} className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
            What did the bot miss?
          </label>
          <textarea
            id={`why-${proposal.id}`}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="It is buying into resistance at 0.56800 — H1 is up but price is already at the level."
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => decide(false)}
              className="inline-flex h-8 items-center rounded-md bg-danger px-3 text-xs font-bold text-bg hover:opacity-90 disabled:opacity-40"
            >
              {pending ? 'Rejecting…' : 'Reject this setup'}
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="text-xs text-fg-subtle hover:text-fg"
            >
              Cancel
            </button>
            <span className="text-[11px] text-fg-subtle">
              A reason is optional, but it is what fixes the bot later.
            </span>
          </div>
        </div>
      )}
    </AdminCard>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] font-bold text-fg-subtle">{label}</dt>
      <dd className="tabular text-fg">{value}</dd>
    </div>
  );
}
