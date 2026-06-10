// Staff onboarding wizard — multi-step flow that runs before the regular
// dashboard unlocks. Steps:
//   1. signature — upload + crop signature photo, background-removed
//   2. offer     — review offer letter (paper view), sign
//   3. nda       — review employment contract + NDA (paper view), sign
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

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
}

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
  const requestedStep = (ALLOWED_STEPS as readonly string[]).includes(stepParam ?? '')
    ? (stepParam as Step)
    : state.nextStep;

  let activeStep: Step = state.nextStep;
  if (requestedStep === 'signature') activeStep = 'signature';
  else if (requestedStep === 'offer' && state.hasSignature) activeStep = 'offer';
  else if (requestedStep === 'nda'   && state.hasSignature && state.offerSigned) activeStep = 'nda';
  else if (requestedStep === 'done'  && state.complete) activeStep = 'done';

  const content = ROLE_CONTENT[staff.slug];
  const salary  = breakdownSalary(staff.slug, staff.salary_ngn);
  const firstName = staff.full_name.split(' ')[0] ?? 'team';

  const today = formatDate(new Date());
  const startDateText = staff.start_date
    ? formatDate(new Date(staff.start_date))
    : 'a date to be confirmed';
  const recipient = `${staff.full_name}\n${staff.role_title}\nLagos, Nigeria`;

  // ── Offer letter content ──────────────────────────────────────────────
  const offerParagraphs: React.ReactNode[] = [
    <p key="p1">
      We are pleased to offer you the position of <strong>{staff.role_title}</strong>
      {staff.department ? <> in our {staff.department}</> : null} at Highscore Tech,
      reporting to <strong>{staff.reports_to_name ?? 'Victor Otung, the Chief Executive Officer'}</strong>.
      Your appointment will take effect from <strong>{startDateText}</strong>.
    </p>,
    <p key="p2">
      Your monthly compensation will be <strong>{formatNgnPlain(salary.total)}</strong>
      {salary.allowance ? (
        <> ({formatNgnPlain(salary.base)} basic salary plus {formatNgnPlain(salary.allowance.amount)} {salary.allowance.label.toLowerCase()})</>
      ) : null}, paid on the <strong>15th of every month</strong> by bank transfer to a Nigerian account you nominate.
    </p>,
    ...(content
      ? [
          <p key="p3">
            In this role you will own, among other things: {content.responsibilities.slice(0, 3).join('; ')}.
            A complete role description is provided as a separate document and forms part of this agreement.
          </p>,
        ]
      : []),
    <p key="p4">
      You agree to treat all confidential information about our products, clients, team and financials in
      strict confidence, both during your employment and after it ends. The full confidentiality and
      intellectual-property terms are set out in your employment contract.
    </p>,
    <p key="p5">
      To accept this offer, sign in the indicated space below. We are looking forward to having you join the
      team.
    </p>,
  ];

  // ── Contract content ──────────────────────────────────────────────────
  const contractParagraphs: React.ReactNode[] = [
    <p key="c1">
      This Employment Contract is entered into between <strong>Highscore Tech</strong> (the "Company") and
      <strong> {staff.full_name}</strong> (the "Employee"), and takes effect from <strong>{startDateText}</strong>.
      The Employee accepts employment in the role of <strong>{staff.role_title}</strong>, reporting to
      <strong> {staff.reports_to_name ?? 'Victor Otung, the Chief Executive Officer'}</strong>, with duties as
      described in the Job Description issued alongside this contract.
    </p>,
    <p key="c2">
      <strong>Compensation.</strong> The Company will pay the Employee a monthly salary of
      <strong> {formatNgnPlain(salary.total)}</strong>, payable on the 15th of every month, less any deductions
      required by law. The Company may review salary annually at its discretion.
    </p>,
    <p key="c3">
      <strong>Confidentiality and intellectual property.</strong> The Employee will treat all confidential
      information of the Company in confidence indefinitely. All work product, code, designs and inventions
      created by the Employee in the course of duties are assigned to the Company on creation.
    </p>,
    <p key="c4">
      <strong>Termination.</strong> Either party may terminate this agreement by giving the other thirty (30)
      days' written notice. The Company may terminate without notice in the case of gross misconduct.
    </p>,
    <p key="c5">
      <strong>Non-solicitation.</strong> For twelve (12) months following the end of employment, the Employee
      will not solicit Company clients or employees for the benefit of any competing business.
    </p>,
    <p key="c6">
      <strong>Governing law.</strong> This contract is governed by the laws of the Federal Republic of
      Nigeria. The Nigerian courts have exclusive jurisdiction over any disputes arising from it.
    </p>,
    <p key="c7">
      The Employee confirms that they have read and understood this contract and accept its terms by signing
      below.
    </p>,
  ];

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
                  Sign on a clean white sheet of paper and upload a photo. You'll crop it to the horizontal signature shape; we'll strip the white background and reuse it on every document you sign here.
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
                  Read the letter below. Your signature shows on the right-hand signature line. When you're ready, confirm and sign.
                </p>
              </div>
              <AgreementSignBlock
                title="Offer of Employment"
                documentLabel="Offer Letter"
                documentDate={today}
                recipient={recipient}
                firstName={firstName}
                paragraphs={offerParagraphs}
                signOff="Yours sincerely,"
                pdfHref={`/api/staff/${staff.slug}/offer-letter.pdf`}
                staffFullName={staff.full_name}
                ceoName="Victor Otung"
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
                  The formal agreement governing your employment, including confidentiality and IP. Same signature you uploaded — no need to upload again.
                </p>
              </div>
              <AgreementSignBlock
                title="Employment Contract"
                documentLabel="Employment Contract"
                documentDate={today}
                recipient={recipient}
                firstName={firstName}
                paragraphs={contractParagraphs}
                signOff="Yours faithfully,"
                pdfHref={`/api/staff/${staff.slug}/contract.pdf`}
                staffFullName={staff.full_name}
                ceoName="Victor Otung"
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
