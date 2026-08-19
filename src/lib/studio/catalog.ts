// Highscore Studio — the product catalogue and the order-brief questions.
//
// One source of truth, shared by the public pricing page, the order form, and
// the server action that prices an order. NEVER trust a price sent from the
// browser: the client posts a `packageKey` plus add-on keys, and the server
// totals it up from here (see totalNgn()).
//
// We sell to the Nigerian market, so everything is priced and charged in Naira
// and settled through ALAT by Wema. Amounts are whole Naira as integers.
//
// Personal and business work are priced separately on purpose. They are not the
// same song with a different number on it: a business package carries
// commercial usage rights, scripting written around the client's offer and
// prices, and broadcast-ready masters. Someone buying a birthday song for their
// mother is spending fun money; a business running a jingle on radio is about
// to spend far more than our fee on airtime alone.

export type ProjectType = 'church' | 'business' | 'birthday' | 'event';

/** ₦1,234,567 — used everywhere a price is shown. */
export function formatNgn(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

export interface StudioPackage {
  key: string;
  name: string;
  /** Whole Naira. */
  priceNgn: number;
  /** Shown under the price on the card. */
  blurb: string;
  /** Itemised deliverables — what the client actually gets. */
  includes: string[];
  group: 'personal' | 'business' | 'brand';
  /** Recurring monthly rather than one-off. */
  monthly?: boolean;
  /** Price is a floor; the rest is scoped per job. */
  from?: boolean;
  /** Highlighted as the popular pick within its group. */
  featured?: boolean;
  /** Extra condition the customer should know before ordering. */
  note?: string;
}

export const PACKAGES: StudioPackage[] = [
  /* ── Personal & occasions ─────────────────────────────────────────────
     Birthdays, weddings, anniversaries, church programmes. Kept genuinely
     affordable — this is the door into the studio.                        */
  {
    key: 'personal_song',
    name: 'Personal song',
    priceNgn: 25_000,
    group: 'personal',
    blurb: 'A song written about one person or one occasion.',
    includes: [
      'A custom song written around the person or the day',
      'Their name and your details in the lyrics',
      'Clean, studio-quality audio',
      'Yours to play, post and keep',
    ],
  },
  {
    key: 'personal_video_edit',
    name: 'Song + your photos & clips',
    priceNgn: 45_000,
    group: 'personal',
    blurb: 'You send the photos and videos, we cut them to the song.',
    includes: [
      'Everything in Personal song',
      'You send your own photos and clips',
      'We edit them into a finished video around the song',
      'Cut for WhatsApp status, Instagram and TikTok',
    ],
  },
  {
    key: 'personal_ai_video',
    name: 'Song + AI video',
    priceNgn: 60_000,
    group: 'personal',
    featured: true,
    blurb: 'No footage needed — we generate the whole video with AI.',
    includes: [
      'Everything in Personal song',
      'A full video created with AI',
      'Your photos turned into moving video',
      'Ready for every platform',
    ],
  },
  {
    key: 'event_package',
    name: 'Wedding & event package',
    priceNgn: 150_000,
    group: 'personal',
    blurb: 'For the day itself — song, multiple videos and the highlight cut.',
    includes: [
      'Custom song written around your story or your programme',
      'Multiple videos plus a highlight edit',
      'Social cut-downs for the run-up and the day after',
      'Delivery locked to your event date',
      'One round of revisions before the day',
    ],
  },

  /* ── Business & brands ────────────────────────────────────────────────
     Commercial work: usage rights, scripting around the offer, and masters
     built for where the advert will actually run.                         */
  {
    key: 'business_jingle',
    name: 'Business jingle',
    priceNgn: 120_000,
    group: 'business',
    blurb: 'The jingle people hum back at you in the market.',
    includes: [
      'Jingle written around what you sell, your prices and your location',
      'Scripted to say the things a customer must hear',
      'Full commercial usage rights — run it anywhere, forever',
      'Broadcast-quality master plus social cuts',
      'One round of revisions',
    ],
  },
  {
    key: 'business_video_edit',
    name: 'Jingle + your footage edited',
    priceNgn: 180_000,
    group: 'business',
    blurb: 'You send the footage, we build the advert around it.',
    includes: [
      'Everything in Business jingle',
      'We edit your own videos and photos into a finished advert',
      'Your prices, location and phone number on screen',
      'Cut for every platform',
    ],
  },
  {
    key: 'business_ai_video',
    name: 'Jingle + AI advert video',
    priceNgn: 220_000,
    group: 'business',
    featured: true,
    blurb: 'A full advert generated with AI — no shoot required.',
    includes: [
      'Everything in Business jingle',
      'A complete advert video created with AI',
      'Photos of your business turned into moving video',
      'Platform-ready cuts plus a broadcast-ready master',
    ],
  },
  {
    key: 'business_shoot',
    name: 'Jingle + we come and shoot',
    priceNgn: 350_000,
    group: 'business',
    blurb: 'We come to your place and film the real thing.',
    includes: [
      'Everything in Business jingle',
      'A filming day at your location with our crew',
      'Professionally filmed and edited advert',
      'Platform-ready cuts plus a broadcast-ready master',
      'Stills from the shoot you can keep using',
    ],
    note: 'Covers a filming day in Lagos. Outside Lagos we quote travel before we start.',
  },

  /* ── Ongoing ──────────────────────────────────────────────────────────
     Retainers. The part that makes a studio survivable month to month.    */
  {
    key: 'ads_management',
    name: 'Ads management',
    priceNgn: 200_000,
    from: true,
    monthly: true,
    group: 'brand',
    blurb: 'We run the ads. You take the calls.',
    includes: [
      'We run your paid ads — Google, Meta and TikTok',
      'Creatives built from your jingle and video',
      'Targeting, tracking and monthly optimisation',
      'A report showing what the spend actually returned',
    ],
    note: 'Ad spend is your budget and is paid to the platforms.',
  },
  {
    key: 'google_ranking',
    name: 'Google ranking (SEO)',
    priceNgn: 250_000,
    from: true,
    monthly: true,
    group: 'brand',
    blurb: 'Get found when your customers search.',
    includes: [
      'Get your website or brand ranking on Google',
      'On-page fixes, content and keyword targeting',
      'Google Business Profile set up and maintained',
      'Monthly ranking report',
    ],
  },
  {
    key: 'content_retainer',
    name: 'Content retainer',
    priceNgn: 350_000,
    from: true,
    monthly: true,
    group: 'brand',
    blurb: 'A steady stream of content, every month.',
    includes: [
      'A set number of videos every month',
      'Seasonal jingles and campaign refreshes',
      'Cut for every platform, posted on schedule',
      'Priority turnaround',
    ],
  },
  {
    key: 'brand_engine',
    name: 'Brand Engine',
    priceNgn: 750_000,
    from: true,
    monthly: true,
    group: 'brand',
    blurb: 'Everything, always on. We run your whole presence.',
    includes: [
      'Everything in the Content retainer',
      'Ads management and Google ranking included',
      'Outdoor branding artwork — billboards, banners, signage',
      'Broadcast campaigns planned across the year',
      'A dedicated line to us, first in the queue',
    ],
  },
];

export const PACKAGE_BY_KEY: Record<string, StudioPackage> = Object.fromEntries(
  PACKAGES.map((p) => [p.key, p]),
);

/* ── Add-ons ─────────────────────────────────────────────────────────────
   Bolted on top of any package: getting the finished piece onto air. Our fee
   covers producing the broadcast master and arranging the placement; the
   station's airtime is the client's budget and quoted per campaign.        */

export interface StudioAddon {
  key: string;
  name: string;
  priceNgn: number;
  blurb: string;
}

export const ADDONS: StudioAddon[] = [
  {
    key: 'radio',
    name: 'Radio',
    priceNgn: 120_000,
    blurb: 'Jingle mixed for air, 15s / 30s / 60s spots, and the station booked for you.',
  },
  {
    key: 'live_tv',
    name: 'Live TV',
    priceNgn: 250_000,
    blurb: 'Broadcast master produced to station spec and your advert placed on live television.',
  },
];

export const ADDON_BY_KEY: Record<string, StudioAddon> = Object.fromEntries(
  ADDONS.map((a) => [a.key, a]),
);

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
    tagline: 'Jingles, promos, adverts — make your business famous',
    fields: [
      { name: 'business_name', label: 'Business name', type: 'text', required: true, placeholder: 'e.g. Mama Nkechi Foods' },
      { name: 'what_you_do', label: 'What does the business do or sell?', type: 'textarea', required: true, placeholder: 'Say it plainly — what you sell and who buys it.' },
      { name: 'location', label: 'Where are you based?', type: 'text', placeholder: 'e.g. Ikeja, Lagos', hint: 'Said in the advert, and it decides travel if we come to shoot.' },
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
    tagline: 'Weddings, parties, clubs, launches, conferences',
    fields: [
      { name: 'event_name', label: 'Event name', type: 'text', required: true, placeholder: 'e.g. Tunde & Ada’s wedding' },
      { name: 'event_kind', label: 'Type of event', type: 'select', required: true, options: ['Wedding', 'Party', 'Club night', 'Product launch', 'Conference', 'Anniversary', 'Other'] },
      { name: 'event_date', label: 'Event date', type: 'date' },
      { name: 'venue', label: 'Venue or city', type: 'text', placeholder: 'e.g. Eko Hotel, Lagos' },
      { name: 'hosts', label: 'Host or celebrant names', type: 'text', placeholder: 'Who the day belongs to.' },
      { name: 'theme', label: 'Theme or colours', type: 'text', placeholder: 'Optional.' },
      { name: 'message', label: 'What should the song capture?', type: 'textarea', required: true, placeholder: 'The vibe, the story, anyone to shout out.' },
      { name: 'mood', label: 'Vibe', type: 'select', options: MOOD_OPTIONS },
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
