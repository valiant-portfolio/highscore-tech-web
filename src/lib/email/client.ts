// SMTP transport for every outbound email.
//
// We send through HOSTINGER email (Google Workspace was retired — the per-seat
// cost was not worth it for transactional mail). Sending mailbox is
// noreply@highzcore.tech.
//
// Setup, once:
//   1. Create the mailbox in hPanel → Emails → your domain → Create mailbox.
//   2. Put the mailbox address in SMTP_USER and its password in SMTP_PASSWORD.
//   3. DNS lives on NETLIFY, not Hostinger — see the note at the bottom.
//
// The Gmail path is kept only as a fallback so mail keeps flowing if the
// Hostinger variables are not set yet. Whichever credential pair is present
// picks its own host; we never point Gmail credentials at Hostinger's server.

import 'server-only';
import nodemailer from 'nodemailer';

const HOSTINGER_USER = process.env.SMTP_USER ?? '';
const HOSTINGER_PASS = process.env.SMTP_PASSWORD ?? '';
const GMAIL_USER = process.env.GMAIL_USER ?? '';
// Google prints app passwords in groups of four; the spaces are not part of it.
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s+/g, '');

interface Transport { host: string; port: number; user: string; pass: string }

function resolveTransport(): Transport | null {
  if (HOSTINGER_USER && HOSTINGER_PASS) {
    return {
      host: process.env.SMTP_HOST ?? 'smtp.hostinger.com',
      // 587 (STARTTLS) by default, not 465: plenty of networks and ISPs block
      // 465 and 25 outright to curb spam, and the failure looks like a hang.
      port: Number(process.env.SMTP_PORT ?? 587),
      user: HOSTINGER_USER,
      pass: HOSTINGER_PASS,
    };
  }
  if (GMAIL_USER && GMAIL_PASS) {
    return { host: 'smtp.gmail.com', port: 465, user: GMAIL_USER, pass: GMAIL_PASS };
  }
  return null;
}

const resolved = resolveTransport();

const SMTP_USER = resolved?.user ?? '';
const FROM_EMAIL = process.env.EMAIL_FROM ?? (SMTP_USER ? `Highscore Tech <${SMTP_USER}>` : '');
const ADMIN_EMAIL = process.env.EMAIL_ADMIN ?? SMTP_USER;

/**
 * Where replies land.
 *
 * We now send FROM a no-reply mailbox, so a customer hitting reply would be
 * writing into a box nobody opens. Unless a caller sets its own replyTo, every
 * message carries one pointing at a mailbox a human actually reads.
 */
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? ADMIN_EMAIL;

const transporter = resolved
  ? nodemailer.createTransport({
      host: resolved.host,
      port: resolved.port,
      secure: resolved.port === 465, // 465 = implicit TLS, 587 = STARTTLS
      // On 587 the connection starts in the clear. Without this, nodemailer
      // can send AUTH before upgrading, and the server rejects plaintext
      // credentials with a bare `535 authentication failed` that reads like a
      // wrong password. Refuse to authenticate until TLS is up.
      requireTLS: true,
      auth: { user: resolved.user, pass: resolved.pass },
    })
  : null;

export const emailConfig = {
  from: FROM_EMAIL,
  admin: ADMIN_EMAIL,
  replyTo: REPLY_TO,
  configured: !!transporter,
  host: resolved?.host ?? null,
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
      } (set SMTP_USER + SMTP_PASSWORD to enable)`,
    );
    return { ok: true, id: 'noop' };
  }
  const to = Array.isArray(args.to) ? args.to.join(', ') : args.to;
  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      ...(args.text && { text: args.text }),
      // Always set one, so replying to a no-reply sender still reaches someone.
      replyTo: args.replyTo ?? emailConfig.replyTo,
      ...(args.attachments?.length && {
        attachments: args.attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      }),
    });
    console.log(`[email:sent] "${args.subject}" → ${to} (id=${info.messageId})`);
    return { ok: true, id: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error(`[email:fail] "${args.subject}" → ${to} :: ${message}`);
    return { ok: false, error: message };
  }
}

// ── DNS, which is the part that actually breaks ─────────────────────────────
//
// highzcore.tech uses NETLIFY DNS (the nameservers point at Netlify), so
// Hostinger's own DNS panel is NOT authoritative for this domain. Hostinger
// will show you MX/SPF/DKIM records to add — add them in
// Netlify → Domains → highzcore.tech → DNS records, not in hPanel, or mail
// will neither arrive nor authenticate.
//
// The records that matter:
//   MX    @   mx1.hostinger.com   (priority 5)
//   MX    @   mx2.hostinger.com   (priority 10)
//   TXT   @   v=spf1 include:_spf.mail.hostinger.com ~all
//   TXT   hostingermail-a._domainkey   (DKIM value from hPanel)
//   TXT   _dmarc   v=DMARC1; p=none
//
// Without SPF and DKIM, Gmail will drop our mail into spam or reject it.
