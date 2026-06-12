// /admin/projects — list of all client projects with key metrics.

import Link from 'next/link';
import {
  Briefcase, CircleDollarSign, Plus, TrendingDown, TrendingUp, Users,
} from 'lucide-react';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { listProjects } from '@/lib/admin/project-queries';
import { formatNgn } from '@/lib/academy/queries';

export const dynamic = 'force-dynamic';

const STATUS_LABEL = {
  in_progress: { label: 'In progress', tone: 'bg-brand-tint text-brand' },
  completed:   { label: 'Completed',   tone: 'bg-success/15 text-success' },
  cancelled:   { label: 'Cancelled',   tone: 'bg-danger/15 text-danger' },
} as const;

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  const totalCost     = projects.reduce((s, p) => s + Number(p.cost_ngn), 0);
  const totalReceived = projects.reduce((s, p) => s + p.received_ngn, 0);
  const totalSpent    = projects.reduce((s, p) => s + p.spent_ngn, 0);
  const totalNet      = totalReceived - totalSpent;

  return (
    <>
      <PageHead
        title="Client projects"
        description="Every client engagement, its cost, what's been paid, what we've spent, and who's working on it."
        actions={
          <Link
            href="/admin/projects/new"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md bg-brand text-brand-fg text-sm font-semibold hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" /> Add project
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi label="Active projects" value={projects.filter((p) => p.status === 'in_progress').length} />
        <Kpi label="Total committed"  value={formatNgn(totalCost)} />
        <Kpi label="Total received"   value={formatNgn(totalReceived)} tone="success" />
        <Kpi label="Net (received − spent)" value={formatNgn(totalNet)} tone={totalNet >= 0 ? 'success' : 'default'} />
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
                <th className="text-left  px-4 py-3 font-bold">Project</th>
                <th className="text-right px-4 py-3 font-bold">Cost</th>
                <th className="text-right px-4 py-3 font-bold">Received</th>
                <th className="text-right px-4 py-3 font-bold">Spent</th>
                <th className="text-right px-4 py-3 font-bold">Net</th>
                <th className="text-left  px-4 py-3 font-bold">Milestones</th>
                <th className="text-left  px-4 py-3 font-bold">Team</th>
                <th className="text-left  px-4 py-3 font-bold">Status</th>
                <th className="text-right px-4 py-3 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => {
                const tone = STATUS_LABEL[p.status].tone;
                const label = STATUS_LABEL[p.status].label;
                const progressPct = Number(p.cost_ngn) > 0
                  ? Math.min(100, Math.round((p.received_ngn / Number(p.cost_ngn)) * 100))
                  : 0;
                return (
                  <tr key={p.id} className="hover:bg-surface-hover/40 align-top">
                    <td className="px-4 py-3">
                      <Link href={`/admin/projects/${p.id}`} className="font-semibold text-fg hover:text-brand">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-fg-subtle">{p.client_name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular text-fg">
                      {formatNgn(Number(p.cost_ngn))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono tabular text-success font-semibold">{formatNgn(p.received_ngn)}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-surface-hover overflow-hidden w-24 ml-auto">
                        <div className="h-full bg-success" style={{ width: `${progressPct}%` }} />
                      </div>
                      <p className="mt-0.5 text-[10px] text-fg-subtle">{progressPct}% paid</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular text-fg-muted">
                      {formatNgn(p.spent_ngn)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 font-mono tabular font-bold ${p.net_ngn >= 0 ? 'text-success' : 'text-danger'}`}>
                        {p.net_ngn >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatNgn(Math.abs(p.net_ngn))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-fg-muted">
                      {p.milestones_completed} / {p.milestones_total}
                    </td>
                    <td className="px-4 py-3 text-xs text-fg-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {p.staff_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-semibold ${tone}`}>
                        {label}
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

      <p className="mt-6 text-xs text-fg-subtle inline-flex items-center gap-1.5">
        <CircleDollarSign className="h-3 w-3" /> Net = total received from client − total spent on project.
      </p>
    </>
  );
}
