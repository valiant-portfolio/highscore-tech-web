// Server-only reads for the staff portal. Auth-gated upstream — callers
// must verify the user is the linked staff member or an admin before
// returning sensitive fields.

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export interface StaffRecord {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  role_title: string;
  department: string | null;
  salary_ngn: number;
  start_date: string | null;
  status: 'active' | 'former';
  work_email: string | null;
  signature_url: string | null;
  offer_signed_at: string | null;
  nda_signed_at: string | null;
  reports_to_name: string | null;
}

interface StaffRow {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  role_title: string;
  department: string | null;
  salary_ngn: number;
  start_date: string | null;
  status: 'active' | 'former';
  work_email: string | null;
  signature_url: string | null;
  offer_signed_at: string | null;
  nda_signed_at: string | null;
  reports_to: { full_name: string } | { full_name: string }[] | null;
}

const STAFF_COLS =
  'id, user_id, slug, full_name, role_title, department, salary_ngn, start_date, status, work_email, signature_url, offer_signed_at, nda_signed_at, reports_to:reports_to(full_name)';

function reportsToName(rel: StaffRow['reports_to']): string | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0]?.full_name ?? null;
  return rel.full_name ?? null;
}

function shape(row: StaffRow): StaffRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    slug: row.slug,
    full_name: row.full_name,
    role_title: row.role_title,
    department: row.department,
    salary_ngn: row.salary_ngn,
    start_date: row.start_date,
    status: row.status,
    work_email: row.work_email,
    signature_url: row.signature_url,
    offer_signed_at: row.offer_signed_at,
    nda_signed_at: row.nda_signed_at,
    reports_to_name: reportsToName(row.reports_to),
  };
}

// ── Onboarding state helper ──────────────────────────────────────────────
// Two-document wizard: (1) offer letter, (2) employment contract + NDA.
// Signature is collected via a modal when the first document is signed,
// not as a separate step — the staff reads the document FIRST so they
// know what they're signing. Onboarding is complete once both documents
// are signed.
export interface OnboardingState {
  hasSignature: boolean;
  offerSigned:  boolean;
  ndaSigned:    boolean;
  complete:     boolean;
  /** The next step to take. 'done' means the dashboard is unlocked. */
  nextStep: 'offer' | 'nda' | 'done';
}

export function getOnboardingState(staff: StaffRecord): OnboardingState {
  const hasSignature = !!staff.signature_url;
  const offerSigned  = !!staff.offer_signed_at;
  const ndaSigned    = !!staff.nda_signed_at;
  const complete = offerSigned && ndaSigned;
  const nextStep: OnboardingState['nextStep'] =
    !offerSigned ? 'offer' :
    !ndaSigned   ? 'nda'   : 'done';
  return { hasSignature, offerSigned, ndaSigned, complete, nextStep };
}

export async function getStaffBySlug(slug: string): Promise<StaffRecord | null> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from('staff')
    .select(STAFF_COLS)
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return shape(data as unknown as StaffRow);
}

export async function getStaffByUserId(userId: string): Promise<StaffRecord | null> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from('staff')
    .select(STAFF_COLS)
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return shape(data as unknown as StaffRow);
}

export async function listAllStaff(): Promise<StaffRecord[]> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from('staff')
    .select(STAFF_COLS)
    .eq('status', 'active')
    .order('salary_ngn', { ascending: false });
  if (error) return [];
  return ((data ?? []) as unknown as StaffRow[]).map(shape);
}

// ── Payday helper ─────────────────────────────────────────────────────────
// Payday is the 15th of every month for everyone, signed or not. NDA
// signing records the signatory date in `staff.nda_signed_at` but doesn't
// change pay timing.
export interface PaydayInfo {
  dayOfMonth: 15;
  nextDate: Date;
  copy: string;
}

export function computePayday(_staff: StaffRecord, now = new Date()): PaydayInfo {
  return {
    dayOfMonth: 15,
    nextDate: nextOccurrence(now, 15),
    copy: '15th of every month',
  };
}

function nextOccurrence(from: Date, day: number): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), day);
  if (d <= from) d.setMonth(d.getMonth() + 1);
  return d;
}
