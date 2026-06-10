// Staff onboarding wizard — multi-step flow that runs before the regular
// dashboard unlocks. Steps:
//   1. signature — upload signature photo, background-removed
//   2. offer     — review offer letter, sign
//   3. nda       — review employment contract + NDA, sign
//   4. done      — celebrate, unlock dashboard

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { UploadSignatureStep } from '@/components/staff/onboarding/UploadSignatureStep';
import { AgreementSignBlock } from '@/components/staff/onboarding/AgreementSignBlock';
import { DoneStep } from '@/components/staff/onboarding/DoneStep';
import { OnboardingWizardChrome } from '@/components/staff/onboarding/OnboardingWizardChrome';
import { getStaffByUserId, getOnboardingState } from '@/lib/staff/queries';
import { getCurrentUser } from '@/lib/auth/queries';
import { signOfferLetterAction, signNdaAction } from '@/lib/staff/signature-actions';
import { ROLE_CONTENT, breakdownSalary } from '@/lib/staff/role-content';
import { formatNgnPlain } from '@/lib/staff/pdf-shared';

export const metadata: Metadata = {
  title: 'Onboarding — Highscore Tech',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ step?: string }>;
}

const ALLOWED_STEPS = ['signature', 'offer', 'nda', 'done'] as const;
type Step = (typeof ALLOWED_STEPS)[number];

export default async function StaffOnboardingPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/staff/onboarding');

  const staff = await getStaffByUserId(user.id);
  if (!staff) {
    if (user.role === 'admin') redirect('/admin');
    redirect('/profile');
  }
  if (staff.status !== 'active') redirect('/login?inactive=1');

  const state = getOnboardingState(staff);
  const { step: stepParam } = await searchParams;
  // Default = next required step. If they jump ahead via URL, we snap them
  // back to the next required step. The exception is `?step=done` — only
  // valid once everything's signed.
  const requestedStep = (ALLOWED_STEPS as readonly string[]).includes(stepParam ?? '')
    ? (stepParam as Step)
    : state.nextStep;

  let activeStep: Step = state.nextStep;
  // Allow staying on a step that matches what's still needed, or going
  // back to a completed step to re-read.
  if (requestedStep === 'signature') activeStep = 'signature';
  else if (requestedStep === 'offer' && state.hasSignature) activeStep = 'offer';
  else if (requestedStep === 'nda'   && state.hasSignature && state.offerSigned) activeStep = 'nda';
  else if (requestedStep === 'done'  && state.complete) activeStep = 'done';

  // Onboarding finished — show the done screen then redirect to /staff
  // via the dashboard button. Hitting /staff/onboarding after completion
  // is harmless — we just show the success card.

  const content = ROLE_CONTENT[staff.slug];
  const salary  = breakdownSalary(staff.slug, staff.salary_ngn);
  const firstName = staff.full_name.split(' ')[0] ?? 'team';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="sticky top-0 z-30 bg-bg-elevated/85 backdrop-blur-md border-b border-border h-16">
        <div className="h-full mx-auto max-w-[1180px] px-4 md:px-8 flex items-center">
          <Logo size="sm" href={null} />
          <p className="ml-auto text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle hidden sm:block">
            Welcome, {firstName}
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-10 md:py-14">
        <div className="mx-auto max-w-[840px]">
          <OnboardingWizardChrome
            current={activeStep}
            hasSignature={state.hasSignature}
            offerSigned={state.offerSigned}
            ndaSigned={state.ndaSigned}
          />

          {activeStep === 'signature' && (
            <div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Step 1 of 3</p>
                <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
                  Your signature, once.
                </h1>
                <p className="mt-2 text-fg-muted">
                  Sign on a clean white sheet of paper and upload a photo. We crop it to a horizontal signature shape and remove the background so it embeds cleanly in every document you sign here.
                </p>
              </div>
              <UploadSignatureStep initialHasSignature={state.hasSignature} />
            </div>
          )}

          {activeStep === 'offer' && (
            <div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Step 2 of 3</p>
                <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
                  Sign the offer letter.
                </h1>
                <p className="mt-2 text-fg-muted">
                  Read the key terms below and download the full PDF if you want every word. Your signature appears in the slot at the bottom — click sign when you're ready.
                </p>
              </div>
              <AgreementSignBlock
                title="Offer of Employment"
                documentLabel="Offer Letter"
                pdfHref={`/api/staff/${staff.slug}/offer-letter.pdf`}
                staffFullName={staff.full_name}
                ceoName="Victor Otung"
                summary={[
                  { heading: 'Position', body:
                    `${staff.role_title}${staff.department ? ` (${staff.department})` : ''}.\nReports to ${staff.reports_to_name ?? 'Victor Otung — CEO'}.\nWork arrangement: Hybrid — Nigeria.\nStart date: ${staff.start_date ? new Date(staff.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}.` },
                  { heading: 'Compensation', body:
                    `${formatNgnPlain(salary.total)} monthly${salary.allowance ? ` (${formatNgnPlain(salary.base)} base + ${formatNgnPlain(salary.allowance.amount)} ${salary.allowance.label.toLowerCase()})` : ''}.\nPayday: 15th of every month.` },
                  ...(content ? [{
                    heading: "What you'll own",
                    body: content.responsibilities.map((r) => `• ${r}`).join('\n'),
                  }] : []),
                  { heading: 'Confidentiality', body:
                    'By signing, you agree to treat all confidential information about products, clients, team, and financials in confidence — during employment and after it ends.' },
                ]}
                action={signOfferLetterAction}
                nextHref="/staff/onboarding?step=nda"
                nextLabel="Continue to contract"
              />
            </div>
          )}

          {activeStep === 'nda' && (
            <div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Step 3 of 3</p>
                <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
                  Employment contract + NDA.
                </h1>
                <p className="mt-2 text-fg-muted">
                  The formal agreement governing your employment. Includes the NDA. Same signature you uploaded — no need to upload again.
                </p>
              </div>
              <AgreementSignBlock
                title="Employment Contract"
                documentLabel="Employment Contract"
                pdfHref={`/api/staff/${staff.slug}/contract.pdf`}
                staffFullName={staff.full_name}
                ceoName="Victor Otung"
                summary={[
                  { heading: 'Parties', body:
                    `Highscore Tech (the "Company") and ${staff.full_name} (the "Employee"), with effect from ${staff.start_date ? new Date(staff.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}.` },
                  { heading: 'Position & duties', body:
                    `${staff.role_title}, reporting to ${staff.reports_to_name ?? 'Victor Otung, CEO'}. Duties per the Job Description.` },
                  { heading: 'Compensation', body:
                    `${formatNgnPlain(salary.total)} per month, paid on the 15th of each month.` },
                  { heading: 'Confidentiality + IP', body:
                    'You will treat company information in confidence indefinitely and assign all work product created in the course of duties to the Company.' },
                  { heading: 'Termination', body:
                    'Either party may terminate with 30 days written notice. Gross misconduct allows immediate termination.' },
                  { heading: 'Non-solicitation', body:
                    '12-month non-solicit of Company clients and employees from end of employment.' },
                  { heading: 'Governing law', body:
                    'Laws of the Federal Republic of Nigeria; Nigerian courts have exclusive jurisdiction.' },
                ]}
                action={signNdaAction}
                nextHref="/staff/onboarding?step=done"
                nextLabel="Finish onboarding"
              />
            </div>
          )}

          {activeStep === 'done' && (
            <DoneStep
              firstName={firstName}
              slug={staff.slug}
              signedAt={staff.nda_signed_at ?? new Date().toISOString()}
            />
          )}
        </div>
      </main>
    </div>
  );
}
