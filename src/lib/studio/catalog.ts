// Highscore Studio — the product catalogue and the order-brief questions.
//
// One source of truth, shared by the public pricing page, the order form, and
// the server action that prices an order. NEVER trust a price sent from the
// browser: the client posts a `packageKey`, and the server looks the amount up
// here (see priceOf()).
//
// Money is held in whole USD. We sell worldwide, so USD is the display and
// charge currency; Nigerian cards settle through ALAT/Wema at checkout.

export type ProjectType = 'church' | 'business' | 'birthday' | 'event';

export interface StudioPackage {
  key: string;
  name: string;
  /** Whole US dollars. `null` = quoted per campaign, not self-serve. */
  priceUsd: number | null;
  /** Shown under the price on the card. */
  blurb: string;
  /** Itemised deliverables — what the client actually gets. */
  includes: string[];
  /** Grouping on the pricing page. */
  group: 'start' | 'ladder' | 'reach';
  /** Recurring monthly rather than one-off. */
  monthly?: boolean;
  /** Price is a floor ("from $199"), the rest scoped per job. */
  from?: boolean;
  /** Highlighted as the popular pick. */
  featured?: boolean;
}

export const PACKAGES: StudioPackage[] = [
  {
    key: 'starter_song',
    name: 'Starter Song',
    priceUsd: 8,
    group: 'start',
    blurb: 'The entry point. Fast, and yours to use anywhere.',
    includes: [
      'One custom song written about you, your business or your occasion',
      'Clean, studio-quality audio',
      'Fast turnaround',
    ],
  },
  {
    key: 'song_video',
    name: 'Song + Video',
    priceUsd: 15,
    group: 'start',
    featured: true,
    blurb: 'The everyday offer — a song and a video to go with it.',
    includes: [
      'Everything in Starter Song',
      'One branded video (AI or live footage)',
      'Ready for WhatsApp status, Instagram, TikTok — anywhere',
    ],
  },
  {
    key: 'social_pack',
    name: 'Social Starter Pack',
    priceUsd: 49,
    group: 'ladder',
    blurb: 'Enough content to actually run a week of posting.',
    includes: [
      'Everything in Song + Video',
      '2–3 videos from one concept',
      'Cut for every platform — vertical, square and wide',
      'Ready-to-post captions',
    ],
  },
  {
    key: 'event_package',
    name: 'Event Package',
    priceUsd: 99,
    group: 'ladder',
    blurb: 'For weddings, church programmes, birthdays and launches.',
    includes: [
      'Custom themed song for the day',
      'Multiple videos plus a highlight edit',
      'Social cut-downs from across the event',
      'Priority delivery locked to your date',
    ],
  },
  {
    key: 'business_promo',
    name: 'Business Promo',
    priceUsd: 299,
    group: 'ladder',
    blurb: 'The full promotional kit for a business that wants to be seen.',
    includes: [
      'Full custom jingle',
      'Professional promo video (live or AI)',
      'Your photos turned into moving video',
      'Platform-ready edits plus a broadcast-ready cut for TV or radio',
    ],
  },
  {
    key: 'radio_campaign',
    name: 'Radio Campaign',
    priceUsd: 199,
    from: true,
    group: 'reach',
    blurb: 'Built for air — the jingle people hum back to you.',
    includes: [
      'Jingle written and mixed for radio',
      '15s / 30s / 60s spots',
      'Broadcast-format delivery and station guidance',
    ],
  },
  {
    key: 'tv_campaign',
    name: 'TV Campaign',
    priceUsd: 499,
    from: true,
    group: 'reach',
    blurb: 'A commercial your customers see on live television.',
    includes: [
      'TV commercial produced (live footage or AI)',
      'Broadcast-format masters for any station',
      'Live TV station promotion arranged',
    ],
  },
  {
    key: 'outdoor_branding',
    name: 'Outdoor Branding',
    priceUsd: 149,
    from: true,
    group: 'reach',
    blurb: 'Billboards, banners and signage that match the campaign.',
    includes: [
      'Billboard, banner and street-signage creative',
      'Vehicle and shop-front branding',
      'Print-ready artwork at any size',
    ],
  },
  {
    key: 'google_ranking',
    name: 'Google Ranking (SEO)',
    priceUsd: 199,
    from: true,
    monthly: true,
    group: 'reach',
    blurb: 'Get found when your customers search.',
    includes: [
      'Get your website or brand ranking on Google',
      'On-page fixes, content and keyword targeting',
      'Monthly ranking report',
    ],
  },
  {
    key: 'ads_management',
    name: 'Ads Management',
    priceUsd: 149,
    from: true,
    monthly: true,
    group: 'reach',
    blurb: 'We run the ads. You take the calls.',
    includes: [
      'We run your paid ads — Google, Meta and TikTok',
      'Creatives built from your song and video',
      'Targeting, tracking and optimisation',
    ],
  },
  {
    key: 'brand_engine',
    name: 'Brand Engine',
    priceUsd: 300,
    from: true,
    monthly: true,
    group: 'reach',
    blurb: 'Always-on. We keep you on people’s screens, month after month.',
    includes: [
      'A set number of videos every month',
      'Ongoing jingles and seasonal campaigns',
      'Everything above bundled together',
      'Priority turnaround',
    ],
  },
];

export const PACKAGE_BY_KEY: Record<string, StudioPackage> = Object.fromEntries(
  PACKAGES.map((p) => [p.key, p]),
);

/** Server-side price lookup. Returns null for an unknown key — never guess. */
export function priceOf(packageKey: string): number | null {
  return PACKAGE_BY_KEY[packageKey]?.priceUsd ?? null;
}

/* ── The brief ───────────────────────────────────────────────────────────
   A church job asks for different things than a birthday, so the form
   branches on project type. Common fields (name, email, country, delivery
   channel, deadline) are asked once by the form itself; only the
   type-specific questions live here.                                      */

export interface BriefField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  /** Helper text under the input. */
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
      { name: 'target_customer', label: 'Who is your customer?', type: 'text', placeholder: 'e.g. young families in Lagos' },
      { name: 'slogan', label: 'Slogan or tagline', type: 'text', placeholder: 'If you have one.' },
      { name: 'selling_points', label: 'What must the advert say?', type: 'textarea', required: true, placeholder: 'Your prices, your location, what makes you better — the things a customer must hear.' },
      { name: 'where_it_runs', label: 'Where will it run?', type: 'select', options: ['Social media', 'Radio', 'TV', 'Billboard / outdoor', 'Everywhere'] },
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
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'WhatsApp number, with country code' },
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
