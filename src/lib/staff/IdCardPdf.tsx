// Employee ID Card — A4 landscape with front and back side-by-side, sized
// so each face prints to a standard ISO/IEC 7810 ID-1 card (~85.6 x 54 mm).

import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { Font, StyleSheet } from '@react-pdf/renderer';
import { BRAND, BRAND_DEEP, INK, PAPER, MUTED, LINE } from './pdf-shared';
import type { StaffRecord } from './queries';

Font.register({
  family: 'InterId',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa1ZL7.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa3JL7.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa9ZL7.woff2', fontWeight: 800 },
  ],
});

// A4 landscape is 842 x 595 points. The two cards sit centered horizontally
// with a small gap between them. Card dimensions roughly 320 x 200 points
// — close to ISO/IEC 7810 ID-1 (85.6×54 mm ≈ 242×153 pt) but scaled up so
// the print is more presentable.
const CARD_W = 320;
const CARD_H = 200;

const s = StyleSheet.create({
  page: {
    fontFamily: 'InterId',
    padding: 40,
    backgroundColor: '#ECEFF2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: PAPER,
  },
  // Front
  bandTop: {
    backgroundColor: INK,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 12,
  },
  logoMark: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: BRAND_DEEP, color: PAPER,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  logoMarkText: { color: PAPER, fontSize: 16, fontWeight: 800 },
  brandName:    { color: BRAND, fontSize: 13, fontWeight: 800, letterSpacing: -0.2 },
  brandSub:     { color: PAPER, fontSize: 7, marginTop: 2, letterSpacing: 1.5 },
  body:         { padding: 14, paddingTop: 12, flex: 1, flexDirection: 'row', gap: 12 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: BRAND_DEEP,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: PAPER, fontSize: 22, fontWeight: 800 },
  details:    { flex: 1, justifyContent: 'center' },
  name:       { color: INK, fontSize: 13, fontWeight: 800, letterSpacing: -0.2 },
  role:       { color: BRAND_DEEP, fontSize: 9, marginTop: 3, letterSpacing: 1.3, textTransform: 'uppercase', fontWeight: 700 },
  eid:        { color: MUTED, fontSize: 8, marginTop: 6, letterSpacing: 1 },
  bandBottom: {
    backgroundColor: BRAND_DEEP,
    paddingVertical: 7, paddingHorizontal: 14,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  bandText: { color: PAPER, fontSize: 7, letterSpacing: 1.5 },
  // Back
  backBody: {
    flex: 1, padding: 14, justifyContent: 'space-between',
  },
  backHead: { color: BRAND_DEEP, fontSize: 8, fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 },
  backLine: { color: INK, fontSize: 8.5, marginBottom: 3 },
  backDivider: { height: 1, backgroundColor: LINE, marginVertical: 8 },
  signature: {
    marginTop: 4, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 4,
    color: MUTED, fontSize: 7, letterSpacing: 1, textAlign: 'center',
  },
});

interface Props {
  staff: StaffRecord;
  employeeId: string;
  photoUrl?: string | null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function IdCardPdf({ staff, employeeId, photoUrl }: Props) {
  const initials = initialsOf(staff.full_name);

  return (
    <Document title={`ID Card — ${staff.full_name}`} author="Highscore Tech">
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Front */}
        <View style={s.card}>
          <View style={s.bandTop}>
            <View style={s.logoMark}>
              <Text style={s.logoMarkText}>H</Text>
            </View>
            <View>
              <Text style={s.brandName}>Highscore Tech</Text>
              <Text style={s.brandSub}>STAFF · OFFICIAL ID</Text>
            </View>
          </View>
          <View style={s.body}>
            {photoUrl ? (
              <View style={{ ...s.avatar, overflow: 'hidden' }}>
                <Image src={photoUrl} style={{ width: 60, height: 60, objectFit: 'cover' }} />
              </View>
            ) : (
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={s.details}>
              <Text style={s.name}>{staff.full_name}</Text>
              <Text style={s.role}>{staff.role_title}</Text>
              <Text style={s.eid}>EMP ID  ·  {employeeId}</Text>
            </View>
          </View>
          <View style={s.bandBottom}>
            <Text style={s.bandText}>HIGHZCORE.TECH</Text>
            <Text style={s.bandText}>NIGERIA</Text>
          </View>
        </View>

        {/* Back */}
        <View style={s.card}>
          <View style={s.bandTop}>
            <View style={s.logoMark}>
              <Text style={s.logoMarkText}>H</Text>
            </View>
            <View>
              <Text style={s.brandName}>Highscore Tech</Text>
              <Text style={s.brandSub}>STAFF · OFFICIAL ID · BACK</Text>
            </View>
          </View>
          <View style={s.backBody}>
            <View>
              <Text style={s.backHead}>OWNER</Text>
              <Text style={s.backLine}>{staff.full_name}</Text>
              <Text style={s.backLine}>{staff.role_title}</Text>
              <Text style={s.backLine}>EMP ID · {employeeId}</Text>
            </View>
            <View style={s.backDivider} />
            <View>
              <Text style={s.backHead}>IF FOUND</Text>
              <Text style={s.backLine}>Return to Highscore Tech</Text>
              <Text style={s.backLine}>admin@highzcore.tech</Text>
              <Text style={s.backLine}>highzcore.tech</Text>
            </View>
            <Text style={s.signature}>This card remains the property of Highscore Tech</Text>
          </View>
          <View style={s.bandBottom}>
            <Text style={s.bandText}>AI · SOFTWARE · ACADEMY</Text>
            <Text style={s.bandText}>NG</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

void BRAND;
