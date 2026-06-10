'use server';

// Contact form server action. Writes one row into public.contact_messages
// (public-insert RLS policy makes the anon client suffice), then sends a
// notification to hello@ and an auto-reply to the sender via Resend.

import { createClient } from '@/lib/supabase/server';
import { sendContactEmails } from '@/lib/email/send-helpers';

export interface ContactFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'subject' | 'message', string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name    = String(formData.get('name')    ?? '').trim();
  const email   = String(formData.get('email')   ?? '').trim();
  const phone   = String(formData.get('phone')   ?? '').trim();
  const subject = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  const fieldErrors: ContactFormState['fieldErrors'] = {};

  if (!name)    fieldErrors.name    = 'Tell us your name.';
  if (!email)   fieldErrors.email   = 'We need an email to reply.';
  else if (!EMAIL_RE.test(email)) fieldErrors.email = "That email doesn't look right.";
  if (!message) fieldErrors.message = 'Add a quick message.';
  else if (message.length < 10) fieldErrors.message = 'A few more words please.';

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('contact_messages').insert({
    name,
    email,
    phone:   phone || null,
    subject: subject || null,
    message,
  });

  if (error) {
    return {
      status: 'error',
      message: "Couldn't send your message — try again, or email admin@highzcore.tech.",
    };
  }

  // Await the email sends. On serverless (Netlify Functions / AWS Lambda)
  // the function freezes the moment we return — fire-and-forget promises
  // get killed before SMTP completes, so the admin notification just
  // never arrives. Costs us ~1-2s of response latency but is the only
  // reliable pattern. Errors are caught inside sendContactEmails and
  // logged; they don't bubble.
  try {
    await sendContactEmails({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
    });
  } catch (err) {
    console.error('[contact] sendContactEmails threw:', err);
  }

  return {
    status: 'success',
    message: "Thanks — we'll get back to you within one working day.",
  };
}
