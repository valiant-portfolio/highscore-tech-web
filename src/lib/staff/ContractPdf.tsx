// Employment Contract / Contract Agreement — per-staff PDF. More
// legal-flavoured than the offer letter: parties, term, compensation,
// working hours, IP assignment, confidentiality, termination, governing
// law. Plain language but precise.

import { Document, Page, Text, View, Link, Image } from '@react-pdf/renderer';
import {
  shared, BRAND_DEEP, INK, MUTED,
  COMPANY_NAME, COMPANY_TAGLINE, CEO_NAME, CEO_TITLE,
  COMPANY_REG_NO, COMPANY_ADDRESS,
  formatDateLong, formatNgnPlain,
} from './pdf-shared';
import { ROLE_CONTENT, breakdownSalary } from './role-content';
import type { StaffRecord } from './queries';

interface Props {
  staff: StaffRecord;
  issuedDate: string;
  ceoSignatureDataUri?: string | null;
  staffSignatureDataUri?: string | null;
}

function Clause({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <View wrap={false} style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: 800, color: INK, marginBottom: 4 }}>
        {n}. {title}
      </Text>
      <Text style={{ fontSize: 10.5, color: '#3B4651', lineHeight: 1.6 }}>
        {children}
      </Text>
    </View>
  );
}

export function ContractPdf({ staff, issuedDate, ceoSignatureDataUri, staffSignatureDataUri }: Props) {
  const content = ROLE_CONTENT[staff.slug];
  const salary  = breakdownSalary(staff.slug, staff.salary_ngn);
  const ipScope = content?.ipScope ?? 'work product produced in the course of duties';
  const isSigned = !!staff.nda_signed_at;

  return (
    <Document title={`Employment Contract — ${staff.full_name}`} author={COMPANY_NAME}>
      <Page size="A4" style={shared.page}>
        {/* Header — page 1 only. */}
        <View style={shared.header}>
          <View style={shared.logoMark}>
            <Text style={shared.logoMarkText}>H</Text>
          </View>
          <View>
            <Text style={shared.brandName}>{COMPANY_NAME}</Text>
            <Text style={shared.brandSub}>{COMPANY_TAGLINE}</Text>
          </View>
          <View style={shared.docMeta}>
            <Text style={shared.docMetaTitle}>Employment Contract</Text>
            <Text>Issued {issuedDate}</Text>
          </View>
        </View>

        <View style={shared.body}>
          <Text style={shared.docTitle}>Employment Contract</Text>

          <Text style={shared.para}>
            This Employment Contract (the &quot;Agreement&quot;) is entered into between{' '}
            <Text style={{ color: INK, fontWeight: 700 }}>{COMPANY_NAME}</Text> (the &quot;Company&quot;), and{' '}
            <Text style={{ color: INK, fontWeight: 700 }}>{staff.full_name}</Text> (the &quot;Employee&quot;), with effect from{' '}
            <Text style={{ color: INK, fontWeight: 700 }}>{staff.start_date ? formatDateLong(staff.start_date) : '—'}</Text> (the &quot;Effective Date&quot;).
          </Text>

          {/* Quick summary table */}
          <Text style={shared.section}>Summary</Text>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Position</Text>
            <Text style={shared.kvVal}>{staff.role_title}</Text>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Reports to</Text>
            <Text style={shared.kvVal}>{staff.reports_to_name ?? `${CEO_NAME}, CEO`}</Text>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Compensation</Text>
            <Text style={shared.kvVal}>{formatNgnPlain(salary.total)} per month</Text>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Pay day</Text>
            <Text style={shared.kvVal}>15th of each month</Text>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Work arrangement</Text>
            <Text style={shared.kvVal}>Fully remote — Nigeria</Text>
          </View>

          {/* Clauses */}
          <Text style={shared.section}>Terms &amp; conditions</Text>

          <Clause n="1" title="Position and duties">
            The Employee is engaged as {staff.role_title} and will report to{' '}
            {staff.reports_to_name ?? `${CEO_NAME}, CEO`}. The Employee will perform the duties set out in the accompanying Job Description and any other reasonable duties assigned by the Company from time to time.
          </Clause>

          <Clause n="2" title="Term">
            This Agreement commences on the Effective Date and continues indefinitely until terminated by either party in accordance with Clause 8.
          </Clause>

          <Clause n="3" title="Compensation">
            The Company will pay the Employee {formatNgnPlain(salary.total)} per month
            {salary.allowance ? ` (comprising ${formatNgnPlain(salary.base)} base salary and ${formatNgnPlain(salary.allowance.amount)} ${salary.allowance.label.toLowerCase()})` : ''}.
            Payment is made on the 15th day of each month, into the Employee's nominated bank account.
          </Clause>

          <Clause n="4" title="Working hours">
            The Employee will keep regular working hours sufficient to meet the responsibilities of the role, posting Start-Of-Day and End-Of-Day updates in the team Google Workspace group on every working day. Specific hours are flexible by mutual agreement.
          </Clause>

          <Clause n="5" title="Confidentiality">
            The Employee acknowledges that during the course of employment they will gain access to Confidential Information of the Company, including but not limited to source code, designs, business plans, client information, financial information, and internal processes. The Employee will not disclose or use any Confidential Information except for the legitimate purposes of their role. This obligation survives termination of this Agreement.
          </Clause>

          <Clause n="6" title="Intellectual property">
            All {ipScope} created by the Employee in the course of employment with the Company are works made for hire and the exclusive property of the Company. The Employee hereby assigns to the Company any rights they may have in such work product. The Employee will execute any documents reasonably required to perfect such assignment.
          </Clause>

          <Clause n="7" title="Non-solicitation">
            For a period of twelve (12) months following the end of this Agreement, the Employee will not directly solicit (for themselves or any third party) any client, customer, or employee of the Company with whom the Employee had material dealings during the final twelve (12) months of employment.
          </Clause>

          <Clause n="8" title="Termination">
            Either party may terminate this Agreement by giving the other party thirty (30) days written notice. The Company may terminate the Agreement immediately and without notice in the case of gross misconduct, including but not limited to dishonesty, breach of confidentiality, or material breach of this Agreement. On termination the Employee will return all Company property and assist in handover.
          </Clause>

          <Clause n="9" title="Governing law">
            This Agreement is governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute arising out of or in connection with this Agreement will be subject to the exclusive jurisdiction of the Nigerian courts.
          </Clause>

          <Clause n="10" title="Entire agreement">
            This Agreement, together with the accompanying Job Description and Offer Letter, constitutes the entire agreement between the parties and supersedes all prior negotiations. Any amendment must be in writing and signed by both parties.
          </Clause>

          <View style={shared.callout} wrap={false}>
            <Text style={{ color: BRAND_DEEP, fontWeight: 700, fontSize: 10.5, marginBottom: 4 }}>Acknowledgement</Text>
            <Text style={shared.calloutText}>
              By signing below, the Employee acknowledges that they have read, understood, and agree to be bound by the terms of this Agreement.
            </Text>
          </View>

          <View style={shared.signatureRow}>
            <View style={shared.signatureBlock}>
              <Text style={shared.sigLabel}>FOR {COMPANY_NAME.toUpperCase()}</Text>
              {ceoSignatureDataUri ? (
                <Image src={ceoSignatureDataUri} style={{ height: 44, maxWidth: 180, objectFit: 'contain', objectPosition: 'left' }} />
              ) : (
                <Text style={shared.sigScript}>Valiant</Text>
              )}
              <View style={shared.sigLine} />
              <Text style={shared.sigName}>{CEO_NAME}</Text>
              <Text style={shared.sigRole}>{CEO_TITLE}</Text>
            </View>
            <View style={shared.signatureBlock}>
              <Text style={shared.sigLabel}>EMPLOYEE</Text>
              {staffSignatureDataUri ? (
                <Image src={staffSignatureDataUri} style={{ height: 44, maxWidth: 180, objectFit: 'contain', objectPosition: 'left' }} />
              ) : (
                <View style={{ height: 32 }} />
              )}
              <View style={shared.sigLine} />
              <Text style={shared.sigName}>{staff.full_name}</Text>
              <Text style={shared.sigRole}>
                {isSigned
                  ? `Signed: ${formatDateLong(staff.nda_signed_at!)}`
                  : 'Date: _______________________'}
              </Text>
            </View>
          </View>
        </View>

        <View style={shared.footer} fixed>
          <View>
            <Text>{COMPANY_NAME} · CAC RC No. {COMPANY_REG_NO} · Employment contract · {staff.full_name} · {issuedDate}</Text>
            <Text style={{ marginTop: 2, fontSize: 7 }}>{COMPANY_ADDRESS}</Text>
          </View>
          <Link src="https://highzcore.tech" style={shared.footerLink}>highzcore.tech</Link>
        </View>
      </Page>
    </Document>
  );
}

void MUTED;
