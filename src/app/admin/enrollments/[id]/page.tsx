import { notFound } from 'next/navigation';
import { PageHead, AdminCard, Kpi } from '@/components/admin/AdminPage';
import { MarkInstallmentPaidButton } from '@/components/admin/InstallmentRow';
import { getEnrollmentAdmin } from '@/lib/admin/queries';
import { formatNgn } from '@/lib/academy/queries';

interface Props {
  params: Promise<{ id: string }>;
}

function pill(status: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending:   { bg: 'bg-warning/15', fg: 'text-warning', label: 'Pending' },
    paid:      { bg: 'bg-success/15', fg: 'text-success', label: 'Paid' },
    overdue:   { bg: 'bg-danger/15',  fg: 'text-danger',  label: 'Overdue' },
    waived:    { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: 'Waived' },
    succeeded: { bg: 'bg-success/15', fg: 'text-success', label: 'Succeeded' },
    failed:    { bg: 'bg-danger/15',  fg: 'text-danger',  label: 'Failed' },
    refunded:  { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: 'Refunded' },
  };
  const p = map[status] ?? { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: status };
  return (
    <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-semibold ${p.bg} ${p.fg}`}>
      {p.label}
    </span>
  );
}

export default async function AdminEnrollmentDetailPage({ params }: Props) {
  const { id } = await params;
  const e = await getEnrollmentAdmin(id);
  if (!e) notFound();

  return (
    <>
      <PageHead
        title={`${e.student_name ?? e.student_email}`}
        description={
          <>
            {e.course_title} · {e.pay_plan === 'installment' ? 'Instalment plan' : 'Full payment'} · {' '}
            {formatNgn(e.paid_ngn)} of {formatNgn(e.total_ngn)} paid
          </>
        }
        back={{ href: '/admin/enrollments', label: 'Back to enrolments' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Kpi label="Total fee" value={formatNgn(e.total_ngn)} />
        <Kpi label="Paid"      value={formatNgn(e.paid_ngn)}  tone="success" />
        <Kpi label="Balance"   value={formatNgn(Math.max(0, e.total_ngn - e.paid_ngn))} tone="brand" />
      </div>

      <h2 className="mb-3 font-display text-lg md:text-xl font-bold text-fg">Instalments</h2>
      <AdminCard className="mb-8">
        <table className="w-full text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <th className="text-left px-4 py-3 font-bold">#</th>
              <th className="text-left px-4 py-3 font-bold">Due</th>
              <th className="text-right px-4 py-3 font-bold">Amount</th>
              <th className="text-left px-4 py-3 font-bold">Status</th>
              <th className="text-right px-4 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {e.installments.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 font-mono tabular text-fg-muted">{String(i.sort_order).padStart(2, '0')}</td>
                <td className="px-4 py-3 text-fg-muted">{new Date(i.due_date).toLocaleDateString('en-GB')}</td>
                <td className="px-4 py-3 text-right font-mono tabular font-semibold text-fg">{formatNgn(i.amount_ngn)}</td>
                <td className="px-4 py-3">{pill(i.status)}</td>
                <td className="px-4 py-3 text-right">
                  <MarkInstallmentPaidButton
                    installmentId={i.id}
                    enrollmentId={e.id}
                    isPaid={i.status === 'paid'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      <h2 className="mb-3 font-display text-lg md:text-xl font-bold text-fg">Payments</h2>
      <AdminCard>
        {e.payments.length === 0 ? (
          <p className="p-6 text-center text-fg-muted text-sm">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Date</th>
                <th className="text-left px-4 py-3 font-bold">Reference</th>
                <th className="text-right px-4 py-3 font-bold">Amount</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {e.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-fg-muted">{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3 font-mono text-xs text-fg-muted break-all">{p.alatpay_reference ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono tabular font-semibold text-fg">{formatNgn(p.amount_ngn)}</td>
                  <td className="px-4 py-3">{pill(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </>
  );
}
