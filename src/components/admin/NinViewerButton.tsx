'use client';

import { useState } from 'react';
import { Loader2, FileText } from 'lucide-react';

export function NinViewerButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/nin-docs?userId=${userId}`);
          const { url } = await res.json();
          if (url) window.open(url, '_blank', 'noopener,noreferrer');
          else alert('No NIN document on file for this student.');
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex h-8 items-center gap-1.5 px-3 rounded-md bg-brand text-brand-fg text-xs font-semibold hover:bg-brand-hover disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
      View NIN
    </button>
  );
}
