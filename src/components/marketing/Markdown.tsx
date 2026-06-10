// Tiny markdown renderer for portfolio case studies + course descriptions.
//
// Supports: H2 (## ), H3 (### ), bulleted lists (- ), paragraphs, **bold**,
// and inline `code`. Anything more elaborate (links, images, tables) belongs
// in a real renderer — but the seeded content here is plain-text-ish prose
// so this stays light and dependency-free.

import { Fragment } from 'react';

interface Props {
  source: string;
  className?: string;
}

function renderInline(text: string): React.ReactNode {
  // Bold **x** and inline `code` — handled in two passes.
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const tok = match[0];
    if (tok.startsWith('**')) {
      parts.push(<strong key={`b${key++}`} className="text-fg font-semibold">{tok.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={`c${key++}`} className="font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-surface text-brand">{tok.slice(1, -1)}</code>);
    }
    last = match.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ source, className }: Props) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Headings
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={key++} className="font-display text-xl md:text-2xl font-semibold tracking-tight text-fg mt-8 mb-3">
          {renderInline(line.slice(4))}
        </h3>,
      );
      i++; continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={key++} className="font-display text-2xl md:text-3xl font-bold tracking-tight text-fg mt-10 mb-4">
          {renderInline(line.slice(3))}
        </h2>,
      );
      i++; continue;
    }

    // Bulleted lists — consume consecutive `- ` lines.
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-4 space-y-2 list-disc pl-6 marker:text-brand text-fg-muted leading-relaxed">
          {items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}
        </ul>,
      );
      continue;
    }

    // Paragraph — consume until a blank line.
    const paraLines: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('- ')) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-4 text-base md:text-[17px] text-fg-muted leading-[1.75]">
        {renderInline(paraLines.join(' '))}
      </p>,
    );
  }

  return <div className={className}>{blocks.map((b, idx) => <Fragment key={idx}>{b}</Fragment>)}</div>;
}
