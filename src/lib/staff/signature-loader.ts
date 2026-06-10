// Server-side helpers for fetching signature image bytes at PDF render
// time. The CEO sig sits in public/ as a processed PNG; staff sigs live
// in Supabase Storage under the signatures bucket.

import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { serviceClient } from '@/lib/supabase/service';

// Stored OUTSIDE /public so Next.js doesn't serve it as a static asset.
// Read at PDF render time, base64-encoded into the document.
const CEO_PATH = join(process.cwd(), '_secrets', 'sigs', 'ceo.png');

let cachedCeo: Buffer | null = null;
let cachedCeoChecked = false;

export async function getCeoSignatureBuffer(): Promise<Buffer | null> {
  if (cachedCeoChecked) return cachedCeo;
  cachedCeoChecked = true;
  try {
    cachedCeo = await readFile(CEO_PATH);
  } catch {
    cachedCeo = null;     // file not present yet — falls back to cursive Allura
  }
  return cachedCeo;
}

export async function getStaffSignatureBuffer(path: string | null): Promise<Buffer | null> {
  if (!path) return null;
  const admin = serviceClient();
  const { data } = await admin.storage.from('signatures').download(path);
  if (!data) return null;
  const buf = Buffer.from(await data.arrayBuffer());
  return buf;
}

// react-pdf can't take a Buffer directly — it expects a data: URI or a URL.
// Encode the buffer as a data: URI so it's drop-in.
export function bufferToDataUri(buf: Buffer, mime = 'image/png'): string {
  return `data:${mime};base64,${buf.toString('base64')}`;
}
