'use client';

import { useState, useTransition } from 'react';
import { KeyRound, Loader2, Check, X } from 'lucide-react';
import { resetStaffEmailAction, updateStaffSalaryAction } from '@/lib/admin/actions';
import { formatNgn } from '@/lib/academy/queries';

export function ResetEmailButton({ staffId, hasEmail }: { staffId: string; hasEmail: boolean }) {
  const [pending, startTransition] = useTransition();
  if (!hasEmail) {
    return <span className="text-xs text-fg-subtle">Not claimed</span>;
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Reset this staff member's portal access? They'll need to provision their email again on next visit.")) return;
        startTransition(async () => {
          await resetStaffEmailAction(staffId);
        });
      }}
      className="inline-flex h-8 items-center gap-1.5 px-3 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
      Reset email
    </button>
  );
}

export function SalaryEditor({ staffId, salary }: { staffId: string; salary: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(salary);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => { setEditing(true); setValue(salary); }}
        className="font-mono tabular text-fg hover:text-brand text-left"
      >
        {formatNgn(salary)}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-8 w-32 px-2 rounded-md border border-border bg-surface text-fg font-mono tabular text-sm"
        autoFocus
      />
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            await updateStaffSalaryAction(staffId, value);
            setEditing(false);
          });
        }}
        disabled={pending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand text-brand-fg hover:bg-brand-hover disabled:opacity-50"
        aria-label="Save"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted hover:bg-surface-hover"
        aria-label="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
