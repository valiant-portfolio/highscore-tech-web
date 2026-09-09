// Single source of truth for who we are, where we are, and how to reach us.
//
// Every NAP (name / address / phone) signal Google sees comes from here: the
// LocalBusiness JSON-LD, the footer, the contact page. Local ranking is an
// entity-matching problem — Google compares the name, address and phone on the
// site against the Google Business Profile and against every directory listing,
// and a mismatch in any one of them costs trust. Keeping them in one file is
// the only way that stays true after six months of edits.
//
// If any of this changes, change it HERE and nowhere else, then update the
// Google Business Profile to match character for character.

/** Legal/display name. Must match the Google Business Profile exactly — no
 *  appended keywords, which Google treats as spam. */
export const BUSINESS_NAME = 'Highscore Studio';

/** The parent company, as registered. */
export const LEGAL_NAME = 'Highscore Tech';
export const CAC_RC = 'RC 7223102';

/** E.164, no spaces. Set NEXT_PUBLIC_STUDIO_PHONE to the number the Google
 *  Business Profile carries — the two must be identical or the entity fails
 *  validation and the listing loses trust. */
export const PHONE = process.env.NEXT_PUBLIC_STUDIO_PHONE ?? '';

export const EMAIL = 'studio@highzcore.tech';

/** Nigerian street addresses are frequently non-standard, so the practical
 *  approach is to drop a pin in Google Maps and adopt whatever address Google
 *  itself assigns to that pin. Until a verified street address exists, we
 *  publish locality-level only rather than an invented street — a wrong address
 *  in schema is worse than an absent one. */
export const ADDRESS = {
  street: process.env.NEXT_PUBLIC_STUDIO_STREET ?? '',
  locality: 'Lekki',
  region: 'Lagos',
  regionCode: 'LA',
  country: 'NG',
  postalCode: process.env.NEXT_PUBLIC_STUDIO_POSTCODE ?? '',
} as const;

/** Lagos city centre. Replace with the exact pin coordinates once the Google
 *  Business Profile is verified. */
export const GEO = { lat: 6.5244, lng: 3.3792 } as const;

/** Lagosians search by neighbourhood, not by local government area — "studio in
 *  Lekki", never "studio in Eti-Osa". These are the areas we say we serve, and
 *  they are the phrases worth carrying in page copy. */
export const AREAS_SERVED = [
  'Lekki', 'Ikoyi', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba',
  'Ajah', 'Magodo', 'Gbagada', 'Festac', 'Ikorodu', 'Lagos Island',
] as const;

/** Beyond Lagos. Delivery is digital, so the service area is genuinely national
 *  plus the diaspora — claiming it is accurate, not a stretch. */
export const REGIONS_SERVED = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City', 'Enugu',
  'Kano', 'Nigeria', 'United Kingdom', 'United States', 'Canada',
] as const;

/** Opening hours, in schema's 24h form. Override via env if these change so the
 *  site and the Google Business Profile never drift apart. */
export const OPENING_HOURS = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  opens: process.env.NEXT_PUBLIC_STUDIO_OPENS ?? '09:00',
  closes: process.env.NEXT_PUBLIC_STUDIO_CLOSES ?? '18:00',
} as const;

/** Cheapest package to most expensive, as Google's coarse price band. */
export const PRICE_RANGE = '₦₦';

/**
 * Profiles that prove this is one real entity rather than a name on a page.
 * `sameAs` is how a search engine reconciles the site, the Google Business
 * Profile and the social accounts into a single business — being cited
 * consistently across the web is what link building has become.
 *
 * Empty strings are stripped before rendering, so an unset handle simply does
 * not appear rather than shipping a dead link.
 */
export const SOCIAL_PROFILES = [
  process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? '',
  process.env.NEXT_PUBLIC_SOCIAL_TIKTOK ?? '',
  process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? '',
  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? '',
  process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? '',
  process.env.NEXT_PUBLIC_SOCIAL_X ?? '',
].filter(Boolean);

/** Human-readable address line for the footer and contact page. Built from the
 *  same parts the schema uses, so the two can never disagree. */
export function addressLine(): string {
  return [ADDRESS.street, ADDRESS.locality, `${ADDRESS.region}, Nigeria`]
    .filter(Boolean)
    .join(', ');
}

/** Display form of the phone number, e.g. +234 703 253 5735. */
export function phoneDisplay(): string {
  if (!PHONE) return '';
  const d = PHONE.replace(/[^\d+]/g, '');
  const m = d.match(/^\+?234(\d{3})(\d{3})(\d{4})$/);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : PHONE;
}

/* ── The agency entity ────────────────────────────────────────────────────
   "Highscore" is a contested name. HighScore EdTech (JAMB/WAEC tutorials),
   highscore.com (game streaming) and Malvern Panalytical's HighScore (XRD
   software) all carry it, and Google's AI Overview currently answers a query
   for "Highscore Tech" by describing the edtech company. That is an entity
   problem, not a keyword problem: when a name is shared, Google's confidence in
   assigning any signal to the right owner collapses, and no amount of content
   fixes it.

   The documented remedy is specificity applied consistently everywhere, plus
   external identifiers it can cross-check. So the bare word never appears alone
   below — it is always "Highscore Tech", with the CAC number, the founder and
   the city attached.                                                          */

export const AGENCY_NAME = 'Highscore Tech';

/** Every form of the name a person might type or a directory might list. Gives
 *  Google explicit permission to treat these as one entity rather than guessing. */
export const AGENCY_ALT_NAMES = [
  'Highscore',
  'HighScore Tech',
  'Highscore Technology',
  'Highzcore',
  'Highscore Tech Nigeria',
] as const;

/** Corporate Affairs Commission registration. A government identifier is one of
 *  the strongest disambiguation signals available — it is unique, verifiable and
 *  belongs to exactly one company. */
export const CAC_NUMBER = '7223102';

/** ISO date. Unset rather than guessed: a wrong founding date is a contradiction
 *  Google can catch against other sources, which costs more than an absent one. */
export const FOUNDED = process.env.NEXT_PUBLIC_FOUNDED ?? '';

/** A named, real founder is a disambiguation anchor. None of the other
 *  "Highscore" entities have this person attached to them. */
export const FOUNDER = {
  name: 'Victor Otung',
  jobTitle: 'Founder & Chief Executive Officer',
  sameAs: [
    process.env.NEXT_PUBLIC_FOUNDER_LINKEDIN ?? '',
    process.env.NEXT_PUBLIC_FOUNDER_X ?? '',
    process.env.NEXT_PUBLIC_FOUNDER_GITHUB ?? '',
  ].filter(Boolean),
} as const;

/** What the company is demonstrably about. `knowsAbout` is how Google links an
 *  entity to topics, and it is what decides whether we are considered for a
 *  query at all against competitors with weaker entity signals. */
export const AGENCY_KNOWS_ABOUT = [
  'Artificial intelligence development',
  'AI systems integration',
  'Large language model applications',
  'Retrieval-augmented generation',
  'Web application development',
  'Mobile application development',
  'Next.js development',
  'React Native development',
  'Custom software development',
  'Music and jingle production',
  'Advert video production',
  'Search engine optimisation',
] as const;

/** Authoritative external profiles for the company. These are what Google
 *  cross-references to decide the site, the socials and the registry entry are
 *  one business. A Wikidata item is the single most valuable one to add. */
export const AGENCY_PROFILES = [
  process.env.NEXT_PUBLIC_AGENCY_LINKEDIN ?? '',
  process.env.NEXT_PUBLIC_AGENCY_GITHUB ?? '',
  process.env.NEXT_PUBLIC_AGENCY_X ?? '',
  process.env.NEXT_PUBLIC_AGENCY_CRUNCHBASE ?? '',
  process.env.NEXT_PUBLIC_AGENCY_WIKIDATA ?? '',
  ...SOCIAL_PROFILES,
].filter(Boolean);
