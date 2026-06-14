// Application-level send helpers — one per transactional flow. Each one
// renders the React-email template to HTML, optionally renders a PDF
// attachment, and dispatches via the Resend wrapper. All non-blocking:
// callers do `void sendX(...)` so a slow Resend call doesn't tail-latency
// a server action.

import 'server-only';
import { renderToBuffer } from '@react-pdf/renderer';
import { render } from '@react-email/render';
import { createElement } from 'react';
import { sendEmail, emailConfig } from './client';
import { ContactNotifyEmail } from './templates/ContactNotifyEmail';
import { ContactAckEmail }    from './templates/ContactAckEmail';
import { EnrollmentEmail }    from './templates/EnrollmentEmail';
import { ReceiptEmail }       from './templates/ReceiptEmail';
import { StaffAmendmentEmail } from './templates/StaffAmendmentEmail';
import { StaffOffboardingEmail } from './templates/StaffOffboardingEmail';
import { InstallmentReminderEmail } from './templates/InstallmentReminderEmail';
import { WeeklyCeoSummaryEmail } from './templates/WeeklyCeoSummaryEmail';
import { EmploymentConfirmationEmail } from './templates/EmploymentConfirmationEmail';
import { TeamEodReportEmail } from './templates/TeamEodReportEmail';
import { ReceiptPdf, type ReceiptData } from '@/lib/payments/ReceiptPdf';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

// ── Contact form ─────────────────────────────────────────────────────────
export async function sendContactEmails(args: {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
}): Promise<void> {
  const submittedAt = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  const notifyHtml = await render(
    createElement(ContactNotifyEmail, { ...args, submittedAt }),
  );
  const ackHtml = await render(
    createElement(ContactAckEmail, { name: args.name }),
  );

  console.log(`[contact] sending admin notify → ${emailConfig.admin}, ack → ${args.email}`);

  // Send both in parallel; failures are logged but don't bubble up.
  const results = await Promise.allSettled([
    sendEmail({
      to: emailConfig.admin,
      subject: `New contact: ${args.name}${args.subject ? ` — ${args.subject}` : ''}`,
      html: notifyHtml,
      replyTo: args.email,
    }),
    sendEmail({
      to: args.email,
      subject: 'Thanks — we got your message',
      html: ackHtml,
    }),
  ]);

  for (const r of results) {
    if (r.status === 'rejected') console.error('[contact] send rejected:', r.reason);
  }
}

// ── Enrolment welcome (sent once, when first instalment lands) ──────────
export async function sendEnrollmentWelcome(args: {
  to: string;
  firstName: string;
  courseTitle: string;
  courseSlug: string;
  totalNgn: string;
  paidNgn: string;
  isFullPayment: boolean;
}): Promise<void> {
  const html = await render(
    createElement(EnrollmentEmail, { ...args, siteUrl: SITE_URL }),
  );
  await sendEmail({
    to: args.to,
    subject: `Welcome to ${args.courseTitle}`,
    html,
  });
}

// ── Receipt (sent on every successful payment) ──────────────────────────
export async function sendReceiptEmail(args: {
  to: string;
  firstName: string;
  receipt: ReceiptData;
  receiptUrl: string;
  courseTitle: string;
  amountPaid: string;
  totalCourseFee: string;
  paidToDate: string;
  balance: string;
}): Promise<void> {
  // Render the receipt PDF to a Buffer so we can attach it.
  let attachment: { filename: string; content: Buffer } | undefined;
  try {
    const pdf = await renderToBuffer(
      // @ts-expect-error react-pdf's internal element type
      createElement(ReceiptPdf, { receipt: args.receipt, siteUrl: SITE_URL }),
    );
    attachment = {
      filename: `highscore-tech-receipt-${args.receipt.receiptNumber}.pdf`,
      content: pdf,
    };
  } catch (err) {
    console.error('[email] receipt PDF render failed:', err);
  }

  const html = await render(
    createElement(ReceiptEmail, {
      firstName: args.firstName,
      courseTitle: args.courseTitle,
      amountPaid: args.amountPaid,
      totalCourseFee: args.totalCourseFee,
      paidToDate: args.paidToDate,
      balance: args.balance,
      reference: args.receipt.reference,
      paidOn: args.receipt.paidOn,
      receiptUrl: args.receiptUrl,
    }),
  );

  await sendEmail({
    to: args.to,
    subject: `Receipt — ${args.amountPaid} for ${args.courseTitle}`,
    html,
    ...(attachment && { attachments: [attachment] }),
  });
}

// ── Staff amendment notification (admin → staff) ────────────────────────
export async function sendStaffAmendmentEmail(args: {
  to: string;
  firstName: string;
  changes: { field: string; before: string; after: string }[];
}): Promise<void> {
  if (args.changes.length === 0) return;
  const html = await render(
    createElement(StaffAmendmentEmail, { firstName: args.firstName, changes: args.changes }),
  );
  await sendEmail({
    to: args.to,
    subject: `Your Highscore Tech record was updated`,
    html,
  });
}

// ── Staff offboarding (suspend / fire) — letter email + signed PDF ──────
// Renders the admin-typed letter to a branded email AND a signed PDF copy
// (with the CEO's real signature image), then sends to the staff member's
// personal email.
export async function sendStaffOffboardingEmail(args: {
  to: string;
  subject: string;
  heading: string;
  bodyText: string;
  recipientName: string;
  dateStr: string;
}): Promise<void> {
  // Render the signed letter PDF for the attachment.
  let attachment: { filename: string; content: Buffer } | undefined;
  try {
    const { getCeoSignatureBuffer, bufferToDataUri } = await import('@/lib/staff/signature-loader');
    const { OffboardingLetterPdf } = await import('@/lib/staff/OffboardingLetterPdf');
    const sigBuf = await getCeoSignatureBuffer();
    const pdf = await renderToBuffer(
      // @ts-expect-error react-pdf's internal element type
      createElement(OffboardingLetterPdf, {
        data: {
          title: args.heading,
          recipientName: args.recipientName,
          recipientEmail: args.to,
          dateStr: args.dateStr,
          bodyText: args.bodyText,
          ceoSignatureDataUri: sigBuf ? bufferToDataUri(sigBuf, 'image/png') : null,
        },
      }),
    );
    const slug = args.recipientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    attachment = { filename: `highscore-tech-letter-${slug || 'staff'}.pdf`, content: pdf };
  } catch (err) {
    console.error('[email] offboarding PDF render failed:', err);
  }

  const html = await render(
    createElement(StaffOffboardingEmail, { heading: args.heading, bodyText: args.bodyText }),
  );
  await sendEmail({
    to: args.to,
    subject: args.subject,
    html,
    ...(attachment && { attachments: [attachment] }),
  });
}

// ── Overdue instalment reminder ────────────────────────────────────────
export async function sendInstallmentReminder(args: {
  to: string;
  firstName: string;
  courseTitle: string;
  amountDue: string;
  dueDate: string;
  totalBalance: string;
}): Promise<void> {
  const html = await render(
    createElement(InstallmentReminderEmail, {
      ...args,
      payHref: `${SITE_URL}/profile?tab=plan`,
    }),
  );
  await sendEmail({
    to: args.to,
    subject: `Instalment due — ${args.amountDue} for ${args.courseTitle}`,
    html,
  });
}

// ── Weekly CEO summary ────────────────────────────────────────────────
export async function sendWeeklyCeoSummary(args: Parameters<typeof WeeklyCeoSummaryEmail>[0] & { to: string }): Promise<void> {
  const { to, ...emailArgs } = args;
  const html = await render(createElement(WeeklyCeoSummaryEmail, emailArgs));
  await sendEmail({
    to,
    subject: `Weekly summary — ${args.weekRange}`,
    html,
  });
}

// ── Team EOD report (sent to admin when Olivia posts) ────────────────────
export async function sendTeamEodReport(args: {
  reportDate: string;
  postedBy: string;
  summary: string;
  entries: { full_name: string; did_work: boolean; notes: string }[];
}): Promise<void> {
  const html = await render(
    createElement(TeamEodReportEmail, {
      ...args,
      dashboardHref: `${SITE_URL}/admin/reports`,
    }),
  );
  await sendEmail({
    to: emailConfig.admin,
    subject: `Team EOD · ${args.reportDate} · ${args.entries.filter((e) => e.did_work).length}/${args.entries.length} worked`,
    html,
  });
}

// ── Employment confirmation (sent after the final onboarding step) ──────
export async function sendEmploymentConfirmation(args: {
  to: string;
  firstName: string;
  fullName: string;
  roleTitle: string;
  monthlySalaryNgn: number;
  startDate: string | null;
  slug: string;
}): Promise<void> {
  const formatDate = (d: Date): string =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const formatNgn = (n: number): string =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  const startStr = args.startDate ? formatDate(new Date(args.startDate)) : '—';

  // Payday is the 15th of every month — find the next 15th.
  const today = new Date();
  const nextPayday = new Date(today.getFullYear(), today.getMonth(), 15);
  if (nextPayday <= today) nextPayday.setMonth(nextPayday.getMonth() + 1);

  const html = await render(
    createElement(EmploymentConfirmationEmail, {
      firstName: args.firstName,
      fullName: args.fullName,
      roleTitle: args.roleTitle,
      monthlySalary: formatNgn(args.monthlySalaryNgn),
      startDate: startStr,
      nextPayday: formatDate(nextPayday),
      dashboardHref:   `${SITE_URL}/staff`,
      offerPdfHref:    `${SITE_URL}/api/staff/${args.slug}/offer-letter.pdf`,
      contractPdfHref: `${SITE_URL}/api/staff/${args.slug}/contract.pdf`,
      policyPdfHref:   `${SITE_URL}/api/staff/${args.slug}/policy.pdf`,
      jobDescPdfHref:  `${SITE_URL}/api/staff/${args.slug}/job-description.pdf`,
      idCardPdfHref:   `${SITE_URL}/api/staff/${args.slug}/id-card.pdf`,
    }),
  );
  await sendEmail({
    to: args.to,
    subject: `Welcome to Highscore Tech, ${args.firstName}`,
    html,
  });
}
