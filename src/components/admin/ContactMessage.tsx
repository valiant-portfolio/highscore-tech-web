'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateContactStatusAction } from '@/lib/admin/actions';

interface Props {
  id: string;
  current: 'new' | 'read' | 'replied' | 'archived';
}

const NEXT: Record<Props['current'], Props['current'] | null> = {
  new:      'read',
  read:     'replied',
  replied:  'archived',
  archived: null,
};

export function ContactStatusButtons({ id, current }: Props) {
  const [pending, startTransition] = useTransition();
  const next = NEXT[current];

  return (
    <div className="inline-flex items-center gap-2">
      {next && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateContactStatusAction(id, next);
            })
          }
          className="inline-flex h-8 items-center gap-1.5 px-3 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Mark {next}
        </button>
      )}
      {current !== 'archived' && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateContactStatusAction(id, 'archived');
            })
          }
          className="inline-flex h-8 items-center px-3 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted disabled:opacity-50"
        >
          Archive
        </button>
      )}
    </div>
  );
}
