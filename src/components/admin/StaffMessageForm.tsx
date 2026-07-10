'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Loader2, Mail, Send, X } from 'lucide-react';
import { sendStaffMessageAction, type AdminStaffState } from '@/lib/admin/staff-actions';

const INITIAL: AdminStaffState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-brand text-paper text-sm font-semibold hover:opacity-90 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      Send message
    </button>
  );
}

export function StaffMessageForm({
  staffId,
  fullName,
  workEmail,
  personalEmail,
}: {
  staffId: string;
  fullName: string;
  workEmail: string | null;
  personalEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(sendStaffMessageAction, INITIAL);
  const first = fullName.split(' ')[0] || 'there';

  const emailOptions = [
    personalEmail ? { value: personalEmail, label: `Personal — ${personalEmail}` } : null,
    workEmail ? { value: workEmail, label: `Work — ${workEmail}` } : null,
  ].filter(Boolean) as { value: string; label: string }[];

  // Close the modal on a successful send.
  useEffect(() => {
    if (state.status === 'success') setOpen(false);
  }, [state.status]);

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-brand text-paper text-sm font-semibold hover:opacity-90"
      >
        <Mail className="h-4 w-4" /> Send a message
      </button>
      <p className="text-xs text-fg-subtle">
        Emails {first} a plain message (no status change, no PDF) — pick their work or personal address. Supports{' '}
        <code className="font-mono text-fg-muted">**bold**</code>, blank lines for paragraphs, and single line breaks.
      </p>

      {state.status === 'success' && (
        <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
          <div className="mt-10 w-full max-w-xl rounded-lg border border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-display text-lg font-bold text-fg">Message {fullName}</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-fg-subtle hover:text-fg" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-4 p-5">
              <input type="hidden" name="staff_id" value={staffId} />

              {state.status === 'error' && !fieldErrors && (
                <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-fg">{state.message}</p>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-semibold text-fg-muted">Send to</span>
                {emailOptions.length > 0 ? (
                  <select
                    name="to_email"
                    required
                    defaultValue={emailOptions[0].value}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-brand"
                  >
                    {emailOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-fg-muted">
                    No email on file for {first}. Ask them to add a personal email, or set a work email in their HR record.
                  </p>
                )}
                {fieldErrors?.to_email && <span className="mt-1 block text-xs text-danger">{fieldErrors.to_email}</span>}
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-fg-muted">Subject (email subject line)</span>
                <input
                  name="subject"
                  type="text"
                  required
                  defaultValue=""
                  placeholder="e.g. Welcome back to Highscore Tech"
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-brand"
                />
                {fieldErrors?.subject && <span className="mt-1 block text-xs text-danger">{fieldErrors.subject}</span>}
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-fg-muted">Heading (big title in the email — optional, defaults to subject)</span>
                <input
                  name="heading"
                  type="text"
                  defaultValue=""
                  placeholder="e.g. Welcome Back"
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-brand"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-fg-muted">Message</span>
                <textarea
                  name="body"
                  required
                  rows={14}
                  defaultValue=""
                  placeholder={'Dear ' + first + ',\n\n**A bold heading**\nYour paragraph text...\n\nWarm regards,\nVictor Otung'}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-brand font-mono leading-relaxed"
                />
                {fieldErrors?.body && <span className="mt-1 block text-xs text-danger">{fieldErrors.body}</span>}
              </label>

              <p className="text-xs text-fg-subtle">
                Wrap a line in <code className="font-mono text-fg-muted">**stars**</code> to make it bold. Leave a blank line between paragraphs.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="inline-flex h-10 items-center px-4 rounded-md border border-border text-sm font-semibold text-fg-muted hover:text-fg">
                  Cancel
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
