'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { Textarea, Select, Button } from '@/components/ui';
import { adminCreateReportAction, type AdminStaffState } from '@/lib/admin/staff-actions';

const INITIAL: AdminStaffState = { status: 'idle' };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Save className="h-4 w-4" />}>
      Save override report
    </Button>
  );
}

export function AdminReportForm({ staffId }: { staffId: string }) {
  const [state, formAction] = useActionState(adminCreateReportAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="staff_id" value={staffId} />

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

      <Select
        name="kind"
        label="Kind"
        defaultValue="general"
        options={[
          { value: 'sod', label: 'SOD (Start of day)' },
          { value: 'eod', label: 'EOD (End of day)' },
          { value: 'general', label: 'General' },
        ]}
      />
      <Textarea
        name="content"
        label="Report content"
        rows={6}
        required
        placeholder="Save the day with what the staff would have written, in their voice."
      />
      <SaveButton />
      <p className="text-xs text-fg-subtle">
        Saved with <code className="font-mono">is_admin_override = true</code> so it's clear in the audit trail this was filed by you on their behalf.
      </p>
    </form>
  );
}
