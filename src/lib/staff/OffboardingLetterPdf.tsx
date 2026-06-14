// Signed letter PDF for staff offboarding (suspend / fire). Rendered to a
// Buffer and attached to the email. Uses the CEO's REAL uploaded signature
// image (passed as a data URI) — falling back to the Allura "Valiant" script
// only if no signature image is on file.

import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import {
  shared, MUTED,
  CEO_NAME, CEO_TITLE, COMPANY_NAME, COMPANY_TAGLINE, COMPANY_DOMAIN,
  COMPANY_REG_NO, COMPANY_ADDRESS,
} from './pdf-shared';

export interface OffboardingLetterData {
  title: string;
  recipientName: string;
  recipientEmail: string;
  dateStr: string;
  bodyText: string;
  ceoSignatureDataUri: string | null;
}

// Split free-typed text into paragraphs on blank lines; collapse single
// newlines inside a paragraph to spaces so wrapping stays natural.
function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

export function OffboardingLetterPdf({ data }: { data: OffboardingLetterData }) {
  return (
    <Document title={`${data.title} — ${data.recipientName}`}>
      <Page size="A4" style={shared.page}>
        {/* Brand band */}
        <View style={shared.header}>
          <View style={shared.logoMark}><Text style={shared.logoMarkText}>H</Text></View>
          <View>
            <Text style={shared.brandName}>{COMPANY_NAME}</Text>
            <Text style={shared.brandSub}>{COMPANY_TAGLINE}</Text>
          </View>
          <View style={shared.docMeta}>
            <Text style={shared.docMetaTitle}>{COMPANY_NAME}</Text>
            <Text>AI &amp; product development</Text>
            <Text>{COMPANY_DOMAIN}</Text>
          </View>
        </View>

        <View style={shared.body}>
          <Text style={shared.docTitle}>{data.title}</Text>

          <Text style={{ ...shared.para, marginBottom: 2, fontWeight: 700, color: '#050E14' }}>
            {data.recipientName}
          </Text>
          <Text style={{ ...shared.para, marginBottom: 2, color: MUTED }}>{data.recipientEmail}</Text>
          <Text style={{ ...shared.para, marginBottom: 18 }}>Date: {data.dateStr}</Text>

          {toParagraphs(data.bodyText).map((para, i) => (
            <Text key={i} style={shared.para}>{para}</Text>
          ))}

          {/* Signature — real CEO image, fallback to script */}
          <View style={{ marginTop: 26, width: 230 }}>
            <Text style={shared.sigLabel}>FOR HIGHSCORE TECH</Text>
            {data.ceoSignatureDataUri ? (
              <Image src={data.ceoSignatureDataUri} style={{ width: 150, height: 54, objectFit: 'contain' }} />
            ) : (
              <Text style={shared.sigScript}>Valiant</Text>
            )}
            <View style={shared.sigLine} />
            <Text style={shared.sigName}>{CEO_NAME}</Text>
            <Text style={shared.sigRole}>{CEO_TITLE}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={shared.footer} fixed>
          <Text>{COMPANY_NAME} · RC {COMPANY_REG_NO} · {COMPANY_ADDRESS}</Text>
          <Text style={shared.footerLink}>{COMPANY_DOMAIN}</Text>
        </View>
      </Page>
    </Document>
  );
}
