'use client';

// Forms + delete buttons for the /admin/finance page. Server component
// renders the page; this file owns every interactive bit.

import { useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertCircle, CheckCircle2, Plus, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  addCompanyExpenseAction, deleteCompanyExpenseAction,
  addIncomePaymentAction,  deleteIncomePaymentAction,
  type FinanceActionState,
} from '@/lib/admin/finance-actions';

const INITIAL: FinanceActionState = { status: 'idle' };

interface ProjectOption { id: string; label: string }

// ── Add income ───────────────────────────────────────────────────────────
export function AddIncomeForm({ projectOptions }: { projectOptions: ProjectOption[] }) {
  const [state, formAction] = useActionState(addIncomePaymentAction, INITIAL);
  const errs = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <FormCard state={state}>
      <form action={formAction} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="project_id">Project *</Label>
            <select
              id="project_id"
              name="project_id"
              required
              defaultValue=""
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">Pick a project…</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {errs?.project_id && <p className="mt-1 text-xs text-danger">{errs.project_id}</p>}
          </div>

          <LabelledInput
            label="Amount (NGN) *"
            name="amount_ngn"
            type="number"
            required
            min={1}
            step={1000}
            placeholder="50000"
            error={errs?.amount_ngn}
            mono
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <LabelledInput label="Received on" name="received_at" type="date" defaultValue={today()} mono />
          <LabelledInput label="Method" name="method" placeholder="Transfer / Cash / Card" />
          <LabelledInput label="Reference" name="reference" placeholder="invoice #INV-001" />
        </div>

        <LabelledInput label="Notes" name="notes" placeholder="(optional)" />

        <SubmitButton label="Record income" />
      </form>
    </FormCard>
  );
}

// ── Add expense ──────────────────────────────────────────────────────────
export function AddExpenseForm({ projectOptions }: { projectOptions: ProjectOption[] }) {
  const [state, formAction] = useActionState(addCompanyExpenseAction, INITIAL);
  const errs = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <FormCard state={state}>
      <form action={formAction} className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <LabelledInput
            label="Amount (NGN) *"
            name="amount_ngn"
            type="number"
            required
            min={1}
            step={500}
            placeholder="5000"
            error={errs?.amount_ngn}
            mono
          />
          <LabelledInput label="Spent on" name="spent_at" type="date" defaultValue={today()} mono />
          <LabelledInput label="Category" name="category" placeholder="Hosting / Tools / Rent" />
        </div>

        <LabelledTextarea
          label="Reason *"
          name="reason"
          required
          rows={2}
          placeholder="Why this expense was needed."
          error={errs?.reason}
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="project_id">Linked project (optional)</Label>
            <select
              id="project_id"
              name="project_id"
              defaultValue=""
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">— no specific project (overhead / general) —</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <LabelledInput label="Notes" name="notes" placeholder="(optional)" />
        </div>

        <SubmitButton label="Record expense" />
      </form>
    </FormCard>
  );
}

// ── Delete buttons ───────────────────────────────────────────────────────
export function DeleteIncomeButton({ paymentId }: { paymentId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Delete this income record?')) return;
        start(async () => { await deleteIncomePaymentAction(paymentId); });
      }}
      className="text-fg-subtle hover:text-danger inline-flex items-center gap-1 text-xs font-semibold"
      aria-label="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Delete this expense?')) return;
        start(async () => { await deleteCompanyExpenseAction(expenseId); });
      }}
      className="text-fg-subtle hover:text-danger inline-flex items-center gap-1 text-xs font-semibold"
      aria-label="Delete"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

// ── Atoms ────────────────────────────────────────────────────────────────
function today(): string { return new Date().toISOString().slice(0, 10); }

function FormCard({ state, children }: { state: FinanceActionState; children: React.ReactNode }) {
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

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending} rightIcon={!pending ? <Plus className="h-3.5 w-3.5" /> : undefined}>
      {label}
    </Button>
  );
}
