// React-PDF document for the payment receipt. Rendered by
// /api/payments/[id]/receipt.pdf into a real PDF binary.

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { formatNgn } from '@/lib/academy/queries';
import { registerPdfFonts } from '@/lib/pdf-fonts';

registerPdfFonts();

const BRAND      = '#18C2DC';
const BRAND_DEEP = '#0A8EA8';
const INK        = '#050E14';
const INK_2      = '#3B4651';
const MUTED      = '#7C8893';
const PAPER      = '#FFFFFF';
const LINE       = '#E2E8EE';
const SOFT       = '#F4F8FA';

const styles = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 11, color: INK, paddingBottom: 40 },
  header: {
    backgroundColor: INK, color: PAPER,
    padding: 28, paddingHorizontal: 40,
    flexDirection: 'row', alignItems: 'center',
  },
  logoMark: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: BRAND_DEEP, color: PAPER,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  logoMarkText: { color: PAPER, fontSize: 22, fontWeight: 800 },
  brandName:    { color: BRAND, fontSize: 18, fontWeight: 800, letterSpacing: -0.2 },
  brandSub:     { color: PAPER, fontSize: 9, marginTop: 3, letterSpacing: 2 },
  docMeta:      { marginLeft: 'auto', textAlign: 'right', color: PAPER, fontSize: 9, opacity: 0.75 },
  docMetaTitle: { color: PAPER, fontSize: 10, fontWeight: 600, marginBottom: 3 },
  body:         { paddingHorizontal: 40, paddingTop: 26 },
  docTitle: {
    fontSize: 22, fontWeight: 800, color: INK,
    borderBottomWidth: 2, borderBottomColor: BRAND,
    paddingBottom: 8, marginBottom: 18, letterSpacing: -0.3,
  },
  // Receipt status banner — green for paid
  banner: {
    backgroundColor: '#E6F8F0',
    borderLeftWidth: 3, borderLeftColor: '#1FB479',
    padding: 10, paddingHorizontal: 14, borderRadius: 4,
    marginBottom: 20,
  },
  bannerLabel: { fontSize: 9, color: '#0F7449', letterSpacing: 1.5, fontWeight: 800 },
  bannerText:  { fontSize: 13, color: '#0F7449', marginTop: 3, fontWeight: 700 },

  // Two-column for billed-to + payment-meta
  twoCol: { flexDirection: 'row', marginBottom: 22, gap: 16 },
  col:    { flex: 1, padding: 12, borderWidth: 1, borderColor: LINE, borderRadius: 6, backgroundColor: SOFT },
  colHead: { fontSize: 8, color: BRAND_DEEP, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 },
  kvRow:   { flexDirection: 'row', marginBottom: 4 },
  kvKey:   { color: MUTED, width: 90, fontSize: 10 },
  kvVal:   { color: INK, fontSize: 10, fontWeight: 600, flex: 1 },

  // Line items
  section: {
    fontSize: 10, fontWeight: 800, color: BRAND_DEEP,
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginTop: 6, marginBottom: 8,
  },
  table: { borderWidth: 1, borderColor: LINE, borderRadius: 6, overflow: 'hidden', marginBottom: 18 },
  tHead: { flexDirection: 'row', backgroundColor: SOFT, padding: 8 },
  tHeadText: { fontSize: 8, color: MUTED, fontWeight: 800, letterSpacing: 1.2 },
  tRow:  { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: LINE },
  cellWide:   { flex: 2.2, color: INK, fontSize: 11, fontWeight: 600 },
  cellNarrow: { flex: 1, textAlign: 'right', color: INK, fontSize: 11, fontWeight: 700 },

  totals: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 18 },
  totalsBox: { width: 240, padding: 12, borderWidth: 1, borderColor: LINE, borderRadius: 6 },
  totalRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { color: MUTED, fontSize: 10 },
  totalValue: { color: INK, fontSize: 11, fontWeight: 700 },
  grandLabel: { color: INK, fontSize: 11, fontWeight: 800 },
  grandValue: { color: BRAND_DEEP, fontSize: 15, fontWeight: 800 },
  totalSep:   { borderTopWidth: 1, borderTopColor: LINE, marginVertical: 5 },

  thanks: {
    marginTop: 8, padding: 12, borderRadius: 6,
    backgroundColor: SOFT, color: INK_2, fontSize: 10, lineHeight: 1.5,
  },

  footer: {
    position: 'absolute', bottom: 18, left: 40, right: 40,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: LINE,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 8, color: MUTED,
  },
  footerLink: { color: BRAND_DEEP, textDecoration: 'none' },
});

export interface ReceiptData {
  receiptNumber: string;
  paidOn: string;             // Pre-formatted date
  customerName: string;
  customerEmail: string;
  courseTitle: string;
  installmentIndex: number | null;
  installmentTotal: number | null;
  amountNgn: number;
  reference: string;
  enrollmentTotalNgn: number;
  enrollmentPaidNgn: number;
}

interface Props {
  receipt: ReceiptData;
  siteUrl: string;
}

export function ReceiptPdf({ receipt, siteUrl }: Props) {
  const installmentLine =
    receipt.installmentIndex && receipt.installmentTotal
      ? `Installment ${receipt.installmentIndex} of ${receipt.installmentTotal}`
      : 'Full payment';

  return (
    <Document
      title={`Receipt ${receipt.receiptNumber}`}
      author="Highscore Tech Academy"
      creator="Highscore Tech"
      producer="Highscore Tech"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>H</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Highscore Tech</Text>
            <Text style={styles.brandSub}>ACADEMY · OFFICIAL RECEIPT</Text>
          </View>
          <View style={styles.docMeta}>
            <Text style={styles.docMetaTitle}>Receipt</Text>
            <Text>#{receipt.receiptNumber}</Text>
            <Text>{receipt.paidOn}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.docTitle}>Payment Receipt</Text>

          <View style={styles.banner}>
            <Text style={styles.bannerLabel}>STATUS</Text>
            <Text style={styles.bannerText}>Payment received · {formatNgn(receipt.amountNgn)}</Text>
          </View>

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.colHead}>BILLED TO</Text>
              <Text style={[styles.kvVal, { marginBottom: 3 }]}>{receipt.customerName}</Text>
              <Text style={[styles.kvKey, { fontSize: 9 }]}>{receipt.customerEmail}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.colHead}>PAYMENT</Text>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Date</Text>
                <Text style={styles.kvVal}>{receipt.paidOn}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Method</Text>
                <Text style={styles.kvVal}>ALATPay (WEMA)</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Reference</Text>
                <Text style={[styles.kvVal, { fontSize: 9 }]}>{receipt.reference}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.section}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tHead}>
              <Text style={[styles.tHeadText, { flex: 2.2 }]}>DESCRIPTION</Text>
              <Text style={[styles.tHeadText, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
            </View>
            <View style={styles.tRow}>
              <View style={styles.cellWide}>
                <Text>{receipt.courseTitle}</Text>
                <Text style={{ color: MUTED, fontSize: 9, marginTop: 3 }}>{installmentLine}</Text>
              </View>
              <Text style={styles.cellNarrow}>{formatNgn(receipt.amountNgn)}</Text>
            </View>
          </View>

          <View style={styles.totals}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Course total</Text>
                <Text style={styles.totalValue}>{formatNgn(receipt.enrollmentTotalNgn)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Paid to date</Text>
                <Text style={styles.totalValue}>{formatNgn(receipt.enrollmentPaidNgn)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Balance</Text>
                <Text style={styles.totalValue}>
                  {formatNgn(Math.max(0, receipt.enrollmentTotalNgn - receipt.enrollmentPaidNgn))}
                </Text>
              </View>
              <View style={styles.totalSep} />
              <View style={styles.totalRow}>
                <Text style={styles.grandLabel}>This receipt</Text>
                <Text style={styles.grandValue}>{formatNgn(receipt.amountNgn)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.thanks}>
            <Text>
              Thank you for your payment. This receipt is an official record of your enrolment payment with
              Highscore Tech Academy. For any questions, reach out at admin@highzcore.tech.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Highscore Tech Academy · Receipt #{receipt.receiptNumber}</Text>
          <Link src={siteUrl} style={styles.footerLink}>highzcore.tech</Link>
        </View>
      </Page>
    </Document>
  );
}
