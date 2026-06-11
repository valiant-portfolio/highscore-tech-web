// Company Policy & Staff Agreement — final document signed by every
// staff member during onboarding. Lays out the day-to-day rules of
// working at Highscore Tech: working hours, leave, notice periods,
// disciplinary process, IT security, code of conduct.

import { Document, Page, Text, View, Link, Image } from '@react-pdf/renderer';
import {
  shared, BRAND_DEEP, INK_2, MUTED,
  COMPANY_NAME, COMPANY_TAGLINE, CEO_NAME,
  COMPANY_DOMAIN, COMPANY_REG_NO, COMPANY_ADDRESS,
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

function buildSections(role: string): Section[] {
  const isDev = /developer|engineer|dev/i.test(role);

  return [
    {
      heading: '1. Remote-first work model',
      paragraphs: [
        'Highscore Tech operates as a fully remote company based in Lagos, Nigeria. Every staff member works from a quiet, secure location of their choosing within Nigeria. There is no requirement to attend any physical office for routine work.',
        'You must maintain a stable internet connection adequate for video calls, screen sharing and access to the Company\'s development tools. The Company will not provide internet allowance unless explicitly stated in your offer letter.',
      ],
    },
    {
      heading: '2. Working hours',
      paragraphs: [
        isDev
          ? 'As a developer, you are evaluated on delivery, not hours. You may choose when in the day or night you work, provided you (a) deliver assigned tasks on or before agreed deadlines, (b) attend scheduled meetings, and (c) respond to time-sensitive communication during business hours.'
          : 'You must be available and actively contactable during standard business hours of 09:00 – 17:00 West Africa Time, Monday to Friday. Active means online in the Company\'s communication tools and able to respond to messages within a reasonable time (typically thirty minutes during business hours).',
        'Regardless of role, scheduled meetings are mandatory unless prior approval to skip has been obtained from the meeting organiser.',
      ],
    },
    {
      heading: '3. Attendance, strikes, and termination triggers',
      paragraphs: [
        'The following events are tracked as STRIKES against your attendance record:',
        '(a) Missing an important meeting without prior approval or a documented emergency.',
        '(b) Missing an agreed deadline without timely notification and a valid reason.',
        '(c) Failing to submit a required SOD or EOD report without notice.',
        '(d) Being unavailable during your required hours without prior approval.',
        '(e) Not responding to time-sensitive communication within a reasonable window during business hours.',
        'ACCUMULATING THREE (3) STRIKES WITHIN ANY TWO (2) MONTH WINDOW IS GROUNDS FOR IMMEDIATE TERMINATION. This is in addition to the Company\'s right to terminate for poor performance generally.',
        'Constantly missing deadlines or a sustained lack of acceptable performance may also lead to termination at the Company\'s discretion, independent of the strikes process.',
      ],
    },
    {
      heading: '4. Probation period',
      paragraphs: [
        'All new staff serve an initial three (3) month probation period. During probation, either party may end the employment by giving as little as three (3) working days\' written notice to the other.',
        'Probation may be extended once by a further month at the Company\'s discretion if performance is borderline. The Company will confirm in writing when probation has been successfully completed.',
      ],
    },
    {
      heading: '5. Notice of termination after probation',
      paragraphs: [
        'After successful probation, either party may end the employment on thirty (30) days\' written notice. The Company may, at its discretion, pay salary in lieu of notice.',
        'The Company may terminate without notice in the case of gross misconduct, including breach of confidentiality, theft or attempted theft of property or intellectual property, falsification of records, harassment, persistent insubordination, accumulation of three strikes within two months, or any act that brings the Company into disrepute.',
      ],
    },
    {
      heading: '6. Annual leave and public holidays',
      paragraphs: [
        'Twenty (20) paid working days of annual leave per calendar year, plus all gazetted Nigerian public holidays. Leave accrues pro-rata from your start date.',
        'Leave requests must be made at least seven (7) working days in advance via the staff portal and require approval from the line manager. Leave during sprint cut-overs or active client engagements may be deferred.',
      ],
    },
    {
      heading: '7. Sick leave',
      paragraphs: [
        'Up to ten (10) paid sick days per calendar year. Staff who are too unwell to work must notify their line manager before 09:00 on the affected day.',
        'Any absence longer than two (2) consecutive working days may require a doctor\'s certificate. Sick leave does not carry over and is not transferable to annual leave.',
      ],
    },
    {
      heading: '8. Code of conduct',
      paragraphs: [
        'Treat colleagues, clients, students, and partners with respect and professional courtesy. Discrimination, harassment, or bullying — on any basis — will not be tolerated and is a disciplinary matter that may result in immediate termination.',
        'External communication about the Company, including social media, must not disclose Confidential Information and must not bring the Company into disrepute. When in doubt, ask before posting. Speaking to media or competitors about the Company, its products, clients, finances, or personnel requires prior written consent from the CEO.',
      ],
    },
    {
      heading: '9. IT and security',
      paragraphs: [
        'Multi-factor authentication is mandatory on every Company account that supports it. Passwords live in the Company password manager — never shared, never reused.',
        'Source code, customer data, AI models, prompts, datasets and any other Confidential Information may never be copied to personal devices, personal cloud storage, or personal repositories. This rule has no exceptions.',
        'You are responsible for the physical security of any device you use for work. Devices must be encrypted at rest, locked when unattended, and reported immediately if lost or stolen.',
        'Security incidents — actual or suspected — must be reported to the CEO within four (4) hours of discovery.',
      ],
    },
    {
      heading: '10. Outside work and conflicts of interest',
      paragraphs: [
        'No outside paid work, consulting, freelance engagements, or directorships that compete with — or create a conflict of interest with — Highscore Tech without prior written approval from the CEO.',
        'Any personal investment or relationship that could influence your judgement in your role must be disclosed in writing as soon as it arises.',
      ],
    },
    {
      heading: '11. Performance reviews and salary',
      paragraphs: [
        'Performance is reviewed informally each quarter and formally each year. The annual review covers achievements against goals, peer feedback, and development plans for the year ahead.',
        'Salary is reviewed during the annual review. Any salary change becomes effective on the 1st of the following month and is documented in writing.',
        'Salary is paid on the 15th of every month by bank transfer to a Nigerian bank account you nominate.',
      ],
    },
    {
      heading: '12. Reporting obligations',
      paragraphs: [
        'Daily Start-of-Day (SOD) and End-of-Day (EOD) reports are submitted via the staff portal. SOD lists the day\'s planned work; EOD summarises what shipped, what slipped, and what blocked progress.',
        'Material problems — security incidents, customer complaints, project risks, or any breach of this policy — must be reported to the CEO without delay.',
      ],
    },
    {
      heading: '13. Disciplinary process',
      paragraphs: [
        'Minor breaches are addressed through a verbal warning, then a written warning, then a final written warning before any termination. Each step is documented in the staff record.',
        'Gross misconduct or accumulation of three strikes within two months may bypass earlier steps and result in immediate termination. The staff member will be given an opportunity to state their case in a documented disciplinary meeting before any final decision.',
      ],
    },
    {
      heading: '14. Survival and amendments',
      paragraphs: [
        'Clauses 8, 9, 10 of this Policy and the confidentiality and IP terms in your Employment Contract survive the end of employment for any reason.',
        'This Policy may be amended from time to time. Staff will be notified of material changes via email and via the staff portal at least fourteen (14) days before they take effect.',
      ],
    },
  ];
}

export function PolicyPdf({ staff, issuedDate, ceoSignatureDataUri, staffSignatureDataUri }: Props) {
  const sections = buildSections(staff.role_title);
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
          <View>
            <Text>
              {COMPANY_NAME} · CAC RC No. {COMPANY_REG_NO} · {staff.full_name} · {issuedDate}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 7 }}>
              {COMPANY_ADDRESS}
            </Text>
          </View>
          <Link src={`https://${COMPANY_DOMAIN}`} style={shared.footerLink}>
            {COMPANY_DOMAIN}
          </Link>
        </View>
      </Page>
    </Document>
  );
}

void BRAND_DEEP; void INK_2;
