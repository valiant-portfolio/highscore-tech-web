// Shared style tokens + helpers for the four staff PDFs. Keeps the brand
// band, colors, and font registration in one place.

import { StyleSheet } from '@react-pdf/renderer';
import { registerPdfFonts } from '@/lib/pdf-fonts';

registerPdfFonts();

export const BRAND      = '#18C2DC';
export const BRAND_DEEP = '#0A8EA8';
export const INK        = '#050E14';
export const INK_2      = '#3B4651';
export const MUTED      = '#7C8893';
export const PAPER      = '#FFFFFF';
export const LINE       = '#E2E8EE';
export const SOFT       = '#F4F8FA';

export const shared = StyleSheet.create({
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
    paddingBottom: 8, marginBottom: 16, letterSpacing: -0.3,
  },
  section: {
    fontSize: 10, fontWeight: 800, color: BRAND_DEEP,
    textTransform: 'uppercase', letterSpacing: 1.5,
    marginTop: 14, marginBottom: 6,
  },
  para: { fontSize: 11, color: INK_2, lineHeight: 1.55, marginBottom: 10 },
  // Key-value table
  kvRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: LINE },
  kvKey: { color: MUTED, fontSize: 11, width: '38%' },
  kvVal: { color: INK, fontSize: 11, fontWeight: 600, flex: 1 },
  // Bulleted list row
  bulletRow:    { flexDirection: 'row', marginBottom: 5 },
  bulletDot:    { color: BRAND, marginRight: 8, fontWeight: 800 },
  bulletText:   { color: INK_2, fontSize: 10.5, lineHeight: 1.55, flex: 1 },
  // Callout
  callout: {
    marginTop: 10, marginBottom: 10,
    padding: 12, paddingHorizontal: 14,
    backgroundColor: SOFT, borderLeftWidth: 3, borderLeftColor: BRAND,
    borderRadius: 4,
  },
  calloutText: { color: INK_2, fontSize: 10.5, lineHeight: 1.55 },
  // Signatures
  signatureRow: { flexDirection: 'row', marginTop: 28, gap: 32 },
  signatureBlock: { flex: 1, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 12 },
  sigLabel: { fontSize: 8, color: MUTED, letterSpacing: 1.5, fontWeight: 800, marginBottom: 8 },
  sigScript: { fontFamily: 'Allura', fontSize: 32, color: BRAND_DEEP, transform: 'rotate(-3deg)' },
  sigLine:  { borderBottomWidth: 1, borderBottomColor: INK, marginTop: 8 },
  sigName:  { marginTop: 8, fontWeight: 700, color: INK, fontSize: 12 },
  sigRole:  { color: MUTED, fontSize: 10, marginTop: 2 },
  // Footer
  footer: {
    position: 'absolute', bottom: 18, left: 40, right: 40,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: LINE,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 8, color: MUTED,
  },
  footerLink: { color: BRAND_DEEP, textDecoration: 'none' },
});

export function formatDateLong(d: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

export function formatNgnPlain(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(amount);
}

export const CEO_NAME = 'Victor Otung';
export const CEO_TITLE = 'Chief Executive Officer · Highscore Tech';
export const COMPANY_NAME = 'Highscore Tech';
export const COMPANY_TAGLINE = 'AI · SOFTWARE · ACADEMY';
export const COMPANY_DOMAIN = 'highzcore.tech';
// CAC business-name registration. Issued by the Corporate Affairs
// Commission on 14 November 2023 under the Companies and Allied Matters
// Act 2020. Printed at the bottom of every legal document.
export const COMPANY_REG_NO = '7223102';
export const COMPANY_ADDRESS = 'No. 237 1st Artellary, Aba Road, Port Harcourt, Rivers State, Nigeria';
export const COMPANY_REG_DATE = '14 November 2023';
