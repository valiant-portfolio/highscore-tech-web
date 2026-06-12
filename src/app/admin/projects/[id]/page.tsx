// /admin/projects/[id] — full project detail with payments, expenses,
// milestones, team, and project reports. Server-rendered with all data,
// interactive controls (forms / status toggles / delete buttons) live in
// ProjectDetailSections.tsx.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertCircle, ArrowLeft, CalendarClock, CircleDollarSign,
  Flag, Mail, MessageSquare, Phone, Receipt, TrendingDown, TrendingUp,
  Users, Wallet,
} from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { getProjectDetail, listAssignableStaff } from '@/lib/admin/project-queries';
import {
  AddExpenseForm, AddMilestoneForm, AddPaymentForm, AddProjectReportForm,
  AssignStaffForm, DeleteExpenseButton, DeletePaymentButton,
  MilestoneStatusPill, ProjectStatusControls, UnassignButton,
} from '@/components/admin/ProjectDetailSections';
import { formatNgn } from '@/lib/academy/queries';

interface PageProps { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic';

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getProjectDetail(id);
  if (!detail) notFound();
  const staffOptions = await listAssignableStaff();

  const { project, metrics, payments, expenses, milestones, assignments, reports } = detail;
  const paidPct = Number(project.cost_ngn) > 0
    ? Math.min(100, Math.round((metrics.received_ngn / Number(project.cost_ngn)) * 100))
    : 0;

  return (
    <>
      <PageHead
        title={project.name}
        description={
          <span className="inline-flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{project.client_name}</span>
            <span className="text-fg-subtle">·</span>
            <ProjectStatusControls projectId={project.id} currentStatus={project.status} />
          </span>
        }
        back={{ href: '/admin/projects', label: 'Back to projects' }}
      />

      {/* KPI strip */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Cost" value={formatNgn(Number(project.cost_ngn))} />
        <Kpi
          label="Received"
          value={formatNgn(metrics.received_ngn)}
          hint={`${paidPct}% paid · balance ${formatNgn(metrics.balance_owed_ngn)}`}
          tone={metrics.balance_owed_ngn === 0 ? 'success' : 'default'}
        />
        <Kpi
          label="Spent"
          value={formatNgn(metrics.spent_ngn)}
          tone="default"
        />
        <Kpi
          label="Net (received − spent)"
          value={`${metrics.net_ngn < 0 ? '−' : ''}${formatNgn(Math.abs(metrics.net_ngn))}`}
          tone={metrics.net_ngn >= 0 ? 'success' : 'brand'}
        />
      </div>

      {/* Top facts */}
      <AdminCard className="mb-6">
        <div className="p-5 md:p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <Fact label="Started"  value={formatDate(project.started_at)} icon={<CalendarClock className="h-3.5 w-3.5" />} />
          <Fact label="Due"      value={formatDate(project.due_at)}     icon={<Flag className="h-3.5 w-3.5" />} />
          <Fact label="Ended"    value={formatDate(project.ended_at)}   icon={<CalendarClock className="h-3.5 w-3.5" />} />
          <Fact label="Client"   value={project.client_name}            icon={<Users className="h-3.5 w-3.5" />} />
          {project.client_email && <Fact label="Email" value={project.client_email} icon={<Mail className="h-3.5 w-3.5" />} />}
          {project.client_phone && <Fact label="Phone" value={project.client_phone} icon={<Phone className="h-3.5 w-3.5" />} />}
        </div>
        {project.description && (
          <div className="px-5 md:px-6 pb-6 -mt-2">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-fg-subtle">Description</p>
            <p className="mt-1.5 text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
        )}
      </AdminCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payments */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <SectionHeader icon={<Wallet className="h-5 w-5" />} title="Payments received" count={payments.length} />
            <div className="mt-5"><AddPaymentForm projectId={project.id} /></div>
            <div className="mt-5">
              {payments.length === 0 ? (
                <Empty text="No payments recorded yet." />
              ) : (
                <ul className="space-y-2">
                  {payments.map((p) => (
                    <li key={p.id} className="rounded-md border border-border bg-surface/30 p-3 flex items-start justify-between gap-3 text-sm">
                      <div className="space-y-0.5">
                        <p className="font-mono tabular font-bold text-success">{formatNgn(p.amount_ngn)}</p>
                        <p className="text-xs text-fg-subtle">
                          {formatDate(p.received_at)}
                          {p.method && <> · {p.method}</>}
                          {p.reference && <> · {p.reference}</>}
                        </p>
                        {p.notes && <p className="mt-1 text-xs text-fg-muted">{p.notes}</p>}
                      </div>
                      <DeletePaymentButton paymentId={p.id} projectId={project.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AdminCard>

        {/* Expenses */}
        <AdminCard>
          <div className="p-5 md:p-6">
            <SectionHeader icon={<Receipt className="h-5 w-5" />} title="Expenses" count={expenses.length} />
            <div className="mt-5"><AddExpenseForm projectId={project.id} /></div>
            <div className="mt-5">
              {expenses.length === 0 ? (
                <Empty text="No expenses recorded yet." />
              ) : (
                <ul className="space-y-2">
                  {expenses.map((e) => (
                    <li key={e.id} className="rounded-md border border-border bg-surface/30 p-3 flex items-start justify-between gap-3 text-sm">
                      <div className="space-y-0.5">
                        <p className="font-mono tabular font-bold text-fg">−{formatNgn(e.amount_ngn)}</p>
                        <p className="text-xs text-fg-subtle">
                          {formatDate(e.spent_at)}
                          {e.category && <> · {e.category}</>}
                        </p>
                        <p className="mt-1 text-sm text-fg whitespace-pre-wrap">{e.reason}</p>
                        {e.notes && <p className="mt-1 text-xs text-fg-muted">{e.notes}</p>}
                      </div>
                      <DeleteExpenseButton expenseId={e.id} projectId={project.id} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Milestones */}
      <AdminCard className="mt-6">
        <div className="p-5 md:p-6">
          <SectionHeader icon={<Flag className="h-5 w-5" />} title="Milestones" count={milestones.length} />
          <div className="mt-5"><AddMilestoneForm projectId={project.id} /></div>
          <div className="mt-5">
            {milestones.length === 0 ? (
              <Empty text="No milestones yet." />
            ) : (
              <ul className="space-y-2">
                {milestones.map((m) => (
                  <li key={m.id} className="rounded-md border border-border bg-surface/30 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-fg">{m.title}</p>
                        {m.description && <p className="mt-0.5 text-sm text-fg-muted whitespace-pre-wrap">{m.description}</p>}
                        <p className="mt-1.5 text-xs text-fg-subtle">
                          Due {formatDate(m.due_date)}
                          {m.completed_at && <> · Completed {formatDate(m.completed_at.slice(0, 10))}</>}
                        </p>
                      </div>
                      <MilestoneStatusPill milestoneId={m.id} currentStatus={m.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Team */}
      <AdminCard className="mt-6">
        <div className="p-5 md:p-6">
          <SectionHeader icon={<Users className="h-5 w-5" />} title="Team assigned" count={assignments.length} />
          <div className="mt-5"><AssignStaffForm projectId={project.id} staffOptions={staffOptions} /></div>
          <div className="mt-5">
            {assignments.length === 0 ? (
              <Empty text="No staff assigned yet." />
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {assignments.map((a) => (
                  <li key={a.id} className="rounded-md border border-border bg-surface/30 p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg truncate">{a.staff_name}</p>
                      <p className="text-xs text-fg-subtle">{a.role ?? a.staff_role}</p>
                    </div>
                    <UnassignButton assignmentId={a.id} projectId={project.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Reports */}
      <AdminCard className="mt-6">
        <div className="p-5 md:p-6">
          <SectionHeader icon={<MessageSquare className="h-5 w-5" />} title="Progress reports" count={reports.length} />
          <p className="mt-1 text-xs text-fg-subtle">
            Daily updates on this project. Olivia or anyone with admin access can post.
          </p>
          <div className="mt-5"><AddProjectReportForm projectId={project.id} /></div>
          <div className="mt-5">
            {reports.length === 0 ? (
              <Empty text="No reports yet." />
            ) : (
              <ul className="space-y-3">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-md border border-border bg-surface/30 p-3">
                    <p className="text-xs font-mono tabular text-fg-subtle">
                      {formatDate(r.report_date)}
                      {r.submitted_by_email && <> · {r.submitted_by_email}</>}
                    </p>
                    <p className="mt-1.5 text-sm text-fg whitespace-pre-wrap leading-relaxed">{r.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminCard>

      <div className="mt-8 text-xs text-fg-subtle flex items-center gap-1.5">
        <Link href="/admin/projects" className="inline-flex items-center gap-1 hover:text-fg">
          <ArrowLeft className="h-3 w-3" /> Back to projects
        </Link>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <CircleDollarSign className="h-3 w-3" />
          Every change recorded in the audit log.
        </span>
        {metrics.net_ngn < 0 && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-danger font-semibold">
              <TrendingDown className="h-3 w-3" /> Project is currently losing money.
            </span>
          </>
        )}
        {metrics.net_ngn > 0 && (
          <>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-success font-semibold">
              <TrendingUp className="h-3 w-3" /> Project is in the green.
            </span>
          </>
        )}
      </div>
    </>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 flex-wrap">
      <h2 className="font-display text-lg md:text-xl font-bold text-fg inline-flex items-center gap-2">
        <span className="text-brand">{icon}</span> {title}
      </h2>
      <p className="text-xs text-fg-subtle">{count} on file</p>
    </div>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle inline-flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="mt-1 text-fg font-semibold break-all">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface/20 p-6 text-center">
      <AlertCircle className="h-6 w-6 mx-auto text-fg-subtle" />
      <p className="mt-2 text-sm text-fg-muted">{text}</p>
    </div>
  );
}
