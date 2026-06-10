'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui';
import { PremiumCard } from '@/components/marketing/PremiumCard';

interface Props {
  firstName: string;
  slug: string;
  signedAt: string;
}

export function DoneStep({ firstName, slug, signedAt }: Props) {
  const router = useRouter();
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
          All your agreements are signed. Your offer letter and employment contract are on file as of{' '}
          <strong className="text-fg">{new Date(signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
          Your payday is the 15th of every month.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={() => router.push('/staff')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Open my dashboard
          </Button>
          <a
            href={`/api/staff/${slug}/contract.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-2 px-6 rounded-lg border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted"
          >
            <Download className="h-4 w-4" /> Download signed contract
          </a>
        </div>
      </div>
    </PremiumCard>
  );
}
