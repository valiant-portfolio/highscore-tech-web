'use client';

// Renders an agreement as a styled "letter on paper" so the staff member
// signing it sees something that reads like a real document, not a dark
// HTML page. Mirrors the layout of the actual PDF the route generates.
//
// Layout:
//   ┌─────────────────────────────────────────────────┐
//   │  HIGHSCORE TECH         · brand cyan rule ·     │
//   │  AI Studio · Academy            <date>          │
//   ├─────────────────────────────────────────────────┤
//   │                                                 │
//   │  <recipient address block>                      │
//   │                                                 │
//   │  Dear <First Name>,                             │
//   │                                                 │
//   │  <body paragraphs>                              │
//   │                                                 │
//   │  Yours sincerely,                               │
//   │                                                 │
//   ├──────────────────┬──────────────────────────────┤
//   │  CEO sig         │  Staff sig                   │
//   │  Victor Otung    │  Vany Joseph                 │
//   │  CEO             │  Accepted: signed on submit  │
//   └─────────────────────────────────────────────────┘
//
// Background is paper-white with subtle drop-shadow on a soft surface so
// it reads like a printed page even inside the dark app shell. All text
// uses ink black on cream so contrast looks like real ink on paper.

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  /** "Offer of Employment", "Employment Contract" — printed on the body */
  title: string;
  /** Document date shown top-right */
  documentDate: string;
  /** "Vany Joseph\n[role]\nLagos, Nigeria" — top-left recipient block */
  recipient: string;
  /** First name for the salutation */
  firstName: string;
  /** Body paragraphs — each rendered as a <p> */
  paragraphs: React.ReactNode[];
  /** Sign-off line, e.g. "Yours sincerely," */
  signOff: string;
  /** CEO + staff names */
  ceoName: string;
  staffName: string;
}

// 5-minute signed URL for the current staff's processed signature. The
// LetterPaper sits inside an authenticated page so this is safe to call
// without an extra round-trip.
function useStaffSignatureUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/staff/me/signature-preview')
      .then((r) => r.json())
      .then(({ url }) => { if (!cancelled) setUrl(url); })
      .catch(() => { /* swallow — fall back to blank slot */ });
    return () => { cancelled = true; };
  }, []);
  return url;
}

export function LetterPaper({
  title, documentDate, recipient, firstName, paragraphs, signOff, ceoName, staffName,
}: Props) {
  const staffSig = useStaffSignatureUrl();

  return (
    <div className="mx-auto max-w-[760px]">
      {/* Subtle "page on desk" shadow */}
      <div
        className="bg-[#FBFAF6] text-[#1A1B1E] rounded-md shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55),0_18px_32px_-12px_rgba(0,0,0,0.35)] overflow-hidden"
        style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
      >
        {/* Letterhead */}
        <header className="px-10 md:px-14 pt-10 md:pt-12 pb-6 border-b-2 border-[#18C2DC]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-[#0A8EA8] leading-none">
                HIGHSCORE TECH
              </h1>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#5A6470]">
                AI Development Studio · Academy
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#5A6470]">Issued</p>
              <p className="mt-1 text-sm font-mono tabular font-semibold text-[#1A1B1E]">{documentDate}</p>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="px-10 md:px-14 py-10 md:py-12 text-[14.5px] md:text-[15px] leading-[1.75]">
          <pre className="font-sans whitespace-pre-line text-[#3B4651]">{recipient}</pre>

          <p className="mt-8 font-bold text-[#1A1B1E]">RE: {title}</p>

          <p className="mt-6">Dear {firstName},</p>

          <div className="mt-4 space-y-5 text-[#222]">
            {paragraphs.map((p, i) => (
              <div key={i}>{p}</div>
            ))}
          </div>

          <p className="mt-8">{signOff}</p>
        </div>

        {/* Signature block */}
        <div className="px-10 md:px-14 pb-14 pt-2 grid sm:grid-cols-2 gap-10 md:gap-14">
          <SignatureSlot
            label="For Highscore Tech"
            name={ceoName}
            title="Chief Executive Officer"
            // CEO signature: render as a cursive script. The actual PDF
            // embeds the real CEO signature image when available.
            scriptName="Valiant"
          />
          <SignatureSlot
            label="Accepted"
            name={staffName}
            title={`Signed on ${documentDate}`}
            imageUrl={staffSig}
          />
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] uppercase tracking-[0.18em] font-semibold text-fg-subtle">
        This document is a binding agreement between you and Highscore Tech.
      </p>
    </div>
  );
}

function SignatureSlot({
  label, name, title, imageUrl, scriptName,
}: {
  label: string;
  name: string;
  title: string;
  imageUrl?: string | null;
  scriptName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#5A6470]">{label}</p>

      {/* Signature line */}
      <div className="mt-3 relative">
        <div className="h-20 flex items-end justify-start">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="max-h-20 max-w-full object-contain object-bottom"
              style={{ mixBlendMode: 'multiply' }}
            />
          ) : scriptName ? (
            <span
              className="text-4xl md:text-5xl text-[#0A8EA8] leading-none italic select-none"
              style={{ fontFamily: 'var(--font-script, "Allura"), cursive', transform: 'rotate(-3deg)' }}
            >
              {scriptName}
            </span>
          ) : (
            <span className="text-xs text-[#9aa3ad] italic">— signature pending —</span>
          )}
        </div>
        {/* Ink line */}
        <div className="border-b border-[#1A1B1E]/40 mt-1" />
      </div>

      <p className="mt-2 font-semibold text-[#1A1B1E] text-[15px]">{name}</p>
      <p className="text-xs text-[#5A6470]">{title}</p>
    </div>
  );
}

void Loader2;
