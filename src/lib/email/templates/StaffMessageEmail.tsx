// General staff message email — a plain note from the company to a staff
// member (not an offboarding letter, so no signed-PDF attachment). The admin
// types the body in the modal; **bold**, paragraphs and line breaks are honoured
// via the shared formatter.

import { Text } from '@react-email/components';
import { EmailShell, h1, p } from './shared';
import { toParagraphs, renderBlock } from './format';

export function StaffMessageEmail({ heading, bodyText }: { heading: string; bodyText: string }) {
  return (
    <EmailShell preview={heading} eyebrow="HIGHSCORE TECH">
      <Text style={h1}>{heading}</Text>
      {toParagraphs(bodyText).map((block, i) => (
        <Text key={i} style={p}>{renderBlock(block)}</Text>
      ))}
    </EmailShell>
  );
}
