// React-PDF document for the course syllabus. Server-rendered into a real
// PDF binary by the /api/academy/[slug]/syllabus.pdf route.
//
// @react-pdf/renderer has its own renderer, not the React DOM one — supported
// elements are Document / Page / View / Text / Image / Link, with a Flexbox
// subset for layout. Don't import normal React components in here.

import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { CourseWithModules } from './queries';
import { formatNgn } from './queries';
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
  page: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: INK,
    paddingTop: 0,
    paddingBottom: 36,
    paddingHorizontal: 0,
  },
  // Brand header band
  header: {
    backgroundColor: INK,
    color: PAPER,
    padding: 28,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMark: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: BRAND_DEEP,
    color: PAPER,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  logoMarkText: { color: PAPER, fontSize: 22, fontWeight: 800 },
  brandName:   { color: BRAND, fontSize: 18, fontWeight: 800, letterSpacing: -0.2 },
  brandSub:    { color: PAPER, fontSize: 9, marginTop: 3, letterSpacing: 2 },
  docMeta:     { marginLeft: 'auto', textAlign: 'right', color: PAPER, fontSize: 9, opacity: 0.75 },
  docMetaTitle:{ color: PAPER, fontSize: 10, fontWeight: 600, marginBottom: 3 },

  // Body content
  body:   { paddingHorizontal: 40, paddingTop: 24 },

  docTitle: {
    fontSize: 22, fontWeight: 800, color: INK,
    borderBottomWidth: 2, borderBottomColor: BRAND,
    paddingBottom: 8, marginBottom: 16, letterSpacing: -0.3,
  },

  summary: { fontSize: 11, color: INK_2, lineHeight: 1.55, marginBottom: 16 },

  // Key/value metadata table (Level, Mode, Duration, Fee)
  metaRow: { flexDirection: 'row', marginBottom: 24, gap: 12, flexWrap: 'wrap' },
  metaCell: {
    flexGrow: 1, flexBasis: '22%',
    borderWidth: 1, borderColor: LINE,
    borderRadius: 6,
    padding: 10,
    backgroundColor: SOFT,
  },
  metaKey:   { fontSize: 8, color: BRAND_DEEP, fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 },
  metaValue: { fontSize: 12, color: INK, fontWeight: 700 },

  section: {
    fontSize: 10, fontWeight: 800,
    color: BRAND_DEEP, textTransform: 'uppercase', letterSpacing: 1.5,
    marginTop: 16, marginBottom: 8,
  },

  outcomeList: { marginBottom: 12 },
  outcomeRow:  { flexDirection: 'row', marginBottom: 5 },
  outcomeBullet: { color: BRAND, marginRight: 8, fontWeight: 800 },
  outcomeText:   { color: INK_2, fontSize: 10.5, lineHeight: 1.5, flex: 1 },

  prereqChipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  prereqChip: {
    fontSize: 9, color: INK_2,
    paddingVertical: 3, paddingHorizontal: 8,
    backgroundColor: SOFT, borderRadius: 999,
    borderWidth: 1, borderColor: LINE,
    marginRight: 5, marginBottom: 5,
  },

  // Modules
  moduleCard: {
    borderWidth: 1, borderColor: LINE, borderRadius: 8,
    padding: 12, marginBottom: 9, backgroundColor: PAPER,
  },
  moduleHeader:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  moduleNumber:  {
    fontSize: 10, fontWeight: 800, color: PAPER,
    backgroundColor: BRAND_DEEP, paddingVertical: 3, paddingHorizontal: 7,
    borderRadius: 4, marginRight: 9, marginTop: 1,
  },
  moduleTitle:   { fontSize: 12, fontWeight: 700, color: INK, flex: 1 },
  moduleSummary: { fontSize: 10, color: INK_2, marginBottom: 6, marginLeft: 30, lineHeight: 1.5 },
  lessonRow:     { flexDirection: 'row', marginLeft: 30, marginBottom: 3 },
  lessonBullet:  { color: BRAND_DEEP, marginRight: 6, fontSize: 10 },
  lessonText:    { fontSize: 9.5, color: INK_2, flex: 1, lineHeight: 1.45 },

  // Footer
  footer: {
    position: 'absolute', bottom: 18, left: 40, right: 40,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: LINE,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 8, color: MUTED,
  },
  footerLink: { color: BRAND_DEEP, textDecoration: 'none' },
});

interface Props {
  course: CourseWithModules;
  siteUrl: string;
  issuedDate: string;   // Pre-formatted ISO date (e.g. "10 June 2026")
}

export function SyllabusPdf({ course, siteUrl, issuedDate }: Props) {
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <Document
      title={`${course.title} — Syllabus`}
      author="Highscore Tech Academy"
      subject={course.summary}
      creator="Highscore Tech"
      producer="Highscore Tech"
    >
      <Page size="A4" style={styles.page}>
        {/* Header band */}
        <View style={styles.header} fixed>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>H</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Highscore Tech</Text>
            <Text style={styles.brandSub}>ACADEMY · SYLLABUS</Text>
          </View>
          <View style={styles.docMeta}>
            <Text style={styles.docMetaTitle}>Course Syllabus</Text>
            <Text>{issuedDate}</Text>
            <Text>highzcore.tech/academy/{course.slug}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.docTitle}>{course.title}</Text>
          <Text style={styles.summary}>{course.summary}</Text>

          {/* Meta cells */}
          <View style={styles.metaRow}>
            <View style={styles.metaCell}>
              <Text style={styles.metaKey}>FEE</Text>
              <Text style={styles.metaValue}>{formatNgn(course.price_ngn)}</Text>
            </View>
            {course.duration_weeks && (
              <View style={styles.metaCell}>
                <Text style={styles.metaKey}>DURATION</Text>
                <Text style={styles.metaValue}>{course.duration_weeks} weeks</Text>
              </View>
            )}
            <View style={styles.metaCell}>
              <Text style={styles.metaKey}>MODE</Text>
              <Text style={styles.metaValue}>
                {course.mode === 'hybrid' ? 'Online + Onsite' : course.mode}
              </Text>
            </View>
            {course.level && (
              <View style={styles.metaCell}>
                <Text style={styles.metaKey}>LEVEL</Text>
                <Text style={styles.metaValue}>{course.level}</Text>
              </View>
            )}
          </View>

          {/* Outcomes */}
          {course.outcomes.length > 0 && (
            <>
              <Text style={styles.section}>What you'll be able to do</Text>
              <View style={styles.outcomeList}>
                {course.outcomes.map((o, idx) => (
                  <View key={idx} style={styles.outcomeRow}>
                    <Text style={styles.outcomeBullet}>✓</Text>
                    <Text style={styles.outcomeText}>{o}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <>
              <Text style={styles.section}>Prerequisites</Text>
              <View style={styles.prereqChipWrap}>
                {course.prerequisites.map((p, idx) => (
                  <Text key={idx} style={styles.prereqChip}>{p}</Text>
                ))}
              </View>
            </>
          )}

          {/* Modules */}
          <Text style={styles.section}>
            Modules · {course.modules.length} sections · {totalLessons} lessons
          </Text>
          {course.modules.map((mod) => (
            <View key={mod.id} style={styles.moduleCard} wrap={false}>
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleNumber}>{String(mod.sort_order).padStart(2, '0')}</Text>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
              </View>
              {mod.summary && <Text style={styles.moduleSummary}>{mod.summary}</Text>}
              {mod.lessons.map((l, idx) => (
                <View key={idx} style={styles.lessonRow}>
                  <Text style={styles.lessonBullet}>›</Text>
                  <Text style={styles.lessonText}>
                    {l.title}
                    {l.summary ? ` — ${l.summary}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Highscore Tech Academy · {course.title} syllabus · {issuedDate}
          </Text>
          <Link src={`${siteUrl}/academy/${course.slug}`} style={styles.footerLink}>
            highzcore.tech
          </Link>
        </View>
      </Page>
    </Document>
  );
}
