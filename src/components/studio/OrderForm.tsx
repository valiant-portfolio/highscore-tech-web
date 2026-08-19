'use client';

// The Studio order form, as a guided sequence rather than one long page: one
// question on screen at a time, each answered step collapsing to a summary line
// you can click to go back. A church brief is not a business brief is not a
// birthday brief, so the questions BRANCH on project type.
//
// Two things that look like details but are not:
//
//  1. Collapsed steps stay MOUNTED and are hidden with CSS. Unmounting them
//     would drop their inputs out of the submitted FormData, silently losing
//     the brief.
//  2. The form is noValidate. Native validation refuses to submit when a
//     REQUIRED field is inside a display:none step ("not focusable"), which
//     would have made the button appear dead. Each step is validated on its
//     way past instead, and the server re-checks everything regardless.
//
// The client never sends a price — it posts a packageKey plus add-on keys and
// the server totals it from the catalogue (see createStudioOrder).

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, ArrowRight, ArrowLeft, Check, Lock, Pencil, Radio, Tv } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import {
  PACKAGES, PACKAGE_BY_KEY, PROJECT_TYPES, PROJECT_TYPE_BY_KEY, DELIVERY_CHANNELS,
  ADDONS, ADDON_BY_KEY, totalNgn, formatNgn,
  type ProjectType,
} from '@/lib/studio/catalog';
import { createStudioOrder, type OrderFormState } from '@/lib/studio/actions';
import { cn } from '@/lib/utils';

const INITIAL: OrderFormState = { status: 'idle' };
const LAST_STEP = 6;

const GROUPS: { id: 'personal' | 'business' | 'brand'; label: string }[] = [
  { id: 'personal', label: 'Personal & occasions' },
  { id: 'business', label: 'Business & brands' },
  { id: 'brand',    label: 'Ongoing, every month' },
];

const ADDON_ICON: Record<string, React.ReactNode> = {
  live_tv: <Tv className="h-5 w-5" />,
  radio: <Radio className="h-5 w-5" />,
};

function SubmitButton({ amount }: { amount: number | null }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth loading={pending}
      rightIcon={pending ? undefined : <ArrowRight className="h-4 w-4" />}>
      {pending ? 'Creating your order…' : amount != null ? `Continue to payment — ${formatNgn(amount)}` : 'Continue to payment'}
    </Button>
  );
}

export function OrderForm({ initialPackage }: { initialPackage?: string }) {
  const [state, formAction] = useActionState(createStudioOrder, INITIAL);

  const preset = initialPackage && PACKAGE_BY_KEY[initialPackage] ? initialPackage : '';
  const [packageKey, setPackageKey] = useState(preset);
  const [addons, setAddons] = useState<string[]>([]);
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [channel, setChannel] = useState<string>('whatsapp');
  // Controlled so the collapsed summaries can show what was actually entered.
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryHandle, setDeliveryHandle] = useState('');

  // Arriving from a pricing card means step 1 is already answered.
  const [current, setCurrent] = useState(preset ? 2 : 1);

  const pkg = packageKey ? PACKAGE_BY_KEY[packageKey] : undefined;
  const typeDef = projectType ? PROJECT_TYPE_BY_KEY[projectType] : undefined;
  const channelDef = useMemo(
    () => DELIVERY_CHANNELS.find((c) => c.key === channel) ?? DELIVERY_CHANNELS[0],
    [channel],
  );
  // Mirrors the server's sum, so what they see is what they are charged.
  const total = packageKey ? totalNgn(packageKey, addons) : null;

  const stepRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const go = (n: number) => {
    setCurrent(n);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  /** Let the browser check just this step's visible fields before moving on. */
  const advanceFrom = (n: number) => {
    const el = stepRefs.current[n];
    if (el) {
      const fields = el.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        'input, select, textarea',
      );
      for (const f of fields) {
        if (!f.checkValidity()) { f.reportValidity(); return; }
      }
    }
    go(n + 1);
  };

  const toggleAddon = (key: string) =>
    setAddons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  useEffect(() => {
    if (state.status === 'error') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state]);

  const summaries: Record<number, string> = {
    1: pkg ? `${pkg.name} · ${formatNgn(pkg.priceNgn)}${pkg.monthly ? '/mo' : ''}` : '',
    2: addons.length ? addons.map((k) => ADDON_BY_KEY[k]?.name).filter(Boolean).join(' + ') : 'No broadcast add-ons',
    3: typeDef?.label ?? '',
    4: typeDef ? 'Brief filled in' : '',
    5: [customerName, customerEmail].filter(Boolean).join(' · '),
    6: `${channelDef.label}${deliveryHandle ? ` · ${deliveryHandle}` : ''}`,
  };

  return (
    <form action={formAction} noValidate>
      <div ref={topRef} className="scroll-mt-24" />

      {state.status === 'error' && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-fg">{state.message}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8 items-start">
        <div className="min-w-0">
          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg-subtle">
                Step {current} of {LAST_STEP}
              </p>
              <p className="text-[11px] font-semibold text-fg-muted">
                {Math.round(((current - 1) / (LAST_STEP - 1)) * 100)}% there
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500"
                style={{ width: `${((current - 1) / (LAST_STEP - 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {/* 1 — package */}
            <Step n={1} current={current} title="What do you want made?"
              hint="Pick one. You can add broadcast next."
              summary={summaries[1]} onEdit={() => go(1)}
              innerRef={(el) => { stepRefs.current[1] = el; }}>
              <input type="hidden" name="packageKey" value={packageKey} />
              <div className="space-y-5">
                {GROUPS.map((g) => (
                  <div key={g.id}>
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-fg-subtle">{g.label}</p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {PACKAGES.filter((p) => p.group === g.id).map((p) => (
                        <Choice
                          key={p.key}
                          active={p.key === packageKey}
                          onClick={() => { setPackageKey(p.key); go(2); }}
                          title={p.name}
                          note={p.blurb}
                          right={
                            <span className="font-display font-extrabold tabular-nums text-brand whitespace-nowrap text-sm">
                              {p.from && <span className="text-[10px] font-semibold text-fg-subtle mr-0.5">from</span>}
                              {formatNgn(p.priceNgn)}{p.monthly && <span className="text-[11px] font-semibold text-fg-muted">/mo</span>}
                            </span>
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {state.fieldErrors?.packageKey && (
                <p className="mt-3 text-xs text-danger">{state.fieldErrors.packageKey}</p>
              )}
            </Step>

            {/* 2 — broadcast add-ons */}
            <Step n={2} current={current} title="Want it on TV or radio?"
              hint="Optional. Skip it if you only need the song and video."
              summary={summaries[2]} onEdit={() => go(2)}
              innerRef={(el) => { stepRefs.current[2] = el; }}>
              {/* One hidden input per selected add-on, so they arrive as a list. */}
              {addons.map((k) => <input key={k} type="hidden" name="addons" value={k} />)}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {ADDONS.map((a) => {
                  const on = addons.includes(a.key);
                  return (
                    <button
                      type="button"
                      key={a.key}
                      onClick={() => toggleAddon(a.key)}
                      aria-pressed={on}
                      className={cn(
                        'text-left rounded-xl border p-4 transition-colors',
                        on ? 'border-brand bg-brand-tint' : 'border-border bg-bg-elevated hover:border-border-strong',
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-2.5">
                          <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg',
                            on ? 'bg-brand text-brand-fg' : 'bg-surface-hover text-fg-muted')}>
                            {ADDON_ICON[a.key]}
                          </span>
                          <span className="font-semibold text-fg text-sm">{a.name}</span>
                        </span>
                        <span className="font-display font-extrabold tabular-nums text-brand whitespace-nowrap text-sm">
                          +{formatNgn(a.priceNgn)}
                        </span>
                      </span>
                      <span className="mt-2 block text-xs text-fg-muted leading-relaxed">{a.blurb}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-fg-subtle leading-relaxed">
                This covers producing the broadcast master and arranging placement. The station’s
                airtime is quoted separately, per campaign.
              </p>
              <StepNav onBack={() => go(1)} onNext={() => go(3)}
                nextLabel={addons.length ? 'Continue' : 'Skip for now'} />
            </Step>

            {/* 3 — project type */}
            <Step n={3} current={current} title="What is it for?"
              hint="We ask different questions depending on the job."
              summary={summaries[3]} onEdit={() => go(3)}
              innerRef={(el) => { stepRefs.current[3] = el; }}>
              <input type="hidden" name="projectType" value={projectType} />
              <div className="grid gap-2.5 sm:grid-cols-2">
                {PROJECT_TYPES.map((t) => (
                  <Choice
                    key={t.key}
                    active={t.key === projectType}
                    onClick={() => { setProjectType(t.key); go(4); }}
                    title={t.label}
                    note={t.tagline}
                  />
                ))}
              </div>
              {state.fieldErrors?.projectType && (
                <p className="mt-3 text-xs text-danger">{state.fieldErrors.projectType}</p>
              )}
              <StepNav onBack={() => go(2)} />
            </Step>

            {/* 4 — the branching brief */}
            <Step n={4} current={current}
              title={typeDef ? `Tell us about your ${typeDef.label.toLowerCase()} job` : 'Tell us about the job'}
              hint="The details are what make it feel written for you."
              summary={summaries[4]} onEdit={() => go(4)}
              innerRef={(el) => { stepRefs.current[4] = el; }}>
              {typeDef ? (
                <>
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
                  <StepNav onBack={() => go(3)} onNext={() => advanceFrom(4)} />
                </>
              ) : (
                <p className="text-sm text-fg-muted">Pick what it’s for first.</p>
              )}
            </Step>

            {/* 5 — who they are */}
            <Step n={5} current={current} title="Your details"
              summary={summaries[5]} onEdit={() => go(5)}
              innerRef={(el) => { stepRefs.current[5] = el; }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="customerName" label="Your name" required autoComplete="name"
                  placeholder="Jane Doe" value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={state.fieldErrors?.customerName} />
                <Input name="customerEmail" type="email" label="Email" required autoComplete="email"
                  placeholder="jane@example.com" helper="Your receipt and invoice go here."
                  value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                  error={state.fieldErrors?.customerEmail} />
                <Input name="neededBy" type="date" label="When do you need it?"
                  helper="Leave blank if it isn’t urgent." error={state.fieldErrors?.neededBy} />
              </div>
              <StepNav onBack={() => go(4)} onNext={() => advanceFrom(5)} />
            </Step>

            {/* 6 — delivery */}
            <Step n={6} current={current} title="Where should we send the finished work?"
              summary={summaries[6]} onEdit={() => go(6)}
              innerRef={(el) => { stepRefs.current[6] = el; }}>
              <input type="hidden" name="deliveryChannel" value={channel} />
              <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                <div>
                  <p className="mb-2 text-sm font-medium text-fg">Send it on</p>
                  <div className="flex flex-wrap gap-2">
                    {DELIVERY_CHANNELS.map((c) => (
                      <button
                        type="button"
                        key={c.key}
                        onClick={() => setChannel(c.key)}
                        aria-pressed={c.key === channel}
                        className={cn(
                          'inline-flex h-11 items-center rounded-lg border px-4 text-sm font-semibold transition-colors',
                          c.key === channel
                            ? 'border-brand bg-brand-tint text-fg'
                            : 'border-border bg-bg-elevated text-fg-muted hover:text-fg',
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  name="deliveryHandle"
                  label={`Your ${channelDef.label}`}
                  required
                  placeholder={channelDef.placeholder}
                  value={deliveryHandle}
                  onChange={(e) => setDeliveryHandle(e.target.value)}
                  error={state.fieldErrors?.deliveryHandle}
                />
              </div>
              <StepNav onBack={() => go(5)} />
            </Step>
          </div>
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
                    <p className="tabular-nums font-semibold text-fg whitespace-nowrap">{formatNgn(pkg.priceNgn)}</p>
                  </div>
                  {pkg.monthly && <p className="mt-0.5 text-xs text-fg-subtle">per month, cancel any time</p>}

                  {addons.map((k) => {
                    const a = ADDON_BY_KEY[k];
                    if (!a) return null;
                    return (
                      <div key={k} className="mt-2 flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-fg-muted">+ {a.name}</span>
                        <span className="tabular-nums text-fg-muted whitespace-nowrap">{formatNgn(a.priceNgn)}</span>
                      </div>
                    );
                  })}

                  <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-fg-subtle">Total</span>
                    <span className="font-display text-2xl font-extrabold tabular-nums text-brand whitespace-nowrap">
                      {total != null ? formatNgn(total) : '—'}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 border-t border-border pt-4">
                    {pkg.includes.map((line) => (
                      <li key={line} className="flex gap-2 text-xs text-fg-muted leading-relaxed">
                        <Check className="h-3.5 w-3.5 shrink-0 mt-px text-success" aria-hidden="true" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.note && <p className="mt-3 text-xs text-fg-subtle leading-relaxed">{pkg.note}</p>}
                </>
              ) : (
                <p className="text-sm text-fg-muted">Pick a package and it’ll show up here.</p>
              )}

              {typeDef && (
                <p className="mt-4 border-t border-border pt-3 text-xs text-fg-subtle">
                  For: <span className="font-semibold text-fg-muted">{typeDef.label}</span>
                </p>
              )}
            </div>

            <div className="border-t border-border bg-bg-elevated p-5">
              {current === LAST_STEP ? (
                <>
                  <p className="mb-3 text-xs text-fg-muted leading-relaxed">
                    {pkg?.from && 'A starting price — we confirm the final quote for bigger campaigns before any extra work. '}
                    After payment you get your delivery date and an invoice to download.
                  </p>
                  <SubmitButton amount={total} />
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-fg-subtle">
                    <Lock className="h-3 w-3" /> Secure payment via ALAT by Wema
                  </p>
                </>
              ) : (
                <p className="text-xs text-fg-muted leading-relaxed">
                  {LAST_STEP - current} more step{LAST_STEP - current === 1 ? '' : 's'} and you’re done.
                  Payment comes last.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

/* ── pieces ──────────────────────────────────────────────────────────── */

/**
 * One step. Answered steps collapse to a summary you can click to reopen;
 * upcoming ones show as locked.
 *
 * The body is always rendered and merely hidden — see the note at the top of
 * this file about FormData.
 */
function Step({
  n, current, title, hint, summary, onEdit, innerRef, children,
}: {
  n: number; current: number; title: string; hint?: string;
  summary?: string; onEdit: () => void;
  innerRef: (el: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  const active = n === current;
  const done = n < current;

  return (
    <section
      className={cn(
        'rounded-2xl border transition-colors',
        active ? 'border-brand/45 bg-surface' : done ? 'border-border bg-surface/60' : 'border-border/60 bg-surface/30',
      )}
    >
      <div className={cn('flex items-center gap-3 px-5', active ? 'pt-5 pb-1' : 'py-4')}>
        <span
          className={cn(
            'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-sm font-extrabold',
            active ? 'bg-brand text-brand-fg' : done ? 'bg-success/20 text-success' : 'bg-surface-hover text-fg-subtle',
          )}
        >
          {done ? <Check className="h-4 w-4" /> : n}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className={cn('font-display font-bold leading-tight', active ? 'text-lg md:text-xl text-fg' : 'text-base text-fg-muted')}>
            {title}
          </h2>
          {active && hint && <p className="mt-0.5 text-sm text-fg-muted">{hint}</p>}
          {done && summary && <p className="mt-0.5 truncate text-sm text-fg">{summary}</p>}
        </div>

        {done && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-fg-muted hover:bg-surface-hover hover:text-fg"
          >
            <Pencil className="h-3.5 w-3.5" /> Change
          </button>
        )}
      </div>

      {/* Hidden, never unmounted. */}
      <div ref={innerRef} className={cn('px-5 pb-5', active ? 'block pt-4' : 'hidden')}>
        {children}
      </div>
    </section>
  );
}

function Choice({
  active, onClick, title, note, right,
}: { active: boolean; onClick: () => void; title: string; note: string; right?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'text-left rounded-xl border p-3.5 transition-colors',
        active ? 'border-brand bg-brand-tint' : 'border-border bg-bg-elevated hover:border-border-strong',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="font-semibold text-fg text-sm leading-tight">{title}</span>
        {right}
      </span>
      <span className="mt-1 block text-xs text-fg-muted leading-relaxed">{note}</span>
    </button>
  );
}

function StepNav({ onBack, onNext, nextLabel = 'Continue' }: { onBack?: () => void; onNext?: () => void; nextLabel?: string }) {
  if (!onBack && !onNext) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-fg-muted hover:bg-surface-hover hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : <span />}
      {onNext && (
        <Button type="button" onClick={onNext} rightIcon={<ArrowRight className="h-4 w-4" />}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
