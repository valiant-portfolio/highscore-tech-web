// Job Description / Scope of Work — per-staff PDF that documents the
// role's responsibilities and the team workflow rules they operate within.

import { Document, Page, Text, View, Link } from '@react-pdf/renderer';
import {
  shared, BRAND, BRAND_DEEP, INK, PAPER, MUTED, LINE,
  COMPANY_NAME, COMPANY_TAGLINE, formatDateLong,
} from './pdf-shared';
import { ROLE_CONTENT } from './role-content';
import type { StaffRecord } from './queries';

interface Props {
  staff: StaffRecord;
  issuedDate: string;
}

export function JobDescriptionPdf({ staff, issuedDate }: Props) {
  const content = ROLE_CONTENT[staff.slug];
  if (!content) {
    return (
      <Document>
        <Page size="A4">
          <View style={{ padding: 40 }}>
            <Text>Job description not available for this role.</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document title={`Job Description — ${staff.full_name}`} author={COMPANY_NAME}>
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
            <Text style={shared.docMetaTitle}>Job Description</Text>
            <Text>Issued {issuedDate}</Text>
          </View>
        </View>

        <View style={shared.body}>
          <Text style={shared.docTitle}>{staff.role_title}</Text>

          <Text style={{ ...shared.para, marginBottom: 6 }}>
            This document defines the scope, responsibilities, and operating rules for the role of{' '}
            <Text style={{ color: INK, fontWeight: 700 }}>{staff.role_title}</Text> at {COMPANY_NAME}.
          </Text>

          {/* Position table */}
          <Text style={shared.section}>Position</Text>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Holder</Text>
            <Text style={shared.kvVal}>{staff.full_name}</Text>
          </View>
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Title</Text>
            <Text style={shared.kvVal}>{staff.role_title}</Text>
          </View>
          {staff.department && (
            <View style={shared.kvRow}>
              <Text style={shared.kvKey}>Department</Text>
              <Text style={shared.kvVal}>{staff.department}</Text>
            </View>
          )}
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Reports to</Text>
            <Text style={shared.kvVal}>{staff.reports_to_name ?? 'Victor Otung · CEO'}</Text>
          </View>
          {staff.start_date && (
            <View style={shared.kvRow}>
              <Text style={shared.kvKey}>Start date</Text>
              <Text style={shared.kvVal}>{formatDateLong(staff.start_date)}</Text>
            </View>
          )}
          <View style={shared.kvRow}>
            <Text style={shared.kvKey}>Work arrangement</Text>
            <Text style={shared.kvVal}>Hybrid — remote with onsite blocks as required</Text>
          </View>

          {/* Responsibilities */}
          <Text style={shared.section}>Responsibilities</Text>
          {content.responsibilities.map((r, i) => (
            <View key={i} style={shared.bulletRow}>
              <Text style={shared.bulletDot}>›</Text>
              <Text style={shared.bulletText}>{r}</Text>
            </View>
          ))}

          {/* Team workflow rules */}
          <Text style={shared.section}>Team workflow rules</Text>
          {content.workflowNotes.map((r, i) => (
            <View key={i} style={shared.bulletRow}>
              <Text style={shared.bulletDot}>›</Text>
              <Text style={shared.bulletText}>{r}</Text>
            </View>
          ))}

          {/* Confidentiality callout */}
          <View style={shared.callout} wrap={false}>
            <Text style={{ color: BRAND_DEEP, fontWeight: 700, fontSize: 10.5, marginBottom: 4 }}>
              Confidentiality
            </Text>
            <Text style={shared.calloutText}>
              All work product, client information, internal designs, code, and commercial decisions you encounter in the course of this role are confidential to {COMPANY_NAME}.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={shared.footer} fixed>
          <Text>{COMPANY_NAME} · Job description · {staff.full_name} · {issuedDate}</Text>
          <Link src={`https://${'highzcore.tech'}`} style={shared.footerLink}>highzcore.tech</Link>
        </View>
      </Page>
    </Document>
  );
}

// Suppress unused-import warning for tokens shared via the StyleSheet.
void BRAND; void PAPER; void MUTED; void LINE;
