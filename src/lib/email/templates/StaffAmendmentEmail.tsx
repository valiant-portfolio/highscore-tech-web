// Sent to a staff member when admin updates fields on their HR record.

import { Section, Text } from '@react-email/components';
import {
  EmailShell, h1, p, muted, kvTable, kvKey, kvVal, LINE,
} from './shared';

interface Change {
  field: string;
  before: string;
  after: string;
}

interface Props {
  firstName: string;
  changes: Change[];
}

export function StaffAmendmentEmail({ firstName, changes }: Props) {
  return (
    <EmailShell preview="Your Highscore Tech record was updated" eyebrow="STAFF · RECORD UPDATED">
      <Text style={h1}>Heads up, {firstName} — your record changed.</Text>
      <Text style={p}>
        An admin updated your HR record on the Highscore Tech staff system. Here's exactly what changed:
      </Text>

      <Section style={{ background: '#F4F8FA', padding: '8px 16px', borderRadius: '8px', borderLeft: '3px solid #18C2DC', margin: '14px 0' }}>
        <table cellPadding={0} cellSpacing={0} style={kvTable}>
          <thead>
            <tr>
              <th style={{ ...kvKey, fontWeight: 800, color: '#0A8EA8', fontSize: '11px', letterSpacing: '1.2px' }}>FIELD</th>
              <th style={{ ...kvKey, fontWeight: 800, color: '#0A8EA8', fontSize: '11px', letterSpacing: '1.2px' }}>BEFORE</th>
              <th style={{ ...kvVal, fontWeight: 800, color: '#0A8EA8', fontSize: '11px', letterSpacing: '1.2px', textAlign: 'left' as const }}>NOW</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((c, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${LINE}` }}>
                <td style={kvKey}>{c.field}</td>
                <td style={{ ...kvKey, color: '#7C8893', textDecoration: 'line-through' }}>{c.before}</td>
                <td style={{ ...kvVal, textAlign: 'left' as const }}>{c.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Text style={p}>
        Sign in to your staff portal to download the updated documents — your job description, offer letter, contract, and ID card will reflect the new values immediately.
      </Text>

      <Text style={muted}>
        If anything here looks wrong, reply to this email and we'll review.
      </Text>
    </EmailShell>
  );
}
