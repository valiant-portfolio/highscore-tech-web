// Canonical URLs for each product subdomain.
//
// One company, one app, one domain — each product is served on its own subdomain
// (routed by src/proxy.ts). These are the links the main page points at. Mirrors
// the STUDIO_URL pattern in lib/studio/catalog: a NEXT_PUBLIC_ override per product,
// else the production subdomain under NEXT_PUBLIC_ROOT_DOMAIN (default highzcore.tech).

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'highzcore.tech';

export const AUTOTRADE_URL =
  process.env.NEXT_PUBLIC_AUTOTRADE_URL ?? `https://autotrade.${ROOT}`;

export const ANALYSIS_URL =
  process.env.NEXT_PUBLIC_ANALYSIS_URL ?? `https://analysis.${ROOT}`;

export const BUILD_URL =
  process.env.NEXT_PUBLIC_BUILD_URL ?? `https://build.${ROOT}`;

// Studio already has a canonical URL (it predates the others); re-exported here so
// the main page imports all four products from one place.
export { STUDIO_URL } from '@/lib/studio/catalog';
