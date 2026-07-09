'use client';

import { useState, useTransition } from 'react';
import { Loader2, Reply, Send } from 'lucide-react';
import { updateContactStatusAction, replyToContactAction } from '@/lib/admin/actions';

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

// ── Reply ────────────────────────────────────────────────────────────────
// Emails the sender and marks the thread `replied`. Body supports blank-line
// paragraphs and **bold**, same as the staff letters.
export function ContactReplyForm({
  id, name, subject,
}: {
  id: string;
  name: string;
  subject: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [subj, setSubj] = useState(subject ? `Re: ${subject}` : 'Re: Your enquiry');
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex h-8 items-center gap-1.5 px-3 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg disabled:opacity-50"
      >
        <Reply className="h-3.5 w-3.5" />
        Reply
      </button>
    );
  }

  const send = () =>
    startTransition(async () => {
      const res = await replyToContactAction(id, subj, body);
      if (res.ok) {
        setNote({ ok: true, text: `Reply sent to ${name}.` });
        setBody('');
        setOpen(false);
      } else {
        setNote({ ok: false, text: res.error ?? 'Could not send the reply.' });
      }
    });

  const input =
    'w-full rounded-md border border-border bg-surface/60 px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand/40';

  return (
    <div className="mt-3 space-y-2">
      <input
        type="text"
        value={subj}
        onChange={(e) => setSubj(e.target.value)}
        placeholder="Subject"
        className={input}
      />
      <textarea
        rows={6}
        value={body}
        onChange={(e) => { setBody(e.target.value); setNote(null); }}
        placeholder={`Write your reply to ${name}…`}
        className={`${input} resize-y`}
      />
      <p className="text-xs text-fg-subtle">
        Blank line starts a new paragraph. Wrap text in **asterisks** for bold. Their original message is quoted below your reply.
      </p>

      {note && (
        <p className={`text-xs font-semibold ${note.ok ? 'text-green-500' : 'text-red-500'}`}>{note.text}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending || !body.trim()}
          onClick={send}
          className="inline-flex h-8 items-center gap-1.5 px-3 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send reply
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => { setOpen(false); setNote(null); }}
          className="inline-flex h-8 items-center px-3 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
