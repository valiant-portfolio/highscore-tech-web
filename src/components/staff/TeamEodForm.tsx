'use client';

// Olivia-only: compile the team's End-of-Day report. One row in the
// staff_reports table per submission, with `content` storing JSON like:
//   { summary: "...", entries: [{ staff_id, full_name, did_work, notes }] }

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertCircle, CheckCircle2, Send, UserCheck, UserX,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { submitTeamEodAction, type AdminStaffState } from '@/lib/admin/staff-actions';

const INITIAL: AdminStaffState = { status: 'idle' };

interface StaffMember {
  id: string;
  full_name: string;
  role_title: string;
}

interface Props {
  activeStaff: StaffMember[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Send className="h-4 w-4" />}>
      Post team EOD
    </Button>
  );
}

export function TeamEodForm({ activeStaff }: Props) {
  const [state, formAction] = useActionState(submitTeamEodAction, INITIAL);
  // Local presence toggles so we can flip the UI without a re-render
  // round-trip. The form submits the underlying checkbox state regardless.
  const [present, setPresent] = useState<Record<string, boolean>>(
    Object.fromEntries(activeStaff.map((s) => [s.id, true])),
  );

  const presentCount = Object.values(present).filter(Boolean).length;

  return (
    <form action={formAction} className="space-y-5">
      {state.status === 'success' && (
        <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}
      {state.status === 'error' && (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-end">
        <div>
          <label htmlFor="report_date" className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle block mb-1.5">
            Date covered
          </label>
          <input
            id="report_date"
            name="report_date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-mono tabular"
          />
        </div>
        <div className="text-xs text-fg-subtle">
          <span className="inline-flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-success" /> {presentCount} working
          </span>
          <span className="mx-2">·</span>
          <span className="inline-flex items-center gap-1.5">
            <UserX className="h-3.5 w-3.5 text-danger" /> {activeStaff.length - presentCount} not working
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="summary" className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle block mb-1.5">
          Overall summary (optional)
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          placeholder="Overall progress for the day · top blocker · any quick win"
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm leading-relaxed"
        />
      </div>

      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
          Per-staff sections
        </p>

        {activeStaff.map((s) => {
          const isPresent = present[s.id];
          return (
            <div
              key={s.id}
              className={`rounded-md border p-4 transition-colors ${
                isPresent ? 'border-border bg-surface/30' : 'border-danger/30 bg-danger/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-fg">{s.full_name}</p>
                  <p className="text-xs text-fg-subtle">{s.role_title}</p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name={`entry.${s.id}.did_work`}
                    checked={isPresent}
                    onChange={(e) => setPresent((p) => ({ ...p, [s.id]: e.target.checked }))}
                    className="h-4 w-4 rounded border-border accent-brand"
                  />
                  <span className="text-sm font-semibold text-fg-muted">
                    {isPresent ? 'Worked today' : 'Did not work'}
                  </span>
                </label>
              </div>

              <label
                htmlFor={`notes-${s.id}`}
                className="block mt-3 text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle"
              >
                {isPresent
                  ? 'What they shipped / blockers'
                  : `Reason given by ${s.full_name.split(' ')[0]}`}
              </label>
              <textarea
                id={`notes-${s.id}`}
                name={`entry.${s.id}.notes`}
                rows={3}
                placeholder={
                  isPresent
                    ? 'Tasks completed · in-progress · what blocked them'
                    : 'Why they did not work today (sick, family emergency, no notice…)'
                }
                className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm leading-relaxed"
              />
              {!isPresent && (
                <p className="mt-1.5 text-[11px] text-danger inline-flex items-center gap-1">
                  <UserX className="h-3 w-3" />
                  Recorded as not worked — entry will appear in the CEO's email even if reason is blank.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-fg-subtle">
          This report covers all {activeStaff.length} active staff and lands as one row in the EOD table.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
