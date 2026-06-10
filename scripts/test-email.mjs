// One-shot Gmail SMTP test.
// Usage:
//   node scripts/test-email.mjs <to-email>
//
// Reads GMAIL_USER, GMAIL_APP_PASSWORD, EMAIL_FROM from .env.local.

import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import nodemailer from 'nodemailer';

// Manual .env.local loader (dotenv defaults to .env, not .env.local).
try {
  const raw = await readFile('.env.local', 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error('Could not read .env.local');
  process.exit(1);
}

const to = process.argv[2];
if (!to) {
  console.error('Usage: node scripts/test-email.mjs <to-email>');
  process.exit(1);
}

const user = process.env.GMAIL_USER ?? '';
const pass = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s+/g, '');
const from = process.env.EMAIL_FROM ?? `Highscore Tech <${user}>`;

if (!user || !pass) {
  console.error('GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env.local.');
  process.exit(1);
}

console.log('• Transport: smtp.gmail.com:465 (SSL)');
console.log(`  User:     ${user}`);
console.log(`  From:     ${from}`);
console.log(`  To:       ${to}`);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass },
});

console.log('• Verifying SMTP credentials…');
try {
  await transporter.verify();
  console.log('  ✓ Authenticated.');
} catch (err) {
  console.error('  ✗ Verify failed:', err.message);
  process.exit(1);
}

const html = `
<!doctype html>
<html><body style="margin:0;padding:32px 12px;background:#ECEFF2;font-family:-apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(5,14,20,0.06);">
    <tr><td style="background:linear-gradient(135deg,#050E14 0%,#102733 60%,#06677F 100%);padding:24px 32px;color:#FFFFFF;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%"><tr>
        <td style="vertical-align:middle;width:48px;padding-right:12px;">
          <div style="width:40px;height:40px;border-radius:20px;background:radial-gradient(circle at 30% 30%,#6CE8FA 0%,#18C2DC 55%,#0A8EA8 100%);color:#050E14;text-align:center;font-size:20px;font-weight:800;line-height:40px;">H</div>
        </td>
        <td style="vertical-align:middle;">
          <div style="color:#18C2DC;font-size:15px;font-weight:800;letter-spacing:-0.2px;">Highscore Tech</div>
          <div style="color:rgba(255,255,255,0.6);font-size:9px;margin-top:3px;letter-spacing:2px;">SMTP TEST</div>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:32px;">
      <h1 style="color:#050E14;font-size:24px;font-weight:800;letter-spacing:-0.4px;margin:0 0 16px;line-height:1.25;">Gmail SMTP is working ✓</h1>
      <p style="color:#0F1923;font-size:15px;line-height:1.6;margin:0 0 14px;">
        This message was sent from the Highscore Tech project's <code style="background:#F4F8FA;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px;color:#0A8EA8;">scripts/test-email.mjs</code> via Google Workspace SMTP.
      </p>
      <p style="color:#0F1923;font-size:15px;line-height:1.6;margin:0 0 14px;">
        If you can read this, the transport in <code style="background:#F4F8FA;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px;color:#0A8EA8;">src/lib/email/client.ts</code> will send contact-form notifications, enrolment confirmations, and receipt emails the same way.
      </p>
      <div style="background:#F4F8FA;padding:16px 20px;border-radius:8px;border-left:3px solid #18C2DC;margin:16px 0;">
        <div style="color:#5A7388;font-size:11px;letter-spacing:1.5px;font-weight:800;margin-bottom:4px;">PIPELINE DETAILS</div>
        <div style="color:#0F1923;font-size:13px;line-height:1.6;">
          From&nbsp;&nbsp;${from}<br/>
          Host&nbsp;&nbsp;smtp.gmail.com:465 (SSL)<br/>
          Auth&nbsp;&nbsp;App password (2FA enabled)
        </div>
      </div>
      <p style="color:#5A7388;font-size:13px;line-height:1.55;margin:0;">
        — Sent at ${new Date().toUTCString()}
      </p>
    </td></tr>
    <tr><td style="padding:20px 32px 28px;border-top:1px solid #E2E8EE;color:#5A7388;font-size:11px;line-height:1.6;">
      Highscore Tech · AI development &amp; Academy · <a href="https://highzcore.tech" style="color:#0A8EA8;text-decoration:none;">highzcore.tech</a>
    </td></tr>
  </table>
</body></html>
`;

console.log('• Sending test email…');
try {
  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Highscore Tech — SMTP test ✓',
    html,
    text: 'Gmail SMTP is working. This is a test from scripts/test-email.mjs.',
  });
  console.log(`  ✓ Sent.  Message ID: ${info.messageId}`);
  console.log(`  ✓ Response: ${info.response}`);
} catch (err) {
  console.error('  ✗ Send failed:', err.message);
  process.exit(1);
}
