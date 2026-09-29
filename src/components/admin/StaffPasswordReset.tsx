'use client';

// Admin-set password reset for a staff member.
//
// Two decisions worth keeping:
//
//   1. The password is shown ONCE, here, and nowhere else. It is not emailed
//      and not written to the audit log. Emailing a plaintext password puts a
//      live credential in two mailboxes forever, and an audit log that records
//      what a password was set to is a list of working logins.
//
//   2. Generating is the default path and typing is the fallback. An admin
//      inventing a password under time pressure produces "Password123", and
//      that becomes the staff member's real credential until they change it —
//      which most never do.
//
// The staff member should change it after signing in; the copy block says so.

import { useState, useTransition } from 'react';
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { resetStaffPasswordAction } from '@/lib/admin/staff-actions';

// Ambiguous characters are left out on purpose: this password gets read off a
// screen and typed by hand, or dictated over a call. O/0 and l/1/I are where
// that goes wrong.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function generatePassword(length = 16): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function StaffPasswordReset({
  staffId,
  fullName,
  workEmail,
  hasAccount,
}: {
  staffId: string;
  fullName: string;
  workEmail: string | null;
  hasAccount: boolean;
}) {
  const [value, setValue] = useState('');
  const [reveal, setReveal] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);   // the password just set
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  if (!hasAccount) {
    return (
      <p className="text-xs text-fg-subtle">
        This staff member has no sign-in account, so there is no password to reset.
      </p>
    );
  }

  const submit = () => {
    setErr(null);
    const pw = value;
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (!confirm(
      `Reset the password for ${fullName}?\n\n`
      + `They will be signed out of any existing session and must use the new password.`,
    )) return;

    start(async () => {
      const res = await resetStaffPasswordAction(staffId, pw);
      if (res.ok) { setDone(pw); setValue(''); setReveal(false); }
      else setErr(res.message);
    });
  };

  const copy = async () => {
    if (!done) return;
    try {
      await navigator.clipboard.writeText(done);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked; the password is on screen to read */ }
  };

  // ── After a successful reset: show it once, then it is gone ──────────────
  if (done) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-success/40 bg-success/5 p-3">
          <p className="text-xs font-semibold text-success">Password reset for {fullName}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 select-all rounded bg-surface-hover px-2 py-1.5 font-mono text-sm tracking-wide text-fg">
              {done}
            </code>
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg"
              aria-label="Copy password"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
            Shown once. It is not emailed and not stored anywhere — leave this page and it is
            gone. Send it to {workEmail ? <span className="font-mono">{workEmail}</span> : 'them'} by
            a channel you trust, and tell them to change it after signing in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDone(null)}
          className="text-xs text-fg-subtle underline hover:text-fg"
        >
          Done
        </button>
      </div>
    );
  }

  // ── Before: generate or type one ─────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={reveal ? 'text' : 'password'}
            value={value}
            onChange={(e) => { setValue(e.target.value); setErr(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="New password"
            autoComplete="new-password"
            disabled={pending}
            className="h-10 w-full rounded-md border border-border bg-bg px-3 pr-10 font-mono text-sm text-fg outline-none focus:border-brand disabled:opacity-50"
          />
          {value && (
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg"
              aria-label={reveal ? 'Hide password' : 'Show password'}
            >
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setValue(generatePassword()); setReveal(true); setErr(null); }}
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-fg-muted hover:text-fg disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" /> Generate
        </button>
      </div>

      {err && <p className="text-xs text-danger">{err}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending || value.length < 8}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-warning px-4 text-sm font-semibold text-paper hover:opacity-90 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        Reset password
      </button>

      <p className="text-xs text-fg-subtle">
        Signs them out everywhere. The new password is shown once so you can pass it on —
        it is never emailed and never stored.
      </p>
    </div>
  );
}
