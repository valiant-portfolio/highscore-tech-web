'use client';

// All client-side bits of the project detail page: status controls, the
// five "add" sub-forms (payment / expense / milestone / assignment /
// report) and the milestone-status toggles. The page itself is server-
// rendered with the data; only the interactive controls live here.

import { useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertCircle, CheckCircle2, Plus, Send, X, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  addMilestoneAction, assignStaffAction, addProjectReportAction,
  setProjectStatusAction, setMilestoneStatusAction, unassignStaffAction,
  type ProjectFormState,
} from '@/lib/admin/project-actions';

const INITIAL: ProjectFormState = { status: 'idle' };

// ── Status controls (top of detail page) ─────────────────────────────────
export function ProjectStatusControls({
  projectId, currentStatus,
}: { projectId: string; currentStatus: 'in_progress' | 'completed' | 'cancelled' }) {
  const [pending, start] = useTransition();

  function setStatus(next: 'in_progress' | 'completed' | 'cancelled') {
    if (next === currentStatus) return;
    start(async () => {
      await setProjectStatusAction(projectId, next);
    });
  }

  const items: { value: 'in_progress' | 'completed' | 'cancelled'; label: string }[] = [
    { value: 'in_progress', label: 'In progress' },
    { value: 'completed',   label: 'Completed' },
    { value: 'cancelled',   label: 'Cancelled' },
  ];

  return (
    <div className="inline-flex rounded-md border border-border bg-surface/60 p-1 gap-1">
      {items.map((it) => {
        const active = it.value === currentStatus;
        return (
          <button
            key={it.value}
            type="button"
            disabled={pending || active}
            onClick={() => setStatus(it.value)}
            className={`px-3 h-8 rounded-md text-xs font-semibold transition-colors ${
              active
                ? 'bg-brand text-brand-fg cursor-default'
                : 'text-fg-muted hover:text-fg hover:bg-surface-hover'
            } disabled:opacity-70`}
          >
            {it.label}
          </button>
        );
      })}
      {pending && <Loader2 className="h-3.5 w-3.5 text-fg-subtle animate-spin ml-1 self-center" />}
    </div>
  );
}

// ── Add milestone ────────────────────────────────────────────────────────
export function AddMilestoneForm({ projectId }: { projectId: string }) {
  const action = addMilestoneAction.bind(null, projectId);
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <FormCard state={state}>
      <form action={formAction} className="space-y-3">
        <div className="grid sm:grid-cols-[1fr_160px] gap-3">
          <LabelledInput label="Milestone title" name="title" required placeholder="e.g. Phase 1 — Auth & onboarding" />
          <LabelledInput label="Due date" name="due_date" type="date" mono />
        </div>
        <LabelledTextarea label="Description" name="description" rows={2} placeholder="What success looks like for this milestone." />
        <SubmitButton label="Add milestone" />
      </form>
    </FormCard>
  );
}

// ── Milestone status pill (in the list) ──────────────────────────────────
export function MilestoneStatusPill({
  milestoneId, currentStatus,
}: { milestoneId: string; currentStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled' }) {
  const [pending, start] = useTransition();
  const next: 'pending' | 'in_progress' | 'completed' | 'cancelled' =
    currentStatus === 'pending'     ? 'in_progress' :
    currentStatus === 'in_progress' ? 'completed'   :
    currentStatus === 'completed'   ? 'pending'     : 'pending';
  const labelByStatus = {
    pending:     { label: 'Pending',     tone: 'bg-surface-hover text-fg-muted' },
    in_progress: { label: 'In progress', tone: 'bg-brand-tint text-brand' },
    completed:   { label: 'Completed',   tone: 'bg-success/15 text-success' },
    cancelled:   { label: 'Cancelled',   tone: 'bg-danger/15 text-danger' },
  };
  const cur = labelByStatus[currentStatus];

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-bold ${cur.tone}`}>
        {cur.label}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { await setMilestoneStatusAction(milestoneId, next); })}
        className="text-[11px] text-fg-muted hover:text-brand font-semibold"
      >
        {pending ? '…' : `→ ${labelByStatus[next].label.toLowerCase()}`}
      </button>
    </div>
  );
}

// ── Assign staff form ────────────────────────────────────────────────────
export function AssignStaffForm({
  projectId, staffOptions,
}: {
  projectId: string;
  staffOptions: { id: string; full_name: string; role_title: string }[];
}) {
  const action = assignStaffAction.bind(null, projectId);
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <FormCard state={state}>
      <form action={formAction} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <Label htmlFor="staff_id">Staff member</Label>
          <select id="staff_id" name="staff_id" required className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm">
            <option value="">Pick a staff…</option>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name} — {s.role_title}</option>
            ))}
          </select>
        </div>
        <LabelledInput label="Project role" name="role" placeholder="e.g. Lead Dev (optional)" />
        <SubmitButton label="Assign" />
      </form>
    </FormCard>
  );
}

// ── Project report form ──────────────────────────────────────────────────
export function AddProjectReportForm({ projectId }: { projectId: string }) {
  const action = addProjectReportAction.bind(null, projectId);
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <FormCard state={state}>
      <form action={formAction} className="space-y-3">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-[170px]">
            <Label htmlFor="report_date">Report date</Label>
            <input id="report_date" name="report_date" type="date" defaultValue={today()} className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm font-mono" />
          </div>
        </div>
        <LabelledTextarea
          label="Progress update"
          name="content"
          required
          rows={4}
          placeholder="What advanced today on this project · blockers · risks · next moves."
        />
        <SubmitButton label="Post report" icon={<Send className="h-4 w-4" />} />
      </form>
    </FormCard>
  );
}

// ── Delete buttons (rows) ────────────────────────────────────────────────
export function UnassignButton({ assignmentId, projectId }: { assignmentId: string; projectId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { await unassignStaffAction(assignmentId, projectId); })}
      className="text-fg-subtle hover:text-danger inline-flex items-center gap-1 text-xs"
      aria-label="Unassign"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

// ── Local atoms ──────────────────────────────────────────────────────────
function today(): string { return new Date().toISOString().slice(0, 10); }

function FormCard({ state, children }: { state: ProjectFormState; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      {state.status === 'error' && (
        <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}
      {state.status === 'success' && (
        <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}
      {children}
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-1">
      {children}
    </label>
  );
}

function LabelledInput({
  label, name, type = 'text', required, placeholder, defaultValue, min, step, mono, error,
}: {
  label: string; name: string;
  type?: string; required?: boolean; placeholder?: string; defaultValue?: string;
  min?: number; step?: number; mono?: boolean; error?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        step={step}
        className={`h-10 w-full rounded-md border border-border bg-surface px-3 text-sm ${mono ? 'font-mono tabular' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function LabelledTextarea({
  label, name, required, rows, placeholder, error,
}: {
  label: string; name: string;
  required?: boolean; rows?: number; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        rows={rows ?? 3}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm leading-relaxed"
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function SubmitButton({ label, icon }: { label: string; icon?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending} rightIcon={!pending ? (icon ?? <Plus className="h-3.5 w-3.5" />) : undefined}>
      {label}
    </Button>
  );
}
