'use client';

// Admin-only editor for a staff member's admin-panel access. Ticking a section
// lets them open that sidebar area and use its actions. Saving writes the full
// set. Only real admins ever see this card (the page gates it).

import { useState, useTransition } from 'react';
import { Loader2, ShieldCheck, Check } from 'lucide-react';
import { ADMIN_SECTIONS } from '@/lib/admin/sections';
import { setStaffSectionsAction } from '@/lib/admin/staff-actions';

export function StaffAccessCard({
  staffUserId,
  firstName,
  initialSections,
  hasAccount,
}: {
  staffUserId: string | null;
  firstName: string;
  initialSections: string[];
  hasAccount: boolean;
}) {
  const [granted, setGranted] = useState<Set<string>>(new Set(initialSections));
  const [saved, setSaved] = useState<Set<string>>(new Set(initialSections));
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty =
    granted.size !== saved.size || [...granted].some((k) => !saved.has(k));

  const toggle = (key: string) => {
    setNote(null);
    setGranted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const save = () =>
    startTransition(async () => {
      const res = await setStaffSectionsAction(staffUserId ?? '', [...granted]);
      if (res.ok) {
        setSaved(new Set(granted));
        setNote({ ok: true, text: granted.size === 0 ? `${firstName} now has no admin access.` : `Saved. ${firstName} can access ${granted.size} area${granted.size === 1 ? '' : 's'}.` });
      } else {
        setNote({ ok: false, text: res.error ?? 'Could not save.' });
      }
    });

  return (
    <div className="p-5 md:p-6">
      <h2 className="font-display text-lg md:text-xl font-bold text-fg inline-flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-brand" /> Admin access
      </h2>
      <p className="mt-1 text-sm text-fg-muted">
        By default staff have no admin access. Tick the areas {firstName} may open in the admin panel.
        Each area includes its actions (e.g. Portfolio lets them add, edit and delete projects).
      </p>

      {!hasAccount && (
        <div className="mt-4 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-fg-muted">
          {firstName} hasn&apos;t signed in yet. Access can be granted once they log in with their work email at least once.
        </div>
      )}

      <div className="mt-5 grid sm:grid-cols-2 gap-2">
        {ADMIN_SECTIONS.map((s) => {
          const on = granted.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              disabled={!hasAccount || pending}
              onClick={() => toggle(s.key)}
              className={[
                'flex items-center gap-2.5 px-3 h-11 rounded-md border text-sm font-semibold text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                on
                  ? 'border-brand/50 bg-brand-tint text-brand'
                  : 'border-border bg-surface/60 text-fg-muted hover:bg-surface-hover',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                  on ? 'border-brand bg-brand text-brand-fg' : 'border-border',
                ].join(' ')}
              >
                {on && <Check className="h-3.5 w-3.5" />}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {note && (
        <p className={`mt-4 text-xs font-semibold ${note.ok ? 'text-success' : 'text-danger'}`}>{note.text}</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          disabled={!hasAccount || pending || !dirty}
          onClick={save}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Save access
        </button>
        {dirty && !pending && (
          <button
            type="button"
            onClick={() => { setGranted(new Set(saved)); setNote(null); }}
            className="text-sm font-semibold text-fg-muted hover:text-fg"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
