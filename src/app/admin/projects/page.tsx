// /admin/projects — every project we're running, client AND internal.
// No money on this page; that lives at /admin/finance.

import Link from 'next/link';
import {
  Briefcase, ExternalLink, Plus, Users,
} from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { listProjects } from '@/lib/admin/project-queries';

export const dynamic = 'force-dynamic';

const STATUS_LABEL = {
  in_progress: { label: 'In progress', tone: 'bg-brand-tint text-brand' },
  completed:   { label: 'Completed',   tone: 'bg-success/15 text-success' },
  cancelled:   { label: 'Cancelled',   tone: 'bg-danger/15 text-danger' },
} as const;

const TYPE_LABEL = {
  client:   { label: 'Client',   tone: 'bg-surface-hover text-fg' },
  internal: { label: 'Internal', tone: 'bg-brand-tint text-brand' },
} as const;

export default async function AdminProjectsPage() {
  const projects = await listProjects();
  const active     = projects.filter((p) => p.status === 'in_progress');
  const completed  = projects.filter((p) => p.status === 'completed');
  const cancelled  = projects.filter((p) => p.status === 'cancelled');
  const internalCt = projects.filter((p) => p.project_type === 'internal').length;

  return (
    <>
      <PageHead
        title="Projects"
        description="Every engagement we're running — for clients and for ourselves. Milestones, team, and progress reports live here. Money flows are on the Finance page."
        actions={
          <Link
            href="/admin/projects/new"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" /> Add project
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Active"    value={active.length} />
        <Kpi label="Completed" value={completed.length} tone="success" />
        <Kpi label="Cancelled" value={cancelled.length} tone="default" />
        <Kpi label="Internal products" value={internalCt} tone="brand" />
      </div>

      {projects.length === 0 ? (
        <AdminCard>
          <div className="p-10 text-center text-fg-muted">
            <Briefcase className="h-10 w-10 mx-auto text-fg-subtle" />
            <p className="mt-4">No projects yet.</p>
            <Link
              href="/admin/projects/new"
              className="mt-4 inline-flex h-10 items-center gap-2 px-4 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" /> Create the first one
            </Link>
          </div>
        </AdminCard>
      ) : (
        <AdminCard>
          <table className="w-full text-sm">
            <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Project</th>
                <th className="text-left px-4 py-3 font-bold">Type</th>
                <th className="text-left px-4 py-3 font-bold">Client / Owner</th>
                <th className="text-left px-4 py-3 font-bold">Milestones</th>
                <th className="text-left px-4 py-3 font-bold">Team</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-right px-4 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => {
                const status = STATUS_LABEL[p.status];
                const type = TYPE_LABEL[p.project_type];
                return (
                  <tr key={p.id} className="hover:bg-surface-hover/40 align-top">
                    <td className="px-4 py-3">
                      <Link href={`/admin/projects/${p.id}`} className="font-semibold text-fg hover:text-brand">
                        {p.name}
                      </Link>
                      {p.project_url && (
                        <a
                          href={p.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-0.5 text-xs text-brand hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> visit
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-bold uppercase ${type.tone}`}>
                        {type.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{p.client_name}</td>
                    <td className="px-4 py-3 text-xs text-fg-muted">
                      {p.milestones_completed} / {p.milestones_total}
                    </td>
                    <td className="px-4 py-3 text-xs text-fg-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {p.staff_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-semibold ${status.tone}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/projects/${p.id}`} className="text-brand text-sm font-semibold hover:underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminCard>
      )}

      <p className="mt-6 text-xs text-fg-subtle inline-flex items-center gap-2 flex-wrap">
        Money tracking (client payments + company expenses) is on the{' '}
        <Link href="/admin/finance" className="text-brand font-semibold hover:underline">Finance page</Link>.
      </p>
    </>
  );
}
