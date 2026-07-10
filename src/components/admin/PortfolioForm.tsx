'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Save, Trash2 } from 'lucide-react';
import { Input, Textarea, Button } from '@/components/ui';
import { PortfolioImages } from './PortfolioImages';
import {
  upsertPortfolioAction,
  deletePortfolioAction,
  type AdminFormState,
} from '@/lib/admin/actions';
import type { AdminPortfolioFull } from '@/lib/admin/queries';

interface Props {
  project?: AdminPortfolioFull | null;
}

const INITIAL: AdminFormState = { status: 'idle' };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Save className="h-4 w-4" />}>
      {pending ? 'Saving' : 'Save'}
    </Button>
  );
}

export function PortfolioForm({ project }: Props) {
  const [state, formAction] = useActionState(upsertPortfolioAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={project?.id ?? ''} />

        {state.status === 'success' && (
          <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <p className="text-fg">{state.message}</p>
          </div>
        )}
        {state.status === 'error' && !fieldErrors && (
          <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
            <p className="text-fg">{state.message}</p>
          </div>
        )}

        <Input name="title"   label="Title"   required defaultValue={project?.title}   error={fieldErrors?.title} />
        <Input name="slug"    label="Slug"    required defaultValue={project?.slug}    error={fieldErrors?.slug}    helper="Lowercase, digits and hyphens. Used in /portfolio/<slug>." />
        <Textarea
          name="summary"
          label="Card summary"
          required
          rows={3}
          defaultValue={project?.summary}
          error={fieldErrors?.summary}
          helper="One- or two-sentence pitch for the grid card."
        />
        <Textarea
          name="body_md"
          label="Case study body (Markdown)"
          rows={14}
          defaultValue={project?.body_md ?? ''}
          helper="Supports ## headings, **bold**, `code`, and - bulleted lists."
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input name="client"   label="Client"   defaultValue={project?.client ?? ''} placeholder="Confidential / Public name" />
          <Input name="category" label="Category" defaultValue={project?.category ?? ''} placeholder="AI / Software / Mobile" />
          <Input name="year"     label="Year"     type="number" defaultValue={project?.year ?? ''} />
          <Input name="sort_order" label="Sort order" type="number" defaultValue={project?.sort_order ?? 0} helper="Lower numbers show first." />
          <Input name="external_url"    label="External link"    defaultValue={project?.external_url ?? ''} placeholder="https://…" fieldClassName="sm:col-span-2" />
          <Input name="tech_stack" label="Tech stack" defaultValue={project?.tech_stack?.join(', ') ?? ''} helper="Comma-separated list." fieldClassName="sm:col-span-2" />
        </div>

        <PortfolioImages
          initial={project?.images?.length ? project.images : (project?.cover_image_url ? [project.cover_image_url] : [])}
          error={fieldErrors?.images}
        />

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={project?.published ?? true} className="h-4 w-4 accent-[var(--brand)]" />
          <span className="text-fg">Published (visible on /portfolio)</span>
        </label>

        <SaveButton />
      </form>

      {project && (
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-bg-elevated p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">ID</p>
            <p className="mt-1 font-mono tabular text-xs text-fg-muted break-all">{project.id}</p>
          </div>
          <DeleteForm id={project.id} />
        </aside>
      )}
    </div>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" fullWidth leftIcon={<Trash2 className="h-4 w-4" />} loading={pending}>
      Delete project
    </Button>
  );
}

function DeleteForm({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        await deletePortfolioAction(id);
      }}
      onSubmit={(e) => {
        if (!confirm('Delete this project permanently?')) {
          e.preventDefault();
        }
      }}
      className="rounded-xl border border-danger/30 bg-danger/5 p-5"
    >
      <p className="text-sm font-semibold text-fg">Danger zone</p>
      <p className="mt-1 text-xs text-fg-muted">Deletion is permanent and not reversible from the UI.</p>
      <div className="mt-3">
        <DeleteButton />
      </div>
    </form>
  );
}
