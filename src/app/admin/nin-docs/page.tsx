// /admin/nin-docs — list of staff with NIN documents on file.
// Clicking opens the doc via a short-lived signed URL.

import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { NinViewerButton } from '@/components/admin/NinViewerButton';
import { serviceClient } from '@/lib/supabase/service';

interface StaffNinRow {
  staff_id: string;
  user_id: string;
  slug: string;
  full_name: string;
  role_title: string;
  status: 'active' | 'former';
  work_email: string | null;
  nin_doc_url: string | null;
  email: string;
  date_of_birth: string | null;
  gender: string | null;
  state_of_origin: string | null;
  city: string | null;
  phone: string | null;
  onboarded_at: string | null;
}

export default async function AdminNinDocsPage() {
  const admin = serviceClient();
  // Join staff → users so we can see who has a NIN uploaded.
  const { data } = await admin
    .from('staff')
    .select(`
      id, user_id, slug, full_name, role_title, status, work_email,
      users:user_id(email, date_of_birth, gender, state_of_origin, city, phone, onboarded_at, nin_doc_url)
    `)
    .not('user_id', 'is', null)
    .order('full_name', { ascending: true });

  type Row = {
    id: string;
    user_id: string;
    slug: string;
    full_name: string;
    role_title: string;
    status: 'active' | 'former';
    work_email: string | null;
    users:
      | { email: string; date_of_birth: string | null; gender: string | null; state_of_origin: string | null; city: string | null; phone: string | null; onboarded_at: string | null; nin_doc_url: string | null }
      | { email: string; date_of_birth: string | null; gender: string | null; state_of_origin: string | null; city: string | null; phone: string | null; onboarded_at: string | null; nin_doc_url: string | null }[]
      | null;
  };
  const rows: StaffNinRow[] = ((data ?? []) as unknown as Row[]).map((r) => {
    const u = Array.isArray(r.users) ? r.users[0] : r.users;
    return {
      staff_id: r.id,
      user_id: r.user_id,
      slug: r.slug,
      full_name: r.full_name,
      role_title: r.role_title,
      status: r.status,
      work_email: r.work_email,
      nin_doc_url: u?.nin_doc_url ?? null,
      email: u?.email ?? '',
      date_of_birth: u?.date_of_birth ?? null,
      gender: u?.gender ?? null,
      state_of_origin: u?.state_of_origin ?? null,
      city: u?.city ?? null,
      phone: u?.phone ?? null,
      onboarded_at: u?.onboarded_at ?? null,
    };
  });

  const withNin = rows.filter((r) => r.nin_doc_url);
  const withoutNin = rows.filter((r) => !r.nin_doc_url);

  return (
    <>
      <PageHead
        title="NIN documents"
        description="Staff identity verification. Clicking 'View NIN' opens a 5-minute signed URL — links expire automatically."
      />

      <AdminCard className="mb-6">
        <table className="w-full text-sm">
          <thead className="bg-surface-hover/40 text-[11px] uppercase tracking-wider text-fg-subtle">
            <tr>
              <th className="text-left px-4 py-3 font-bold">Staff</th>
              <th className="text-left px-4 py-3 font-bold">Role</th>
              <th className="text-left px-4 py-3 font-bold">Demographics</th>
              <th className="text-left px-4 py-3 font-bold">Location</th>
              <th className="text-right px-4 py-3 font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {withNin.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-fg-muted">
                  No staff have uploaded a NIN document yet. They can upload from <code className="font-mono text-brand">/staff?tab=settings</code>.
                </td>
              </tr>
            )}
            {withNin.map((s) => (
              <tr key={s.staff_id} className="hover:bg-surface-hover/40">
                <td className="px-4 py-3">
                  <p className="font-semibold text-fg">{s.full_name}</p>
                  <p className="text-xs text-fg-subtle">{s.work_email ?? s.email}</p>
                  {s.phone && <p className="text-xs text-fg-subtle font-mono">{s.phone}</p>}
                </td>
                <td className="px-4 py-3 text-fg-muted text-sm">
                  <p>{s.role_title}</p>
                  {s.status === 'former' && (
                    <span className="inline-flex h-5 items-center px-1.5 rounded-md bg-danger/15 text-danger text-[10px] font-bold mt-1">FORMER</span>
                  )}
                </td>
                <td className="px-4 py-3 text-fg-muted text-xs">
                  {s.date_of_birth && <p>DOB: {new Date(s.date_of_birth).toLocaleDateString('en-GB')}</p>}
                  {s.gender && <p className="capitalize">{s.gender}</p>}
                </td>
                <td className="px-4 py-3 text-fg-muted text-xs">
                  {s.state_of_origin && <p>{s.state_of_origin}</p>}
                  {s.city && <p className="text-fg-subtle">{s.city}</p>}
                </td>
                <td className="px-4 py-3 text-right">
                  <NinViewerButton userId={s.user_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>

      {withoutNin.length > 0 && (
        <AdminCard>
          <div className="p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-fg-subtle mb-3">
              Awaiting upload ({withoutNin.length})
            </p>
            <ul className="space-y-2 text-sm">
              {withoutNin.map((s) => (
                <li key={s.staff_id} className="flex items-center justify-between gap-2">
                  <span className="text-fg">{s.full_name} <span className="text-fg-subtle">· {s.role_title}</span></span>
                  <span className="text-xs text-fg-subtle">{s.work_email}</span>
                </li>
              ))}
            </ul>
          </div>
        </AdminCard>
      )}

      <p className="mt-6 text-xs text-fg-subtle">
        Privacy note: NIN documents are private — only admin can open them. Signed URLs expire after 5 minutes.
      </p>
    </>
  );
}
