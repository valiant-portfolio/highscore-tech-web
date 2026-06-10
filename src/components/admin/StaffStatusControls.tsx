'use client';

import { useTransition } from 'react';
import { Loader2, Power, RotateCcw } from 'lucide-react';
import { setStaffStatusAction } from '@/lib/admin/staff-actions';

export function StaffStatusControls({ staffId, status }: { staffId: string; status: 'active' | 'former' }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {status === 'active' ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm('Set this staff member to FORMER? They will lose portal access immediately. You can reinstate them later.')) return;
            startTransition(async () => { await setStaffStatusAction(staffId, 'former'); });
          }}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-danger text-paper text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
          Fire / suspend
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm('Reinstate this staff member to ACTIVE? They will regain portal access.')) return;
            startTransition(async () => { await setStaffStatusAction(staffId, 'active'); });
          }}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-success text-paper text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          Reinstate
        </button>
      )}
      <p className="text-xs text-fg-subtle">
        Fire/suspend sets <code className="font-mono text-fg-muted">status='former'</code>. Their auth login still exists but middleware will bounce them out of the staff portal.
      </p>
    </div>
  );
}
