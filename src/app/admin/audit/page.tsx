// /admin/audit — immutable log of every admin mutation, filterable by
// action, actor, and target type.

import Link from 'next/link';
import { ShieldCheck, Download } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import {
  listAudit, listAuditActions, listAuditActors,
} from '@/lib/admin/audit-queries';

interface PageProps {
  searchParams: Promise<{
    action?: string;
    actor?: string;
    target?: string;
  }>;
}

const ACTION_LABEL: Record<string, string> = {
  'staff.amend':                          'Staff · Amended',
  'staff.photo_upload':                   'Staff · Photo uploaded',
  'staff.photo_delete':                   'Staff · Photo removed',
  'staff.fire_suspend':                   'Staff · Fired / suspended',
  'staff.reinstate':                      'Staff · Reinstated',
  'staff.salary_update':                  'Staff · Salary updated',
  'staff.reset_legacy_email':             'Staff · Reset legacy email',
  'staff.report_admin_override':          'Staff · Override report filed',
  'enrollment.installment_marked_paid':   'Enrolment · Installment marked paid',
  'enrollment.status_change':             'Enrolment · Status changed',
  'course.update':                        'Course · Updated',
  'portfolio.create':                     'Portfolio · Created',
  'portfolio.update':                     'Portfolio · Updated',
  'portfolio.delete':                     'Portfolio · Deleted',
  'contact_message.status_change':        'Contact · Status changed',
};

function actionTone(action: string): string {
  if (action.startsWith('staff.fire')) return 'text-danger';
  if (action.endsWith('.delete')) return 'text-danger';
  if (action.startsWith('staff.reinstate')) return 'text-success';
  if (action.endsWith('.create')) return 'text-success';
  if (action.includes('marked_paid')) return 'text-success';
  return 'text-brand';
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const { action, actor, target } = await searchParams;
  const [entries, allActions, allActors] = await Promise.all([
    listAudit({ action: action ?? null, actorEmail: actor ?? null, targetType: target ?? null }),
    listAuditActions(),
    listAuditActors(),
  ]);

  const filterParams = new URLSearchParams();
  if (action) filterParams.set('action', action);
  if (actor)  filterParams.set('actor', actor);
  if (target) filterParams.set('target', target);
  const hasFilter = filterParams.toString().length > 0;

  return (
    <>
      <PageHead
        title="Audit log"
        description="Append-only record of every admin mutation. Rows cannot be edited or deleted — this is the trail of who changed what."
        actions={
          <a
            href="/api/admin/export/audit"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      {/* Filters */}
      <AdminCard className="mb-6">
        <form className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Action</label>
            <select
              name="action"
              defaultValue={action ?? ''}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">All actions</option>
              {allActions.map((a) => (
                <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Actor</label>
            <select
              name="actor"
              defaultValue={actor ?? ''}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">Anyone</option>
              {allActors.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Target type</label>
            <select
              name="target"
              defaultValue={target ?? ''}
              className="mt-1.5 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">Any target</option>
              <option value="staff">staff</option>
              <option value="enrollment">enrollment</option>
              <option value="course">course</option>
              <option value="portfolio_project">portfolio_project</option>
              <option value="contact_message">contact_message</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="inline-flex h-10 items-center px-4 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover">
              Filter
            </button>
            {hasFilter && (
              <Link href="/admin/audit" className="inline-flex h-10 items-center px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted">
                Clear
              </Link>
            )}
          </div>
        </form>
      </AdminCard>

      <AdminCard>
        {entries.length === 0 ? (
          <div className="p-10 text-center text-fg-muted">
            <ShieldCheck className="h-10 w-10 mx-auto text-fg-subtle" />
            <p className="mt-4">No audit entries match the current filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((e) => (
              <li key={e.id} className="p-4 md:p-5 hover:bg-surface-hover/30 transition-colors">
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${actionTone(e.action)}`}>
                      {ACTION_LABEL[e.action] ?? e.action}
                    </span>
                    {e.target_label && (
                      <span className="text-xs text-fg-muted">→ {e.target_label}</span>
                    )}
                  </div>
                  <span className="text-xs text-fg-subtle font-mono tabular">{fmtDate(e.created_at)}</span>
                </div>
                <p className="text-xs text-fg-subtle">
                  by <span className="text-fg-muted font-mono">{e.actor_email ?? '—'}</span>
                  {e.target_type && <> · <span className="font-mono">{e.target_type}</span></>}
                </p>
                {e.diff && Object.keys(e.diff).length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-[140px_1fr_1fr] gap-y-1 text-xs">
                    <p className="text-fg-subtle font-bold uppercase tracking-wider hidden sm:block">FIELD</p>
                    <p className="text-fg-subtle font-bold uppercase tracking-wider hidden sm:block">BEFORE</p>
                    <p className="text-fg-subtle font-bold uppercase tracking-wider hidden sm:block">NOW</p>
                    {Object.entries(e.diff).map(([field, change]) => (
                      <>
                        <p key={`${e.id}-${field}-k`} className="text-fg-muted font-mono">{field}</p>
                        <p key={`${e.id}-${field}-b`} className="text-fg-subtle line-through font-mono break-all">
                          {String(change.before ?? '—').slice(0, 120)}
                        </p>
                        <p key={`${e.id}-${field}-a`} className="text-fg font-mono break-all">
                          {String(change.after ?? '—').slice(0, 120)}
                        </p>
                      </>
                    ))}
                  </div>
                )}
                {e.notes && (
                  <p className="mt-2 text-xs text-fg-muted">{e.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-border px-4 py-3 text-xs text-fg-subtle flex items-center justify-between">
          <span>{entries.length} entries shown · ordered newest first</span>
          <span>RLS: append-only · no UPDATE / DELETE policy exists</span>
        </div>
      </AdminCard>
    </>
  );
}
