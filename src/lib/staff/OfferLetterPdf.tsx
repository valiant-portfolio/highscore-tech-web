// Offer of Employment — per-staff PDF. CEO signature embedded as image
// when available (public/sigs/ceo.png); falls back to the Allura cursive
// "Valiant" rendering when not.

import { Document, Page, Text, View, Link, Image } from '@react-pdf/renderer';
import {
  shared, BRAND_DEEP, INK, MUTED,
  COMPANY_NAME, COMPANY_TAGLINE, CEO_NAME, CEO_TITLE,
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

export function OfferLetterPdf({ staff, issuedDate, ceoSignatureDataUri, staffSignatureDataUri }: Props) {
  const content = ROLE_CONTENT[staff.slug];
  const salary = breakdownSalary(staff.slug, staff.salary_ngn);
  // Payday is the 15th of every month — first pay = next 15th after the
  // start date (or the same month if start is before the 15th).
  const firstPay = staff.start_date
    ? (() => {
        const d = new Date(staff.start_date);
        if (d.getDate() > 15) d.setMonth(d.getMonth() + 1);
        d.setDate(15);
        return formatDateLong(d);
      })()
    : '—';

  return (
    <Document title={`Offer of Employment — ${staff.full_name}`} author={COMPANY_NAME}>
      <Page size="A4" style={shared.page}>
        {/* Header — page 1 only. `fixed` would re-render it on every
            continuation page, which we don't want. */}
        <View style={shared.header}>
          <View style={shared.logoMark}>
            <Text style={shared.logoMarkText}>H</Text>
          </View>
          <View>
            <Text style={shared.brandName}>{COMPANY_NAME}</Text>
            <Text style={shared.brandSub}>{COMPANY_TAGLINE}</Text>
          </View>
          <View style={shared.docMeta}>
            <Text style={shared.docMetaTitle}>Offer of Employment</Text>
            <Text>Issued {issuedDate}</Text>
          </View>
        </View>

        <View style={shared.body}>
          <Text style={shared.docTitle}>Offer of Employment</Text>

          <Text style={{ fontSize: 12, color: INK, fontWeight: 700, marginBottom: 4 }}>
            {staff.full_name}
          </Text>
          <Text style={{ fontSize: 10, color: MUTED, marginBottom: 14 }}>Nigeria</Text>

          <Text style={{ ...shared.para, marginBottom: 14 }}>Dear {staff.full_name.split(' ')[0]},</Text>

          <Text style={shared.para}>
            On behalf of {COMPANY_NAME} — an AI development studio building products for clients worldwide and running the in-house Highscore Tech Academy — it is my pleasure to formally offer you the position of{' '}
            <Text style={{ color: INK, fontWeight: 700 }}>{staff.role_title}</Text>. We were impressed by the quality you bring and the judgement that's hard to teach. We're confident you'll thrive here.
          </Text>

          <Text style={shared.section}>Position details</Text>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Title</Text>
            <Text style={shared.kvVal}>{staff.role_title}</Text>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Reports to</Text>
            <Text style={shared.kvVal}>
              {staff.reports_to_name ?? `${CEO_NAME} — Chief Executive Officer`}
            </Text>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Work arrangement</Text>
            <Text style={shared.kvVal}>Hybrid — Nigeria</Text>
          </View>
          {staff.start_date && (
            <View style={shared.kvRow}>
              <Text style={shared.kvKey}>Start date</Text>
              <Text style={shared.kvVal}>{formatDateLong(staff.start_date)}</Text>
            </View>
          )}
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Compensation</Text>
            <View style={{ flex: 1 }}>
              <Text style={shared.kvVal}>{formatNgnPlain(salary.total)} monthly</Text>
              {salary.allowance && (
                <Text style={{ color: MUTED, fontSize: 10, marginTop: 3 }}>
                  {formatNgnPlain(salary.base)} base + {formatNgnPlain(salary.allowance.amount)} {salary.allowance.label.toLowerCase()}
                </Text>
              )}
            </View>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Pay day</Text>
            <Text style={shared.kvVal}>15th of every month · First pay {firstPay}</Text>
          </View>

          {content && (
            <>
              <Text style={shared.section}>What you'll own</Text>
              {content.responsibilities.map((r, i) => (
                <View key={i} style={shared.bulletRow}>
                  <Text style={shared.bulletDot}>›</Text>
                  <Text style={shared.bulletText}>{r}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={shared.section}>Tools &amp; identity</Text>
          <Text style={shared.para}>
            On acceptance of this offer you will be provisioned a {COMPANY_NAME} work email, a staff ID card, and access to the internal systems and dashboards required for your role.
          </Text>

          <Text style={shared.section}>Confidentiality</Text>
          <Text style={shared.para}>
            You will be exposed to confidential information about our products, our clients, our team, and our financials. By signing this letter you agree to treat this information in confidence during your employment and after it ends, and to use it solely for the legitimate purposes of your role.
          </Text>

          <View style={shared.callout} wrap={false}>
            <Text style={{ color: BRAND_DEEP, fontWeight: 700, fontSize: 10.5, marginBottom: 4 }}>Acceptance</Text>
            <Text style={shared.calloutText}>
              Please sign the accompanying Employment Contract (which includes the NDA) to formally accept this position. Your signatory date will be recorded on file.
            </Text>
          </View>

          <Text style={shared.para}>
            We're genuinely excited to have you join us. Welcome to {COMPANY_NAME}.
          </Text>

          {/* Signatures */}
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
              <Text style={shared.sigLabel}>ACCEPTED BY CANDIDATE</Text>
              {staffSignatureDataUri ? (
                <Image src={staffSignatureDataUri} style={{ height: 44, maxWidth: 180, objectFit: 'contain', objectPosition: 'left' }} />
              ) : (
                <View style={{ height: 32 }} />
              )}
              <View style={shared.sigLine} />
              <Text style={shared.sigName}>{staff.full_name}</Text>
              <Text style={shared.sigRole}>
                {staff.nda_signed_at
                  ? `Signed: ${formatDateLong(staff.nda_signed_at)}`
                  : 'Date: _______________________'}
              </Text>
            </View>
          </View>
        </View>

        <View style={shared.footer} fixed>
          <Text>{COMPANY_NAME} · Offer letter · {staff.full_name} · {issuedDate}</Text>
          <Link src="https://highzcore.tech" style={shared.footerLink}>highzcore.tech</Link>
        </View>
      </Page>
    </Document>
  );
}
