'use client';

// Admin form to provision a new staff member. After successful creation
// we render a credentials card the admin can copy and hand off — those
// credentials never appear again, so the admin should grab them right
// away.

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import {
  AlertCircle, ArrowRight, CheckCircle2, Copy, RefreshCw, UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { createStaffAction, type CreateStaffState } from '@/lib/admin/staff-actions';

const INITIAL: CreateStaffState = { status: 'idle' };

interface ReportsToOption {
  id: string;
  full_name: string;
  role_title: string;
}

interface Props {
  reportsToOptions: ReportsToOption[];
}

function makeDefaultPassword(slug: string): string {
  // Convention from the seed script: Highscore-<slug>. Admin can override.
  return `Highscore-${slug || 'team'}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} rightIcon={!pending ? <UserPlus className="h-4 w-4" /> : undefined}>
      {pending ? 'Creating…' : 'Create staff account'}
    </Button>
  );
}

export function StaffCreateForm({ reportsToOptions }: Props) {
  const [state, formAction] = useActionState(createStaffAction, INITIAL);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState(makeDefaultPassword(''));
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  function onNameInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      const auto = e.target.value
        .toLowerCase()
        .normalize('NFKD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(auto);
      setPassword(makeDefaultPassword(auto));
    }
  }

  function onSlugInput(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setSlug(e.target.value);
    setPassword(makeDefaultPassword(e.target.value));
  }

  function regeneratePassword() {
    // Randomised version of the default — 6 random alphanumerics suffix.
    const r = Math.random().toString(36).slice(2, 8);
    setPassword(`Highscore-${slug || 'team'}-${r}`);
  }

  async function copy(value: string, kind: 'email' | 'password') {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied((c) => (c === kind ? null : c)), 1500);
    } catch {
      /* ignore */
    }
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  // ── Success view: credentials ────────────────────────────────────────
  if (state.status === 'success' && state.credentials) {
    const { email, password: pw, slug: createdSlug, staffId } = state.credentials;
    return (
      <div className="space-y-5">
        <div className="rounded-md border border-success/30 bg-success/5 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-fg">Staff account created.</p>
            <p className="mt-1 text-sm text-fg-muted">
              These credentials are shown <strong className="text-fg">only once</strong>. Copy them now and hand to the new hire.
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-brand/40 bg-brand-tint/20 p-5 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-brand">Login credentials</p>

          <div>
            <p className="text-xs text-fg-subtle mb-1">Email</p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-base text-fg flex-1 truncate">{email}</code>
              <button
                type="button"
                onClick={() => copy(email, 'email')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-fg-muted"
                aria-label="Copy email"
              >
                {copied === 'email' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-fg-subtle mb-1">Password</p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-base text-fg flex-1 truncate">{pw}</code>
              <button
                type="button"
                onClick={() => copy(pw, 'password')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-fg-muted"
                aria-label="Copy password"
              >
                {copied === 'password' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-fg-muted border-t border-border pt-3">
            Tell them to sign in at <code className="font-mono text-brand">/login</code> with these credentials,
            then change their password under Settings → Change password.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/admin/staff/${staffId}`}
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover"
          >
            Open {createdSlug}'s record <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/staff/new"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
          >
            Add another
          </Link>
          <Link
            href="/admin/staff"
            className="inline-flex h-10 items-center text-sm font-semibold text-fg-muted hover:text-fg"
          >
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  // ── Form view ────────────────────────────────────────────────────────
  return (
    <form action={formAction} className="space-y-5">
      {state.status === 'error' && !fieldErrors && (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name *" name="full_name" error={fieldErrors?.full_name}>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="off"
            onChange={onNameInput}
            className="input-text"
          />
        </Field>

        <Field
          label="Slug *"
          name="slug"
          error={fieldErrors?.slug}
          hint="Used in URLs and default password. Lowercase, hyphens only."
        >
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            onChange={onSlugInput}
            pattern="[a-z0-9-]+"
            autoComplete="off"
            className="input-text font-mono"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Role title *" name="role_title" error={fieldErrors?.role_title}>
          <input
            id="role_title"
            name="role_title"
            type="text"
            required
            placeholder="e.g. Senior Developer"
            autoComplete="off"
            className="input-text"
          />
        </Field>

        <Field label="Department" name="department" error={fieldErrors?.department}>
          <input
            id="department"
            name="department"
            type="text"
            placeholder="e.g. Engineering"
            autoComplete="off"
            className="input-text"
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Work email *"
          name="work_email"
          error={fieldErrors?.work_email}
          hint="They sign in with this address."
        >
          <input
            id="work_email"
            name="work_email"
            type="email"
            required
            placeholder="firstname@highzcore.tech"
            autoComplete="off"
            className="input-text"
          />
        </Field>

        <Field
          label="Reports to"
          name="reports_to"
          hint="Direct line manager. Leave blank if they report straight to the CEO."
        >
          <select
            id="reports_to"
            name="reports_to"
            defaultValue=""
            className="input-text"
          >
            <option value="">— CEO —</option>
            {reportsToOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.full_name} ({opt.role_title})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Monthly salary (NGN) *"
          name="salary_ngn"
          error={fieldErrors?.salary_ngn}
        >
          <input
            id="salary_ngn"
            name="salary_ngn"
            type="number"
            required
            min={1}
            step={1000}
            placeholder="e.g. 350000"
            className="input-text font-mono"
          />
        </Field>

        <Field label="Start date *" name="start_date" error={fieldErrors?.start_date}>
          <input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="input-text font-mono"
          />
        </Field>
      </div>

      <Field
        label="Default password *"
        name="password"
        error={fieldErrors?.password}
        hint="Generated from the slug. Tell the new hire to change it on first login."
      >
        <div className="flex items-center gap-2">
          <input
            id="password"
            name="password"
            type="text"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="input-text font-mono flex-1"
          />
          <button
            type="button"
            onClick={regeneratePassword}
            className="inline-flex h-11 items-center gap-1.5 px-3 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-xs font-semibold text-fg-muted"
            aria-label="Regenerate"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Randomise
          </button>
        </div>
      </Field>

      <div className="pt-2">
        <SubmitButton />
      </div>

      <style jsx>{`
        :global(.input-text) {
          height: 44px;
          width: 100%;
          border-radius: 6px;
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          color: var(--c-fg);
          padding: 0 12px;
          font-size: 14px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label, name, error, hint, children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle block mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-fg-subtle">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
