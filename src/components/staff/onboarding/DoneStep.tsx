'use client';

import { useRouter } from 'next/navigation';
import {
  CheckCircle2, ArrowRight, Mail, ScrollText, FileSignature, BookOpenCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { PremiumCard } from '@/components/marketing/PremiumCard';

interface Props {
  firstName: string;
  slug: string;
  signedAt: string;
}

export function DoneStep({ firstName, slug, signedAt }: Props) {
  const router = useRouter();
  const docs = [
    { title: 'Offer letter',         href: `/api/staff/${slug}/offer-letter.pdf`, icon: <ScrollText className="h-4 w-4" /> },
    { title: 'Employment contract',  href: `/api/staff/${slug}/contract.pdf`,     icon: <FileSignature className="h-4 w-4" /> },
    { title: 'Company policy',       href: `/api/staff/${slug}/policy.pdf`,       icon: <BookOpenCheck className="h-4 w-4" /> },
  ];
  return (
    <PremiumCard noLift highlight>
      <div className="p-8 md:p-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl md:text-4xl font-extrabold text-fg">
          Welcome to the team, {firstName}.
        </h2>
        <p className="mt-3 text-base md:text-lg text-fg-muted max-w-md mx-auto leading-relaxed">
          All three agreements are signed as of{' '}
          <strong className="text-fg">{new Date(signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
          Your payday is the 15th of every month.
        </p>

        <p className="mt-4 inline-flex items-center gap-2 text-sm text-fg-muted">
          <Mail className="h-4 w-4 text-brand" />
          A welcome email with copies of every signed document is on the way to your inbox.
        </p>

        {/* Signed documents */}
        <div className="mt-7 grid sm:grid-cols-3 gap-2.5 max-w-[600px] mx-auto">
          {docs.map((d) => (
            <a
              key={d.title}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-border bg-surface/40 hover:bg-surface-hover text-sm font-semibold text-fg-muted hover:text-fg transition-colors text-left"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-tint text-brand">
                {d.icon}
              </span>
              <span className="truncate">{d.title}</span>
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={() => router.push('/staff')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Open my dashboard
          </Button>
        </div>
      </div>
    </PremiumCard>
  );
}
