// Admin → Portfolio list.

import Link from 'next/link';
import { Plus, ExternalLink } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { LinkButton } from '@/components/ui';
import { listPortfolioAdmin } from '@/lib/admin/queries';

export default async function AdminPortfolioListPage() {
  const projects = await listPortfolioAdmin();

  return (
    <>
      <PageHead
        title="Portfolio"
        description="Manage public case studies — what shows up on /portfolio."
        actions={
          <LinkButton href="/admin/portfolio/new" leftIcon={<Plus className="h-4 w-4" />}>
            New project
          </LinkButton>
        }
      />

      <AdminCard>
        {projects.length === 0 ? (
          <div className="p-10 text-center text-fg-muted">
            <p>No portfolio entries yet.</p>
            <LinkButton href="/admin/portfolio/new" className="mt-4">Create the first one</LinkButton>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Title</th>
                <th className="text-left px-4 py-3 font-bold">Client</th>
                <th className="text-left px-4 py-3 font-bold">Category</th>
                <th className="text-left px-4 py-3 font-bold">Year</th>
                <th className="text-left px-4 py-3 font-bold">Sort</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-right px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-surface-hover/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/portfolio/${p.id}`} className="font-semibold text-fg hover:text-brand">
                      {p.title}
                    </Link>
                    <p className="text-xs text-fg-subtle font-mono">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{p.client ?? '—'}</td>
                  <td className="px-4 py-3 text-fg-muted">{p.category ?? '—'}</td>
                  <td className="px-4 py-3 font-mono tabular text-fg-muted">{p.year ?? '—'}</td>
                  <td className="px-4 py-3 font-mono tabular text-fg-muted">{p.sort_order}</td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="inline-flex h-6 items-center px-2 rounded-md bg-success/15 text-success text-[11px] font-semibold">Live</span>
                    ) : (
                      <span className="inline-flex h-6 items-center px-2 rounded-md bg-surface-hover text-fg-muted text-[11px] font-semibold">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-3">
                      <Link href={`/admin/portfolio/${p.id}`} className="text-brand text-sm font-semibold hover:underline">
                        Edit
                      </Link>
                      {p.published && (
                        <Link
                          href={`/portfolio/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-fg-muted hover:text-fg inline-flex items-center gap-1 text-sm"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </>
  );
}
