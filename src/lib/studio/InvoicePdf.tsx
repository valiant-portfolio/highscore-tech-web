// React-PDF document for a Studio invoice. Rendered by
// /api/studio/[reference]/invoice.pdf and attached to the confirmation email.
//
// Priced in USD with the NGN actually charged shown underneath, so the customer
// can reconcile against their bank statement.

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { registerPdfFonts } from '@/lib/pdf-fonts';

registerPdfFonts();

const GOLD  = '#B37A12';
const INK   = '#050E14';
const INK_2 = '#3B4651';
const MUTED = '#7C8893';
const PAPER = '#FFFFFF';
const LINE  = '#E2E8EE';
const SOFT  = '#FAF6EE';

const styles = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 11, color: INK, paddingBottom: 44 },
  header: {
    backgroundColor: INK, color: PAPER,
    padding: 26, paddingHorizontal: 40,
    flexDirection: 'row', alignItems: 'center',
  },
  brandName: { color: PAPER, fontSize: 18, fontWeight: 800, letterSpacing: -0.2 },
  brandSub:  { color: GOLD, fontSize: 9, marginTop: 3, letterSpacing: 2, fontWeight: 600 },
  docMeta:      { marginLeft: 'auto', textAlign: 'right', fontSize: 9, color: PAPER, opacity: 0.8 },
  docMetaTitle: { color: PAPER, fontSize: 10, fontWeight: 600, marginBottom: 3, opacity: 1 },

  body: { paddingHorizontal: 40, paddingTop: 26 },
  docTitle: {
    fontSize: 22, fontWeight: 800, color: INK,
    borderBottomWidth: 2, borderBottomColor: GOLD,
    paddingBottom: 8, marginBottom: 18,
  },
  paidChip: {
    alignSelf: 'flex-start', backgroundColor: '#1FB479', color: PAPER,
    fontSize: 9, fontWeight: 700, letterSpacing: 1,
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 3, marginBottom: 16,
  },

  twoCol: { flexDirection: 'row', gap: 28, marginBottom: 20 },
  col:    { flex: 1 },
  label:  { fontSize: 8, color: MUTED, letterSpacing: 1, marginBottom: 4, fontWeight: 600 },
  value:  { fontSize: 11, color: INK_2, lineHeight: 1.5 },
  strong: { fontSize: 12, color: INK, fontWeight: 600 },

  table:     { borderWidth: 1, borderColor: LINE, borderRadius: 4, marginTop: 6 },
  tHead:     { flexDirection: 'row', backgroundColor: SOFT, paddingVertical: 8, paddingHorizontal: 12 },
  tHeadCell: { fontSize: 8, color: MUTED, letterSpacing: 1, fontWeight: 700 },
  tRow:      { flexDirection: 'row', paddingVertical: 11, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: LINE },
  tCell:     { fontSize: 11, color: INK_2 },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: SOFT, borderRadius: 4, padding: 14, marginTop: 14,
  },
  totalLabel: { fontSize: 10, color: MUTED, letterSpacing: 1, fontWeight: 700 },
  totalValue: { fontSize: 20, color: GOLD, fontWeight: 800 },
  ngnNote:    { fontSize: 9, color: MUTED, marginTop: 6, textAlign: 'right' },

  briefBox:   { marginTop: 22, borderWidth: 1, borderColor: LINE, borderRadius: 4, padding: 14 },
  briefTitle: { fontSize: 9, color: MUTED, letterSpacing: 1, fontWeight: 700, marginBottom: 8 },
  briefRow:   { flexDirection: 'row', marginBottom: 5 },
  briefKey:   { fontSize: 9, color: MUTED, width: 130 },
  briefVal:   { fontSize: 9, color: INK_2, flex: 1, lineHeight: 1.5 },

  footer: {
    position: 'absolute', bottom: 22, left: 40, right: 40,
    borderTopWidth: 1, borderTopColor: LINE, paddingTop: 10,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footText: { fontSize: 8, color: MUTED },
});

export interface StudioInvoiceData {
  reference: string;
  paidOn: string;
  customerName: string;
  customerEmail: string;
  country: string;
  packageName: string;
  projectType: string;
  amountUsd: number;
  amountNgn: number | null;
  usdNgnRate: number | null;
  paymentMethod: string;
  deliveryDue: string;
  deliveryChannel: string;
  brief: Record<string, string>;
}

export function StudioInvoicePdf({ invoice, siteUrl }: { invoice: StudioInvoiceData; siteUrl: string }) {
  const briefEntries = Object.entries(invoice.brief ?? {}).slice(0, 12);

  return (
    <Document
      title={`Highscore Studio invoice ${invoice.reference}`}
      author="Highscore Tech"
      subject={`Invoice for ${invoice.packageName}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Highscore Tech</Text>
            <Text style={styles.brandSub}>STUDIO</Text>
          </View>
          <View style={styles.docMeta}>
            <Text style={styles.docMetaTitle}>INVOICE</Text>
            <Text>{invoice.reference}</Text>
            <Text>CAC RC No. 7223102</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.docTitle}>Invoice</Text>
          <Text style={styles.paidChip}>PAID</Text>

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.label}>BILLED TO</Text>
              <Text style={styles.strong}>{invoice.customerName}</Text>
              <Text style={styles.value}>{invoice.customerEmail}</Text>
              <Text style={styles.value}>{invoice.country}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>PAYMENT</Text>
              <Text style={styles.value}>Paid on {invoice.paidOn}</Text>
              <Text style={styles.value}>
                Method: {invoice.paymentMethod === 'alatpay' ? 'ALAT by Wema' : invoice.paymentMethod === 'card' ? 'Card' : 'Manual'}
              </Text>
              <Text style={styles.value}>Ref: {invoice.reference}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tHead}>
              <Text style={[styles.tHeadCell, { flex: 1 }]}>DESCRIPTION</Text>
              <Text style={[styles.tHeadCell, { width: 90, textAlign: 'right' }]}>AMOUNT</Text>
            </View>
            <View style={styles.tRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.tCell}>{invoice.packageName}</Text>
                <Text style={{ fontSize: 9, color: MUTED, marginTop: 3 }}>
                  {invoice.projectType} · delivery by {invoice.deliveryDue} via {invoice.deliveryChannel}
                </Text>
              </View>
              <Text style={[styles.tCell, { width: 90, textAlign: 'right' }]}>
                ${invoice.amountUsd.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PAID</Text>
            <Text style={styles.totalValue}>${invoice.amountUsd.toFixed(2)}</Text>
          </View>
          {invoice.amountNgn != null && (
            <Text style={styles.ngnNote}>
              Charged as ₦{invoice.amountNgn.toLocaleString('en-NG')}
              {invoice.usdNgnRate ? ` at ₦${invoice.usdNgnRate.toLocaleString('en-NG')} to $1` : ''}
            </Text>
          )}

          {briefEntries.length > 0 && (
            <View style={styles.briefBox}>
              <Text style={styles.briefTitle}>YOUR BRIEF</Text>
              {briefEntries.map(([k, v]) => (
                <View style={styles.briefRow} key={k}>
                  <Text style={styles.briefKey}>{k}</Text>
                  <Text style={styles.briefVal}>{v.length > 220 ? `${v.slice(0, 220)}…` : v}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footText}>Highscore Tech · Lagos, Nigeria · CAC RC No. 7223102</Text>
          <Text style={styles.footText}>{siteUrl.replace(/^https?:\/\//, '')}</Text>
        </View>
      </Page>
    </Document>
  );
}
