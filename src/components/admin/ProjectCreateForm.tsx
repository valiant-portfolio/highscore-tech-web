'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui';
import { createProjectAction, type ProjectFormState } from '@/lib/admin/project-actions';

const INITIAL: ProjectFormState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} rightIcon={!pending ? <ArrowRight className="h-4 w-4" /> : undefined}>
      {pending ? 'Creating…' : 'Create project'}
    </Button>
  );
}

export function ProjectCreateForm() {
  const [state, formAction] = useActionState(createProjectAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      {state.status === 'error' && !fieldErrors && (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <Field label="Project name *" name="name" error={fieldErrors?.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. AI support copilot — Phase 2"
          className="input-text"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Client name *" name="client_name" error={fieldErrors?.client_name}>
          <input id="client_name" name="client_name" type="text" required placeholder="e.g. Acme Fintech" className="input-text" />
        </Field>

        <Field label="Cost (NGN) *" name="cost_ngn" error={fieldErrors?.cost_ngn} hint="Total agreed project value.">
          <input
            id="cost_ngn"
            name="cost_ngn"
            type="number"
            required
            min={0}
            step={1000}
            placeholder="e.g. 100000"
            className="input-text font-mono"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Client email" name="client_email">
          <input id="client_email" name="client_email" type="email" placeholder="contact@client.com" className="input-text" />
        </Field>
        <Field label="Client phone" name="client_phone">
          <input id="client_phone" name="client_phone" type="text" placeholder="+234…" className="input-text font-mono" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Started" name="started_at" hint="Kick-off date.">
          <input id="started_at" name="started_at" type="date" className="input-text font-mono" />
        </Field>
        <Field label="Due" name="due_at" hint="Target delivery date.">
          <input id="due_at" name="due_at" type="date" className="input-text font-mono" />
        </Field>
      </div>

      <Field label="Description" name="description" hint="Short summary of what we're building.">
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Scope summary, key deliverables, any gotchas."
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm leading-relaxed"
        />
      </Field>

      <div className="pt-2">
        <SubmitButton />
      </div>

      <style jsx>{`
        :global(.input-text) {
          height: 44px;
          width: 100%;
          border-radius: 6px;
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          color: var(--c-fg);
          padding: 0 12px;
          font-size: 14px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label, name, error, hint, children,
}: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle block mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-fg-subtle">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

void Briefcase;
