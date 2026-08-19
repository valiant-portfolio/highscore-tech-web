'use client';

// The Studio order form. A church brief is not a business brief is not a
// birthday brief — so the questions BRANCH on project type rather than asking
// everyone the same generic "describe your project".
//
// The client never sends a price. It posts a packageKey and the server prices
// it from the catalogue (see createStudioOrder).

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import {
  PACKAGES, PACKAGE_BY_KEY, PROJECT_TYPES, PROJECT_TYPE_BY_KEY, DELIVERY_CHANNELS,
  type ProjectType,
} from '@/lib/studio/catalog';
import { COUNTRIES, NIGERIA } from '@/lib/studio/countries';
import { createStudioOrder, type OrderFormState } from '@/lib/studio/actions';
import { cn } from '@/lib/utils';

const INITIAL: OrderFormState = { status: 'idle' };

function SubmitButton({ amount }: { amount: number | null }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth loading={pending} rightIcon={pending ? undefined : <ArrowRight className="h-4 w-4" />}>
      {pending ? 'Creating your order…' : amount != null ? `Continue to payment — $${amount}` : 'Continue to payment'}
    </Button>
  );
}

export function OrderForm({ initialPackage }: { initialPackage?: string }) {
  const [state, formAction] = useActionState(createStudioOrder, INITIAL);

  const [packageKey, setPackageKey] = useState(
    initialPackage && PACKAGE_BY_KEY[initialPackage] ? initialPackage : '',
  );
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [country, setCountry] = useState(NIGERIA);
  const [channel, setChannel] = useState<string>('whatsapp');

  const pkg = packageKey ? PACKAGE_BY_KEY[packageKey] : undefined;
  const typeDef = projectType ? PROJECT_TYPE_BY_KEY[projectType] : undefined;
  const channelDef = useMemo(
    () => DELIVERY_CHANNELS.find((c) => c.key === channel) ?? DELIVERY_CHANNELS[0],
    [channel],
  );

  // Surface server-side validation without stranding the user at the bottom.
  useEffect(() => {
    if (state.status === 'error') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state]);

  return (
    <form action={formAction} className="space-y-10">
      {state.status === 'error' && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-fg">{state.message}</p>
        </div>
      )}

      {/* ── 1. Package ─────────────────────────────────────────── */}
      <Step n={1} title="What do you want made?" hint="Pick the package. You can always add more later.">
        <input type="hidden" name="packageKey" value={packageKey} />
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PACKAGES.map((p) => {
            const active = p.key === packageKey;
            return (
              <button
                type="button"
                key={p.key}
                onClick={() => setPackageKey(p.key)}
                aria-pressed={active}
                className={cn(
                  'text-left rounded-xl border p-4 transition-colors',
                  active ? 'border-warning bg-warning/10' : 'border-border bg-surface hover:bg-surface-hover',
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-fg">{p.name}</span>
                  <span className="font-display font-extrabold tabular-nums text-warning whitespace-nowrap">
                    {p.from && <span className="text-[11px] font-semibold text-fg-subtle mr-1">from</span>}
                    ${p.priceUsd}{p.monthly && <span className="text-xs font-semibold text-fg-muted">/mo</span>}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-fg-muted leading-relaxed">{p.blurb}</span>
                {active && (
                  <span className="mt-3 block border-t border-warning/25 pt-2.5">
                    {p.includes.map((line) => (
                      <span key={line} className="flex gap-2 text-xs text-fg-muted leading-relaxed mt-1">
                        <Check className="h-3.5 w-3.5 shrink-0 mt-px text-success" aria-hidden="true" />
                        {line}
                      </span>
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {state.fieldErrors?.packageKey && (
          <p className="mt-2 text-xs text-danger">{state.fieldErrors.packageKey}</p>
        )}
      </Step>

      {/* ── 2. Project type → branching brief ──────────────────── */}
      <Step n={2} title="What is it for?" hint="We ask different questions depending on the job.">
        <input type="hidden" name="projectType" value={projectType} />
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {PROJECT_TYPES.map((t) => {
            const active = t.key === projectType;
            return (
              <button
                type="button"
                key={t.key}
                onClick={() => setProjectType(t.key)}
                aria-pressed={active}
                className={cn(
                  'text-left rounded-xl border p-4 transition-colors',
                  active ? 'border-warning bg-warning/10' : 'border-border bg-surface hover:bg-surface-hover',
                )}
              >
                <span className="block font-semibold text-fg">{t.label}</span>
                <span className="mt-1 block text-xs text-fg-muted leading-relaxed">{t.tagline}</span>
              </button>
            );
          })}
        </div>
        {state.fieldErrors?.projectType && (
          <p className="mt-2 text-xs text-danger">{state.fieldErrors.projectType}</p>
        )}

        {typeDef && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-5 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-warning">
              About your {typeDef.label.toLowerCase()} job
            </p>
            {typeDef.fields.map((f) => {
              // Namespaced so the server can collect the brief without knowing
              // which type was picked.
              const name = `brief__${f.name}`;
              if (f.type === 'textarea') {
                return (
                  <Textarea key={f.name} name={name} label={f.label} required={f.required}
                    placeholder={f.placeholder} helper={f.hint} rows={4} />
                );
              }
              if (f.type === 'select') {
                return (
                  <Select key={f.name} name={name} label={f.label} required={f.required}
                    placeholder="Pick one" helper={f.hint}
                    options={(f.options ?? []).map((o) => ({ value: o, label: o }))} />
                );
              }
              return (
                <Input key={f.name} name={name} label={f.label} required={f.required}
                  type={f.type === 'date' ? 'date' : 'text'}
                  placeholder={f.placeholder} helper={f.hint} />
              );
            })}
          </div>
        )}
      </Step>

      {/* ── 3. Your details ────────────────────────────────────── */}
      <Step n={3} title="Who are we making it for?">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="customerName" label="Your name" required autoComplete="name"
            placeholder="Jane Doe" error={state.fieldErrors?.customerName} />
          <Input name="customerEmail" type="email" label="Email" required autoComplete="email"
            placeholder="jane@example.com" helper="Your receipt and invoice go here."
            error={state.fieldErrors?.customerEmail} />
          <Select name="country" label="Country" required value={country}
            onChange={(e) => setCountry(e.target.value)}
            options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            helper={country === NIGERIA ? 'You’ll pay with ALAT by Wema.' : 'You’ll pay by card.'}
            error={state.fieldErrors?.country} />
          <Input name="neededBy" type="date" label="When do you need it?"
            helper="Leave blank if it isn’t urgent." error={state.fieldErrors?.neededBy} />
        </div>
      </Step>

      {/* ── 4. Delivery ────────────────────────────────────────── */}
      <Step n={4} title="Where should we send the finished work?">
        <input type="hidden" name="deliveryChannel" value={channel} />
        <div className="flex flex-wrap gap-2.5">
          {DELIVERY_CHANNELS.map((c) => {
            const active = c.key === channel;
            return (
              <button
                type="button"
                key={c.key}
                onClick={() => setChannel(c.key)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-11 items-center rounded-lg border px-5 text-sm font-semibold transition-colors',
                  active ? 'border-warning bg-warning/10 text-fg' : 'border-border bg-surface text-fg-muted hover:text-fg',
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <Input
            name="deliveryHandle"
            label={`Your ${channelDef.label}`}
            required
            placeholder={channelDef.placeholder}
            error={state.fieldErrors?.deliveryHandle}
          />
        </div>
      </Step>

      {/* ── Summary + submit ───────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg-subtle">Your order</p>
            <p className="mt-1 font-semibold text-fg">{pkg ? pkg.name : 'No package selected yet'}</p>
          </div>
          <p className="font-display text-3xl font-extrabold tabular-nums text-warning">
            {pkg ? `$${pkg.priceUsd}` : '—'}
          </p>
        </div>
        <p className="py-4 text-xs text-fg-muted leading-relaxed">
          {pkg?.from && 'This is a starting price — we confirm the final quote for bigger campaigns before any extra work begins. '}
          {pkg?.monthly && 'Billed monthly, cancel any time. '}
          After payment you get your delivery date and an invoice to download.
        </p>
        <SubmitButton amount={pkg?.priceUsd ?? null} />
      </div>
    </form>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning text-ink font-display text-sm font-extrabold">
          {n}
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-fg">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-fg-muted">{hint}</p>}
        </div>
      </div>
      <div className="mt-5 sm:pl-10">{children}</div>
    </section>
  );
}
