'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { amendStaffAction, type AdminStaffState } from '@/lib/admin/staff-actions';
import type { AdminStaffFull } from '@/lib/admin/staff-queries';

const INITIAL: AdminStaffState = { status: 'idle' };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Save className="h-4 w-4" />}>
      Save changes
    </Button>
  );
}

export function StaffAmendForm({ staff }: { staff: AdminStaffFull }) {
  const [state, formAction] = useActionState(amendStaffAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="staff_id" value={staff.id} />

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

      <Input name="full_name"  label="Full name" required defaultValue={staff.full_name}  error={fieldErrors?.full_name} />
      <Input name="role_title" label="Role"      required defaultValue={staff.role_title} error={fieldErrors?.role_title} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input name="department" label="Department" defaultValue={staff.department ?? ''} />
        <Input name="salary_ngn" label="Salary (₦, monthly)" type="number" min={0} required defaultValue={staff.salary_ngn} error={fieldErrors?.salary_ngn} />
        <Input name="start_date" label="Start date" type="date" defaultValue={staff.start_date ?? ''} />
        <Input name="work_email" label="Work email (login)" type="email" defaultValue={staff.work_email ?? ''} helper="Changing this also changes their login identifier." />
      </div>

      <SaveButton />

      <p className="text-xs text-fg-subtle">
        Changes that actually differ from the current values trigger a notification email to the staff member at their work_email.
      </p>
    </form>
  );
}
