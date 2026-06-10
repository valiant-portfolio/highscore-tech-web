import Link from 'next/link';
import { Download } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { listEnrollmentsAdmin } from '@/lib/admin/queries';
import { formatNgn } from '@/lib/academy/queries';

function pill(status: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending:   { bg: 'bg-warning/15', fg: 'text-warning', label: 'Pending' },
    active:    { bg: 'bg-success/15', fg: 'text-success', label: 'Active' },
    completed: { bg: 'bg-brand/15',   fg: 'text-brand',   label: 'Completed' },
    cancelled: { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: 'Cancelled' },
  };
  const p = map[status] ?? { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: status };
  return (
    <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-semibold ${p.bg} ${p.fg}`}>
      {p.label}
    </span>
  );
}

export default async function AdminEnrollmentsPage() {
  const enrollments = await listEnrollmentsAdmin();

  return (
    <>
      <PageHead
        title="Enrolments"
        description="Every student enrolment, with installment progress. Click in to mark offline payments paid."
        actions={
          <a
            href="/api/admin/export/enrollments"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <AdminCard>
        {enrollments.length === 0 ? (
          <p className="p-10 text-center text-fg-muted">No enrolments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Student</th>
                <th className="text-left px-4 py-3 font-bold">Course</th>
                <th className="text-left px-4 py-3 font-bold">Plan</th>
                <th className="text-right px-4 py-3 font-bold">Total</th>
                <th className="text-right px-4 py-3 font-bold">Paid</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-right px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-surface-hover/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-fg">{e.student_name ?? '—'}</p>
                    <p className="text-xs text-fg-subtle">{e.student_email}</p>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{e.course_title}</td>
                  <td className="px-4 py-3 text-fg-muted">
                    {e.pay_plan === 'installment' ? 'Instalments' : 'Full'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular font-semibold text-fg">
                    {formatNgn(e.total_ngn)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular text-fg-muted">
                    {formatNgn(e.paid_ngn)}
                  </td>
                  <td className="px-4 py-3">{pill(e.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/enrollments/${e.id}`} className="text-brand text-sm font-semibold hover:underline">
                      Open
                    </Link>
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
