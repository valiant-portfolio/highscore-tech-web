// Email body for a staff offboarding letter (suspend / fire). The same text
// the admin typed in the modal; a signed PDF copy rides along as an attachment.
//
// Formatting rules applied to the free-typed letter:
//   • line endings are normalised (CRLF/CR → LF) so Windows/pasted text splits
//     correctly — otherwise a blank line (\r\n\r\n) is never seen as a break and
//     the whole letter collapses into one run-on paragraph;
//   • a blank line starts a new paragraph (its own <p> with spacing);
//   • a single newline inside a paragraph is kept as a <br/> (signature blocks,
//     addresses, the settlement breakdown, etc. stay on their own lines);
//   • **text** renders as bold.

import { Text } from '@react-email/components';
import { EmailShell, h1, p, muted } from './shared';
import { toParagraphs, renderBlock } from './format';

export function StaffOffboardingEmail({ heading, bodyText }: { heading: string; bodyText: string }) {
  return (
    <EmailShell preview={heading} eyebrow="HIGHSCORE TECH">
      <Text style={h1}>{heading}</Text>
      {toParagraphs(bodyText).map((block, i) => (
        <Text key={i} style={p}>{renderBlock(block)}</Text>
      ))}
      <Text style={muted}>A signed copy of this letter is attached as a PDF.</Text>
    </EmailShell>
  );
}
