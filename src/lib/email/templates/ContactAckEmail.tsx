// Auto-reply confirming the contact form went through.

import { Text } from '@react-email/components';
import { EmailShell, h1, p, muted } from './shared';

interface Props { name: string; }

export function ContactAckEmail({ name }: Props) {
  const firstName = name.split(/\s+/)[0] || name;
  return (
    <EmailShell preview="Thanks — we got your message" eyebrow="HIGHSCORE TECH">
      <Text style={h1}>Thanks, {firstName} — we got your message.</Text>
      <Text style={p}>
        A human at Highscore Tech will read this and get back to you within one working day. If it's urgent, reply to this email and it'll bump in our queue.
      </Text>
      <Text style={muted}>
        — The Highscore Tech team
      </Text>
    </EmailShell>
  );
}
