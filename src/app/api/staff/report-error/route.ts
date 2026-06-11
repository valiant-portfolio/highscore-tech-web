// POST /api/staff/report-error — called from the error boundaries on
// /staff and /staff/onboarding when a server render fails. Logs the
// error to audit_log and sends an alert email to admin so we actually
// hear about it. Without this, the "admin has been notified" copy on
// the error page would be a lie.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { sendEmail, emailConfig } from '@/lib/email/client';

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

interface Body {
  route?: string;
  digest?: string;
  message?: string;
}

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    /* malformed body — keep going, log what we have */
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = serviceClient();

  // Resolve staff identity if the user has one — handy in the email.
  let staffName: string | null = null;
  let staffSlug: string | null = null;
  if (user) {
    const { data: staff } = await admin
      .from('staff')
      .select('full_name, slug')
      .eq('user_id', user.id)
      .maybeSingle();
    staffName = (staff?.full_name as string | null) ?? null;
    staffSlug = (staff?.slug as string | null) ?? null;
  }

  // Audit row — keeps an immutable record.
  try {
    await admin.from('audit_log').insert({
      actor_user_id: user?.id ?? null,
      actor_email:   user?.email ?? null,
      action: 'page.render_error',
      target_type:   'staff',
      target_label:  staffName ?? user?.email ?? 'anonymous',
      notes: `route=${body.route ?? 'unknown'} digest=${body.digest ?? 'none'} message=${(body.message ?? '').slice(0, 240)}`,
    });
  } catch (err) {
    console.error('[report-error] audit insert failed:', err);
  }

  // Email admin. AWAIT so the function doesn't get killed before SMTP
  // completes (the serverless-fire-and-forget bug from earlier).
  try {
    const subject = `[Highscore Tech] ${body.route ?? 'staff'} render error — ${staffName ?? user?.email ?? 'guest'}`;
    const lines: string[] = [
      `<h2 style="font-family: Inter, system-ui; color:#050E14">A staff hit a render error on the portal.</h2>`,
      `<table cellpadding="6" cellspacing="0" style="font-family: Inter, system-ui; color:#222; border-collapse: collapse;">`,
      `<tr><td><b>Route</b></td><td>${body.route ?? '—'}</td></tr>`,
      `<tr><td><b>Error digest</b></td><td><code>${body.digest ?? '—'}</code></td></tr>`,
      `<tr><td><b>Staff</b></td><td>${staffName ? `${staffName} (${staffSlug ?? '—'})` : 'Not linked to a staff record'}</td></tr>`,
      `<tr><td><b>User email</b></td><td>${user?.email ?? '—'}</td></tr>`,
      `<tr><td><b>User ID</b></td><td><code>${user?.id ?? '—'}</code></td></tr>`,
      body.message ? `<tr><td><b>Client message</b></td><td>${body.message.slice(0, 500)}</td></tr>` : '',
      `<tr><td><b>Time</b></td><td>${new Date().toISOString()}</td></tr>`,
      `</table>`,
      `<p style="font-family: Inter, system-ui; color:#5A7388; margin-top:18px">`,
      `Match the digest above against the Netlify Function logs (search <code>[onboarding] render error</code> or <code>[staff] render error</code>) for the stack trace.`,
      `</p>`,
      `<p style="font-family: Inter, system-ui; color:#5A7388; margin-top:10px">`,
      `<a href="${SITE_URL}/admin/audit" style="color:#0A8EA8">Open audit log</a> · <a href="${SITE_URL}/admin/staff" style="color:#0A8EA8">Open staff list</a>`,
      `</p>`,
    ].filter(Boolean);

    await sendEmail({
      to: emailConfig.admin,
      subject,
      html: lines.join('\n'),
    });
  } catch (err) {
    console.error('[report-error] email send failed:', err);
  }

  return NextResponse.json({ ok: true });
}
