// Authenticated staff view — rendered INSIDE StaffShell (sidebar + topbar).
// The page intentionally mirrors AdminShell's information density so it
// reads as an operational tool, not a marketing screen. Tabs are wired
// via ?tab= query params and rendered by the parent shell's nav.

import Link from 'next/link';
import {
  Download, FileText, IdCard, ScrollText, FileSignature,
  CheckCircle2, ShieldAlert, Flame, Calendar, CircleDollarSign, Users as UsersIcon,
  BookOpenCheck,
} from 'lucide-react';
import { StaffPasswordForm } from './StaffPasswordForm';
import { StaffProfileForm } from './StaffProfileForm';
import { StaffReportForm } from './StaffReportForm';
import { StaffNinUpload } from './StaffNinUpload';
import { StaffPhotoUpload } from './StaffPhotoUpload';
import { StaffBankAccount } from './StaffBankAccount';
import { TeamEodForm } from './TeamEodForm';
import { TeamEodTable } from './TeamEodTable';
import { formatNgnPlain } from '@/lib/staff/pdf-shared';
import { computePayday, type StaffRecord } from '@/lib/staff/queries';

type Tab = 'profile' | 'documents' | 'reports' | 'settings';

interface OwnReport {
  id: string;
  kind: 'sod' | 'eod' | 'general' | 'team_eod';
  report_date: string;
  content: string;
  is_admin_override: boolean;
  created_at: string;
}

interface TeamEodRow {
  id: string;
  report_date: string;
  content: string;
  created_at: string;
}

interface EodStaffMember {
  id: string;
  full_name: string;
  role_title: string;
}

interface Props {
  staff: StaffRecord;
  employeeId: string;
  activeTab: Tab;
  signedInEmail: string;
  signedInName: string;
  signedInPhone: string;
  ninUploaded: boolean;
  photoPublicUrl: string | null;
  isOlivia: boolean;
  activeStaffForEod: EodStaffMember[];
  teamEodRows: TeamEodRow[];
  ownReports: OwnReport[];
}

const KIND_LABEL = { sod: 'SOD', eod: 'EOD', general: 'General', team_eod: 'Team EOD' } as const;

function StatCard({
  label, value, hint, icon, tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: React.ReactNode;
  tone?: 'default' | 'brand' | 'success';
}) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-tint text-brand' :
    tone === 'success' ? 'bg-success/15 text-success' :
                         'bg-surface-hover text-fg-muted';
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">{label}</p>
        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${toneClass}`}>{icon}</span>
      </div>
      <p className="mt-3 font-mono tabular text-2xl md:text-3xl font-extrabold text-fg leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-bg-elevated ${className}`}>{children}</div>;
}

export function StaffDashboard({
  staff, employeeId, activeTab, signedInEmail, signedInName, signedInPhone,
  ninUploaded, photoPublicUrl, isOlivia, activeStaffForEod, teamEodRows, ownReports,
}: Props) {
  const payday = computePayday(staff);
  const firstName = staff.full_name.split(' ')[0] ?? 'team';

  const docs = [
    { title: 'Job description',     href: `/api/staff/${staff.slug}/job-description.pdf`, icon: <FileText className="h-5 w-5" />,
      description: 'Your role, responsibilities, and team workflow rules.' },
    { title: 'Offer letter',        href: `/api/staff/${staff.slug}/offer-letter.pdf`,    icon: <ScrollText className="h-5 w-5" />,
      description: 'The original offer of employment — position, terms, start date.' },
    { title: 'Employment contract', href: `/api/staff/${staff.slug}/contract.pdf`,        icon: <FileSignature className="h-5 w-5" />,
      description: 'Your signed contract with NDA. Includes both signatures.' },
    { title: 'Company policy',      href: `/api/staff/${staff.slug}/policy.pdf`,          icon: <BookOpenCheck className="h-5 w-5" />,
      description: 'Day-to-day rules: working hours, leave, notice periods, IT security, conduct.' },
    { title: 'Staff ID card',       href: `/api/staff/${staff.slug}/id-card.pdf`,         icon: <IdCard className="h-5 w-5" />,
      description: 'A4 landscape with front and back. Print to a card or carry the PDF.' },
  ];

  // ── Page head varies per tab ─────────────────────────────────────────
  let title: string;
  let subtitle: string;
  switch (activeTab) {
    case 'documents':
      title = 'Your documents';
      subtitle = 'Brand-styled PDFs, generated on demand. All four reflect your signed signature.';
      break;
    case 'reports':
      title = 'Reports';
      subtitle = `File start-of-day, end-of-day, or anything that should leave a paper trail. ${ownReports.length} on file.`;
      break;
    case 'settings':
      title = 'Settings';
      subtitle = 'Update your profile, change password, upload your NIN.';
      break;
    default:
      title = `Hi, ${firstName}.`;
      subtitle = `${staff.role_title} · Employee ID ${employeeId}`;
  }

  return (
    <div className="space-y-8">
      {/* Page head */}
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-[-0.015em] text-fg">{title}</h1>
        <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>

        {activeTab === 'profile' && (
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {staff.offer_signed_at && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Offer letter signed {new Date(staff.offer_signed_at).toLocaleDateString('en-GB')}
              </span>
            )}
            {staff.nda_signed_at && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Contract + NDA signed {new Date(staff.nda_signed_at).toLocaleDateString('en-GB')}
              </span>
            )}
          </div>
        )}
      </header>

      {/* ── PROFILE / OVERVIEW ──────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Role"
              value={<span className="text-base md:text-lg">{staff.role_title}</span>}
              hint={staff.department ?? '—'}
              icon={<UsersIcon className="h-4 w-4" />}
            />
            <StatCard
              label="Next payday"
              value={<span className="text-lg md:text-xl">{payday.copy}</span>}
              hint={`Every month, on the 15th`}
              icon={<Calendar className="h-4 w-4" />}
              tone="brand"
            />
            <StatCard
              label="Monthly salary"
              value={`₦${(staff.salary_ngn / 1000).toFixed(0)}k`}
              hint={formatNgnPlain(staff.salary_ngn)}
              icon={<CircleDollarSign className="h-4 w-4" />}
              tone="success"
            />
            <StatCard
              label="Reports filed"
              value={ownReports.length}
              hint={ownReports.length > 0 ? `Last on ${new Date(ownReports[0].report_date).toLocaleDateString('en-GB')}` : 'None yet'}
              icon={<Flame className="h-4 w-4" />}
            />
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold text-fg">Your role at a glance</h2>
              <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Reports to</dt>
                  <dd className="mt-1 text-fg font-semibold">{staff.reports_to_name ?? 'Victor Otung — CEO'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Start date</dt>
                  <dd className="mt-1 text-fg font-semibold">
                    {staff.start_date
                      ? new Date(staff.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Department</dt>
                  <dd className="mt-1 text-fg font-semibold">{staff.department ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Employee ID</dt>
                  <dd className="mt-1 text-fg font-semibold font-mono">{employeeId}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Work email</dt>
                  <dd className="mt-1 text-fg-muted truncate">{staff.work_email ?? signedInEmail}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Status</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-lg font-bold text-fg">Quick actions</h2>
              <ul className="mt-5 space-y-2 text-sm">
                <li>
                  <Link href="/staff?tab=reports" className="flex items-center justify-between gap-2 px-3 h-10 rounded-md hover:bg-surface-hover text-fg-muted hover:text-fg">
                    File a report <span className="text-fg-subtle">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/staff?tab=documents" className="flex items-center justify-between gap-2 px-3 h-10 rounded-md hover:bg-surface-hover text-fg-muted hover:text-fg">
                    Download contract <span className="text-fg-subtle">→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/staff?tab=settings" className="flex items-center justify-between gap-2 px-3 h-10 rounded-md hover:bg-surface-hover text-fg-muted hover:text-fg">
                    Update profile <span className="text-fg-subtle">→</span>
                  </Link>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ───────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {docs.map((d) => (
            <a key={d.title} href={d.href} target="_blank" rel="noopener noreferrer" className="block group">
              <Card className="p-5 md:p-6 transition-colors hover:border-brand/40">
                <div className="flex items-start gap-4">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-brand-tint text-brand shrink-0">
                    {d.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-fg group-hover:text-brand transition-colors">
                      {d.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{d.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                      Download <Download className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}

      {/* ── REPORTS ─────────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Olivia: team EOD form + table */}
          {isOlivia && (
            <>
              <Card className="p-5 md:p-7">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-display text-lg md:text-xl font-bold text-fg">Team end-of-day</h2>
                    <p className="mt-1 text-sm text-fg-muted">
                      Compile the day's progress for every active staff in one post.
                      Only you can submit this.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <TeamEodForm activeStaff={activeStaffForEod} />
                </div>
              </Card>

              <Card className="p-5 md:p-7">
                <div className="flex items-baseline justify-between gap-3 mb-4">
                  <h2 className="font-display text-lg md:text-xl font-bold text-fg">Past team EODs</h2>
                  <p className="text-xs text-fg-subtle">{teamEodRows.length} on file</p>
                </div>
                <TeamEodTable rows={teamEodRows} />
              </Card>
            </>
          )}

          {/* All staff: own SOD / general form + own recent list */}
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <Card className="p-5 md:p-7">
              <h2 className="font-display text-lg md:text-xl font-bold text-fg">File a personal report</h2>
              <p className="mt-1 text-sm text-fg-muted">
                Start-of-day plan, or anything that should leave a paper trail.
                {isOlivia ? ' (EOD goes in the team EOD card above.)' : ' EODs are compiled by the operations manager.'}
              </p>
              <div className="mt-6">
                <StaffReportForm />
              </div>
            </Card>

            <Card className="p-5 md:p-7">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-fg">Your recent reports</h3>
                <p className="text-xs text-fg-subtle">{ownReports.filter((r) => r.kind !== 'team_eod').length} on file</p>
              </div>
              {ownReports.filter((r) => r.kind !== 'team_eod').length === 0 ? (
                <p className="mt-4 text-sm text-fg-muted">No reports yet — file your first one on the left.</p>
              ) : (
                <ul className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {ownReports.filter((r) => r.kind !== 'team_eod').map((r) => (
                    <li key={r.id} className="p-3 rounded-md border border-border bg-surface/40 text-sm">
                      <p className="text-xs font-mono tabular text-fg-subtle">
                        {new Date(r.report_date).toLocaleDateString('en-GB')} ·{' '}
                        <span className="font-semibold text-brand">{KIND_LABEL[r.kind]}</span>
                        {r.is_admin_override && (
                          <span className="ml-2 inline-flex items-center gap-1 text-warning">
                            <ShieldAlert className="h-3 w-3" /> Admin filed
                          </span>
                        )}
                      </p>
                      <p className="mt-1.5 text-fg whitespace-pre-wrap leading-relaxed">{r.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── SETTINGS ────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Profile</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Keep your name + phone current — used on your ID card and contract.
            </p>
            <div className="mt-6">
              <StaffProfileForm
                signedInEmail={signedInEmail}
                defaultName={signedInName}
                defaultPhone={signedInPhone}
              />
            </div>
          </Card>

          <Card className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Change password</h2>
            <p className="mt-1 text-sm text-fg-muted">
              First-time login uses <code className="font-mono text-brand">Highscore-{staff.slug}</code>. Change it here.
            </p>
            <div className="mt-6">
              <StaffPasswordForm />
            </div>
          </Card>

          <Card className="p-5 md:p-7 lg:col-span-2">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Bank account · for payroll</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Add the Nigerian bank account your monthly salary should land in. Changes are limited to once every 90 days.
            </p>
            <div className="mt-6">
              <StaffBankAccount
                initialBankName={staff.bank_name}
                initialAccountNumber={staff.bank_account_number}
                initialAccountName={staff.bank_account_name}
                initialUpdatedAt={staff.bank_updated_at}
              />
            </div>
          </Card>

          <Card className="p-5 md:p-7 lg:col-span-2">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Passport photograph</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Add a clean head-and-shoulders shot. We crop to a square automatically and embed it on your staff ID card.
            </p>
            <div className="mt-6">
              <StaffPhotoUpload initialPhotoUrl={photoPublicUrl} />
            </div>
          </Card>

          <Card className="p-5 md:p-7 lg:col-span-2">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Identity (NIN)</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Upload your National Identification Number slip for HR compliance. Required for staff; private; only admin can view.
            </p>
            <div className="mt-6 max-w-[520px]">
              <StaffNinUpload alreadyUploaded={ninUploaded} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
