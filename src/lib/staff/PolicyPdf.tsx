// Company Policy & Staff Agreement — final document signed by every
// staff member during onboarding. Lays out the day-to-day rules of
// working at Highscore Tech: working hours, leave, notice periods,
// disciplinary process, IT security, code of conduct.

import { Document, Page, Text, View, Link, Image } from '@react-pdf/renderer';
import {
  shared, BRAND_DEEP, INK_2, MUTED,
  COMPANY_NAME, COMPANY_TAGLINE, CEO_NAME,
  COMPANY_DOMAIN,
} from './pdf-shared';
import type { StaffRecord } from './queries';

interface Props {
  staff: StaffRecord;
  issuedDate: string;
  ceoSignatureDataUri?: string | null;
  staffSignatureDataUri?: string | null;
}

interface Section {
  heading: string;
  paragraphs: string[];
}

function buildSections(): Section[] {
  return [
    {
      heading: '1. Working hours and location',
      paragraphs: [
        'Standard working hours are 09:00 – 17:00 Lagos time, Monday to Friday. A one-hour break is taken between 13:00 and 14:00.',
        'Highscore Tech operates a hybrid model: at least two (2) days per week onsite at the Lagos office unless the team or role agreement specifies otherwise. The remaining days may be worked remotely from any quiet, secure location in Nigeria.',
        'Punctuality is expected. Persistent or unexplained lateness is treated as a disciplinary matter.',
      ],
    },
    {
      heading: '2. Probation period',
      paragraphs: [
        'All new staff serve an initial three (3) month probation period. During probation the Company may terminate employment, and the staff member may resign, by giving as little as three (3) working days\' notice in writing to the other party.',
        'Probation may be extended once by a further one (1) month if performance is borderline. The Company will confirm in writing when probation has been successfully completed.',
      ],
    },
    {
      heading: '3. Notice of termination after probation',
      paragraphs: [
        'Following successful probation, either party may terminate employment by giving thirty (30) days\' written notice to the other. The Company may, at its discretion, pay salary in lieu of notice.',
        'The Company may terminate employment with immediate effect, without notice, in cases of gross misconduct including but not limited to: breach of confidentiality, theft or attempted theft of property or intellectual property, falsification of records, harassment, persistent insubordination, or any act that brings the Company into disrepute.',
      ],
    },
    {
      heading: '4. Annual leave and public holidays',
      paragraphs: [
        'Staff are entitled to twenty (20) working days of paid annual leave per calendar year, in addition to all gazetted Nigerian public holidays. Leave accrues from the start date pro-rata.',
        'Leave requests must be made at least seven (7) working days in advance via the staff portal and require approval from the relevant line manager.',
      ],
    },
    {
      heading: '5. Sick leave',
      paragraphs: [
        'Staff who are too unwell to work must notify their line manager before 09:00 on the affected day. Up to ten (10) days of paid sick leave per calendar year is provided.',
        'For any absence longer than two (2) consecutive working days the Company may require a doctor\'s certificate. Sick leave is not transferable to annual leave.',
      ],
    },
    {
      heading: '6. Code of conduct',
      paragraphs: [
        'Every staff member is expected to treat colleagues, clients, students, and partners with respect and professional courtesy at all times. Discrimination, harassment, or bullying on the basis of gender, ethnicity, religion, disability, age or any other protected characteristic will not be tolerated and is a disciplinary matter.',
        'External communication about the Company — including social media — must not disclose Confidential Information and must not bring the Company into disrepute. When in doubt, ask before posting.',
      ],
    },
    {
      heading: '7. IT and security policy',
      paragraphs: [
        'All Company devices, accounts and systems are for Company purposes only. Personal use is permitted in moderation but is subject to monitoring.',
        'Multi-factor authentication is mandatory on every account that supports it. Passwords are stored in the Company password manager and never shared. Workstations must be locked when unattended.',
        'Source code, customer data, AI models, prompts and any other Confidential Information must never be copied to personal devices, personal cloud storage, or personal repositories. This rule has no exceptions.',
        'Security incidents — actual or suspected — must be reported to the CEO within four (4) hours of discovery.',
      ],
    },
    {
      heading: '8. Outside employment and conflicts of interest',
      paragraphs: [
        'Staff may not take on outside paid work, consulting engagements, or directorships that compete with, or could create a conflict of interest with, Highscore Tech without prior written approval from the CEO.',
        'Any personal investment or relationship that could influence the staff member\'s judgement in their role must be disclosed in writing as soon as it arises.',
      ],
    },
    {
      heading: '9. Performance reviews and salary',
      paragraphs: [
        'Performance is reviewed informally each quarter and formally each year. The annual review covers achievements against goals, peer feedback, and development plans for the year ahead.',
        'Salary is reviewed during the annual review. Any salary change becomes effective on the 1st of the following month and is documented in a written amendment to the contract.',
      ],
    },
    {
      heading: '10. Reporting obligations',
      paragraphs: [
        'Daily start-of-day (SOD) and end-of-day (EOD) reports are submitted via the staff portal. SOD lists the day\'s planned work; EOD summarises what shipped, what slipped, and what blocked progress.',
        'Material problems — security incidents, customer complaints, project risks, or any breach of this policy — must be reported to the CEO without delay.',
      ],
    },
    {
      heading: '11. Disciplinary process',
      paragraphs: [
        'Minor breaches of policy are addressed through a verbal warning, then a written warning, then a final written warning before any termination. Each step is documented.',
        'Gross misconduct may bypass earlier steps and result in immediate termination. The staff member will always be given an opportunity to state their case in a documented disciplinary meeting before a final decision is taken.',
      ],
    },
    {
      heading: '12. Survival and amendments',
      paragraphs: [
        'Obligations under clauses 6, 7, 8 and 11 of this Policy, together with the confidentiality and IP terms in the Employment Contract, survive the end of employment.',
        'This Policy may be amended from time to time. Staff will be notified of material changes via email and via the staff portal at least fourteen (14) days before they take effect.',
      ],
    },
  ];
}

export function PolicyPdf({ staff, issuedDate, ceoSignatureDataUri, staffSignatureDataUri }: Props) {
  const sections = buildSections();
  const today = new Date();
  const formatFull = (d: Date): string =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);

  return (
    <Document title={`Company Policy — ${staff.full_name}`} author={COMPANY_NAME}>
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
            <Text style={shared.docMetaTitle}>Company Policy</Text>
            <Text>Issued {issuedDate}</Text>
          </View>
        </View>

        <View style={shared.body}>
          <Text style={shared.docTitle}>Company Policy and Staff Agreement</Text>

          <Text style={shared.para}>
            Between Highscore Tech (the "Company") and {staff.full_name} (the "Employee"),
            effective {formatFull(today)}. This Policy governs the day-to-day terms of
            employment and supplements the Offer Letter and Employment Contract previously signed
            between the parties.
          </Text>

          {sections.map((s) => (
            <View key={s.heading} wrap={false}>
              <Text style={shared.section}>{s.heading}</Text>
              {s.paragraphs.map((p, i) => (
                <Text key={i} style={shared.para}>{p}</Text>
              ))}
            </View>
          ))}

          <View style={shared.callout}>
            <Text style={shared.calloutText}>
              By signing below, I confirm that I have read this Policy in full, understood its
              terms, and agree to abide by it for the duration of my employment with Highscore Tech.
            </Text>
          </View>

          {/* Signatures */}
          <View style={shared.signatureRow}>
            <View style={shared.signatureBlock}>
              <Text style={shared.sigLabel}>FOR HIGHSCORE TECH</Text>
              {ceoSignatureDataUri ? (
                <Image src={ceoSignatureDataUri} style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
              ) : (
                <Text style={shared.sigScript}>Valiant</Text>
              )}
              <View style={shared.sigLine} />
              <Text style={shared.sigName}>{CEO_NAME}</Text>
              <Text style={shared.sigRole}>Chief Executive Officer</Text>
            </View>

            <View style={shared.signatureBlock}>
              <Text style={shared.sigLabel}>ACCEPTED BY EMPLOYEE</Text>
              {staffSignatureDataUri ? (
                <Image src={staffSignatureDataUri} style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
              ) : (
                <Text style={{ ...shared.sigScript, color: MUTED, fontSize: 12 }}>— pending —</Text>
              )}
              <View style={shared.sigLine} />
              <Text style={shared.sigName}>{staff.full_name}</Text>
              <Text style={shared.sigRole}>{staff.role_title}</Text>
            </View>
          </View>
        </View>

        {/* Footer — every page. */}
        <View style={shared.footer} fixed>
          <Text>
            {COMPANY_NAME} · Company policy · {staff.full_name} · {issuedDate}
          </Text>
          <Link src={`https://${COMPANY_DOMAIN}`} style={shared.footerLink}>
            {COMPANY_DOMAIN}
          </Link>
        </View>
      </Page>
    </Document>
  );
}

void BRAND_DEEP; void INK_2;
