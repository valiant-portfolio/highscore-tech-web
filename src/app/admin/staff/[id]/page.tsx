import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle2, Clock, FileText, IdCard, ScrollText, FileSignature,
  PenTool, ShieldAlert, MessageSquare,
} from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { StaffPhotoUpload } from '@/components/admin/StaffPhotoUpload';
import { StaffAmendForm } from '@/components/admin/StaffAmendForm';
import { StaffStatusControls } from '@/components/admin/StaffStatusControls';
import { AdminReportForm } from '@/components/admin/AdminReportForm';
import { StaffPerfCard } from '@/components/admin/StaffPerfCard';
import { getStaffAdminFull, listReportsForStaff } from '@/lib/admin/staff-queries';
import { getStaffPerformanceById } from '@/lib/admin/performance';
import { formatNgn } from '@/lib/academy/queries';

interface PageProps {
  params: Promise<{ id: string }>;
}

const KIND_LABEL = { sod: 'SOD', eod: 'EOD', general: 'General' } as const;

export default async function AdminStaffDetailPage({ params }: PageProps) {
  const { id } = await params;
  const staff = await getStaffAdminFull(id);
  if (!staff) notFound();
  const [reports, perf] = await Promise.all([
    listReportsForStaff(staff.id, 30),
    getStaffPerformanceById(staff.id),
  ]);

  return (
    <>
      <PageHead
        title={staff.full_name}
        description={
          <>
            {staff.role_title} ·{' '}
            {staff.status === 'active' ? (
              <span className="text-success font-semibold">Active</span>
            ) : (
              <span className="text-danger font-semibold">Former</span>
            )}
            {staff.nda_signed_at && (
              <> · <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Signed</span></>
            )}
          </>
        }
        back={{ href: '/admin/staff', label: 'Back to staff' }}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Performance */}
          {perf && <StaffPerfCard perf={perf} />}

          {/* Photo */}
          <AdminCard>
            <div className="p-5 md:p-6">
              <h2 className="font-display text-lg md:text-xl font-bold text-fg">Photo</h2>
              <p className="mt-1 text-sm text-fg-muted">Goes on the ID card PDF + staff dashboard avatar.</p>
              <div className="mt-5">
                <StaffPhotoUpload
                  staffId={staff.id}
                  photoPublicUrl={staff.photo_public_url}
                  fullName={staff.full_name}
                />
              </div>
            </div>
          </AdminCard>

          {/* Amend HR record */}
          <AdminCard>
            <div className="p-5 md:p-6">
              <h2 className="font-display text-lg md:text-xl font-bold text-fg">HR record</h2>
              <p className="mt-1 text-sm text-fg-muted">
                Changes here regenerate the PDFs and (if something actually changed) email the staff member.
              </p>
              <div className="mt-5">
                <StaffAmendForm staff={staff} />
              </div>
            </div>
          </AdminCard>

          {/* Reports */}
          <AdminCard>
            <div className="p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h2 className="font-display text-lg md:text-xl font-bold text-fg">Reports</h2>
                <p className="text-xs text-fg-subtle">{reports.length} on file (showing last 30)</p>
              </div>

              {reports.length === 0 ? (
                <p className="mt-4 text-sm text-fg-muted">No reports yet.</p>
              ) : (
                <ul className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {reports.map((r) => (
                    <li key={r.id} className="p-4 rounded-md border border-border bg-surface/40">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="text-xs font-mono tabular text-fg-subtle">
                          {new Date(r.report_date).toLocaleDateString('en-GB')} ·{' '}
                          <span className="font-semibold text-brand">{KIND_LABEL[r.kind]}</span>
                          {r.is_admin_override && (
                            <span className="ml-2 inline-flex items-center gap-1 text-warning">
                              <ShieldAlert className="h-3 w-3" /> Admin override
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-fg-subtle">{new Date(r.created_at).toLocaleString('en-GB')}</p>
                      </div>
                      <p className="mt-2 text-sm text-fg whitespace-pre-wrap leading-relaxed">{r.content}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 pt-5 border-t border-border">
                <h3 className="font-semibold text-fg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-brand" /> Save the day on their behalf
                </h3>
                <p className="mt-1 text-xs text-fg-muted">
                  Use sparingly. When a staff member can't post their report today, file one here so the team trail stays intact.
                </p>
                <div className="mt-4">
                  <AdminReportForm staffId={staff.id} />
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <aside className="space-y-4">
          {/* Quick facts */}
          <AdminCard>
            <div className="p-5 space-y-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Salary</p>
                <p className="mt-1 font-mono tabular text-xl font-extrabold text-fg">{formatNgn(staff.salary_ngn)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Started</p>
                <p className="mt-1 text-fg">
                  {staff.start_date ? new Date(staff.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Work email</p>
                <p className="mt-1 break-all text-fg">{staff.work_email ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Slug</p>
                <p className="mt-1 font-mono text-fg-muted">{staff.slug}</p>
              </div>
              <div className="pt-2 border-t border-border space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  {staff.signature_url
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    : <Clock className="h-3.5 w-3.5 text-warning" />}
                  <span className="text-fg-muted">Signature {staff.signature_url ? 'uploaded' : 'pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {staff.nda_signed_at
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    : <Clock className="h-3.5 w-3.5 text-warning" />}
                  <span className="text-fg-muted">
                    NDA {staff.nda_signed_at
                      ? `signed ${new Date(staff.nda_signed_at).toLocaleDateString('en-GB')}`
                      : 'not signed'}
                  </span>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* PDF downloads */}
          <AdminCard>
            <div className="p-5">
              <h3 className="font-semibold text-fg text-sm">Documents</h3>
              <p className="mt-1 text-xs text-fg-subtle">Admins can download any staff member's PDFs.</p>
              <div className="mt-4 space-y-1.5">
                <Link href={`/api/staff/${staff.slug}/job-description.pdf`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
                  <FileText className="h-3.5 w-3.5" /> Job description
                </Link>
                <Link href={`/api/staff/${staff.slug}/offer-letter.pdf`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
                  <ScrollText className="h-3.5 w-3.5" /> Offer letter
                </Link>
                <Link href={`/api/staff/${staff.slug}/contract.pdf`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
                  <FileSignature className="h-3.5 w-3.5" /> Contract
                </Link>
                <Link href={`/api/staff/${staff.slug}/id-card.pdf`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
                  <IdCard className="h-3.5 w-3.5" /> ID card
                </Link>
              </div>
            </div>
          </AdminCard>

          {/* Status */}
          <AdminCard className={staff.status === 'active' ? '' : 'border-danger/30'}>
            <div className="p-5">
              <h3 className="font-semibold text-fg text-sm">Employment status</h3>
              <p className={`mt-1 text-xs font-semibold ${staff.status === 'active' ? 'text-success' : 'text-danger'}`}>
                Currently: {staff.status.toUpperCase()}
              </p>
              <div className="mt-4">
                <StaffStatusControls staffId={staff.id} status={staff.status} />
              </div>
            </div>
          </AdminCard>

          {/* Other shortcuts */}
          <AdminCard>
            <div className="p-5">
              <h3 className="font-semibold text-fg text-sm flex items-center gap-2">
                <PenTool className="h-3.5 w-3.5 text-brand" /> Quick links
              </h3>
              <Link href="/admin/staff" className="mt-3 inline-flex text-sm font-semibold text-fg-muted hover:text-fg">
                ← Back to staff list
              </Link>
            </div>
          </AdminCard>
        </aside>
      </div>
    </>
  );
}
