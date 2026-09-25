'use client';

// Olivia's reading of a trade: her marked-up chart and one sentence.
//
// It sits UNDER the bot's indicator table on purpose. The routine is: mark the
// chart yourself first, then read what the bot thought, then write down the
// gap. Putting her input above the bot's reading would invite the opposite
// order, and "once you have read what the bot thought, you cannot unsee it".
//
// Saving replaces the note but never deletes a previous image — each upload
// gets its own path, so an analyst correcting themselves does not destroy what
// they first saw.

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { ImagePlus, Check } from 'lucide-react';
import { saveTradeAnalysisAction } from '@/lib/admin/trading-bot-actions';

interface Props {
  ticket: number;
  symbol: string;
  note: string | null;
  imageUrl: string | null;      // already signed by the server component
  at: string | null;
  by: string | null;
  /** What the order was when it was read — stored with the note so it can be
   *  judged against the setup it describes, not against what happened later. */
  context?: { side?: string | null; level?: number | null; sl?: number | null; tp?: number | null };
}

export function TradeAnalysis({ ticket, symbol, note, imageUrl, at, by, context }: Props) {
  const [text, setText] = useState(note ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = text.trim() !== (note ?? '').trim() || file != null;

  const save = () => {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveTradeAnalysisAction(ticket, symbol, text, file, context);
      if (res.ok) {
        setSaved(true);
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
      } else {
        setError(res.error);
      }
    });
  };

  const when = at
    ? new Date(at).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="p-5 md:p-6">
      {imageUrl && (
        <a href={imageUrl} target="_blank" rel="noreferrer" className="mb-5 block">
          {/* Unoptimised: the URL is signed and short-lived, so Next's image
              optimiser would cache a link that expires underneath it. */}
          <Image
            src={imageUrl}
            alt={`Analyst markup for trade ${ticket}`}
            width={1600}
            height={900}
            unoptimized
            className="w-full rounded-md border border-border object-contain"
          />
        </a>
      )}

      <label htmlFor={`note-${ticket}`} className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">
        Does this trade make sense — and if not, what did the bot miss?
      </label>
      <textarea
        id={`note-${ticket}`}
        rows={3}
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        placeholder="It sold into support at 0.56600 — H1 was down but price was already at the level."
        className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-fg-muted hover:bg-surface-hover">
          <ImagePlus className="h-4 w-4" />
          {file ? file.name : imageUrl ? 'Replace chart' : 'Attach marked-up chart'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setSaved(false); }}
          />
        </label>

        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-brand-fg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? 'Saving…' : 'Save analysis'}
        </button>

        {saved && !dirty && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
        {error && <span className="text-xs text-danger">{error}</span>}
        {when && !dirty && (
          <span className="ml-auto text-[11px] text-fg-subtle">
            Last reviewed {when}{by ? ` · ${by}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
