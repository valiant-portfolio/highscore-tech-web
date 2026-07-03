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
import { Fragment, type ReactNode } from 'react';
import { EmailShell, h1, p, muted, INK } from './shared';

function toParagraphs(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')          // normalise CRLF / CR → LF
    .split(/\n{2,}/)                  // blank line → new paragraph
    .map((block) => block.replace(/[ \t]+\n/g, '\n').trim())
    .filter(Boolean);
}

// Inline pass: split a single line on **bold** spans.
function renderInline(line: string, keyBase: string): ReactNode[] {
  return line
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((chunk) => chunk.length > 0)
    .map((chunk, i) => {
      const bold = /^\*\*([^*]+)\*\*$/.exec(chunk);
      return bold ? (
        <strong key={`${keyBase}-${i}`} style={{ fontWeight: 700, color: INK }}>{bold[1]}</strong>
      ) : (
        <Fragment key={`${keyBase}-${i}`}>{chunk}</Fragment>
      );
    });
}

// A paragraph may contain single newlines → render them as <br/>.
function renderBlock(block: string): ReactNode[] {
  const lines = block.split('\n');
  return lines.flatMap((line, i) =>
    i < lines.length - 1
      ? [...renderInline(line, `l${i}`), <br key={`br${i}`} />]
      : renderInline(line, `l${i}`),
  );
}

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
