'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, Briefcase, Building2 } from 'lucide-react';
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
  const [projectType, setProjectType] = useState<'client' | 'internal'>('client');
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      {state.status === 'error' && !fieldErrors && (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      {/* Type picker */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle mb-2">Project type</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <TypeCard
            value="client"
            checked={projectType === 'client'}
            onClick={() => setProjectType('client')}
            title="Client project"
            description="Billable work for an external client."
            icon={<Briefcase className="h-5 w-5" />}
          />
          <TypeCard
            value="internal"
            checked={projectType === 'internal'}
            onClick={() => setProjectType('internal')}
            title="Internal product"
            description="Something we own and operate (e.g. Lovemeet, the Academy itself)."
            icon={<Building2 className="h-5 w-5" />}
          />
        </div>
        <input type="hidden" name="project_type" value={projectType} />
      </div>

      <Field label="Project name *" name="name" error={fieldErrors?.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={projectType === 'internal' ? 'e.g. Lovemeet app' : 'e.g. AI support copilot — Phase 2'}
          className="input-text"
        />
      </Field>

      {projectType === 'client' && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Client name *" name="client_name" error={fieldErrors?.client_name}>
              <input id="client_name" name="client_name" type="text" required placeholder="e.g. Acme Fintech" className="input-text" />
            </Field>
            <Field label="Cost (NGN)" name="cost_ngn" hint="Total agreed value, if applicable.">
              <input
                id="cost_ngn"
                name="cost_ngn"
                type="number"
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
        </>
      )}

      <Field
        label={projectType === 'internal' ? 'Product URL' : 'Project URL (optional)'}
        name="project_url"
        hint={projectType === 'internal' ? 'Where the product lives.' : 'Staging / production link if any.'}
      >
        <input id="project_url" name="project_url" type="url" placeholder="https://lovemeet.app" className="input-text" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Started" name="started_at" hint="Kick-off / launch date.">
          <input id="started_at" name="started_at" type="date" className="input-text font-mono" />
        </Field>
        <Field label="Due" name="due_at" hint={projectType === 'client' ? 'Target delivery date.' : 'Next milestone date (optional).'}>
          <input id="due_at" name="due_at" type="date" className="input-text font-mono" />
        </Field>
      </div>

      <Field label="Description" name="description" hint="What it is, what success looks like.">
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder={projectType === 'internal' ? 'Product positioning, key features, target users.' : 'Scope summary, key deliverables, any gotchas.'}
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

function TypeCard({
  value, checked, onClick, title, description, icon,
}: {
  value: string; checked: boolean; onClick: () => void;
  title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-value={value}
      className={`text-left rounded-md border-2 p-4 transition-colors ${
        checked
          ? 'border-brand bg-brand-tint/30'
          : 'border-border bg-surface/40 hover:bg-surface-hover'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${checked ? 'bg-brand text-brand-fg' : 'bg-surface-hover text-fg-muted'}`}>
          {icon}
        </span>
        <div>
          <p className="font-semibold text-fg">{title}</p>
          <p className="mt-1 text-xs text-fg-muted leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
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
