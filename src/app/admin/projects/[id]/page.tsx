// /admin/projects/[id] — project detail. Money (income / expenses) is
// handled on the Finance page; this page is about scope, team, progress.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertCircle, ArrowLeft, CalendarClock, ExternalLink, Flag,
  Globe, Mail, MessageSquare, Phone, Users, Briefcase,
} from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { getProjectDetail, listAssignableStaff } from '@/lib/admin/project-queries';
import {
  AddMilestoneForm, AddProjectReportForm, AssignStaffForm,
  MilestoneStatusPill, ProjectStatusControls, UnassignButton,
} from '@/components/admin/ProjectDetailSections';

interface PageProps { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic';

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = await getProjectDetail(id);
  if (!detail) notFound();
  const staffOptions = await listAssignableStaff();

  const { project, milestones, assignments, reports } = detail;
  const isInternal = project.project_type === 'internal';

  return (
    <>
      <PageHead
        title={project.name}
        description={
          <span className="inline-flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md text-[11px] font-bold bg-surface-hover text-fg-muted uppercase">
              <Briefcase className="h-3 w-3" /> {isInternal ? 'Internal product' : 'Client project'}
            </span>
            {!isInternal && (
              <>
                <span className="font-semibold">{project.client_name}</span>
                <span className="text-fg-subtle">·</span>
              </>
            )}
            <ProjectStatusControls projectId={project.id} currentStatus={project.status} />
          </span>
        }
        back={{ href: '/admin/projects', label: 'Back to projects' }}
      />

      {/* Top facts */}
      <AdminCard className="mb-6">
        <div className="p-5 md:p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <Fact label="Started"  value={formatDate(project.started_at)} icon={<CalendarClock className="h-3.5 w-3.5" />} />
          <Fact label="Due"      value={formatDate(project.due_at)}     icon={<Flag className="h-3.5 w-3.5" />} />
          {project.ended_at && <Fact label="Ended" value={formatDate(project.ended_at)} icon={<CalendarClock className="h-3.5 w-3.5" />} />}
          {!isInternal && <Fact label="Client" value={project.client_name} icon={<Users className="h-3.5 w-3.5" />} />}
          {!isInternal && project.client_email && (
            <Fact label="Email" value={project.client_email} icon={<Mail className="h-3.5 w-3.5" />} />
          )}
          {!isInternal && project.client_phone && (
            <Fact label="Phone" value={project.client_phone} icon={<Phone className="h-3.5 w-3.5" />} />
          )}
          {project.project_url && (
            <Fact
              label={isInternal ? 'Product URL' : 'Project URL'}
              value={project.project_url}
              icon={<Globe className="h-3.5 w-3.5" />}
              link
            />
          )}
        </div>
        {project.description && (
          <div className="px-5 md:px-6 pb-6 -mt-2">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-fg-subtle">Description</p>
            <p className="mt-1.5 text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
        )}
        <div className="px-5 md:px-6 pb-5 -mt-2">
          <p className="text-xs text-fg-subtle inline-flex items-center gap-1.5">
            <ExternalLink className="h-3 w-3" />
            Money in / out for this project lives on the{' '}
            <Link href="/admin/finance" className="text-brand font-semibold hover:underline">Finance page</Link>.
          </p>
        </div>
      </AdminCard>

      {/* Milestones */}
      <AdminCard className="mb-6">
        <div className="p-5 md:p-6">
          <SectionHeader icon={<Flag className="h-5 w-5" />} title="Milestones" count={milestones.length} />
          <div className="mt-5"><AddMilestoneForm projectId={project.id} /></div>
          <div className="mt-5">
            {milestones.length === 0 ? (
              <Empty text="No milestones yet." />
            ) : (
              <ul className="space-y-2">
                {milestones.map((m) => (
                  <li key={m.id} className="rounded-md border border-border bg-surface/30 p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-fg">{m.title}</p>
                        {m.description && <p className="mt-0.5 text-sm text-fg-muted whitespace-pre-wrap">{m.description}</p>}
                        <p className="mt-1.5 text-xs text-fg-subtle">
                          Due {formatDate(m.due_date)}
                          {m.completed_at && <> · Completed {formatDate(m.completed_at.slice(0, 10))}</>}
                        </p>
                      </div>
                      <MilestoneStatusPill milestoneId={m.id} currentStatus={m.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Team */}
      <AdminCard className="mb-6">
        <div className="p-5 md:p-6">
          <SectionHeader icon={<Users className="h-5 w-5" />} title="Team assigned" count={assignments.length} />
          <div className="mt-5"><AssignStaffForm projectId={project.id} staffOptions={staffOptions} /></div>
          <div className="mt-5">
            {assignments.length === 0 ? (
              <Empty text="No staff assigned yet." />
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {assignments.map((a) => (
                  <li key={a.id} className="rounded-md border border-border bg-surface/30 p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg truncate">{a.staff_name}</p>
                      <p className="text-xs text-fg-subtle">{a.role ?? a.staff_role}</p>
                    </div>
                    <UnassignButton assignmentId={a.id} projectId={project.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Reports */}
      <AdminCard>
        <div className="p-5 md:p-6">
          <SectionHeader icon={<MessageSquare className="h-5 w-5" />} title="Progress reports" count={reports.length} />
          <p className="mt-1 text-xs text-fg-subtle">
            Daily updates on this project. Olivia or anyone with admin access can post.
          </p>
          <div className="mt-5"><AddProjectReportForm projectId={project.id} /></div>
          <div className="mt-5">
            {reports.length === 0 ? (
              <Empty text="No reports yet." />
            ) : (
              <ul className="space-y-3">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-md border border-border bg-surface/30 p-3">
                    <p className="text-xs font-mono tabular text-fg-subtle">
                      {formatDate(r.report_date)}
                      {r.submitted_by_email && <> · {r.submitted_by_email}</>}
                    </p>
                    <p className="mt-1.5 text-sm text-fg whitespace-pre-wrap leading-relaxed">{r.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </AdminCard>

      <div className="mt-6 text-xs text-fg-subtle">
        <Link href="/admin/projects" className="inline-flex items-center gap-1 hover:text-fg">
          <ArrowLeft className="h-3 w-3" /> Back to projects
        </Link>
      </div>
    </>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 flex-wrap">
      <h2 className="font-display text-lg md:text-xl font-bold text-fg inline-flex items-center gap-2">
        <span className="text-brand">{icon}</span> {title}
      </h2>
      <p className="text-xs text-fg-subtle">{count} on file</p>
    </div>
  );
}

function Fact({ label, value, icon, link }: { label: string; value: string; icon?: React.ReactNode; link?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle inline-flex items-center gap-1.5">
        {icon} {label}
      </p>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="mt-1 text-brand font-semibold break-all hover:underline inline-flex items-center gap-1">
          {value} <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <p className="mt-1 text-fg font-semibold break-all">{value}</p>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface/20 p-6 text-center">
      <AlertCircle className="h-6 w-6 mx-auto text-fg-subtle" />
      <p className="mt-2 text-sm text-fg-muted">{text}</p>
    </div>
  );
}
