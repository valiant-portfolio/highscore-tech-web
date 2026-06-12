'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Textarea, Select, Button } from '@/components/ui';
import { submitStaffReportAction } from '@/lib/admin/staff-actions';

const INITIAL = { status: 'idle' } as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Send className="h-4 w-4" />}>
      Submit report
    </Button>
  );
}

export function StaffReportForm() {
  const [state, formAction] = useActionState(submitStaffReportAction, INITIAL as ReturnType<typeof submitStaffReportAction> extends Promise<infer T> ? T : never);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4">
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
        label="Kind of report"
        defaultValue="sod"
        options={[
          // 'eod' intentionally removed: the team EOD is now compiled
          // by Olivia from her own form (see TeamEodForm.tsx).
          { value: 'sod', label: 'SOD — Start of day (what you plan to do today)' },
          { value: 'general', label: 'General (anything that needs a paper trail)' },
        ]}
      />
      <Textarea
        name="content"
        label="Report"
        required
        rows={8}
        placeholder={`Plan for today:\n• \n• \n• \n\nBlockers:\n• `}
        error={fieldErrors?.content}
      />
      <SubmitButton />
    </form>
  );
}
