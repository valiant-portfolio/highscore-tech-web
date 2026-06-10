import Link from 'next/link';
import { CheckCircle2, FileSignature, Download } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { listStaffAdminFull } from '@/lib/admin/staff-queries';
import { formatNgn } from '@/lib/academy/queries';

export default async function AdminStaffPage() {
  const staff = await listStaffAdminFull();

  return (
    <>
      <PageHead
        title="Staff"
        description="Click into any staff member to view, amend, manage photos, status, and reports."
        actions={
          <a
            href="/api/admin/export/staff"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <AdminCard>
        <table className="w-full text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <th className="text-left px-4 py-3 font-bold">Member</th>
              <th className="text-left px-4 py-3 font-bold">Role</th>
              <th className="text-right px-4 py-3 font-bold">Salary</th>
              <th className="text-left px-4 py-3 font-bold">Started</th>
              <th className="text-left px-4 py-3 font-bold">Agreement</th>
              <th className="text-left px-4 py-3 font-bold">Status</th>
              <th className="text-right px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-surface-hover/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.photo_public_url ? (
                      <img
                        src={s.photo_public_url}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <span
                        className="h-10 w-10 rounded-full grid place-items-center text-bg font-extrabold text-xs"
                        style={{ background: 'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)' }}
                      >
                        {s.full_name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <Link href={`/admin/staff/${s.id}`} className="font-semibold text-fg hover:text-brand">
                        {s.full_name}
                      </Link>
                      <p className="text-xs text-fg-subtle font-mono">{s.slug} · {s.work_email ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-fg-muted">
                  {s.role_title}
                  {s.department && <p className="text-xs text-fg-subtle">{s.department}</p>}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular font-semibold text-fg">
                  {formatNgn(s.salary_ngn)}
                </td>
                <td className="px-4 py-3 text-fg-muted">
                  {s.start_date ? new Date(s.start_date).toLocaleDateString('en-GB') : '—'}
                </td>
                <td className="px-4 py-3">
                  {s.nda_signed_at ? (
                    <span className="inline-flex h-6 items-center gap-1 px-2 rounded-md bg-success/15 text-success text-[11px] font-semibold">
                      <CheckCircle2 className="h-3 w-3" /> Signed
                    </span>
                  ) : (
                    <span className="inline-flex h-6 items-center gap-1 px-2 rounded-md bg-warning/15 text-warning text-[11px] font-semibold">
                      <FileSignature className="h-3 w-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {s.status === 'active' ? (
                    <span className="inline-flex h-6 items-center px-2 rounded-md bg-success/15 text-success text-[11px] font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex h-6 items-center px-2 rounded-md bg-danger/15 text-danger text-[11px] font-semibold">
                      Former
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/staff/${s.id}`} className="text-brand text-sm font-semibold hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
    </>
  );
}
