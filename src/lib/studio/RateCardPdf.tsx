// The Studio rate card as a PDF — the whole menu in one document you can send
// to a client, or a client can download and read offline.
//
// Every package gets its full deliverable list, what it does not cover, and the
// turnaround, because the whole point is that someone can read this without us
// on the phone and know what they are buying.

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { registerPdfFonts } from '@/lib/pdf-fonts';
import { PACKAGES, ADDONS, type StudioPackage } from '@/lib/studio/catalog';
import { detailFor } from '@/lib/studio/packages';

registerPdfFonts();

/**
 * Money for PDFs — "NGN 120,000", never "₦120,000".
 *
 * The Inter files bundled for react-pdf are the Latin subset, which has no
 * Naira sign (U+20A6). Using the site's formatNgn here renders a broken glyph
 * in its place, which on a document you send to a client looks like a fault.
 */
const money = (n: number) => `NGN ${n.toLocaleString('en-NG')}`;

const BRAND = '#0A8EA8';
const INK   = '#050E14';
const INK_2 = '#3B4651';
const MUTED = '#7C8893';
const PAPER = '#FFFFFF';
const LINE  = '#E2E8EE';
const SOFT  = '#F4F8FA';
const GREEN = '#1FB479';

const s = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 10, color: INK, paddingBottom: 46 },

  cover:      { backgroundColor: INK, color: PAPER, padding: 46, paddingTop: 64, height: '100%' },
  coverBrand: { color: PAPER, fontSize: 26, fontWeight: 800, letterSpacing: -0.4 },
  coverSub:   { color: BRAND, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginTop: 6 },
  coverTitle: { color: PAPER, fontSize: 40, fontWeight: 800, marginTop: 56, lineHeight: 1.1 },
  coverLede:  { color: '#9FB3C0', fontSize: 12, marginTop: 18, lineHeight: 1.6, maxWidth: 380 },
  coverMeta:  { color: '#6B8496', fontSize: 9, marginTop: 'auto', lineHeight: 1.7 },

  header:      { backgroundColor: INK, color: PAPER, paddingVertical: 14, paddingHorizontal: 40, flexDirection: 'row', alignItems: 'center' },
  headerName:  { color: PAPER, fontSize: 12, fontWeight: 800 },
  headerSub:   { color: BRAND, fontSize: 7, letterSpacing: 2, fontWeight: 700, marginTop: 2 },
  headerRight: { marginLeft: 'auto', color: '#8FA6B4', fontSize: 8 },

  body:    { paddingHorizontal: 40, paddingTop: 22 },
  section: { fontSize: 9, letterSpacing: 1.6, color: BRAND, fontWeight: 700, marginBottom: 4 },
  h2:      { fontSize: 19, fontWeight: 800, color: INK, marginBottom: 4 },
  intro:   { fontSize: 10, color: INK_2, lineHeight: 1.6, marginBottom: 16 },

  card:      { borderWidth: 1, borderColor: LINE, borderRadius: 5, padding: 15, marginBottom: 12 },
  cardTop:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 },
  cardName:  { fontSize: 13, fontWeight: 800, color: INK, flex: 1, paddingRight: 12 },
  cardPrice: { fontSize: 15, fontWeight: 800, color: BRAND, textAlign: 'right' },
  cardPer:   { fontSize: 8, color: MUTED, textAlign: 'right', marginTop: 1 },
  cardBlurb: { fontSize: 9.5, color: INK_2, lineHeight: 1.5, marginBottom: 8 },

  metaRow:   { flexDirection: 'row', gap: 16, backgroundColor: SOFT, borderRadius: 4, padding: 8, marginBottom: 10 },
  metaLabel: { fontSize: 7, letterSpacing: 1, color: MUTED, fontWeight: 700 },
  metaValue: { fontSize: 8.5, color: INK_2, marginTop: 2, lineHeight: 1.4 },

  dLabel: { fontSize: 7.5, letterSpacing: 1, color: MUTED, fontWeight: 700, marginBottom: 5 },
  dRow:   { flexDirection: 'row', marginBottom: 5 },
  // Drawn, not typed: the bundled Inter subset has no check-mark glyph, so a
  // ✓ character silently rendered as empty space.
  dTick:  { width: 5, height: 5, borderRadius: 2.5, backgroundColor: GREEN, marginTop: 4, marginRight: 7 },
  dNum:   { color: BRAND, fontSize: 9, width: 12, fontWeight: 700 },
  dText:  { flex: 1 },
  dTitle: { fontSize: 9.5, color: INK, fontWeight: 600 },
  dBody:  { fontSize: 8.5, color: INK_2, lineHeight: 1.45, marginTop: 1 },

  notRow:  { flexDirection: 'row', marginBottom: 3 },
  notMark: { width: 5, height: 1.5, backgroundColor: MUTED, marginTop: 6, marginRight: 7 },
  notText: { flex: 1, fontSize: 8.5, color: MUTED, lineHeight: 1.4 },

  // No italic: only Inter regular/600/800 are registered, and react-pdf throws
  // rather than falling back when a variant is missing.
  note: { fontSize: 8, color: MUTED, marginTop: 8, lineHeight: 1.4 },

  footer:     { position: 'absolute', bottom: 22, left: 40, right: 40, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: MUTED },
});

const GROUPS: { id: StudioPackage['group']; eyebrow: string; title: string; intro: string }[] = [
  {
    id: 'personal',
    eyebrow: 'PERSONAL & OCCASIONS',
    title: 'For the person, or the day',
    intro: 'Birthdays, weddings, anniversaries and church programmes. Priced so anyone can order one.',
  },
  {
    id: 'business',
    eyebrow: 'BUSINESS & BRANDS',
    title: 'For the business that wants to be heard',
    intro:
      'Each package is everything in the one before it, plus a new channel. Commercial usage rights are included throughout — the work is yours to run anywhere, forever.',
  },
  {
    id: 'brand',
    eyebrow: 'ONGOING',
    title: 'Stay on their screens every month',
    intro: 'Retainers, for brands that would rather be everywhere all year than appear once.',
  },
];

function Header({ label }: { label: string }) {
  return (
    <View style={s.header} fixed>
      <View>
        <Text style={s.headerName}>Highscore Tech</Text>
        <Text style={s.headerSub}>STUDIO</Text>
      </View>
      <Text style={s.headerRight}>{label}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Highscore Tech · Lagos, Nigeria · CAC RC No. 7223102</Text>
      <Text style={s.footerText} render={({ pageNumber }) => `Page ${pageNumber}`} />
    </View>
  );
}

function PackageBlock({ pkg }: { pkg: StudioPackage }) {
  const d = detailFor(pkg.key);
  return (
    // wrap={false} keeps a package from splitting across a page break, which is
    // what makes the document readable rather than merely correct.
    <View style={s.card} wrap={false}>
      <View style={s.cardTop}>
        <Text style={s.cardName}>{pkg.name}</Text>
        <View>
          <Text style={s.cardPrice}>
            {pkg.from ? 'from ' : ''}{money(pkg.priceNgn)}
          </Text>
          {pkg.monthly && <Text style={s.cardPer}>per month</Text>}
        </View>
      </View>
      <Text style={s.cardBlurb}>{pkg.blurb}</Text>

      {d && (
        <View style={s.metaRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.metaLabel}>BEST FOR</Text>
            <Text style={s.metaValue}>{d.bestFor}</Text>
          </View>
          <View style={{ width: 150 }}>
            <Text style={s.metaLabel}>TURNAROUND</Text>
            <Text style={s.metaValue}>{d.turnaround}</Text>
          </View>
        </View>
      )}

      {d && (
        <>
          <Text style={s.dLabel}>WHAT YOU GET</Text>
          {d.deliverables.map((item) => (
            <View style={s.dRow} key={item.title}>
              <View style={s.dTick} />
              <View style={s.dText}>
                <Text style={s.dTitle}>{item.title}</Text>
                <Text style={s.dBody}>{item.detail}</Text>
              </View>
            </View>
          ))}

          {d.notIncluded.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={s.dLabel}>NOT INCLUDED</Text>
              {d.notIncluded.map((n) => (
                <View style={s.notRow} key={n}>
                  <View style={s.notMark} />
                  <Text style={s.notText}>{n}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {pkg.note && <Text style={s.note}>{pkg.note}</Text>}
    </View>
  );
}

export function RateCardPdf({ siteUrl, generatedOn }: { siteUrl: string; generatedOn: string }) {
  const host = siteUrl.replace(/^https?:\/\//, '');
  return (
    <Document title="Highscore Studio — rate card" author="Highscore Tech" subject="Studio packages and prices">
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverBrand}>Highscore Tech</Text>
          <Text style={s.coverSub}>STUDIO</Text>
          <Text style={s.coverTitle}>Packages{'\n'}& prices</Text>
          <Text style={s.coverLede}>
            Custom songs, jingles, advert video, radio, television, outdoor branding and
            Google — everything we make, what each one includes, and exactly what it costs.
          </Text>
          <Text style={s.coverMeta}>
            {generatedOn}{'\n'}
            All prices in Nigerian Naira{'\n'}
            studio.{host}
          </Text>
        </View>
      </Page>

      {/* One page-flow per group */}
      {GROUPS.map((g) => {
        const items = PACKAGES.filter((p) => p.group === g.id);
        if (items.length === 0) return null;
        return (
          <Page size="A4" style={s.page} key={g.id}>
            <Header label={g.eyebrow} />
            <View style={s.body}>
              <Text style={s.section}>{g.eyebrow}</Text>
              <Text style={s.h2}>{g.title}</Text>
              <Text style={s.intro}>{g.intro}</Text>
              {items.map((p) => <PackageBlock pkg={p} key={p.key} />)}
            </View>
            <Footer />
          </Page>
        );
      })}

      {/* Add-ons + how it works */}
      <Page size="A4" style={s.page}>
        <Header label="GETTING ON AIR" />
        <View style={s.body}>
          <Text style={s.section}>ADD TO ANY PACKAGE</Text>
          <Text style={s.h2}>Getting it on air</Text>
          <Text style={s.intro}>
            Your package produces the broadcast-ready advert. These are us actually getting it
            on air — choosing the stations, negotiating the rate, booking the slots and running
            the campaign. The airtime itself is always your own budget, paid to the station.
          </Text>

          {ADDONS.map((a) => (
            <View style={s.card} wrap={false} key={a.key}>
              <View style={s.cardTop}>
                <Text style={s.cardName}>{a.name}</Text>
                <Text style={s.cardPrice}>+{money(a.priceNgn)}</Text>
              </View>
              <Text style={s.cardBlurb}>{a.blurb}</Text>
            </View>
          ))}

          <View style={{ marginTop: 14 }}>
            <Text style={s.section}>HOW ORDERING WORKS</Text>
            <Text style={s.h2}>Four steps</Text>
            <View style={s.card}>
              {[
                'Pick your package and tell us what it is for — we ask different questions for a business, a church, a birthday or an event.',
                'Pay securely with your card or bank through ALAT by Wema.',
                'You get a delivery date straight away, and an invoice to download.',
                'We send the finished work to your WhatsApp, Telegram or email — whichever you chose.',
              ].map((step, i) => (
                <View style={s.dRow} key={step}>
                  <Text style={s.dNum}>{i + 1}.</Text>
                  <Text style={[s.dBody, { flex: 1, marginTop: 0 }]}>{step}</Text>
                </View>
              ))}
            </View>

            <Text style={[s.intro, { marginTop: 10 }]}>
              Order at studio.{host} — or send us a message and we will walk you through it.
            </Text>
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}
