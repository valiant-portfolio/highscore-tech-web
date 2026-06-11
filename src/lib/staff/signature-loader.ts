// Server-side helpers for fetching signature image bytes at PDF render
// time.
//
//   • CEO signature → first tries Supabase Storage (signatures/ceo/
//     signature.png — uploaded by the admin via /admin/settings).
//     Falls back to the legacy local-disk path (_secrets/sigs/ceo.png)
//     for dev environments where the Storage object isn't seeded.
//   • Staff signature → Supabase Storage (signatures bucket, per-user
//     path stored on the staff record).
//
// Both are cached in memory for the lifetime of the function instance
// so repeated PDF renders don't re-download.

import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { serviceClient } from '@/lib/supabase/service';

const CEO_STORAGE_PATH = 'ceo/signature.png';
const CEO_LOCAL_PATH = join(process.cwd(), '_secrets', 'sigs', 'ceo.png');

interface CachedBuffer {
  buf: Buffer | null;
  expires: number;
}

// 10-minute cache. Short enough that a fresh upload from /admin/settings
// becomes visible quickly, long enough to avoid hammering Storage on
// hot routes.
const CACHE_TTL_MS = 10 * 60 * 1000;
let ceoCache: CachedBuffer | null = null;

export async function getCeoSignatureBuffer(): Promise<Buffer | null> {
  if (ceoCache && ceoCache.expires > Date.now()) return ceoCache.buf;

  let buf: Buffer | null = null;

  // 1. Try Storage.
  try {
    const admin = serviceClient();
    const { data } = await admin.storage.from('signatures').download(CEO_STORAGE_PATH);
    if (data) {
      buf = Buffer.from(await data.arrayBuffer());
    }
  } catch {
    /* fall through to local file */
  }

  // 2. Fallback for local development.
  if (!buf) {
    try {
      buf = await readFile(CEO_LOCAL_PATH);
    } catch {
      buf = null;
    }
  }

  ceoCache = { buf, expires: Date.now() + CACHE_TTL_MS };
  return buf;
}

/** Force-clear the CEO sig cache (e.g. after a fresh upload). */
export function clearCeoSignatureCache(): void {
  ceoCache = null;
}

export async function getStaffSignatureBuffer(path: string | null): Promise<Buffer | null> {
  if (!path) return null;
  const admin = serviceClient();
  const { data } = await admin.storage.from('signatures').download(path);
  if (!data) return null;
  return Buffer.from(await data.arrayBuffer());
}

// react-pdf can't take a Buffer directly — it expects a data: URI or a URL.
// Encode the buffer as a data: URI so it's drop-in.
export function bufferToDataUri(buf: Buffer, mime = 'image/png'): string {
  return `data:${mime};base64,${buf.toString('base64')}`;
}
