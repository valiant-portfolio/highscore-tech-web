// Occasion landing pages — where SEO and selling overlap.
//
// Someone searching "custom birthday song" and someone searching "business
// jingle Nigeria" want different pages, so each occasion gets its own: its own
// title, its own words, its own FAQs, and an order link that pre-picks the
// right project type so the brief asks the right questions immediately.

import type { ProjectType } from '@/lib/studio/catalog';

export interface Occasion {
  slug: string;
  /** Used in nav and cards. */
  name: string;
  /** The <h1>. Carries the search phrase. */
  heading: string;
  title: string;
  description: string;
  /** Opening paragraph. */
  intro: string;
  /** Pre-selects the branch of the order brief. */
  projectType: ProjectType;
  /** Package keys to surface, best-first. */
  packages: string[];
  /** What they get, in their words. */
  gets: string[];
  faqs: { q: string; a: string }[];
}

export const OCCASIONS: Occasion[] = [
  {
    slug: 'birthday-song',
    name: 'Birthdays',
    heading: 'Custom birthday songs, made for one person',
    title: 'Custom birthday song — written and produced for them',
    description:
      'Order a custom birthday song with their name in it, from ₦45,000. Written, sung and produced by Highscore Studio, delivered to WhatsApp, Telegram or email in days.',
    intro:
      'A birthday message they will replay for years. We write the song around the person — their name, what they love, the way you talk about them — and produce it properly so it sounds like something off the radio.',
    projectType: 'birthday',
    packages: ['short_song', 'occasion_song', 'occasion_film'],
    gets: [
      'Their name sung in the song',
      'Written from the details you give us — inside jokes, memories, the lot',
      'Clean, studio-quality audio you can play anywhere',
      'Optional video — AI-made, or edited from your own photos',
    ],
    faqs: [
      { q: 'How fast can I get a birthday song?', a: 'A song on its own is usually ready in about three days. If the birthday is sooner than that, message us before you order and we will tell you honestly whether we can make it.' },
      { q: 'Can you put their name in it?', a: 'Yes — that is the whole point. The name goes in the lyrics, and so does anything else you tell us about them.' },
      { q: 'What do you need from me?', a: 'Their name, your relationship to them, and a few honest details: what they love, how they talk, a memory worth singing about. The more specific you are, the better the song.' },
      { q: 'What style of music can I choose?', a: 'Afrobeats, R&B, hip hop, highlife, gospel — or tell us to pick, and we will choose what suits the person.' },
    ],
  },
  {
    slug: 'wedding-song',
    name: 'Weddings',
    heading: 'A custom wedding song written for the two of you',
    title: 'Custom wedding song — written for your day',
    description:
      'A custom song for your wedding: your story, your names, your first dance. Produced by Highscore Studio, with the video filmed, AI-made or cut from your own photos.',
    intro:
      'Your first dance should not be somebody else’s love song. We write one about you — how you met, what you call each other, the bit of the story only your friends know — and produce it ready for the day.',
    projectType: 'event',
    packages: ['occasion_song', 'occasion_film', 'short_song'],
    gets: [
      'A song about your actual story, not a template',
      'Ready for the first dance, the entrance or the montage',
      'Video from your own photos, made with AI, or filmed by us',
      'Delivery locked to your wedding date',
    ],
    faqs: [
      { q: 'How far ahead should I order a wedding song?', a: 'Give us at least two weeks so there is room for a revision and nothing is rushed. Tell us the date when you order and we lock delivery to it.' },
      { q: 'Can we hear it before the day?', a: 'Yes. You get the finished song well before the wedding, and we would rather fix something early than have you hear it for the first time on the day.' },
      { q: 'Can you make a video too?', a: 'Yes — from your own photos and clips, generated with AI, or filmed by us on the day. Pick whichever suits at the order form.' },
    ],
  },
  {
    slug: 'church-song',
    name: 'Churches',
    heading: 'Songs and jingles for churches and church programmes',
    title: 'Custom church song — anniversaries, conventions and programmes',
    description:
      'Custom songs for church anniversaries, conventions, harvests and programmes, from ₦45,000. Themed around your scripture and produced for the service.',
    intro:
      'For the anniversary, the convention, the harvest — a song written around your theme and your scripture, that the congregation can actually sing along to. We produce it for the room it will be played in.',
    projectType: 'church',
    packages: ['short_song', 'occasion_song', 'occasion_film'],
    gets: [
      'Written around your theme or scripture',
      'Gospel, afro-gospel, worship, choir or praise — your call',
      'Names mentioned where you want them',
      'Optional video for the screens and for social',
    ],
    faqs: [
      { q: 'Can the song mention our church and pastor by name?', a: 'Yes. Tell us the names you want sung and we work them into the lyrics naturally.' },
      { q: 'Can you match our programme theme?', a: 'That is how we prefer to write it. Give us the theme and the scripture and the song is built around them.' },
      { q: 'Can we use it for our announcements and social media?', a: 'Yes, it is yours to use. Add a video and you have something for the screens and the church pages too.' },
    ],
  },
  {
    slug: 'business-jingle',
    name: 'Businesses',
    heading: 'Custom jingles that make your business impossible to ignore',
    title: 'Business jingle — custom advert songs for your brand',
    description:
      'Custom jingles and advert songs for businesses, from ₦180,000 — with a website on your own domain, your Google listing and your profiles set up properly, all included. Full commercial rights, radio-ready and TV-ready.',
    intro:
      'The jingle people hum back at you in the market. We write it around what you actually sell, what you charge and why you are better — then produce it for wherever it needs to run: social, radio, live TV, or a billboard.',
    projectType: 'business',
    packages: ['business_starter', 'business_brand_pack', 'business_launch'],
    gets: [
      'A jingle written around your offer, not a generic tune',
      'Your prices, location and phone number said clearly',
      'A website on your own domain, your Google listing and your profiles, all included',
      'Cut for social, with radio, live TV and billboards booked at the station’s own rate',
    ],
    faqs: [
      { q: 'Can I use the jingle on radio or TV?', a: 'Yes. Add media planning and booking (₦120,000) at the order form and we write the campaign plan, negotiate the rate, book the slots and confirm every spot ran. The airtime itself is billed at the station’s own rate plus 15% for the booking — a 60-second radio spot runs from ₦20,000 on a state station to ₦85,000 on Cool FM, and we publish the real rates on our pricing page.' },
      { q: 'Do you make the video as well?', a: 'Yes, three ways: we edit footage you send us, we generate the video with AI, or we come to your place and film it. Pick whichever suits at the order form.' },
      { q: 'Can you keep making content every month?', a: 'Yes. The Brand Pack, The Launch and The Full Campaign each include a set number of months of posting and Google work, and continue at a monthly price printed on the package — ₦250,000, ₦350,000 or ₦750,000 a month. Stop any time: the website, the domain, the jingle and the profiles stay yours.' },
    ],
  },
  {
    slug: 'party-song',
    name: 'Parties & events',
    heading: 'Songs for parties, clubs and events',
    title: 'Custom party song — for parties, clubs and events',
    description:
      'Custom songs and hype tracks for parties, club nights, launches and events, from ₦45,000. Produced by Highscore Studio and delivered before your date.',
    intro:
      'A track made for your night — the name of the event, the host, the crowd it is for. Something to open with, to hype the room, or to post in the run-up so people actually turn up.',
    projectType: 'event',
    packages: ['short_song', 'occasion_song', 'occasion_film'],
    gets: [
      'A track built around your event and its name',
      'Shout-outs for hosts, sponsors or the guest list',
      'Short cuts for the run-up posts',
      'Delivered before the date, not on it',
    ],
    faqs: [
      { q: 'Can you shout out our sponsors?', a: 'Yes. Tell us who needs naming and where, and we work them in.' },
      { q: 'Can I get short clips for promotion?', a: 'Yes — any package with video is cut for every platform, which is what you want in the week before an event.' },
    ],
  },
];

export const OCCASION_BY_SLUG: Record<string, Occasion> = Object.fromEntries(
  OCCASIONS.map((o) => [o.slug, o]),
);
