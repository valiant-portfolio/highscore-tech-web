// Student dashboard — enrolments, instalment schedule, payment history,
// and a settings panel for editing profile basics. Guarded by middleware;
// if the user isn't signed in they're bounced to /login.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight, BookOpen, CreditCard, GraduationCap, Receipt, Settings,
} from 'lucide-react';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { LinkButton } from '@/components/ui';
import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm';
import { getCurrentUser } from '@/lib/auth/queries';
import { listEnrollments, listInstallments, listPayments } from '@/lib/profile/queries';
import { sweepPendingPaymentsAction } from '@/lib/enrollment/actions';
import { formatNgn } from '@/lib/academy/queries';

export const metadata: Metadata = {
  title: 'My profile — Highscore Tech',
  robots: { index: false, follow: false },
};

const TABS = [
  { id: 'courses',  label: 'Courses',       icon: <BookOpen className="h-4 w-4" /> },
  { id: 'plan',     label: 'Instalments',   icon: <CreditCard className="h-4 w-4" /> },
  { id: 'payments', label: 'Payments',      icon: <Receipt className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings',      icon: <Settings className="h-4 w-4" /> },
] as const;

function statusPill(status: string, palette: 'enrollment' | 'installment' | 'payment') {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending:   { bg: 'bg-warning/15', fg: 'text-warning', label: 'Pending' },
    active:    { bg: 'bg-success/15', fg: 'text-success', label: 'Active' },
    completed: { bg: 'bg-brand/15',   fg: 'text-brand',   label: 'Completed' },
    cancelled: { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: 'Cancelled' },
    paid:      { bg: 'bg-success/15', fg: 'text-success', label: 'Paid' },
    overdue:   { bg: 'bg-danger/15',  fg: 'text-danger',  label: 'Overdue' },
    waived:    { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: 'Waived' },
    succeeded: { bg: 'bg-success/15', fg: 'text-success', label: 'Succeeded' },
    failed:    { bg: 'bg-danger/15',  fg: 'text-danger',  label: 'Failed' },
    refunded:  { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: 'Refunded' },
  };
  const p = map[status] ?? { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: status };
  void palette;
  return (
    <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-semibold ${p.bg} ${p.fg}`}>
      {p.label}
    </span>
  );
}

function ProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #18C2DC 0%, #0A8EA8 100%)',
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-fg-muted">{formatNgn(paid)} paid</span>
        <span className="font-semibold text-fg">{pct}%</span>
      </div>
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ tab?: string; paid?: string }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/profile');

  const { tab: tabParam, paid: paidFlag } = await searchParams;
  // Admins skip /profile entirely — the student dashboard is irrelevant to
  // them. The Settings tab stays reachable via /profile?tab=settings if they
  // need to update their name/phone.
  if (user.role === 'admin' && tabParam !== 'settings') {
    redirect('/admin');
  }
  const activeTab = (TABS.find((t) => t.id === tabParam)?.id ?? 'courses') as (typeof TABS)[number]['id'];
  const justPaid = paidFlag === 'ok';

  // Recovery: re-verify any payments still marked pending. Covers the case
  // where the student closed the tab right after paying. No webhook means
  // this server-side sweep is the safety net.
  await sweepPendingPaymentsAction(user.id);

  const [enrollments, installments, payments] = await Promise.all([
    listEnrollments(user.id),
    listInstallments(user.id),
    listPayments(user.id),
  ]);

  const totalCommitted = enrollments.reduce((s, e) => s + e.total_ngn, 0);
  const totalPaid      = enrollments.reduce((s, e) => s + e.paid_ngn, 0);
  const activeCount    = enrollments.filter((e) => e.status === 'active' || e.status === 'pending').length;

  return (
    <>
      {/* ── Header strip ─────────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pt-20 md:pt-28 pb-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">My profile</p>
          <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
            {user.full_name?.split(' ')[0] ? `Hi, ${user.full_name.split(' ')[0]}.` : 'Hi.'}
          </h1>
          <p className="mt-2 text-fg-muted">
            {activeCount > 0
              ? `${activeCount} active enrolment${activeCount === 1 ? '' : 's'}. Track your progress below.`
              : "You haven't enrolled in a course yet — browse the academy when you're ready."}
          </p>
          {user.role === 'admin' && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand/30 bg-brand-tint/40 p-4">
              <span className="mt-0.5 inline-flex h-5 w-5 rounded-full bg-brand text-brand-fg items-center justify-center text-[10px] font-bold">
                A
              </span>
              <div className="text-sm flex-1">
                <p className="text-fg font-semibold">You're signed in as an admin.</p>
                <p className="mt-0.5 text-fg-muted">
                  This page is the student view. Use the admin dashboard to manage courses, enrolments, staff, contact messages, and the ledger.
                </p>
              </div>
              <Link
                href="/admin"
                className="inline-flex h-9 items-center px-4 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover transition-colors shrink-0"
              >
                Open admin →
              </Link>
            </div>
          )}
          {justPaid && (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 rounded-full bg-success/20 text-success items-center justify-center text-xs font-bold">
                ✓
              </span>
              <div className="text-sm">
                <p className="text-fg font-semibold">Payment received.</p>
                <p className="mt-0.5 text-fg-muted">
                  Your enrolment is active. If the totals below haven't refreshed yet, give it a few seconds and reload.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Summary cards ────────────────────────────────────────── */}
      <section className="px-4 md:px-8">
        <div className="mx-auto max-w-[1180px] grid sm:grid-cols-3 gap-4">
          <PremiumCard noLift>
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Enrolments</p>
              <p className="mt-2 font-mono tabular text-3xl font-extrabold text-fg">{enrollments.length}</p>
              <p className="mt-1 text-xs text-fg-muted">{activeCount} active</p>
            </div>
          </PremiumCard>
          <PremiumCard noLift>
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Total committed</p>
              <p className="mt-2 font-mono tabular text-3xl font-extrabold text-fg">{formatNgn(totalCommitted)}</p>
              <p className="mt-1 text-xs text-fg-muted">across all courses</p>
            </div>
          </PremiumCard>
          <PremiumCard noLift>
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Paid so far</p>
              <p className="mt-2 font-mono tabular text-3xl font-extrabold text-fg">{formatNgn(totalPaid)}</p>
              <p className="mt-1 text-xs text-fg-muted">
                {totalCommitted > 0 ? `${Math.round((totalPaid / totalCommitted) * 100)}% of total` : 'no payments yet'}
              </p>
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 mt-10">
        <div className="mx-auto max-w-[1180px]">
          <nav className="flex flex-wrap items-center gap-1 border-b border-border" role="tablist">
            {TABS.map((t) => {
              const active = t.id === activeTab;
              return (
                <Link
                  key={t.id}
                  href={`/profile?tab=${t.id}`}
                  scroll={false}
                  role="tab"
                  aria-selected={active}
                  className={`inline-flex items-center gap-2 px-3 md:px-4 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                    active
                      ? 'text-fg border-brand'
                      : 'text-fg-muted border-transparent hover:text-fg'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Tab body ─────────────────────────────────────────── */}
          <div className="mt-8 pb-24">
            {activeTab === 'courses' && (
              enrollments.length === 0 ? (
                <PremiumCard noLift>
                  <div className="p-10 text-center">
                    <GraduationCap className="h-10 w-10 mx-auto text-fg-subtle" />
                    <h3 className="mt-5 font-display text-xl font-bold text-fg">No enrolments yet.</h3>
                    <p className="mt-2 text-fg-muted max-w-md mx-auto">
                      When you enrol in a course, it'll show up here with your progress and modules.
                    </p>
                    <div className="mt-6">
                      <LinkButton href="/academy" rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Browse courses
                      </LinkButton>
                    </div>
                  </div>
                </PremiumCard>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {enrollments.map((e) => (
                    <PremiumCard key={e.id} noLift>
                      <div className="p-5 md:p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-fg leading-tight">{e.course_title}</h3>
                            <p className="mt-1 text-xs text-fg-muted">
                              {e.pay_plan === 'installment' ? 'Instalment plan' : 'Paid in full'} ·
                              {' '}
                              {formatNgn(e.total_ngn)}
                            </p>
                          </div>
                          {statusPill(e.status, 'enrollment')}
                        </div>

                        <ProgressBar paid={e.paid_ngn} total={e.total_ngn} />

                        <div className="flex flex-wrap gap-2 pt-1">
                          <Link
                            href={`/academy/${e.course_slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                          >
                            Course details <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </PremiumCard>
                  ))}
                </div>
              )
            )}

            {activeTab === 'plan' && (
              installments.length === 0 ? (
                <PremiumCard noLift>
                  <div className="p-10 text-center">
                    <CreditCard className="h-10 w-10 mx-auto text-fg-subtle" />
                    <h3 className="mt-5 font-display text-xl font-bold text-fg">No instalment plans yet.</h3>
                    <p className="mt-2 text-fg-muted max-w-md mx-auto">
                      Choose the instalment option at checkout and your schedule lands here.
                    </p>
                  </div>
                </PremiumCard>
              ) : (
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-hover/50 text-[11px] uppercase tracking-wider text-fg-subtle">
                      <tr>
                        <th className="text-left px-4 py-3 font-bold">Course</th>
                        <th className="text-left px-4 py-3 font-bold">#</th>
                        <th className="text-left px-4 py-3 font-bold">Due</th>
                        <th className="text-right px-4 py-3 font-bold">Amount</th>
                        <th className="text-right px-4 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface/40">
                      {installments.map((i) => (
                        <tr key={i.id}>
                          <td className="px-4 py-3 font-semibold text-fg">{i.course_title}</td>
                          <td className="px-4 py-3 font-mono tabular text-fg-muted">
                            {String(i.sort_order).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3 text-fg-muted">
                            {new Date(i.due_date).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular font-semibold text-fg">
                            {formatNgn(i.amount_ngn)}
                          </td>
                          <td className="px-4 py-3 text-right">{statusPill(i.status, 'installment')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'payments' && (
              payments.length === 0 ? (
                <PremiumCard noLift>
                  <div className="p-10 text-center">
                    <Receipt className="h-10 w-10 mx-auto text-fg-subtle" />
                    <h3 className="mt-5 font-display text-xl font-bold text-fg">No payments yet.</h3>
                    <p className="mt-2 text-fg-muted max-w-md mx-auto">
                      Every successful transaction shows up here with a downloadable PDF receipt.
                    </p>
                  </div>
                </PremiumCard>
              ) : (
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-hover/50 text-[11px] uppercase tracking-wider text-fg-subtle">
                      <tr>
                        <th className="text-left px-4 py-3 font-bold">Date</th>
                        <th className="text-left px-4 py-3 font-bold">Course</th>
                        <th className="text-left px-4 py-3 font-bold">Reference</th>
                        <th className="text-right px-4 py-3 font-bold">Amount</th>
                        <th className="text-right px-4 py-3 font-bold">Status</th>
                        <th className="text-right px-4 py-3 font-bold">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface/40">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3 text-fg-muted">
                            {new Date(p.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-fg">{p.course_title}</td>
                          <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                            {p.alatpay_reference ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular font-semibold text-fg">
                            {formatNgn(p.amount_ngn)}
                          </td>
                          <td className="px-4 py-3 text-right">{statusPill(p.status, 'payment')}</td>
                          <td className="px-4 py-3 text-right">
                            {p.status === 'succeeded' ? (
                              <a
                                href={`/api/payments/${p.id}/receipt.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                              >
                                PDF
                              </a>
                            ) : (
                              <span className="text-fg-subtle text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {activeTab === 'settings' && (
              <PremiumCard noLift>
                <div className="p-5 md:p-7">
                  <h2 className="font-display text-xl md:text-2xl font-bold text-fg">Account details</h2>
                  <p className="mt-1 text-sm text-fg-muted">
                    Keep your contact info current — we use it for cohort updates and certificates.
                  </p>
                  <div className="mt-6">
                    <ProfileSettingsForm
                      email={user.email}
                      defaultName={user.full_name ?? ''}
                      defaultPhone={user.phone ?? ''}
                    />
                  </div>
                </div>
              </PremiumCard>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
