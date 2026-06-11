// Staff onboarding wizard — two-document flow that runs before the
// regular dashboard unlocks:
//   1. offer — review the offer letter, sign with agree-and-sign button
//      (signature collected via modal on first sign)
//   2. nda   — review the employment contract + NDA, sign with same flow
//   3. done  — celebrate, unlock dashboard
//
// Signature is no longer a distinct step. The staff reads the document
// first, clicks "Agree and sign", and a modal collects the signature
// inline if it isn't already on file. The signature is reused on the
// next document automatically.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Logo from '@/components/brand/Logo';
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

const ALLOWED_STEPS = ['offer', 'nda', 'done'] as const;
type Step = (typeof ALLOWED_STEPS)[number];

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
}

// Mini-heading + body, used inside the LetterPaper to give the contract
// numbered-clause structure without overflowing the paper container.
function Clause({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <p>
      <strong className="block text-[13px] uppercase tracking-[0.12em] text-[#0A8EA8] mb-1">
        {heading}
      </strong>
      <span>{children}</span>
    </p>
  );
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

  // Snap forward if the user tries to jump past an unfinished step.
  let activeStep: Step = state.nextStep;
  if (requestedStep === 'offer') activeStep = 'offer';
  else if (requestedStep === 'nda'  && state.offerSigned) activeStep = 'nda';
  else if (requestedStep === 'done' && state.complete)    activeStep = 'done';

  const content   = ROLE_CONTENT[staff.slug];
  const salary    = breakdownSalary(staff.slug, staff.salary_ngn);
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
      Your employment will be governed by the Employment Contract and Non-Disclosure Agreement
      you will be asked to sign next. By accepting this offer you confirm that you will read
      and accept those documents in full.
    </p>,
    <p key="p5">
      We are looking forward to having you join the team. To accept, sign in the space provided below.
    </p>,
  ];

  // ── Contract + NDA content (deliberately detailed) ───────────────────
  const contractParagraphs: React.ReactNode[] = [
    <Clause key="c1" heading="1. Parties and commencement">
      This Employment Contract and Non-Disclosure Agreement (the "Agreement") is entered into
      between <strong>Highscore Tech</strong> (the "Company") and <strong>{staff.full_name}</strong>
      {' '}(the "Employee"), taking effect from <strong>{startDateText}</strong>. The Employee accepts
      employment in the role of <strong>{staff.role_title}</strong>, reporting to
      <strong> {staff.reports_to_name ?? 'Victor Otung, the Chief Executive Officer'}</strong>,
      with duties as described in the Job Description issued alongside this Agreement.
    </Clause>,

    <Clause key="c2" heading="2. Compensation and benefits">
      The Company will pay the Employee a monthly salary of <strong>{formatNgnPlain(salary.total)}</strong>,
      payable on the 15th of every month, subject to deductions required by law (PAYE, NHF, pension).
      Salary may be reviewed annually at the Company's discretion. The Employee is eligible for
      statutory leave entitlements under Nigerian labour law.
    </Clause>,

    <Clause key="c3" heading="3. Definition of Confidential Information">
      "Confidential Information" means any non-public information the Employee learns in the course of
      employment, including but not limited to: <strong>source code, build artefacts, system designs,
      AI models, prompts, training data, embeddings, datasets, customer personal data, customer lists,
      pricing, financial records, internal communications, contracts, business plans, vulnerabilities,
      access credentials, and the identity of clients</strong>. Information is Confidential whether or
      not it is marked as such, and whether it is communicated verbally, in writing, by code, or by any
      other means.
    </Clause>,

    <Clause key="c4" heading="4. Restrictions on use and disclosure">
      The Employee will: <strong>(a)</strong> keep all Confidential Information in strict confidence;
      <strong> (b)</strong> use it only to perform their duties for the Company; <strong>(c)</strong>
      not copy, store, transmit, share, publish, present, or post any portion of it outside the
      Company's systems; and <strong>(d)</strong> not retain any portion of it after the employment
      ends. These obligations <strong>continue indefinitely</strong> after the employment terminates,
      for any reason.
    </Clause>,

    <Clause key="c5" heading="5. Specific prohibited acts (non-exhaustive)">
      The Employee specifically agrees <strong>NOT</strong> to: push or mirror Company source code to
      personal repositories (GitHub, GitLab, Bitbucket, etc.); share screenshots of code, dashboards,
      or customer data on social media, messaging apps, or any public forum; reuse Company AI prompts,
      models, fine-tuned weights, datasets, or pipelines in personal projects or for other employers;
      share access credentials, API keys, or session tokens with anyone — inside or outside the Company;
      copy or remove customer personal data on departure; or speak to media or competitors about
      Company products, clients, finances, or personnel without express written consent from the CEO.
    </Clause>,

    <Clause key="c6" heading="6. Intellectual property assignment">
      All inventions, code, designs, models, datasets, documents, and other work product created by
      the Employee in the course of employment — whether during office hours or otherwise — are
      <strong> assigned to the Company on creation</strong>, with no further payment required.
      The Employee will execute any documents reasonably required to confirm or perfect this
      assignment. Open-source contributions made on Company time follow the Company's contribution
      policy and require prior approval.
    </Clause>,

    <Clause key="c7" heading="7. Criminal liability under Nigerian law">
      The Employee acknowledges and accepts that breach of confidentiality obligations is a
      <strong> criminal offence</strong> under Nigerian law. In particular:
      <span className="block mt-2">
        <strong>(a)</strong> The <strong>Cybercrimes (Prohibition, Prevention etc.) Act 2015</strong>,
        Section 16 makes unauthorised disclosure or use of confidential computer data punishable by
        <strong> up to three (3) years imprisonment, a fine of up to ₦7,000,000, or both</strong>.
        Section 17 makes unauthorised modification of computer data punishable by up to three (3)
        years imprisonment.
      </span>
      <span className="block mt-2">
        <strong>(b)</strong> The <strong>Nigeria Data Protection Act 2023</strong> imposes fines of
        <strong> up to ₦10,000,000 or 2% of annual gross revenue</strong> (whichever is higher) on
        any person who unlawfully discloses, transfers, or processes personal data of data subjects.
      </span>
      <span className="block mt-2">
        <strong>(c)</strong> The <strong>Criminal Code Act, Sections 390–396</strong> criminalise
        theft, breach of trust by an employee, and conversion of property entrusted to one's care,
        with penalties of <strong>up to fourteen (14) years imprisonment</strong>.
      </span>
      <span className="block mt-2">
        <strong>(d)</strong> The <strong>Copyright Act 2022</strong> criminalises unauthorised
        reproduction or distribution of copyright works including source code, with penalties
        including fines and imprisonment.
      </span>
      <span className="block mt-3 text-[#1A1B1E]">
        The Company will <strong>report any such breach to the Nigerian Police, EFCC, or the
        Nigeria Data Protection Commission</strong> where appropriate, and will cooperate fully
        with any prosecution.
      </span>
    </Clause>,

    <Clause key="c8" heading="8. Civil liability and indemnification">
      In addition to any criminal proceedings, the Employee will be personally liable to the Company
      for: <strong>(a)</strong> actual damages caused by the breach; <strong>(b)</strong> any profits
      the Employee or any third party obtained from the disclosed information; <strong>(c)</strong>
      injunctive relief; <strong>(d)</strong> the Company's legal costs on a full-indemnity basis;
      and <strong>(e)</strong> any payments the Company is required to make to affected clients,
      data subjects, or regulators as a result of the breach. The Employee further agrees that the
      Company may, at its sole discretion, seek emergency injunctive relief without posting bond.
    </Clause>,

    <Clause key="c9" heading="9. Termination and immediate dismissal">
      Either party may terminate this Agreement on <strong>thirty (30) days' written notice</strong>.
      The Company may terminate <strong>without notice</strong> in the case of gross misconduct,
      including (without limitation) any breach of clauses 3–6 of this Agreement, falsification
      of records, theft, harassment, or wilful insubordination. Termination does not extinguish
      the Employee's confidentiality, IP-assignment, or non-solicitation obligations.
    </Clause>,

    <Clause key="c10" heading="10. Non-solicitation">
      For twelve (12) months following the end of employment for any reason, the Employee will not,
      directly or indirectly: <strong>(a)</strong> solicit business from any Company client they
      had contact with in the last twelve (12) months of employment; or <strong>(b)</strong>
      solicit or hire any Company employee or contractor.
    </Clause>,

    <Clause key="c11" heading="11. Return of materials and reporting">
      On termination of employment, or earlier on the Company's request, the Employee will
      immediately return or securely destroy all Confidential Information in their possession or
      control, including hardware, copies, and derivatives. The Employee will promptly report to
      the CEO any actual or suspected breach of confidentiality of which they become aware,
      whether by themselves or any other person.
    </Clause>,

    <Clause key="c12" heading="12. Governing law and jurisdiction">
      This Agreement is governed by the laws of the <strong>Federal Republic of Nigeria</strong>.
      The Federal High Court and the High Court of the Federal Capital Territory have exclusive
      jurisdiction over any disputes arising from or in connection with this Agreement. Each party
      waives any objection to such jurisdiction on grounds of inconvenient forum.
    </Clause>,

    <p key="c13" className="mt-2 italic text-[#3B4651]">
      By signing below, the Employee confirms that they have read this Agreement in full, that they
      understand its contents and the criminal and civil consequences of breach, and that they
      accept its terms unconditionally.
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
            offerSigned={state.offerSigned}
            ndaSigned={state.ndaSigned}
          />

          {activeStep === 'offer' && (
            <div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Step 1 of 2</p>
                <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
                  Read your offer letter.
                </h1>
                <p className="mt-2 text-fg-muted">
                  Read the letter end to end. When you're ready, click <strong className="text-fg">Agree and sign</strong>.
                  If you don't have a signature on file yet, you'll be asked to take a photo or upload one — it'll be
                  reused on the contract.
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
                initiallyHasSignature={state.hasSignature}
              />
            </div>
          )}

          {activeStep === 'nda' && (
            <div>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Step 2 of 2</p>
                <h1 className="mt-1 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
                  Employment contract + NDA.
                </h1>
                <p className="mt-2 text-fg-muted">
                  This is the binding agreement governing your employment, including detailed
                  confidentiality and intellectual-property terms. <strong className="text-fg">Read clause 7
                  carefully</strong> — it explains the criminal liability under Nigerian law for
                  leaking source code or customer data.
                </p>
              </div>
              <AgreementSignBlock
                title="Employment Contract and Non-Disclosure Agreement"
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
                initiallyHasSignature={state.hasSignature}
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
