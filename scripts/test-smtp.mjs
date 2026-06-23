// Verify a Gmail App Password works for SMTP before putting it in Supabase.
// Run (PowerShell):
//   $env:SMTP_USER="you@gmail.com"; $env:SMTP_PASS="abcd efgh ijkl mnop"; node scripts/test-smtp.mjs
// (spaces in the app password are fine — they're stripped automatically)
import nodemailer from 'nodemailer';

const user = process.env.SMTP_USER;
const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, ''); // Gmail shows it spaced; strip
const to = process.env.SMTP_TO || user;
if (!user || !pass) {
  console.error('✗ Set SMTP_USER and SMTP_PASS (the Gmail address + the 16-char app password).');
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass },
});

try {
  await transport.verify();
  console.log('SMTP connect + auth : OK ✓');
  const info = await transport.sendMail({
    from: `Xantle <${user}>`,
    to,
    subject: 'Xantle SMTP test ✅',
    text: 'If you got this, your Gmail App Password + SMTP works. You can now use it as Supabase custom SMTP.',
  });
  console.log('Test email sent     :', info.messageId, '→', to);
  console.log('\nCheck your inbox. If it arrived, the credential is good — plug it into Supabase.');
} catch (e) {
  console.error('✗ FAILED:', e.message);
  console.error('  Common causes: wrong app password, 2FA not enabled on the account, or using your normal password instead of an App Password.');
}
