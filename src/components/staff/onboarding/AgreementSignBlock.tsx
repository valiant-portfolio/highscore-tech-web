'use client';

// Shared "agreement signing" block used by both step 2 (offer letter) and
// step 3 (employment contract / NDA). Renders:
//   • An "Acknowledgement" header
//   • A read-only summary of the document's key terms
//   • A "By signing" callout
//   • The CEO signature label + script-style placeholder (PDF embeds the
//     actual processed image when downloaded)
//   • The staff signature slot showing their uploaded signature live
//   • A "Sign" button bound to the supplied server action

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2, FileSignature, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { SignaturePreview } from './SignaturePreview';
import type { SigActionState } from '@/lib/staff/signature-actions';

interface Props {
  title: string;
  documentLabel: string;        // "Offer Letter" / "Employment Contract"
  summary: { heading: string; body: string }[];
  pdfHref: string;              // Link to download the actual PDF
  staffFullName: string;
  ceoName: string;
  action: (prev: SigActionState, fd: FormData) => Promise<SigActionState>;
  nextHref: string;             // Where to go after signing succeeds
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
  title, documentLabel, summary, pdfHref, staffFullName, ceoName, action, nextHref, nextLabel,
}: Props) {
  const [state, formAction] = useActionState(action, INITIAL);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PremiumCard noLift>
        <div className="p-6 md:p-10 space-y-6">
          <header>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">{documentLabel}</p>
            <h1 className="mt-1 font-display text-2xl md:text-4xl font-extrabold tracking-tight text-fg">{title}</h1>
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              Open the full PDF in a new tab →
            </a>
          </header>

          {summary.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xs uppercase tracking-[0.18em] font-bold text-brand-deep mb-2">{s.heading}</h2>
              <p className="text-sm md:text-[15px] text-fg-muted leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}

          {/* Signature block — mirrors the PDF layout */}
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8 pt-4 border-t border-border">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-fg-subtle mb-3">For Highscore Tech</p>
              <div className="w-full aspect-[4/1] rounded-md border border-dashed border-border bg-paper flex items-center justify-center px-4 py-2">
                <span className="font-display italic text-3xl text-brand-deep -rotate-3">Valiant</span>
              </div>
              <p className="mt-2 font-semibold text-fg text-sm">{ceoName}</p>
              <p className="text-xs text-fg-muted">Chief Executive Officer</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-bold text-fg-subtle mb-3">Your signature</p>
              <SignaturePreview />
              <p className="mt-2 font-semibold text-fg text-sm">{staffFullName}</p>
              <p className="text-xs text-fg-muted">Date: signed on submit</p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Confirm + sign */}
      <PremiumCard noLift highlight>
        <div className="p-6 md:p-7 space-y-4">
          <p className="text-sm text-fg-muted leading-relaxed">
            By signing, you confirm that you have read the full document and accept its terms.
            Your signature will be embedded into the {documentLabel.toLowerCase()} and the signing date is recorded on file.
          </p>

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

          <div className="flex items-center justify-end gap-3 flex-wrap">
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
      </PremiumCard>
    </div>
  );
}

// Tiny re-export so we don't import Loader2 unused.
void Loader2;
