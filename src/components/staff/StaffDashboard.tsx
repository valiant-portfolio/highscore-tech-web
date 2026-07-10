// Authenticated staff view — rendered INSIDE StaffShell (sidebar + topbar).
// The page intentionally mirrors AdminShell's information density so it
// reads as an operational tool, not a marketing screen. Tabs are wired
// via ?tab= query params and rendered by the parent shell's nav.

import Link from 'next/link';
import {
  Download, FileText, IdCard, ScrollText, FileSignature,
  CheckCircle2, Flame, Calendar, CircleDollarSign, Users as UsersIcon,
  BookOpenCheck,
} from 'lucide-react';
import { StaffProfilePanel } from './StaffProfilePanel';
import { TeamEodForm } from './TeamEodForm';
import { TeamEodTable } from './TeamEodTable';
import { formatNgnPlain } from '@/lib/staff/pdf-shared';
import { computePayday, type StaffRecord } from '@/lib/staff/queries';

type Tab = 'profile' | 'documents' | 'reports' | 'settings';

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
  canPostTeamEod: boolean;
  canEditProfile: boolean;
  activeStaffForEod: EodStaffMember[];
  teamEodRows: TeamEodRow[];
}

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
  ninUploaded, photoPublicUrl, canPostTeamEod, canEditProfile, activeStaffForEod, teamEodRows,
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
      title = 'Team end-of-day';
      subtitle = 'Compile the team report from the updates gathered on Google Workspace and post it here.';
      break;
    case 'settings':
      title = 'Profile';
      subtitle = canEditProfile
        ? 'View your details. Use Edit to update your photo, NIN, password, phone and personal email.'
        : 'View your details. Editing is turned off until an admin grants you access.';
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
              label="Days employed"
              value={(() => {
                if (!staff.start_date) return '—';
                const days = Math.max(0, Math.floor((Date.now() - new Date(staff.start_date).getTime()) / 86_400_000));
                return days;
              })()}
              hint={staff.start_date ? `Since ${new Date(staff.start_date).toLocaleDateString('en-GB')}` : 'Start date not set'}
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
                {canPostTeamEod && (
                  <li>
                    <Link href="/staff?tab=reports" className="flex items-center justify-between gap-2 px-3 h-10 rounded-md hover:bg-surface-hover text-fg-muted hover:text-fg">
                      Post team EOD <span className="text-fg-subtle">→</span>
                    </Link>
                  </li>
                )}
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

      {/* ── REPORTS (only when granted 'team-eod' — others hit a redirect) */}
      {activeTab === 'reports' && canPostTeamEod && (
        <div className="space-y-6">
          <Card className="p-5 md:p-7">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-lg md:text-xl font-bold text-fg">Compile the team EOD</h2>
                <p className="mt-1 text-sm text-fg-muted">
                  Gather everyone&apos;s end-of-day update from the Google Workspace group, then post the
                  consolidated report here. The CEO is emailed automatically when you submit.
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
        </div>
      )}

      {/* ── PROFILE (formerly Settings) — editing gated by 'profile-edit' */}
      {activeTab === 'settings' && (
        <StaffProfilePanel
          canEdit={canEditProfile}
          slug={staff.slug}
          fullName={signedInName || staff.full_name}
          workEmail={signedInEmail}
          phone={signedInPhone}
          personalEmail={staff.personal_email}
          photoPublicUrl={photoPublicUrl}
          ninUploaded={ninUploaded}
          bank={{
            name: staff.bank_name,
            accountNumber: staff.bank_account_number,
            accountName: staff.bank_account_name,
            updatedAt: staff.bank_updated_at,
          }}
        />
      )}
    </div>
  );
}
