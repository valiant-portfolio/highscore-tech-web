'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { updateCourseAction, type AdminFormState } from '@/lib/admin/actions';
import type { AdminCourseFull } from '@/lib/admin/queries';

interface Props {
  course: AdminCourseFull;
}

const INITIAL: AdminFormState = { status: 'idle' };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Save className="h-4 w-4" />}>
      Save
    </Button>
  );
}

export function CourseForm({ course }: Props) {
  const [state, formAction] = useActionState(updateCourseAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5 max-w-[920px]">
      <input type="hidden" name="id" value={course.id} />

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

      <Input name="title" label="Title" required defaultValue={course.title} error={fieldErrors?.title} />
      <Input label="Slug" value={course.slug} disabled helper="The slug is permanent — edits would break /academy/<slug> + syllabus PDFs." />

      <Textarea
        name="summary"
        label="Card summary"
        required
        rows={3}
        defaultValue={course.summary}
        error={fieldErrors?.summary}
      />
      <Textarea
        name="full_description"
        label="Long description (Markdown)"
        rows={10}
        defaultValue={course.full_description ?? ''}
        helper="Renders on the course detail page. Markdown supported."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input name="price_ngn" label="Price (₦)" type="number" required min={0} defaultValue={course.price_ngn} />
        <Input name="duration_weeks" label="Duration (weeks)" type="number" min={0} defaultValue={course.duration_weeks ?? ''} />
        <Select
          name="mode"
          label="Mode"
          defaultValue={course.mode}
          options={[
            { value: 'hybrid',  label: 'Hybrid (online + onsite)' },
            { value: 'online',  label: 'Online only' },
            { value: 'offline', label: 'Onsite only' },
          ]}
        />
        <Input name="level" label="Level" defaultValue={course.level ?? ''} placeholder="Beginner / Intermediate / Advanced" />
        <Input name="sort_order" label="Sort order" type="number" defaultValue={course.sort_order} />
      </div>

      <Textarea
        name="outcomes"
        label="Outcomes"
        rows={4}
        defaultValue={course.outcomes.join('\n')}
        helper="One outcome per line."
      />
      <Textarea
        name="prerequisites"
        label="Prerequisites"
        rows={3}
        defaultValue={course.prerequisites.join('\n')}
        helper="One per line."
      />

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={course.published} className="h-4 w-4 accent-[var(--brand)]" />
        <span className="text-fg">Published (visible on /academy)</span>
      </label>

      <SaveButton />
    </form>
  );
}
