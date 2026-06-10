'use client';

// Shared "agreement signing" block used by both step 2 (offer letter)
// and step 3 (employment contract / NDA). The document body is rendered
// inside a LetterPaper that mimics a real printed document, so the
// staff member sees what they're signing in its native shape.

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, ArrowRight, CheckCircle2, Download, FileSignature,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { LetterPaper } from './LetterPaper';
import type { SigActionState } from '@/lib/staff/signature-actions';

interface Props {
  title: string;                                  // "Offer of Employment"
  documentLabel: string;                          // "Offer Letter"
  documentDate: string;                           // "11 June 2026"
  recipient: string;                              // Multi-line recipient block
  firstName: string;
  paragraphs: React.ReactNode[];                  // Letter body, one <p> per
  signOff: string;                                // "Yours sincerely,"
  pdfHref: string;
  staffFullName: string;
  ceoName: string;
  action: (prev: SigActionState, fd: FormData) => Promise<SigActionState>;
  nextHref: string;
  nextLabel: string;
}

const INITIAL: SigActionState = { status: 'idle' };

function SignButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} rightIcon={pending ? undefined : <FileSignature className="h-4 w-4" />}>
      {label}
    </Button>
  );
}

export function AgreementSignBlock({
  title, documentLabel, documentDate, recipient, firstName, paragraphs, signOff,
  pdfHref, staffFullName, ceoName, action, nextHref, nextLabel,
}: Props) {
  const [state, formAction] = useActionState(action, INITIAL);
  const router = useRouter();

  return (
    <div className="space-y-8">
      <LetterPaper
        title={title}
        documentDate={documentDate}
        recipient={recipient}
        firstName={firstName}
        paragraphs={paragraphs}
        signOff={signOff}
        ceoName={ceoName}
        staffName={staffFullName}
      />

      {/* Sign + download row */}
      <div className="mx-auto max-w-[760px] rounded-xl border border-border bg-bg-elevated p-5 md:p-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">
              Ready to sign?
            </p>
            <h3 className="mt-1 text-lg font-bold text-fg">Confirm and sign the {documentLabel.toLowerCase()}</h3>
            <p className="mt-1 text-sm text-fg-muted leading-relaxed max-w-[520px]">
              By signing, you confirm that you have read the document above and accept its terms.
              Your signature will be embedded into the {documentLabel.toLowerCase()} and the signing date is recorded on file.
            </p>
          </div>
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 px-4 rounded-md border border-border bg-surface/60 hover:bg-surface-hover text-sm font-semibold text-fg-muted shrink-0"
          >
            <Download className="h-4 w-4" /> Open as PDF
          </a>
        </div>

        {state.status === 'success' && (
          <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <p className="text-fg">{state.message}</p>
          </div>
        )}
        {state.status === 'error' && (
          <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
            <p className="text-fg">{state.message}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 flex-wrap pt-1">
          {state.status !== 'success' ? (
            <form action={formAction}>
              <SignButton label={`Sign ${documentLabel.toLowerCase()}`} />
            </form>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={() => router.push(nextHref)}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
