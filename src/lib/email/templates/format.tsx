// Shared formatter for admin-typed letter/message bodies rendered in
// react-email templates. Turns plain text (from a <textarea>) into paragraphs:
//   • line endings are normalised (CRLF/CR → LF) so Windows/pasted text splits
//     correctly — otherwise a blank line (\r\n\r\n) is never seen as a break and
//     the whole message collapses into one run-on paragraph;
//   • a blank line starts a new paragraph;
//   • a single newline inside a paragraph is kept as a <br/>;
//   • **text** renders as bold.
// (The offboarding PDF has its own copy of this logic because @react-pdf uses
// '\n' / nested <Text> for breaks and weight rather than <br/> / <strong>.)

import { Fragment, type ReactNode } from 'react';
import { INK } from './shared';

export function toParagraphs(text: string): string[] {
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
export function renderBlock(block: string): ReactNode[] {
  const lines = block.split('\n');
  return lines.flatMap((line, i) =>
    i < lines.length - 1
      ? [...renderInline(line, `l${i}`), <br key={`br${i}`} />]
      : renderInline(line, `l${i}`),
  );
}
