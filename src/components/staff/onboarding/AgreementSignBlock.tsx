'use client';

// Shared "agreement signing" block used by both step 1 (offer letter)
// and step 2 (employment contract / NDA). The document body is rendered
// inside a LetterPaper that mimics a real printed document.
//
// Flow:
//   • Staff reads the document
//   • Clicks "Agree and sign"
//   • If no signature on file → SignatureCollectionModal opens (camera
//     or upload → crop → save). When that completes successfully the
//     modal closes, the signature appears live in the LetterPaper, and
//     this component automatically dispatches the sign action.
//   • If signature already on file → sign action fires immediately.
//   • On successful sign → auto-redirect to nextHref after a short
//     delay so the staff sees the success toast.

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, ArrowRight, CheckCircle2, Download, FileSignature, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { LetterPaper } from './LetterPaper';
import { SignatureCollectionModal } from './SignatureCollectionModal';
import type { SigActionState } from '@/lib/staff/signature-actions';

interface Props {
  title: string;
  documentLabel: string;
  documentDate: string;
  recipient: string;
  firstName: string;
  paragraphs: React.ReactNode[];
  signOff: string;
  pdfHref: string;
  staffFullName: string;
  ceoName: string;
  action: (prev: SigActionState, fd: FormData) => Promise<SigActionState>;
  nextHref: string;
  nextLabel: string;
  /** True if a signature is already on file for this staff member. */
  initiallyHasSignature: boolean;
}

const INITIAL: SigActionState = { status: 'idle' };

export function AgreementSignBlock({
  title, documentLabel, documentDate, recipient, firstName, paragraphs, signOff,
  pdfHref, staffFullName, ceoName, action, nextHref, nextLabel, initiallyHasSignature,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  const [hasSignature, setHasSignature] = useState(initiallyHasSignature);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // When the user has clicked "Agree and sign" without a signature and
  // we're now waiting for the modal upload to finish so we can auto-fire.
  const [pendingAutoSign, setPendingAutoSign] = useState(false);

  // Auto-fire the sign action once the signature finishes uploading.
  useEffect(() => {
    if (!pendingAutoSign || !hasSignature) return;
    setPendingAutoSign(false);
    const t = setTimeout(() => {
      formAction(new FormData());
    }, 500);
    return () => clearTimeout(t);
  }, [pendingAutoSign, hasSignature, formAction]);

  // Auto-advance once the sign action succeeds.
  useEffect(() => {
    if (state.status !== 'success') return;
    const t = setTimeout(() => router.push(nextHref), 1200);
    return () => clearTimeout(t);
  }, [state.status, nextHref, router]);

  function handleAgreeAndSign() {
    if (!hasSignature) {
      setModalOpen(true);
      setPendingAutoSign(true);
      return;
    }
    formAction(new FormData());
  }

  function handleSignatureSaved() {
    setHasSignature(true);
    setRefreshKey((k) => k + 1);
    setModalOpen(false);
  }

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
        signatureRefreshKey={refreshKey}
      />

      <div className="mx-auto max-w-[760px] rounded-xl border border-border bg-bg-elevated p-5 md:p-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[520px]">
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">
              Ready to commit?
            </p>
            <h3 className="mt-1 text-lg font-bold text-fg">
              I have read and accept this {documentLabel.toLowerCase()}
            </h3>
            <p className="mt-1 text-sm text-fg-muted leading-relaxed">
              {!hasSignature
                ? `Clicking "Agree and sign" will ask for your signature once — then save it to this document and reuse it on the next one.`
                : `Your signature is on file. Clicking "Agree and sign" embeds it into this ${documentLabel.toLowerCase()} and records the signing date.`}
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
            <div className="text-fg">
              <p>{state.message}</p>
              <p className="mt-1 text-xs text-fg-muted inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Continuing to {nextLabel.toLowerCase()}…
              </p>
            </div>
          </div>
        )}
        {state.status === 'error' && (
          <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
            <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
            <p className="text-fg">{state.message}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 flex-wrap pt-1">
          {state.status !== 'success' && (
            <Button
              type="button"
              size="lg"
              loading={isPending || pendingAutoSign}
              onClick={handleAgreeAndSign}
              rightIcon={(isPending || pendingAutoSign) ? undefined : <FileSignature className="h-4 w-4" />}
            >
              {pendingAutoSign
                ? 'Waiting for signature…'
                : `Agree and sign ${documentLabel.toLowerCase()}`}
            </Button>
          )}
          {state.status === 'success' && (
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

      <SignatureCollectionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingAutoSign(false);
        }}
        onSigned={handleSignatureSaved}
      />
    </div>
  );
}
