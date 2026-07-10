'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Ban, Loader2, Power, RotateCcw, Send, X } from 'lucide-react';
import {
  setStaffStatusAction,
  offboardStaffAction,
  type AdminStaffState,
} from '@/lib/admin/staff-actions';

const INITIAL: AdminStaffState = { status: 'idle' };

type Mode = 'suspend' | 'fire';

// Default letter text per action. Admin can edit any of it before sending.
function letterDefaults(mode: Mode, fullName: string) {
  const first = fullName.split(' ')[0] || 'there';
  if (mode === 'fire') {
    return {
      subject: 'Conclusion of your engagement — Highscore Tech',
      body: `Dear ${first},

Thank you for the work you brought to Highscore Tech.

After careful thought, we've decided to end your engagement with Highscore Tech, effective today. The expectations of the role were not met, and we believe parting ways now is the right step for both sides. This is not a reflection of your talent.

We'll gladly settle any outstanding dues for work you've completed. Please continue to treat any company information you accessed as confidential; your access will be deactivated shortly.

We wish you the very best ahead.

Warm regards,
Victor Otung
Chief Executive Officer · Highscore Tech`,
    };
  }
  return {
    subject: 'Notice of suspension — Highscore Tech',
    body: `Dear ${first},

This is to notify you that your engagement with Highscore Tech is suspended, effective today, pending review.

During the suspension, your access to the staff portal is paused. We will be in touch regarding the next steps.

If you have any questions, simply reply to this email.

Regards,
Victor Otung
Chief Executive Officer · Highscore Tech`,
  };
}

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-10 items-center gap-2 px-4 rounded-md text-paper text-sm font-semibold hover:opacity-90 disabled:opacity-50 ${
        mode === 'fire' ? 'bg-danger' : 'bg-warning'
      }`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {mode === 'fire' ? 'Send letter & fire' : 'Send letter & suspend'}
    </button>
  );
}

export function StaffStatusControls({
  staffId,
  status,
  fullName,
  workEmail,
  personalEmail,
}: {
  staffId: string;
  status: 'active' | 'former';
  fullName: string;
  workEmail: string | null;
  personalEmail: string | null;
}) {
  const [reinstating, startReinstate] = useTransition();
  const [mode, setMode] = useState<Mode | null>(null);
  const [state, formAction] = useActionState(offboardStaffAction, INITIAL);

  // Close the modal once the action succeeds (the page revalidates and the
  // card flips to the Reinstate control).
  useEffect(() => {
    if (state.status === 'success') setMode(null);
  }, [state.status]);

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  if (status !== 'active') {
    return (
      <div className="space-y-3">
        <button
          type="button"
          disabled={reinstating}
          onClick={() => {
            if (!confirm('Reinstate this staff member to ACTIVE? They will regain portal access.')) return;
            startReinstate(async () => { await setStaffStatusAction(staffId, 'active'); });
          }}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-success text-paper text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {reinstating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          Reinstate
        </button>
        <p className="text-xs text-fg-subtle">Sets status back to <code className="font-mono text-fg-muted">active</code> and restores staff-portal access.</p>
      </div>
    );
  }

  const defaults = mode ? letterDefaults(mode, fullName) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('suspend')}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-warning text-paper text-sm font-semibold hover:opacity-90"
        >
          <Ban className="h-4 w-4" /> Suspend
        </button>
        <button
          type="button"
          onClick={() => setMode('fire')}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-danger text-paper text-sm font-semibold hover:opacity-90"
        >
          <Power className="h-4 w-4" /> Fire
        </button>
      </div>
      <p className="text-xs text-fg-subtle">
        Both set <code className="font-mono text-fg-muted">status=&apos;former&apos;</code> (portal access ends) and email a letter to the staff member&apos;s personal email with a signed PDF copy. Suspend is reversible via Reinstate.
      </p>

      {mode && defaults && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
          <div className="mt-10 w-full max-w-xl rounded-lg border border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-display text-lg font-bold text-fg">
                {mode === 'fire' ? 'Fire' : 'Suspend'} {fullName}
              </h3>
              <button type="button" onClick={() => setMode(null)} className="text-fg-subtle hover:text-fg" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* key by mode so switching action resets the default letter */}
            <form key={mode} action={formAction} className="space-y-4 p-5">
              <input type="hidden" name="staff_id" value={staffId} />
              <input type="hidden" name="mode" value={mode} />

              {state.status === 'error' && !fieldErrors && (
                <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-fg">{state.message}</p>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-semibold text-fg-muted">Staff personal email</span>
                <input
                  name="personal_email"
                  type="email"
                  required
                  readOnly={!!personalEmail}
                  defaultValue={personalEmail ?? ''}
                  placeholder={workEmail ? `e.g. their personal address (work: ${workEmail})` : 'name@personal-email.com'}
                  className={`mt-1 w-full rounded-md border border-border px-3 py-2 text-sm text-fg outline-none focus:border-brand ${personalEmail ? 'bg-surface-hover cursor-not-allowed' : 'bg-bg'}`}
                />
                <span className="mt-1 block text-xs text-fg-subtle">
                  {personalEmail
                    ? 'The letter goes to the personal email on file.'
                    : 'No personal email on file — enter the address to send the letter to.'}
                </span>
                {fieldErrors?.personal_email && <span className="mt-1 block text-xs text-danger">{fieldErrors.personal_email}</span>}
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-fg-muted">Subject</span>
                <input
                  name="subject"
                  type="text"
                  required
                  defaultValue={defaults.subject}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-brand"
                />
                {fieldErrors?.subject && <span className="mt-1 block text-xs text-danger">{fieldErrors.subject}</span>}
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-fg-muted">Letter (email body + signed PDF)</span>
                <textarea
                  name="body"
                  required
                  rows={12}
                  defaultValue={defaults.body}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-brand font-mono leading-relaxed"
                />
                {fieldErrors?.body && <span className="mt-1 block text-xs text-danger">{fieldErrors.body}</span>}
              </label>

              <p className="text-xs text-fg-subtle">
                The signed PDF carries the CEO&apos;s uploaded signature. Sending sets this staff member to <span className="font-semibold text-danger">former</span>.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setMode(null)} className="inline-flex h-10 items-center px-4 rounded-md border border-border text-sm font-semibold text-fg-muted hover:text-fg">
                  Cancel
                </button>
                <SubmitButton mode={mode} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
