'use server';

// Enrollment + checkout server actions. Two entry points:
//   • initiateEnrollmentAction — called from /enrol/[slug] when the student
//     confirms a pay plan. Creates the enrollment + installment schedule +
//     a pending payment row for the first amount to charge, then returns
//     the transaction reference to the client.
//   • markPaymentSucceededAction — used by the verify route after we hit
//     ALATPay's REST API and confirm the payment. Idempotent. There is no
//     webhook — this is the only confirmation path.
//   • sweepPendingPaymentsAction — recovery path: on /profile load we
//     re-verify any payments still marked pending so a closed tab doesn't
//     leave a payment stuck.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { verifyAlatPayTransaction } from '@/lib/alatpay/server';
import { sendEnrollmentWelcome, sendReceiptEmail } from '@/lib/email/send-helpers';
import { formatNgn } from '@/lib/academy/queries';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export type PayPlan = 'full' | 'installment_2' | 'installment_3';

export interface InitiateResult {
  ok: boolean;
  message?: string;
  reference?: string;
  enrollmentId?: string;
  paymentId?: string;
  amountNgn?: number;
  customerEmail?: string;
  customerName?: string;
}

// Build a deterministic-but-unique reference for ALATPay. Format:
// HST-<enrollmentId-prefix>-<paymentId-prefix>-<timestamp>. Stays under 64
// chars so any provider accepts it as a merchant orderId.
function buildReference(enrollmentId: string, paymentId: string): string {
  const ts = Math.floor(Date.now() / 1000).toString(36);
  return `HST-${enrollmentId.slice(0, 8)}-${paymentId.slice(0, 8)}-${ts}`;
}

// Equal-ish split: split `total` across N instalments rounded to whole
// Naira. Earlier instalments take the floor; the last installment absorbs
// any rounding remainder so the total reconciles exactly.
function splitAmount(total: number, n: number): number[] {
  const each = Math.floor(total / n);
  const parts = Array(n).fill(each);
  const remainder = total - each * n;
  parts[parts.length - 1] += remainder;
  return parts;
}

function addMonths(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + n);
  return copy;
}

interface CourseRow {
  id: string;
  title: string;
  price_ngn: number;
}

export async function initiateEnrollmentAction(
  courseSlug: string,
  plan: PayPlan,
): Promise<InitiateResult> {
  const supabase = await createClient();

  // 1. Verify user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Sign in to enrol.' };

  const { data: profile } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const customerEmail = profile?.email ?? user.email ?? '';
  const customerName  = (profile?.full_name as string | null) ?? customerEmail.split('@')[0];

  // 2. Look up course (read-through public RLS is fine here)
  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select('id, title, price_ngn')
    .eq('slug', courseSlug)
    .eq('published', true)
    .maybeSingle<CourseRow>();
  if (cErr || !course) return { ok: false, message: 'Course not found.' };

  // 3. Refuse if there's already an active enrollment
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle();
  if (existing && existing.status !== 'cancelled') {
    return { ok: false, message: "You're already enrolled in this course." };
  }

  // 4. Compute plan
  const total = course.price_ngn;
  const installments: number[] =
    plan === 'full'           ? [total]
    : plan === 'installment_2' ? splitAmount(total, 2)
    : /* installment_3 */       splitAmount(total, 3);

  const payPlanDb: 'full' | 'installment' = plan === 'full' ? 'full' : 'installment';

  // 5. Create enrollment, installments, and the first payment row in a
  //    single transaction-ish flow using the service client so we don't
  //    fight RLS. We still constrain student_id to the verified user.
  const admin = serviceClient();

  const { data: enroll, error: eErr } = await admin
    .from('enrollments')
    .insert({
      student_id: user.id,
      course_id: course.id,
      status: 'pending',
      pay_plan: payPlanDb,
      total_ngn: total,
      paid_ngn: 0,
    })
    .select('id')
    .single();
  if (eErr || !enroll) {
    return { ok: false, message: `Could not create enrollment: ${eErr?.message ?? 'unknown'}` };
  }

  // Insert installment schedule. First instalment due today; subsequent
  // ones one month apart.
  const today = new Date();
  const installmentRows = installments.map((amt, idx) => ({
    enrollment_id: enroll.id,
    sort_order: idx + 1,
    due_date: addMonths(today, idx).toISOString().slice(0, 10),
    amount_ngn: amt,
    status: 'pending' as const,
  }));
  const { data: insertedInstallments, error: iErr } = await admin
    .from('installments')
    .insert(installmentRows)
    .select('id, sort_order, amount_ngn');
  if (iErr || !insertedInstallments) {
    return { ok: false, message: `Could not schedule instalments: ${iErr?.message ?? 'unknown'}` };
  }

  const first = insertedInstallments.sort((a, b) => a.sort_order - b.sort_order)[0];

  // Pending payment row for the first instalment. ALATPay reference set in
  // a follow-up update once we have the enrollment + payment IDs.
  const { data: payment, error: pErr } = await admin
    .from('payments')
    .insert({
      enrollment_id: enroll.id,
      installment_id: first.id,
      amount_ngn: first.amount_ngn,
      status: 'pending',
    })
    .select('id')
    .single();
  if (pErr || !payment) {
    return { ok: false, message: `Could not create payment: ${pErr?.message ?? 'unknown'}` };
  }

  const reference = buildReference(enroll.id, payment.id);
  const { error: refErr } = await admin
    .from('payments')
    .update({ alatpay_reference: reference })
    .eq('id', payment.id);
  if (refErr) {
    return { ok: false, message: `Could not finalise payment: ${refErr.message}` };
  }

  return {
    ok: true,
    reference,
    enrollmentId: enroll.id,
    paymentId: payment.id,
    amountNgn: first.amount_ngn,
    customerEmail,
    customerName,
  };
}

// ── markPaymentSucceededAction ────────────────────────────────────────────
// Idempotent: looks up the payment by reference, marks it succeeded if not
// already, recomputes paid_ngn on the enrollment, flips installment +
// enrollment statuses, then revalidates the profile.
export async function markPaymentSucceededAction(reference: string, rawPayload?: unknown): Promise<void> {
  const admin = serviceClient();

  const { data: payment } = await admin
    .from('payments')
    .select('id, enrollment_id, installment_id, amount_ngn, status')
    .eq('alatpay_reference', reference)
    .maybeSingle();
  if (!payment) return; // unknown ref — silently ignore
  if (payment.status === 'succeeded') return; // already processed

  // Flip payment row
  await admin
    .from('payments')
    .update({ status: 'succeeded', ...(rawPayload ? { raw_payload: rawPayload } : {}) })
    .eq('id', payment.id);

  if (payment.installment_id) {
    await admin
      .from('installments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payment.installment_id);
  }

  // Recompute paid_ngn from succeeded payments
  const { data: succeeded } = await admin
    .from('payments')
    .select('amount_ngn')
    .eq('enrollment_id', payment.enrollment_id)
    .eq('status', 'succeeded');
  const paid = (succeeded ?? []).reduce((s, p) => s + (p.amount_ngn ?? 0), 0);

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('total_ngn, status, enrolled_at, student_id, course_id')
    .eq('id', payment.enrollment_id)
    .maybeSingle();

  const isFirstPayment = enrollment ? !enrollment.enrolled_at : false;

  if (enrollment) {
    const isFullyPaid = paid >= enrollment.total_ngn;
    await admin
      .from('enrollments')
      .update({
        paid_ngn: paid,
        status: isFullyPaid ? 'active' : 'active',
        enrolled_at: enrollment.enrolled_at ?? new Date().toISOString(),
      })
      .eq('id', payment.enrollment_id);
  }

  revalidatePath('/profile');

  // Side effects (emails). Don't block the action result — failures are
  // logged inside the helpers. Fire-and-forget.
  if (enrollment) {
    void sendPaymentEmails({
      paymentId: payment.id,
      enrollmentId: payment.enrollment_id,
      studentId: enrollment.student_id,
      courseId: enrollment.course_id,
      amountNgn: payment.amount_ngn,
      paidNgn: paid,
      totalNgn: enrollment.total_ngn,
      isFirstPayment,
    });
  }
}

interface PaymentEmailArgs {
  paymentId: string;
  enrollmentId: string;
  studentId: string;
  courseId: string;
  amountNgn: number;
  paidNgn: number;
  totalNgn: number;
  isFirstPayment: boolean;
}

async function sendPaymentEmails(args: PaymentEmailArgs): Promise<void> {
  const admin = serviceClient();
  // Pull student + course + receipt context in parallel.
  const [{ data: user }, { data: course }, { data: paymentRow }, installmentCount] = await Promise.all([
    admin.from('users').select('email, full_name').eq('id', args.studentId).maybeSingle(),
    admin.from('courses').select('slug, title').eq('id', args.courseId).maybeSingle(),
    admin.from('payments').select('id, alatpay_reference, created_at, installment_id, installments(sort_order)').eq('id', args.paymentId).maybeSingle(),
    admin.from('installments').select('id', { count: 'exact', head: true }).eq('enrollment_id', args.enrollmentId),
  ]);

  if (!user?.email || !course || !paymentRow) return;

  const firstName = (user.full_name ?? '').split(/\s+/)[0] || user.email.split('@')[0];
  const courseTitle = course.title;
  const courseSlug  = course.slug;

  const formatDate = (d: string): string =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));

  // Receipt payload (matches /api/payments/[id]/receipt.pdf shape).
  const receiptUrl = `${SITE_URL}/api/payments/${paymentRow.id}/receipt.pdf`;
  const installmentRel = Array.isArray(paymentRow.installments)
    ? paymentRow.installments[0]
    : paymentRow.installments;
  const receipt = {
    receiptNumber: paymentRow.id.slice(0, 8).toUpperCase(),
    paidOn: formatDate(paymentRow.created_at),
    customerName: user.full_name ?? user.email,
    customerEmail: user.email,
    courseTitle,
    installmentIndex: installmentRel?.sort_order ?? null,
    installmentTotal: installmentCount.count ?? null,
    amountNgn: args.amountNgn,
    reference: paymentRow.alatpay_reference ?? '—',
    enrollmentTotalNgn: args.totalNgn,
    enrollmentPaidNgn: args.paidNgn,
  };

  // Receipt always.
  void sendReceiptEmail({
    to: user.email,
    firstName,
    receipt,
    receiptUrl,
    courseTitle,
    amountPaid: formatNgn(args.amountNgn),
    totalCourseFee: formatNgn(args.totalNgn),
    paidToDate: formatNgn(args.paidNgn),
    balance: formatNgn(Math.max(0, args.totalNgn - args.paidNgn)),
  });

  // Welcome only on the first payment of the enrolment.
  if (args.isFirstPayment) {
    void sendEnrollmentWelcome({
      to: user.email,
      firstName,
      courseTitle,
      courseSlug,
      totalNgn: formatNgn(args.totalNgn),
      paidNgn: formatNgn(args.paidNgn),
      isFullPayment: args.paidNgn >= args.totalNgn,
    });
  }
}

// ── sweepPendingPaymentsAction ────────────────────────────────────────────
// Re-verifies any pending payments owned by the signed-in student against
// ALATPay's REST API. Called from /profile so a student who closed the tab
// right after paying still gets their enrolment confirmed on next visit.
// Cheap when there are no pending rows; bounded by N pending rows.
export async function sweepPendingPaymentsAction(studentId: string): Promise<void> {
  const admin = serviceClient();
  const { data: pending } = await admin
    .from('payments')
    .select('alatpay_reference, enrollments!inner(student_id)')
    .eq('status', 'pending')
    .not('alatpay_reference', 'is', null)
    .eq('enrollments.student_id', studentId);

  if (!pending || pending.length === 0) return;

  await Promise.all(
    (pending as { alatpay_reference: string }[]).map(async (p) => {
      const result = await verifyAlatPayTransaction(p.alatpay_reference);
      if (result.status === 'succeeded') {
        await markPaymentSucceededAction(p.alatpay_reference, result.raw);
      }
    }),
  );
}
