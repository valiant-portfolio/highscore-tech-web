// Email body for a staff offboarding letter (suspend / fire). The same text
// the admin typed in the modal; a signed PDF copy rides along as an attachment.

import { Text } from '@react-email/components';
import { EmailShell, h1, p, muted } from './shared';

function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

export function StaffOffboardingEmail({ heading, bodyText }: { heading: string; bodyText: string }) {
  return (
    <EmailShell preview={heading} eyebrow="HIGHSCORE TECH">
      <Text style={h1}>{heading}</Text>
      {toParagraphs(bodyText).map((block, i) => (
        <Text key={i} style={p}>{block}</Text>
      ))}
      <Text style={muted}>A signed copy of this letter is attached as a PDF.</Text>
    </EmailShell>
  );
}
