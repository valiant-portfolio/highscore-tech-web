// Reply to a contact-form enquiry, sent from the admin inbox. The admin types
// the body in the inbox; **bold**, paragraphs and line breaks are honoured via
// the shared formatter. The sender's original message is quoted underneath so
// they have the context of what they wrote.

import { Hr, Text } from '@react-email/components';
import { EmailShell, h1, p, muted, divider } from './shared';
import { toParagraphs, renderBlock } from './format';

export function ContactReplyEmail({
  heading, bodyText, originalMessage,
}: {
  heading: string;
  bodyText: string;
  originalMessage?: string | null;
}) {
  return (
    <EmailShell preview={heading} eyebrow="HIGHSCORE TECH">
      <Text style={h1}>{heading}</Text>

      {toParagraphs(bodyText).map((block, i) => (
        <Text key={i} style={p}>{renderBlock(block)}</Text>
      ))}

      {originalMessage ? (
        <>
          <Hr style={divider} />
          <Text style={{ ...muted, fontWeight: 700 }}>Your original message</Text>
          {toParagraphs(originalMessage).map((block, i) => (
            <Text key={`orig-${i}`} style={muted}>{renderBlock(block)}</Text>
          ))}
        </>
      ) : null}
    </EmailShell>
  );
}
