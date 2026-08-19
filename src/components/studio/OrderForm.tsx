'use client';

// The Studio order form. A church brief is not a business brief is not a
// birthday brief — so the questions BRANCH on project type rather than asking
// everyone the same generic "describe your project".
//
// Layout: each step is its own card, with a sticky order summary alongside on
// desktop. Before, every field ran together in one tall column and the total sat
// so far down you couldn't see what you were buying while filling it in.
//
// The client never sends a price. It posts a packageKey and the server prices it
// from the catalogue (see createStudioOrder).

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, Check, Lock } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import {
  PACKAGES, PACKAGE_BY_KEY, PROJECT_TYPES, PROJECT_TYPE_BY_KEY, DELIVERY_CHANNELS,
  type ProjectType,
} from '@/lib/studio/catalog';
import { COUNTRIES, NIGERIA } from '@/lib/studio/countries';
import { createStudioOrder, type OrderFormState } from '@/lib/studio/actions';
import { cn } from '@/lib/utils';

const INITIAL: OrderFormState = { status: 'idle' };

// The catalogue's three tiers, so eleven packages read as a menu rather than a
// wall of equal-weight buttons.
const GROUPS: { id: 'start' | 'ladder' | 'reach'; label: string }[] = [
  { id: 'start',  label: 'Start here' },
  { id: 'ladder', label: 'Bigger packages' },
  { id: 'reach',  label: 'Reach further — broadcast, outdoor, Google & ads' },
];

function SubmitButton({ amount }: { amount: number | null }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth loading={pending}
      rightIcon={pending ? undefined : <ArrowRight className="h-4 w-4" />}>
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

  useEffect(() => {
    if (state.status === 'error') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state]);

  return (
    <form action={formAction}>
      {state.status === 'error' && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-fg">{state.message}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8 items-start">
        {/* ── Steps ──────────────────────────────────────────────── */}
        <div className="space-y-5 min-w-0">

          <Step n={1} title="What do you want made?" hint="Pick one. You can always add more later.">
            <input type="hidden" name="packageKey" value={packageKey} />
            <div className="space-y-5">
              {GROUPS.map((g) => (
                <div key={g.id}>
                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-subtle">{g.label}</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {PACKAGES.filter((p) => p.group === g.id).map((p) => {
                      const active = p.key === packageKey;
                      return (
                        <button
                          type="button"
                          key={p.key}
                          onClick={() => setPackageKey(p.key)}
                          aria-pressed={active}
                          className={cn(
                            'text-left rounded-xl border p-3.5 transition-colors',
                            active
                              ? 'border-brand bg-brand-tint'
                              : 'border-border bg-bg-elevated hover:border-border-strong',
                          )}
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-fg text-sm leading-tight">{p.name}</span>
                            <span className="font-display font-extrabold tabular-nums text-brand whitespace-nowrap text-sm">
                              {p.from && <span className="text-[10px] font-semibold text-fg-subtle mr-0.5">from</span>}
                              ${p.priceUsd}{p.monthly && <span className="text-[11px] font-semibold text-fg-muted">/mo</span>}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs text-fg-muted leading-relaxed">{p.blurb}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {state.fieldErrors?.packageKey && (
              <p className="mt-3 text-xs text-danger">{state.fieldErrors.packageKey}</p>
            )}
          </Step>

          <Step n={2} title="What is it for?" hint="We ask different questions depending on the job.">
            <input type="hidden" name="projectType" value={projectType} />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PROJECT_TYPES.map((t) => {
                const active = t.key === projectType;
                return (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => setProjectType(t.key)}
                    aria-pressed={active}
                    className={cn(
                      'text-left rounded-xl border p-3.5 transition-colors',
                      active
                        ? 'border-brand bg-brand-tint'
                        : 'border-border bg-bg-elevated hover:border-border-strong',
                    )}
                  >
                    <span className="block font-semibold text-fg text-sm">{t.label}</span>
                    <span className="mt-1 block text-xs text-fg-muted leading-relaxed">{t.tagline}</span>
                  </button>
                );
              })}
            </div>
            {state.fieldErrors?.projectType && (
              <p className="mt-3 text-xs text-danger">{state.fieldErrors.projectType}</p>
            )}
          </Step>

          {/* The brief only exists once a type is chosen, so it gets its own card
              rather than padding out step 2. */}
          {typeDef && (
            <Step n={3} title={`Tell us about your ${typeDef.label.toLowerCase()} job`}
              hint="The details are what make it feel written for you.">
              <div className="grid gap-4 sm:grid-cols-2">
                {typeDef.fields.map((f) => {
                  // Namespaced so the server can collect the brief without
                  // knowing which type was picked.
                  const name = `brief__${f.name}`;
                  if (f.type === 'textarea') {
                    return (
                      <div key={f.name} className="sm:col-span-2">
                        <Textarea name={name} label={f.label} required={f.required}
                          placeholder={f.placeholder} helper={f.hint} rows={4} />
                      </div>
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
            </Step>
          )}

          <Step n={typeDef ? 4 : 3} title="Your details">
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

          <Step n={typeDef ? 5 : 4} title="Where should we send the finished work?">
            <input type="hidden" name="deliveryChannel" value={channel} />
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <div>
                <p className="mb-2 text-sm font-medium text-fg">Send it on</p>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_CHANNELS.map((c) => {
                    const active = c.key === channel;
                    return (
                      <button
                        type="button"
                        key={c.key}
                        onClick={() => setChannel(c.key)}
                        aria-pressed={active}
                        className={cn(
                          'inline-flex h-11 items-center rounded-lg border px-4 text-sm font-semibold transition-colors',
                          active
                            ? 'border-brand bg-brand-tint text-fg'
                            : 'border-border bg-bg-elevated text-fg-muted hover:text-fg',
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Input
                name="deliveryHandle"
                label={`Your ${channelDef.label}`}
                required
                placeholder={channelDef.placeholder}
                error={state.fieldErrors?.deliveryHandle}
              />
            </div>
          </Step>
        </div>

        {/* ── Sticky summary ─────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-fg-subtle">Your order</p>
            </div>

            <div className="p-5">
              {pkg ? (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold text-fg">{pkg.name}</p>
                    <p className="font-display text-2xl font-extrabold tabular-nums text-brand whitespace-nowrap">
                      ${pkg.priceUsd}
                    </p>
                  </div>
                  {pkg.monthly && <p className="mt-0.5 text-xs text-fg-subtle">per month, cancel any time</p>}

                  <ul className="mt-4 space-y-2 border-t border-border pt-4">
                    {pkg.includes.map((line) => (
                      <li key={line} className="flex gap-2 text-xs text-fg-muted leading-relaxed">
                        <Check className="h-3.5 w-3.5 shrink-0 mt-px text-success" aria-hidden="true" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-fg-muted">Pick a package in step 1 and it’ll show up here.</p>
              )}

              {typeDef && (
                <p className="mt-4 border-t border-border pt-3 text-xs text-fg-subtle">
                  For: <span className="font-semibold text-fg-muted">{typeDef.label}</span>
                </p>
              )}
            </div>

            <div className="border-t border-border bg-bg-elevated p-5">
              <p className="mb-3 text-xs text-fg-muted leading-relaxed">
                {pkg?.from && 'A starting price — we confirm the final quote for bigger campaigns before any extra work. '}
                After payment you get your delivery date and an invoice to download.
              </p>
              <SubmitButton amount={pkg?.priceUsd ?? null} />
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-fg-subtle">
                <Lock className="h-3 w-3" />
                {country === NIGERIA ? 'Secure payment via ALAT by Wema' : 'Secure card payment'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <div className="flex items-baseline gap-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-fg font-display text-sm font-extrabold">
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg md:text-xl font-bold text-fg leading-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-fg-muted">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
