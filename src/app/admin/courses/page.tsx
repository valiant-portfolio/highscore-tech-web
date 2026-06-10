import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { listCoursesAdmin } from '@/lib/admin/queries';
import { formatNgn } from '@/lib/academy/queries';

export default async function AdminCoursesListPage() {
  const courses = await listCoursesAdmin();

  return (
    <>
      <PageHead
        title="Courses"
        description="Edit pricing, copy, and publish status. Modules are edited by re-running seed.sql."
      />

      <AdminCard>
        <table className="w-full text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <th className="text-left px-4 py-3 font-bold">Title</th>
              <th className="text-left px-4 py-3 font-bold">Level</th>
              <th className="text-left px-4 py-3 font-bold">Mode</th>
              <th className="text-right px-4 py-3 font-bold">Price</th>
              <th className="text-right px-4 py-3 font-bold">Weeks</th>
              <th className="text-left px-4 py-3 font-bold">Status</th>
              <th className="text-right px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-surface-hover/40">
                <td className="px-4 py-3">
                  <Link href={`/admin/courses/${c.id}`} className="font-semibold text-fg hover:text-brand">
                    {c.title}
                  </Link>
                  <p className="text-xs text-fg-subtle font-mono">/{c.slug}</p>
                </td>
                <td className="px-4 py-3 text-fg-muted">{c.level ?? '—'}</td>
                <td className="px-4 py-3 text-fg-muted">{c.mode === 'hybrid' ? 'Hybrid' : c.mode}</td>
                <td className="px-4 py-3 text-right font-mono tabular font-semibold text-fg">{formatNgn(c.price_ngn)}</td>
                <td className="px-4 py-3 text-right font-mono tabular text-fg-muted">{c.duration_weeks ?? '—'}</td>
                <td className="px-4 py-3">
                  {c.published ? (
                    <span className="inline-flex h-6 items-center px-2 rounded-md bg-success/15 text-success text-[11px] font-semibold">Live</span>
                  ) : (
                    <span className="inline-flex h-6 items-center px-2 rounded-md bg-surface-hover text-fg-muted text-[11px] font-semibold">Draft</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    <Link href={`/admin/courses/${c.id}`} className="text-brand text-sm font-semibold hover:underline">
                      Edit
                    </Link>
                    {c.published && (
                      <Link
                        href={`/academy/${c.slug}`}
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
      </AdminCard>
    </>
  );
}
