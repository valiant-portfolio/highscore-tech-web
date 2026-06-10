// Gmail SMTP transport (Workspace app password). If GMAIL_USER /
// GMAIL_APP_PASSWORD are unset, every send becomes a no-op that logs
// recipient + subject so local dev keeps working without the secret.
//
// Pre-flight checklist (when configuring for the first time):
//   1. The Gmail / Workspace account behind GMAIL_USER must have
//      2-Step Verification enabled.
//   2. Create an app password at https://myaccount.google.com/apppasswords
//      (Choose "Mail", any device name). Paste the 16-character string into
//      GMAIL_APP_PASSWORD with no spaces.
//   3. For the most professional From: address, use a Google Workspace
//      mailbox like admin@highzcore.tech — set GMAIL_USER to that mailbox
//      and generate the app password from within that account.
//
// Daily limits: ~500 sends/day for personal Gmail, ~2,000/day for Workspace.

import 'server-only';
import nodemailer from 'nodemailer';

const SMTP_USER = process.env.GMAIL_USER ?? '';
const SMTP_PASS = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s+/g, '');
const FROM_EMAIL = process.env.EMAIL_FROM ?? (SMTP_USER ? `Highscore Tech <${SMTP_USER}>` : '');
const ADMIN_EMAIL = process.env.EMAIL_ADMIN ?? SMTP_USER;

const transporter =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    : null;

export const emailConfig = {
  from: FROM_EMAIL,
  admin: ADMIN_EMAIL,
  configured: !!transporter,
};

export interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!transporter) {
    console.log(
      `[email:noop] would send "${args.subject}" → ${
        Array.isArray(args.to) ? args.to.join(', ') : args.to
      } (set GMAIL_USER + GMAIL_APP_PASSWORD to enable)`,
    );
    return { ok: true, id: 'noop' };
  }
  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      ...(args.text && { text: args.text }),
      ...(args.replyTo && { replyTo: args.replyTo }),
      ...(args.attachments?.length && {
        attachments: args.attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      }),
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[email] send threw:', message);
    return { ok: false, error: message };
  }
}
