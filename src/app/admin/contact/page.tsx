import { Inbox, Download } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { ContactStatusButtons } from '@/components/admin/ContactMessage';
import { listContactMessagesAdmin } from '@/lib/admin/queries';

function pill(status: string) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    new:      { bg: 'bg-danger/15',  fg: 'text-danger', label: 'New' },
    read:     { bg: 'bg-warning/15', fg: 'text-warning', label: 'Read' },
    replied:  { bg: 'bg-success/15', fg: 'text-success', label: 'Replied' },
    archived: { bg: 'bg-surface-hover', fg: 'text-fg-muted', label: 'Archived' },
  };
  const p = map[status] ?? map.new;
  return (
    <span className={`inline-flex h-6 items-center px-2 rounded-md text-[11px] font-semibold ${p.bg} ${p.fg}`}>
      {p.label}
    </span>
  );
}

export default async function AdminContactPage() {
  const messages = await listContactMessagesAdmin();

  return (
    <>
      <PageHead
        title="Contact inbox"
        description="Triage incoming enquiries. Mark them through new → read → replied → archived."
        actions={
          <a
            href="/api/admin/export/contact"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        }
      />

      <AdminCard>
        {messages.length === 0 ? (
          <div className="p-10 text-center text-fg-muted">
            <Inbox className="h-10 w-10 mx-auto text-fg-subtle" />
            <p className="mt-4">No messages yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {messages.map((m) => (
              <li key={m.id} className="p-5 md:p-6 hover:bg-surface-hover/30 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-fg">{m.name}</p>
                    <p className="text-xs text-fg-subtle">
                      <a href={`mailto:${m.email}`} className="hover:text-brand">{m.email}</a>
                      {m.phone && <> · {m.phone}</>}
                      {' · '}
                      {new Date(m.created_at).toLocaleString('en-GB')}
                    </p>
                  </div>
                  {pill(m.status)}
                </div>
                {m.subject && (
                  <p className="text-sm font-semibold text-fg mb-1">{m.subject}</p>
                )}
                <p className="text-sm text-fg-muted whitespace-pre-wrap leading-relaxed">{m.message}</p>
                <div className="mt-4">
                  <ContactStatusButtons id={m.id} current={m.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </>
  );
}
