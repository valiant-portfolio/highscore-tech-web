// Highscore Studio — the product catalogue and the order-brief questions.
//
// One source of truth, shared by the public pricing page, the order form, the
// rate-card PDF and the server action that prices an order. NEVER trust a price
// sent from the browser: the client posts a `packageKey` plus add-on keys, and
// the server totals it up from here (see totalNgn()).
//
// We sell to the Nigerian market, so everything is priced and charged in Naira
// and settled through ALAT by Wema. Amounts are whole Naira as integers.
//
// ── The two rules this catalogue is built on ──────────────────────────────
//
// 1. MEDIA IS NEVER INSIDE A PACKAGE. Airtime, billboard rental and printing
//    are billed at the station's own rate plus 15% for the booking — and that
//    15% comes out of the 15–30% discount stations already give agencies, so
//    it costs the client nothing extra. This is not a detail: one 30-second
//    Channels spot is ₦200,000, and the old ₦220,000 "TV" tier promised live
//    television for less than the price of a single spot. Every one of those
//    bundles lost money on every sale.
//
// 2. THE TIERS CLIMB BY CAPABILITY, NOT BY CHANNEL. First you exist online,
//    then you have something to show, then real footage and a proper site,
//    then you are on air. Everything added along the way is something we can
//    produce in-house. The old ladder climbed by adding radio and then TV,
//    which are precisely the things that cost us money and travel nowhere.
//
// Personal and business work are priced separately on purpose. A business
// package carries commercial usage rights, scripting written around the
// client's offer, and broadcast-ready masters. Someone buying a birthday song
// for their mother is spending fun money.

export type ProjectType = 'church' | 'business' | 'birthday' | 'event' | 'political';

/** ₦1,234,567 — used everywhere a price is shown. */
export function formatNgn(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

export type PackageGroup = 'personal' | 'business' | 'political';

export interface StudioPackage {
  key: string;
  name: string;
  /** Whole Naira. */
  priceNgn: number;
  /** Shown under the price on the card. */
  blurb: string;
  /** Itemised deliverables — what the client actually gets. */
  includes: string[];
  group: PackageGroup;
  /** Working days from payment to delivery. Drives the promised delivery date. */
  turnaroundDays: number;
  /** Price is a floor; the rest is scoped per job. */
  from?: boolean;
  /** Highlighted as the popular pick within its group. */
  featured?: boolean;
  /** Extra condition the customer should know before ordering. */
  note?: string;
  /**
   * What the ongoing work costs once the months included in the package run
   * out. Stated on the card on purpose — a client who reads it up front never
   * feels ambushed in month two, and continuing is a far easier conversation
   * than pitching a retainer cold.
   */
  monthlyAfterNgn?: number;
  /** e.g. "after the first month" — what the monthly price follows. */
  monthlyAfterNote?: string;
  /** What the same work costs elsewhere, for the card and the rate card. */
  marketValue?: string;
}

export const PACKAGES: StudioPackage[] = [
  /* ── Personal & occasions ─────────────────────────────────────────────
     The band plays once and goes home. The song stays.

     A live band at a Nigerian wedding is ₦300,000–₦1m for one performance,
     and the cheapest standalone pre-wedding shoot is ₦50,000. These are
     priced against that, not against a souvenir.                          */
  {
    key: 'short_song',
    name: 'The Short Song',
    priceNgn: 45_000,
    group: 'personal',
    turnaroundDays: 3,
    blurb: 'A one-minute song for one person, on their day.',
    includes: [],
  },
  {
    key: 'occasion_song',
    name: 'The Occasion Song',
    priceNgn: 120_000,
    group: 'personal',
    turnaroundDays: 5,
    featured: true,
    blurb: 'A real song, written from their actual story.',
    includes: [],
    marketValue: 'A live band plays once for ₦300,000–₦1m',
  },
  {
    key: 'occasion_film',
    name: 'The Occasion Film',
    priceNgn: 280_000,
    group: 'personal',
    turnaroundDays: 7,
    blurb: 'The song, the film, and the record that outlives the day.',
    includes: [],
    note: 'The song goes live on Spotify and Apple Music about two weeks after delivery.',
  },

  /* ── Business & brands ────────────────────────────────────────────────
     Each tier is everything before it, plus a new capability. The website is
     the hook: a Nigerian SME already budgets ₦250,000–₦400,000 for one, so
     including it stops the price being a question.                        */
  {
    key: 'business_starter',
    name: 'The Starter',
    priceNgn: 180_000,
    group: 'business',
    turnaroundDays: 7,
    blurb: 'For a business that exists but cannot be found.',
    includes: [],
    marketValue: '₦310,000–₦800,000 bought separately',
  },
  {
    key: 'business_brand_pack',
    name: 'The Brand Pack',
    priceNgn: 380_000,
    group: 'business',
    turnaroundDays: 14,
    featured: true,
    blurb: 'For a business ready to be seen, not just found.',
    includes: [],
    monthlyAfterNgn: 250_000,
    monthlyAfterNote: 'after the first month included',
    marketValue: '₦760,000–₦1.6m bought separately',
  },
  {
    key: 'business_launch',
    name: 'The Launch',
    priceNgn: 750_000,
    group: 'business',
    turnaroundDays: 21,
    blurb: 'For a business opening, relaunching, or finally taking itself seriously.',
    includes: [],
    monthlyAfterNgn: 350_000,
    monthlyAfterNote: 'after the three months included',
    marketValue: '₦1.6m–₦3m bought separately',
    note: 'Covers a filming day in Lagos. Outside Lagos we quote travel before we start.',
  },
  {
    key: 'business_campaign',
    name: 'The Full Campaign',
    priceNgn: 1_500_000,
    from: true,
    group: 'business',
    turnaroundDays: 30,
    blurb: 'For a business that wants the whole city to know.',
    includes: [],
    monthlyAfterNgn: 750_000,
    monthlyAfterNote: 'after the three months included',
    note: 'Airtime and billboard rental are billed separately at the station’s own rate, plus 15% for the booking.',
  },

  /* ── Political ────────────────────────────────────────────────────────
     The 2027 window is open: campaigning legally began 150 days before the
     16 January 2027 poll. Media houses charge campaigns a 31–50% premium as
     standard — a full-page newspaper is ₦920,000 political against ₦700,000
     commercial, and Channels applies a 50% political surcharge — so the
     production carries one too.                                           */
  {
    key: 'campaign_jingle',
    name: 'Campaign Jingle',
    priceNgn: 250_000,
    group: 'political',
    turnaroundDays: 5,
    blurb: 'The song they will be humming at the rally.',
    includes: [],
  },
  {
    key: 'campaign_pack',
    name: 'Campaign Pack',
    priceNgn: 850_000,
    group: 'political',
    turnaroundDays: 14,
    featured: true,
    blurb: 'The jingle, the films, and everything cut for every screen.',
    includes: [],
  },
  {
    key: 'campaign_full',
    name: 'Full Campaign',
    priceNgn: 2_000_000,
    from: true,
    group: 'political',
    turnaroundDays: 30,
    blurb: 'Everything, planned and placed, from now to polling day.',
    includes: [],
    note: 'Airtime and outdoor rental are billed separately at the station’s own rate, plus 15% for the booking.',
  },
];

export const PACKAGE_BY_KEY: Record<string, StudioPackage> = Object.fromEntries(
  PACKAGES.map((p) => [p.key, p]),
);

/** Group headings, in the order they appear on the pricing page and the PDF. */
export const PACKAGE_GROUPS: {
  id: PackageGroup;
  eyebrow: string;
  title: string;
  body: string;
}[] = [
  {
    id: 'personal',
    eyebrow: 'Personal & occasions',
    title: 'The band plays once and goes home. The song stays.',
    body: 'Birthdays, weddings, anniversaries, funerals, church programmes. A live band at a Nigerian wedding costs ₦300,000 to ₦1m and plays for one afternoon. These do not stop playing.',
  },
  {
    id: 'business',
    eyebrow: 'Business & brands',
    title: 'Be found, be seen, be heard — in that order.',
    body: 'Every tier is everything before it plus a new capability, and each one includes the website, the Google work and the profiles that most businesses are quietly missing.',
  },
  {
    id: 'political',
    eyebrow: 'Campaigns',
    title: 'For the 2027 elections.',
    body: 'Presidential and National Assembly on 16 January 2027, Governorship and State Assembly on 6 February. Campaigning is already open. Jingles are how Nigerian campaigns are won, and the ones that work are made early.',
  },
];

/* ── Add-ons ─────────────────────────────────────────────────────────────
   Real services with a fixed price, added on top of any package. Note what
   is NOT here: airtime. We do not sell airtime at a fixed price because we
   cannot — a 60-second spot ranges from ₦20,000 on a state station to
   ₦85,000 on Cool FM, and one 30-second Channels slot is ₦200,000. Media is
   quoted per campaign and billed at the station's rate plus 15%.          */

export interface StudioAddon {
  key: string;
  name: string;
  priceNgn: number;
  blurb: string;
}

export const ADDONS: StudioAddon[] = [
  {
    key: 'media_booking',
    name: 'Media planning & booking',
    priceNgn: 120_000,
    blurb:
      'We write the campaign plan — which stations, which weeks, which billboards, with the real cost of each — then negotiate, book, traffic the files and confirm every spot ran. Airtime and rental are billed separately at the station’s own rate plus 15%.',
  },
  {
    key: 'streaming_release',
    name: 'Release to Spotify & Apple Music',
    priceNgn: 25_000,
    blurb:
      'Your song published to Spotify, Apple Music and YouTube Music under the name you choose, so it can be searched for and played by anyone, forever. Live about two weeks after delivery. Already included in The Occasion Film.',
  },
  {
    key: 'framed_tribute',
    name: 'Framed spoken-word tribute',
    priceNgn: 20_000,
    blurb:
      'A short written tribute about the person — who they are, what they survived, what they always say — typeset, printed and framed with their name and the date. Delivered in Lagos; elsewhere we quote shipping. Already included in The Occasion Song.',
  },
];

export const ADDON_BY_KEY: Record<string, StudioAddon> = Object.fromEntries(
  ADDONS.map((a) => [a.key, a]),
);

/* ── Media rates ─────────────────────────────────────────────────────────
   Published on the pricing page and the rate card on purpose. Showing the
   real station rates is what proves our package price is a production fee
   and not a markup — and it stops a client expecting television inside a
   ₦380,000 package. Verified against station cards and agency rate guides,
   September 2026. Rates move; we re-confirm before every booking.         */

export interface MediaRate {
  label: string;
  rate: string;
  note?: string;
}

export const MEDIA_RATES: { heading: string; items: MediaRate[] }[] = [
  {
    heading: 'Radio',
    items: [
      { label: '60 seconds, peak — state station', rate: '₦20,000 – ₦40,000', note: 'per spot' },
      { label: '60 seconds, peak — Cool FM, Beat FM', rate: '₦45,000 – ₦85,000', note: 'per spot' },
      { label: 'Two-week local flight', rate: 'from ₦150,000' },
    ],
  },
  {
    heading: 'Television',
    items: [
      { label: 'Arise, 10 seconds primetime', rate: '₦10,000 – ₦18,000' },
      { label: 'Channels, 15 seconds off-peak', rate: '₦100,000' },
      { label: 'Channels, 30 seconds', rate: '₦200,000' },
    ],
  },
  {
    heading: 'Outdoor & print',
    items: [
      { label: 'BRT shelter or lamppost', rate: '₦40,000 – ₦150,000', note: 'per month' },
      { label: '48-sheet billboard, mainland', rate: '₦300,000 – ₦600,000', note: 'per month' },
      { label: 'Street banner, 3m × 2m', rate: '₦18,000 – ₦36,000', note: 'each' },
      { label: 'LASAA and APCON permits', rate: '₦40,000 – ₦250,000' },
    ],
  },
];

/**
 * Server-side total. Unknown keys are ignored rather than trusted, and an
 * unknown package returns null so the caller can reject the order outright.
 */
export function totalNgn(packageKey: string, addonKeys: string[] = []): number | null {
  const pkg = PACKAGE_BY_KEY[packageKey];
  if (!pkg) return null;
  return addonKeys.reduce((sum, k) => sum + (ADDON_BY_KEY[k]?.priceNgn ?? 0), pkg.priceNgn);
}

/* ── The brief ───────────────────────────────────────────────────────────
   A church job asks for different things than a birthday, so the form
   branches on project type. Common fields (name, email, delivery channel,
   deadline) are asked once by the form itself; only the type-specific
   questions live here.                                                     */

export interface BriefField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
}

export interface ProjectTypeDef {
  key: ProjectType;
  label: string;
  tagline: string;
  fields: BriefField[];
}

const MOOD_OPTIONS = ['Joyful / upbeat', 'Emotional / heartfelt', 'Calm / gentle', 'Bold / energetic', 'Premium / classy'];

export const PROJECT_TYPES: ProjectTypeDef[] = [
  {
    key: 'church',
    label: 'Church',
    tagline: 'Anniversaries, conventions, harvests, church programmes',
    fields: [
      { name: 'church_name', label: 'Church name', type: 'text', required: true, placeholder: 'e.g. Grace Assembly' },
      { name: 'programme', label: 'Programme or occasion', type: 'text', required: true, placeholder: 'e.g. 25th anniversary, annual convention' },
      { name: 'programme_date', label: 'Date of the programme', type: 'date' },
      { name: 'theme', label: 'Theme or scripture', type: 'text', placeholder: 'e.g. "Greater Heights" — Isaiah 60:1' },
      { name: 'style', label: 'Style of music', type: 'select', options: ['Gospel', 'Afro-gospel', 'Choir / hymnal', 'Worship', 'Praise / highlife', 'Not sure — you decide'] },
      { name: 'mentions', label: 'Names to mention', type: 'text', placeholder: 'e.g. Pastor & Mrs Adeyemi', hint: 'Anyone the song should name.' },
      { name: 'message', label: 'What should the song say?', type: 'textarea', required: true, placeholder: 'The message, the story, what this programme means to the church.' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    tagline: 'Jingles, adverts, websites — make your business impossible to miss',
    fields: [
      { name: 'business_name', label: 'Business name', type: 'text', required: true, placeholder: 'e.g. Mama Nkechi Foods' },
      { name: 'what_you_do', label: 'What does the business do or sell?', type: 'textarea', required: true, placeholder: 'Say it plainly — what you sell and who buys it.' },
      { name: 'location', label: 'Where are you based?', type: 'text', placeholder: 'e.g. Ikeja, Lagos', hint: 'Said in the advert, used for your Google listing, and it decides travel if we come to shoot.' },
      { name: 'website', label: 'Do you already have a website?', type: 'text', placeholder: 'Paste the link, or write “none”.', hint: 'If you have none, one is included in every business package.' },
      { name: 'socials', label: 'Instagram, Facebook or TikTok handles', type: 'text', placeholder: 'e.g. @mamankechifoods', hint: 'We set them up if you have none, and fix them properly if you do.' },
      { name: 'target_customer', label: 'Who is your customer?', type: 'text', placeholder: 'e.g. young families in Lagos' },
      { name: 'slogan', label: 'Slogan or tagline', type: 'text', placeholder: 'If you have one.' },
      { name: 'selling_points', label: 'What must the advert say?', type: 'textarea', required: true, placeholder: 'Your prices, your location, your phone number — the things a customer must hear.' },
      { name: 'mood', label: 'Tone', type: 'select', options: MOOD_OPTIONS },
    ],
  },
  {
    key: 'birthday',
    label: 'Birthday',
    tagline: 'A song made for one person, on their day',
    fields: [
      { name: 'celebrant', label: "Celebrant's name", type: 'text', required: true, placeholder: 'The name to sing.' },
      { name: 'age', label: 'Age they are turning', type: 'text', placeholder: 'Optional.' },
      { name: 'birthday_date', label: 'Birthday date', type: 'date' },
      { name: 'relationship', label: 'Who are they to you?', type: 'text', placeholder: 'e.g. my mother, my best friend' },
      { name: 'about_them', label: 'Tell us about them', type: 'textarea', required: true, placeholder: 'What they love, how they talk, what makes them laugh — the details make the song.' },
      { name: 'memories', label: 'A memory or message to include', type: 'textarea', placeholder: 'Something only the two of you would know.' },
      { name: 'style', label: 'Style of music', type: 'select', options: ['Afrobeats', 'R&B / soul', 'Hip hop', 'Highlife', 'Gospel', 'Not sure — you decide'] },
    ],
  },
  {
    key: 'event',
    label: 'Event or party',
    tagline: 'Weddings, funerals, parties, launches, conferences',
    fields: [
      { name: 'event_name', label: 'Event name', type: 'text', required: true, placeholder: 'e.g. Tunde & Ada’s wedding' },
      { name: 'event_kind', label: 'Type of event', type: 'select', required: true, options: ['Wedding', 'Funeral or memorial', 'Party', 'Naming ceremony', 'Product launch', 'Conference', 'Anniversary', 'Other'] },
      { name: 'event_date', label: 'Event date', type: 'date' },
      { name: 'venue', label: 'Venue or city', type: 'text', placeholder: 'e.g. Eko Hotel, Lagos' },
      { name: 'hosts', label: 'Host or celebrant names', type: 'text', placeholder: 'Who the day belongs to.' },
      { name: 'theme', label: 'Theme or colours', type: 'text', placeholder: 'Optional.' },
      { name: 'message', label: 'What should the song capture?', type: 'textarea', required: true, placeholder: 'The vibe, the story, anyone to shout out.' },
      { name: 'mood', label: 'Vibe', type: 'select', options: MOOD_OPTIONS },
    ],
  },
  {
    key: 'political',
    label: 'Campaign',
    tagline: 'Jingles and adverts for the 2027 elections',
    fields: [
      { name: 'candidate', label: 'Candidate name', type: 'text', required: true, placeholder: 'The name to be sung and remembered.' },
      { name: 'office', label: 'Office being contested', type: 'select', required: true, options: ['President', 'Governor', 'Senate', 'House of Representatives', 'State Assembly', 'Local Government', 'Other'] },
      { name: 'constituency', label: 'State or constituency', type: 'text', required: true, placeholder: 'e.g. Surulere Federal Constituency, Lagos' },
      { name: 'party', label: 'Party', type: 'text', placeholder: 'Party name or initials.' },
      { name: 'languages', label: 'Languages needed', type: 'text', placeholder: 'e.g. English, Pidgin, Yoruba', hint: 'A separate version is produced for each language.' },
      { name: 'slogan', label: 'Campaign slogan', type: 'text', placeholder: 'If you have one.' },
      { name: 'message', label: 'What must the campaign say?', type: 'textarea', required: true, placeholder: 'The promises, the record, the reason to vote — the things every voter must hear.' },
      { name: 'poll_date', label: 'Election date', type: 'date' },
      { name: 'mood', label: 'Tone', type: 'select', options: ['Hopeful / uplifting', 'Strong / commanding', 'Grassroots / street', 'Calm / statesmanlike'] },
    ],
  },
];

export const PROJECT_TYPE_BY_KEY: Record<string, ProjectTypeDef> = Object.fromEntries(
  PROJECT_TYPES.map((p) => [p.key, p]),
);

/** How the finished work gets to the client. */
export const DELIVERY_CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'e.g. 0801 234 5678' },
  { key: 'telegram', label: 'Telegram', placeholder: '@username or phone number' },
  { key: 'email',    label: 'Email',    placeholder: 'you@example.com' },
] as const;

export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number]['key'];

/** Where we can reach us — mirrored on the site and used for delivery. */
export const CONTACT_LINKS = {
  whatsapp: process.env.NEXT_PUBLIC_STUDIO_WHATSAPP ?? '',
  telegram: process.env.NEXT_PUBLIC_STUDIO_TELEGRAM ?? '',
  email: 'studio@highzcore.tech',
};

/**
 * Where links from the main site should send people. Studio lives on its own
 * subdomain in production; locally there is no subdomain, so we stay on the
 * /studio path. Override with NEXT_PUBLIC_STUDIO_URL if the host ever changes.
 */
export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL
  ?? (process.env.NODE_ENV === 'development' ? '/studio' : 'https://studio.highzcore.tech');
