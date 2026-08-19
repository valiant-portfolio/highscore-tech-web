// Studio contact. Channels first, form second: most people ordering a song
// would rather send a message than fill in a form, so the message buttons come
// before the fields.

import type { Metadata } from 'next';
import { MessageCircle, Send, Mail, ArrowUpRight } from 'lucide-react';
import { ContactForm } from '@/components/marketing/ContactForm';
import { LinkButton } from '@/components/ui';
import { studioChannels } from '@/lib/studio/contact';

export const metadata: Metadata = {
  title: 'Contact Highscore Studio',
  description:
    'Talk to Highscore Studio about a custom song, jingle, promo video or campaign. Message us on WhatsApp or Telegram, or send an email — we reply within one working day.',
  alternates: { canonical: '/studio/contact' },
};

const ICON = {
  whatsapp: <MessageCircle className="h-5 w-5" />,
  telegram: <Send className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
} as const;

export default function StudioContactPage() {
  const channels = studioChannels();

  return (
    <section className="px-4 md:px-8 py-12 md:py-16">
      <div className="mx-auto max-w-[900px]">
        <header className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Contact us</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] text-fg">
            Talk to the studio.
          </h1>
          <p className="mt-4 text-fg-muted leading-relaxed">
            Not sure which package fits, or want to hear samples for your kind of job first?
            Message us — we reply within one working day.
          </p>
        </header>

        {/* ── Channels ───────────────────────────────────────────── */}
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.key}
              href={c.href}
              target={c.key === 'email' ? undefined : '_blank'}
              rel={c.key === 'email' ? undefined : 'noopener noreferrer'}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand/60 hover:bg-surface-hover"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
                {ICON[c.key]}
              </span>
              <span className="mt-4 flex items-center gap-1.5 font-semibold text-fg">
                {c.label}
                <ArrowUpRight className="h-4 w-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="mt-0.5 text-sm font-medium text-brand break-all">{c.handle}</span>
              <span className="mt-2 text-sm text-fg-muted leading-relaxed">{c.blurb}</span>
            </a>
          ))}
        </div>

        {/* ── Ready to order? ────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand/5 p-5">
          <div>
            <p className="font-semibold text-fg">Already know what you want?</p>
            <p className="mt-0.5 text-sm text-fg-muted">
              Skip the back-and-forth — fill the brief and we start on payment.
            </p>
          </div>
          <LinkButton href="/studio/order">Start your order</LinkButton>
        </div>

        {/* ── Form ───────────────────────────────────────────────── */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-fg">Or send us a message</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Tell us what you’re planning and we’ll come back with what it takes.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 md:p-7">
            <ContactForm />
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-fg-subtle">
          Highscore Tech · Lagos, Nigeria · CAC RC No. 7223102
        </p>
      </div>
    </section>
  );
}
