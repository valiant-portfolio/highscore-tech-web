// Email sent to hello@ when a new contact-form submission lands.

import { Section, Text } from '@react-email/components';
import {
  EmailShell, h1, p, muted, kvTable, kvKey, kvVal, divider, LINE,
} from './shared';

interface Props {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  submittedAt: string;   // pre-formatted
}

export function ContactNotifyEmail(props: Props) {
  return (
    <EmailShell preview={`New contact: ${props.name}`} eyebrow="CONTACT FORM">
      <Text style={h1}>New contact enquiry</Text>
      <Text style={muted}>Someone submitted the form on /contact. Reply directly to this email and your reply goes straight to them.</Text>

      <table cellPadding={0} cellSpacing={0} style={kvTable}>
        <tbody>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>From</td><td style={kvVal}>{props.name}</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>Email</td><td style={kvVal}>{props.email}</td>
          </tr>
          {props.phone && (
            <tr style={{ borderBottom: `1px solid ${LINE}` }}>
              <td style={kvKey}>Phone</td><td style={kvVal}>{props.phone}</td>
            </tr>
          )}
          {props.subject && (
            <tr style={{ borderBottom: `1px solid ${LINE}` }}>
              <td style={kvKey}>Subject</td><td style={kvVal}>{props.subject}</td>
            </tr>
          )}
          <tr>
            <td style={kvKey}>Received</td><td style={kvVal}>{props.submittedAt}</td>
          </tr>
        </tbody>
      </table>

      <hr style={divider} />

      <Section style={{ background: '#F4F8FA', padding: '16px 20px', borderRadius: '8px', borderLeft: '3px solid #18C2DC' }}>
        <Text style={{ ...p, whiteSpace: 'pre-wrap', margin: 0 }}>{props.message}</Text>
      </Section>
    </EmailShell>
  );
}
