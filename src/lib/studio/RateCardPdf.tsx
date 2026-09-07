// The Studio rate card as a PDF — the whole menu in one document you can send
// to a client, or a client can download and read offline.
//
// Every package gets its full deliverable list, what it does not cover, and the
// turnaround, because the whole point is that someone can read this without us
// on the phone and know what they are buying.

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { registerPdfFonts } from '@/lib/pdf-fonts';
import { PACKAGES, PACKAGE_GROUPS, ADDONS, MEDIA_RATES, type StudioPackage } from '@/lib/studio/catalog';
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

/**
 * Every piece of catalogue prose passes through here on its way into the PDF.
 *
 * Same reason as money() above: the bundled Inter is the Latin subset and has
 * no Naira sign, so a ₦ anywhere in copy renders as a broken bar. Doing this
 * centrally rather than at each call site is deliberate — the last time this
 * was fixed string by string, `marketValue` and the group intros were missed
 * and shipped a document full of "¦ 310,000".
 */
const t = (str: string) => str.replace(/₦\s?/g, 'NGN ');

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

  cardValue: { fontSize: 7.5, color: MUTED, textAlign: 'right', marginTop: 2 },
  after:     { backgroundColor: SOFT, borderRadius: 4, padding: 8, marginTop: 8 },
  afterText: { fontSize: 8.5, color: INK_2, lineHeight: 1.45 },

  rateHead:  { fontSize: 9, letterSpacing: 1.2, color: BRAND, fontWeight: 700, marginTop: 12, marginBottom: 6 },
  rateRow:   { flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 1, borderBottomColor: LINE, paddingVertical: 5 },
  rateLabel: { flex: 1, fontSize: 9, color: INK_2, paddingRight: 12 },
  rateVal:   { fontSize: 9, fontWeight: 700, color: INK, textAlign: 'right' },
  rateNote:  { fontSize: 7.5, color: MUTED, textAlign: 'right', marginTop: 1 },

  footer:     { position: 'absolute', bottom: 22, left: 40, right: 40, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7.5, color: MUTED },
});

// Headings come from the catalogue so the page and the PDF cannot drift.
const GROUPS = PACKAGE_GROUPS.map((g) => ({
  id: g.id,
  eyebrow: g.eyebrow.toUpperCase(),
  title: g.title,
  intro: g.body,
}));

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
    // Short packages stay whole; a nine-deliverable one has to be allowed to
    // split, or react-pdf pushes it wholesale to the next page and leaves the
    // group heading sitting alone on a blank one.
    <View style={s.card} wrap={(d?.deliverables.length ?? 0) >= 7}>
      <View style={s.cardTop}>
        <Text style={s.cardName}>{pkg.name}</Text>
        <View>
          <Text style={s.cardPrice}>
            {pkg.from ? 'from ' : ''}{money(pkg.priceNgn)}
          </Text>
          <Text style={s.cardPer}>{pkg.turnaroundDays} working days</Text>
          {pkg.marketValue && <Text style={s.cardValue}>{t(pkg.marketValue)}</Text>}
        </View>
      </View>
      <Text style={s.cardBlurb}>{t(pkg.blurb)}</Text>

      {d && (
        <View style={s.metaRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.metaLabel}>BEST FOR</Text>
            <Text style={s.metaValue}>{t(d.bestFor)}</Text>
          </View>
          <View style={{ width: 150 }}>
            <Text style={s.metaLabel}>TURNAROUND</Text>
            <Text style={s.metaValue}>{t(d.turnaround)}</Text>
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
                <Text style={s.dTitle}>{t(item.title)}</Text>
                <Text style={s.dBody}>{t(item.detail)}</Text>
              </View>
            </View>
          ))}

          {d.notIncluded.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={s.dLabel}>NOT INCLUDED</Text>
              {d.notIncluded.map((n) => (
                <View style={s.notRow} key={n}>
                  <View style={s.notMark} />
                  <Text style={s.notText}>{t(n)}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {pkg.monthlyAfterNgn && (
        <View style={s.after}>
          <Text style={s.afterText}>
            Continues at {money(pkg.monthlyAfterNgn)} a month
            {pkg.monthlyAfterNote ? ` ${pkg.monthlyAfterNote}` : ''}. Stop any time — the website,
            the domain, the jingle and the profiles stay yours.
          </Text>
        </View>
      )}

      {pkg.note && <Text style={s.note}>{t(pkg.note)}</Text>}
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
            Custom songs, jingles, advert video, websites, Google, radio, television and
            outdoor branding. Everything we make, exactly what each one includes, what it
            costs, and what the stations charge — published, so you can see our fee is for
            the work and not a markup on somebody else&rsquo;s airtime.
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
              <Text style={s.h2}>{t(g.title)}</Text>
              <Text style={s.intro}>{t(g.intro)}</Text>
              {items.map((p) => <PackageBlock pkg={p} key={p.key} />)}
            </View>
            <Footer />
          </Page>
        );
      })}

      {/* Add-ons + how it works */}
      <Page size="A4" style={s.page}>
        <Header label="EXTRAS" />
        <View style={s.body}>
          <Text style={s.section}>ADD TO ANY PACKAGE</Text>
          <Text style={s.h2}>Extras, at a fixed price</Text>
          <Text style={s.intro}>
            Added at the order form. Note what is not on this list: airtime. We do not sell
            airtime at a fixed price because nobody honestly can — a 60-second radio spot runs
            from NGN 20,000 on a state station to NGN 85,000 on Cool FM, and a single
            30-second Channels slot is NGN 200,000. Media is quoted per campaign and billed at
            the station&rsquo;s own rate, plus 15% for the booking. The real rates are on the next page.
          </Text>

          {ADDONS.map((a) => (
            <View style={s.card} wrap={false} key={a.key}>
              <View style={s.cardTop}>
                <Text style={s.cardName}>{t(a.name)}</Text>
                <Text style={s.cardPrice}>+{money(a.priceNgn)}</Text>
              </View>
              <Text style={s.cardBlurb}>{t(a.blurb)}</Text>
            </View>
          ))}

          <View style={{ marginTop: 14 }} break>
            <Text style={s.section}>MEDIA, AT COST</Text>
            <Text style={s.h2}>What airtime actually costs</Text>
            <Text style={s.intro}>
              Airtime, billboard rental and printing are never inside a package price. They are
              billed at the station&rsquo;s own rate plus 15% for the booking — and because stations
              already give agencies 15 to 30 per cent off card, that 15 per cent comes out of the
              discount and costs you nothing extra. These are the real numbers.
            </Text>

            {MEDIA_RATES.map((block) => (
              <View key={block.heading} wrap={false}>
                <Text style={s.rateHead}>{block.heading.toUpperCase()}</Text>
                {block.items.map((it) => (
                  <View style={s.rateRow} key={it.label}>
                    <Text style={s.rateLabel}>{t(it.label)}</Text>
                    <View>
                      <Text style={s.rateVal}>{t(it.rate)}</Text>
                      {it.note && <Text style={s.rateNote}>{it.note}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <Text style={s.note}>
              Rates verified September 2026 against station cards and agency guides, and
              re-confirmed before every booking. Political campaigns pay a 31 to 50 per cent
              premium on published rates as standard across Nigerian media — we quote the real
              figure up front rather than after.
            </Text>
          </View>

          <View style={{ marginTop: 14 }} break>
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
