'use client';

import { useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  uploadStaffPhotoAction, deleteStaffPhotoAction, type AdminStaffState,
} from '@/lib/admin/staff-actions';

const INITIAL: AdminStaffState = { status: 'idle' };

interface Props {
  staffId: string;
  photoPublicUrl: string | null;
  fullName: string;
}

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} rightIcon={pending ? undefined : <Upload className="h-4 w-4" />}>
      Upload
    </Button>
  );
}

export function StaffPhotoUpload({ staffId, photoPublicUrl, fullName }: Props) {
  const [state, formAction] = useActionState(uploadStaffPhotoAction, INITIAL);
  const [pending, startTransition] = useTransition();
  const url = state.status === 'success' ? `${photoPublicUrl ?? ''}?t=${Date.now()}` : photoPublicUrl;

  return (
    <div className="space-y-4">
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

      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-surface-hover">
          {url ? (
            <img src={url} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <div
              className="absolute inset-0 grid place-items-center text-bg font-extrabold text-2xl"
              style={{ background: 'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)' }}
            >
              {fullName.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <form action={formAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="staff_id" value={staffId} />
            <label className="inline-flex items-center gap-2 px-3 h-10 rounded-md border border-border bg-surface/60 hover:bg-surface-hover cursor-pointer text-sm font-semibold text-fg-muted">
              <Upload className="h-4 w-4" />
              Choose photo
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                required
                className="sr-only"
                onChange={(e) => {
                  const label = e.target.parentElement?.querySelector('span.filename') as HTMLSpanElement | null;
                  if (label && e.target.files?.[0]) label.textContent = ` ${e.target.files[0].name}`;
                }}
              />
              <span className="filename text-fg-subtle"></span>
            </label>
            <UploadButton />
          </form>
          {photoPublicUrl && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm('Remove this photo?')) return;
                startTransition(async () => { await deleteStaffPhotoAction(staffId); });
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger hover:underline disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove photo
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-fg-subtle">
        Square crop, auto-resized to 600×600. JPG / PNG / WebP, up to 5 MB. Bucket is public so it embeds in the ID card PDF without a signed URL.
      </p>
    </div>
  );
}
