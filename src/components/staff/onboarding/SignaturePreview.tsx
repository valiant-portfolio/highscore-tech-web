'use client';

// Renders the staff's processed signature inside a horizontal signature
// slot (4:1 aspect ratio, similar to a real signature line on paper).
// Loads via /api/staff/me/signature-preview which returns a 5-minute
// signed URL — no public bucket exposure.

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function SignaturePreview({ refreshKey }: { refreshKey?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/staff/me/signature-preview')
      .then((r) => r.json())
      .then(({ url }) => setUrl(url))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="w-full aspect-[4/1] rounded-md border border-dashed border-border bg-paper flex items-center justify-center px-6 py-4 overflow-hidden">
      {loading ? (
        <Loader2 className="h-5 w-5 text-fg-muted animate-spin" />
      ) : url ? (
        <img src={url} alt="Your signature" className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-xs uppercase tracking-[0.18em] text-fg-subtle font-semibold">Signature</span>
      )}
    </div>
  );
}
