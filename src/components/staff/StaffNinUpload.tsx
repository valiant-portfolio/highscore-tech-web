'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Upload, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { uploadStaffNinAction, type NinUploadState } from '@/lib/staff/nin-actions';

const INITIAL: NinUploadState = { status: 'idle' };

interface Props {
  alreadyUploaded: boolean;
}

function SubmitButton({ replacing }: { replacing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Upload className="h-4 w-4" />}>
      {replacing ? 'Replace NIN' : 'Upload NIN'}
    </Button>
  );
}

export function StaffNinUpload({ alreadyUploaded }: Props) {
  const [state, formAction] = useActionState(uploadStaffNinAction, INITIAL);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;
  const uploaded = alreadyUploaded || state.status === 'success';

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-4">
      {uploaded && (
        <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
          <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <div className="text-fg">
            <p className="font-semibold">NIN on file.</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              Only admin can view it. Replace below if you uploaded the wrong file.
            </p>
          </div>
        </div>
      )}
      {state.status === 'error' && !fieldErrors && (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <label className="flex items-center gap-3 px-4 py-3 rounded-md border-2 border-dashed border-border bg-surface/40 hover:bg-surface-hover cursor-pointer transition-colors">
        <Upload className="h-5 w-5 text-brand" />
        <span className="text-sm text-fg-muted">
          <span className="font-semibold text-fg">Click to upload</span> · JPG / PNG / PDF, max 5 MB
        </span>
        <input
          type="file"
          name="nin_doc"
          accept="image/jpeg,image/png,application/pdf"
          required
          className="sr-only"
          onChange={(e) => {
            const label = e.target.parentElement?.querySelector('span span') as HTMLSpanElement | null;
            if (label && e.target.files?.[0]) label.textContent = e.target.files[0].name;
          }}
        />
      </label>
      {fieldErrors?.nin_doc && <p className="text-xs text-danger">{fieldErrors.nin_doc}</p>}

      <SubmitButton replacing={uploaded} />
    </form>
  );
}
