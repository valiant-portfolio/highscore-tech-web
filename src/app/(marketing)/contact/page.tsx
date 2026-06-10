// Contact — form + direct channels. Form writes to contact_messages via
// the submitContactForm server action.

import type { Metadata } from 'next';
import { Mail, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/marketing/ContactForm';
import { PremiumCard } from '@/components/marketing/PremiumCard';

export const metadata: Metadata = {
  title: 'Contact — Highscore Tech',
  description:
    'Project enquiries, partnerships, academy questions — get in touch with the Highscore Tech team.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative px-4 md:px-8 pt-24 md:pt-36 pb-12 md:pb-16">
        <div className="mx-auto max-w-[920px] space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Contact</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05] text-fg">
            Tell us what you're building.
          </h1>
          <p className="text-lg md:text-xl text-fg-muted leading-relaxed max-w-2xl">
            Project enquiries, partnerships, academy enrolment, press — all welcome.
            We reply within one working day.
          </p>
        </div>
      </section>

      {/* ── Form + Side panel ────────────────────────────────────── */}
      <section className="relative isolate px-4 md:px-8 pb-24 md:pb-32">
        <div className="mx-auto max-w-[1180px] grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-16">
          {/* Form */}
          <PremiumCard className="h-fit">
            <div className="p-6 md:p-10">
              <ContactForm />
            </div>
          </PremiumCard>

          {/* Direct channels */}
          <div className="space-y-6">
            <PremiumCard noLift>
              <div className="p-6 md:p-7">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-brand-tint text-brand">
                  <Mail className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-fg">Email</h3>
                <p className="mt-1 text-sm text-fg-muted">
                  Direct, no form.
                </p>
                <a
                  href="mailto:admin@highzcore.tech"
                  className="mt-3 inline-block text-base font-semibold text-brand hover:underline"
                >
                  admin@highzcore.tech
                </a>
              </div>
            </PremiumCard>

            <PremiumCard noLift>
              <div className="p-6 md:p-7">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-brand-tint text-brand">
                  <MapPin className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-fg">Based in</h3>
                <p className="mt-1 text-sm text-fg-muted leading-relaxed">
                  Nigeria — working with clients across Africa, Europe, and North America.
                </p>
              </div>
            </PremiumCard>

          </div>
        </div>
      </section>
    </>
  );
}
