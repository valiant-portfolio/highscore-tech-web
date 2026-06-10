// Authenticated staff view — tabbed: Profile, Documents, Sign agreement, Settings.

import Link from 'next/link';
import {
  Download, FileText, IdCard, ScrollText, FileSignature,
  User, FolderOpen, Settings, PenTool, CheckCircle2,
  MessageSquare, ShieldAlert,
} from 'lucide-react';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { StaffPasswordForm } from './StaffPasswordForm';
import { StaffProfileForm } from './StaffProfileForm';
import { SignAgreementBlock } from './SignAgreementBlock';
import { StaffReportForm } from './StaffReportForm';
import { StaffNinUpload } from './StaffNinUpload';
import { formatNgnPlain } from '@/lib/staff/pdf-shared';
import { computePayday, type StaffRecord } from '@/lib/staff/queries';

type Tab = 'profile' | 'documents' | 'sign' | 'reports' | 'settings';

interface OwnReport {
  id: string;
  kind: 'sod' | 'eod' | 'general';
  report_date: string;
  content: string;
  is_admin_override: boolean;
  created_at: string;
}

interface Props {
  staff: StaffRecord;
  employeeId: string;
  activeTab: Tab;
  signedInEmail: string;
  signedInName: string;
  signedInPhone: string;
  ninUploaded: boolean;
  ownReports: OwnReport[];
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',   label: 'Profile',         icon: <User className="h-4 w-4" /> },
  { id: 'documents', label: 'Documents',       icon: <FolderOpen className="h-4 w-4" /> },
  { id: 'reports',   label: 'Reports',         icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'sign',      label: 'Sign agreement',  icon: <PenTool className="h-4 w-4" /> },
  { id: 'settings',  label: 'Settings',        icon: <Settings className="h-4 w-4" /> },
];

const KIND_LABEL = { sod: 'SOD', eod: 'EOD', general: 'General' } as const;

export function StaffDashboard({ staff, employeeId, activeTab, signedInEmail, signedInName, signedInPhone, ninUploaded, ownReports }: Props) {
  const payday = computePayday(staff);

  const docs = [
    { title: 'Job description', href: `/api/staff/${staff.slug}/job-description.pdf`, icon: <FileText className="h-5 w-5" />,
      description: 'Your role, responsibilities, and team workflow rules.' },
    { title: 'Offer letter',    href: `/api/staff/${staff.slug}/offer-letter.pdf`,    icon: <ScrollText className="h-5 w-5" />,
      description: 'The original offer of employment — position, terms, start date.' },
    { title: 'Employment contract', href: `/api/staff/${staff.slug}/contract.pdf`,   icon: <FileSignature className="h-5 w-5" />,
      description: 'Your signed contract with NDA. Includes both signatures once signed.' },
    { title: 'Staff ID card',   href: `/api/staff/${staff.slug}/id-card.pdf`,        icon: <IdCard className="h-5 w-5" />,
      description: 'A4 landscape with front and back. Print to a card or carry the PDF.' },
  ];

  return (
    <>
      {/* Header */}
      <section className="relative px-4 md:px-8 pt-20 md:pt-28 pb-6">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Staff portal</p>
          <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
            Hi, {staff.full_name.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-fg-muted">
            {staff.role_title} · Employee ID <span className="font-mono tabular text-fg">{employeeId}</span>
          </p>
          {!staff.nda_signed_at && (
            <Link
              href="/staff?tab=sign"
              className="mt-4 inline-flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3 pr-4 text-left max-w-2xl hover:bg-warning/10 transition-colors"
            >
              <PenTool className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <span className="text-sm text-fg">
                <span className="font-semibold">Your agreement isn't signed yet.</span>{' '}
                <span className="text-fg-muted">
                  Sign your contract + NDA to formally accept the position — your signatory date is recorded on file.
                </span>
              </span>
            </Link>
          )}
          {staff.nda_signed_at && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> Agreement signed on {new Date(staff.nda_signed_at).toLocaleDateString('en-GB')}
            </p>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <nav className="flex flex-wrap items-center gap-1 border-b border-border" role="tablist">
            {TABS.map((t) => {
              const active = t.id === activeTab;
              return (
                <Link
                  key={t.id}
                  href={`/staff?tab=${t.id}`}
                  scroll={false}
                  role="tab"
                  aria-selected={active}
                  className={`inline-flex items-center gap-2 px-3 md:px-4 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                    active ? 'text-fg border-brand' : 'text-fg-muted border-transparent hover:text-fg'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </Link>
              );
            })}
          </nav>

          {/* Tab body */}
          <div className="mt-8 pb-24">
            {activeTab === 'profile' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PremiumCard noLift>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Role</p>
                    <p className="mt-2 text-base font-semibold text-fg">{staff.role_title}</p>
                    {staff.department && <p className="mt-1 text-xs text-fg-muted">{staff.department}</p>}
                  </div>
                </PremiumCard>
                <PremiumCard noLift>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Reports to</p>
                    <p className="mt-2 text-base font-semibold text-fg">
                      {staff.reports_to_name ?? 'Victor Otung'}
                    </p>
                    <p className="mt-1 text-xs text-fg-muted">
                      {staff.reports_to_name ? 'Operations Manager' : 'CEO'}
                    </p>
                  </div>
                </PremiumCard>
                <PremiumCard noLift>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Monthly salary</p>
                    <p className="mt-2 font-mono tabular text-2xl font-extrabold text-fg">
                      {formatNgnPlain(staff.salary_ngn)}
                    </p>
                    <p className="mt-1 text-xs text-fg-muted">Paid on the {payday.copy}</p>
                  </div>
                </PremiumCard>
                <PremiumCard noLift>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">Start date</p>
                    <p className="mt-2 text-base font-semibold text-fg">
                      {staff.start_date
                        ? new Date(staff.start_date).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })
                        : '—'}
                    </p>
                    <p className="mt-1 text-xs text-fg-muted">Active · {staff.status}</p>
                  </div>
                </PremiumCard>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-fg">
                    Your documents
                  </h2>
                  <p className="text-sm text-fg-muted">Brand-styled PDFs, generated on demand.</p>
                </div>
                <div className="mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
                  {docs.map((d) => (
                    <a key={d.title} href={d.href} target="_blank" rel="noopener noreferrer" className="block">
                      <PremiumCard>
                        <div className="p-6 flex items-start gap-4">
                          <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-brand-tint text-brand shrink-0">
                            {d.icon}
                          </span>
                          <div className="flex-1">
                            <h3 className="text-base md:text-lg font-semibold text-fg group-hover:text-brand transition-colors">
                              {d.title}
                            </h3>
                            <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{d.description}</p>
                            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                              Download <Download className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </PremiumCard>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sign' && (
              <div className="max-w-[760px]">
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-fg">
                  Sign your agreement
                </h2>
                <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                  Upload a photo of your signature on white paper. We'll process it so it appears cleanly in the contract PDF, then you confirm and sign.
                </p>
                <div className="mt-6">
                  <SignAgreementBlock
                    hasSignature={!!staff.signature_url}
                    ndaSignedAt={staff.nda_signed_at}
                  />
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="grid lg:grid-cols-[1fr_360px] gap-6">
                <PremiumCard noLift>
                  <div className="p-5 md:p-7">
                    <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-fg">
                      File a report
                    </h2>
                    <p className="mt-1 text-sm text-fg-muted">
                      Start-of-day, end-of-day, or anything that should leave a paper trail.
                    </p>
                    <div className="mt-6">
                      <StaffReportForm />
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard noLift>
                  <div className="p-5 md:p-7">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-fg">Recent reports</h3>
                      <p className="text-xs text-fg-subtle">{ownReports.length} on file</p>
                    </div>
                    {ownReports.length === 0 ? (
                      <p className="mt-4 text-sm text-fg-muted">No reports yet — file your first one on the left.</p>
                    ) : (
                      <ul className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {ownReports.map((r) => (
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
                  </div>
                </PremiumCard>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <PremiumCard noLift>
                  <div className="p-5 md:p-7">
                    <h2 className="font-display text-xl md:text-2xl font-bold text-fg">Profile</h2>
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
                  </div>
                </PremiumCard>

                <PremiumCard noLift>
                  <div className="p-5 md:p-7">
                    <h2 className="font-display text-xl md:text-2xl font-bold text-fg">Change password</h2>
                    <p className="mt-1 text-sm text-fg-muted">
                      First-time login uses <code className="font-mono text-brand">Highscore-{staff.slug}</code>. Change it here.
                    </p>
                    <div className="mt-6">
                      <StaffPasswordForm />
                    </div>
                  </div>
                </PremiumCard>

                <PremiumCard noLift className="lg:col-span-2">
                  <div className="p-5 md:p-7">
                    <h2 className="font-display text-xl md:text-2xl font-bold text-fg">Identity (NIN)</h2>
                    <p className="mt-1 text-sm text-fg-muted">
                      Upload your National Identification Number slip for HR compliance. Required for staff; private; only admin can view.
                    </p>
                    <div className="mt-6 max-w-[520px]">
                      <StaffNinUpload alreadyUploaded={ninUploaded} />
                    </div>
                  </div>
                </PremiumCard>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
