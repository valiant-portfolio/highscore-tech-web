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
import { InstallmentReminderEmail } from './templates/InstallmentReminderEmail';
import { WeeklyCeoSummaryEmail } from './templates/WeeklyCeoSummaryEmail';
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

  // Send both in parallel; failures are logged but don't bubble up.
  await Promise.allSettled([
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
