// Per-staff performance metrics — computed in TS from raw reports + auth +
// staff data. Cheap because the team is small; if it ever grows we'd move
// the aggregation into a Postgres view.

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export interface StaffPerf {
  staffId: string;
  slug: string;
  full_name: string;
  role_title: string;
  status: 'active' | 'former';
  lastSignInAt: string | null;
  lastReportAt: string | null;
  reportCount: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  streakDays: number;
  selfFiledPct: number;          // 0..1
  ndaSignedAt: string | null;
  signatureUploaded: boolean;
  daysEmployed: number | null;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  // Unique calendar-date strings, sorted descending.
  const set = new Set(dates.map((d) => d.slice(0, 10)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const cursor = new Date(today);
  // If there's no report today, start counting from yesterday — that's still
  // a one-day grace window so the streak doesn't reset before EOD.
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getStaffPerformance(): Promise<StaffPerf[]> {
  const admin = serviceClient();
  const [{ data: staffRows }, { data: reports }, authList] = await Promise.all([
    admin
      .from('staff')
      .select('id, user_id, slug, full_name, role_title, status, start_date, signature_url, nda_signed_at')
      .order('salary_ngn', { ascending: false }),
    admin
      .from('staff_reports')
      .select('id, staff_id, report_date, created_at, is_admin_override')
      .order('report_date', { ascending: false })
      .limit(2000),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const lastSignByUser = new Map<string, string | null>();
  for (const u of authList.data?.users ?? []) {
    lastSignByUser.set(u.id, u.last_sign_in_at ?? null);
  }

  const weekCutoff  = daysAgo(7);
  const monthCutoff = daysAgo(30);

  const result: StaffPerf[] = [];
  for (const s of staffRows ?? []) {
    const mine = (reports ?? []).filter((r) => r.staff_id === s.id);
    const dates = mine.map((m) => m.report_date as string);
    const reportsThisWeek  = mine.filter((m) => new Date(m.report_date) >= weekCutoff).length;
    const reportsThisMonth = mine.filter((m) => new Date(m.report_date) >= monthCutoff).length;
    const selfFiled = mine.filter((m) => !m.is_admin_override).length;
    const selfFiledPct = mine.length === 0 ? 0 : selfFiled / mine.length;
    const lastReportAt = mine[0]?.created_at ?? null;

    const daysEmployed = s.start_date
      ? Math.max(0, Math.floor((Date.now() - new Date(s.start_date as string).getTime()) / 86400000))
      : null;

    result.push({
      staffId: s.id as string,
      slug: s.slug as string,
      full_name: s.full_name as string,
      role_title: s.role_title as string,
      status: s.status as 'active' | 'former',
      lastSignInAt: s.user_id ? lastSignByUser.get(s.user_id as string) ?? null : null,
      lastReportAt,
      reportCount: mine.length,
      reportsThisWeek,
      reportsThisMonth,
      streakDays: calcStreak(dates),
      selfFiledPct,
      ndaSignedAt: (s.nda_signed_at as string | null) ?? null,
      signatureUploaded: !!s.signature_url,
      daysEmployed,
    });
  }
  return result;
}

export async function getStaffPerformanceById(staffId: string): Promise<StaffPerf | null> {
  const all = await getStaffPerformance();
  return all.find((p) => p.staffId === staffId) ?? null;
}
