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
      'Order a custom birthday song with their name in it, from $8. Written, sung and produced by Highscore Studio, delivered to WhatsApp, Telegram or email in days.',
    intro:
      'A birthday message they will replay for years. We write the song around the person — their name, what they love, the way you talk about them — and produce it properly so it sounds like something off the radio.',
    projectType: 'birthday',
    packages: ['starter_song', 'song_video', 'social_pack'],
    gets: [
      'Their name sung in the song',
      'Written from the details you give us — inside jokes, memories, the lot',
      'Clean, studio-quality audio you can play anywhere',
      'Optional video to post or play at the party',
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
      'A custom song for your wedding: your story, your names, your first dance. Produced by Highscore Studio with optional video and social cut-downs.',
    intro:
      'Your first dance should not be somebody else’s love song. We write one about you — how you met, what you call each other, the bit of the story only your friends know — and produce it ready for the day.',
    projectType: 'event',
    packages: ['song_video', 'event_package', 'social_pack'],
    gets: [
      'A song about your actual story, not a template',
      'Ready for the first dance, the entrance or the montage',
      'Optional video and social cut-downs for the highlights',
      'Delivery locked to your wedding date',
    ],
    faqs: [
      { q: 'How far ahead should I order a wedding song?', a: 'Give us at least two weeks so there is room for a revision and nothing is rushed. Tell us the date when you order and we lock delivery to it.' },
      { q: 'Can we hear it before the day?', a: 'Yes. You get the finished song well before the wedding, and we would rather fix something early than have you hear it for the first time on the day.' },
      { q: 'Can you make a video too?', a: 'Yes — either from your photos, turned into moving video, or as a filmed piece. The Event Package covers a song plus multiple videos and a highlight edit.' },
    ],
  },
  {
    slug: 'church-song',
    name: 'Churches',
    heading: 'Songs and jingles for churches and church programmes',
    title: 'Custom church song — anniversaries, conventions and programmes',
    description:
      'Custom songs for church anniversaries, conventions, harvests and programmes. Themed around your scripture and produced for the service, from Highscore Studio.',
    intro:
      'For the anniversary, the convention, the harvest — a song written around your theme and your scripture, that the congregation can actually sing along to. We produce it for the room it will be played in.',
    projectType: 'church',
    packages: ['song_video', 'event_package', 'business_promo'],
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
      'Custom jingles and advert songs for businesses, from $8. Radio-ready, TV-ready and built for social, with promo video, outdoor branding and ads from Highscore Studio.',
    intro:
      'The jingle people hum back at you in the market. We write it around what you actually sell, what you charge and why you are better — then produce it for wherever it needs to run: social, radio, live TV, or a billboard.',
    projectType: 'business',
    packages: ['song_video', 'business_promo', 'radio_campaign'],
    gets: [
      'A jingle written around your offer, not a generic tune',
      'Your prices, location and phone number said clearly',
      'Cut for social, and in broadcast format for radio or TV',
      'Optional promo video, billboards, Google ranking and paid ads',
    ],
    faqs: [
      { q: 'Can I use the jingle on radio or TV?', a: 'Yes. We deliver broadcast-format masters and 15/30/60 second cuts. Airtime itself is paid to the station and quoted per campaign.' },
      { q: 'Do you make the video as well?', a: 'Yes — filmed, or made with AI from photos of your business. The Business Promo covers the jingle, the promo video and a broadcast-ready cut.' },
      { q: 'Can you keep making content every month?', a: 'That is the Brand Engine: a set number of videos each month, ongoing jingles and seasonal campaigns, so you stay on people’s screens instead of appearing once.' },
    ],
  },
  {
    slug: 'party-song',
    name: 'Parties & events',
    heading: 'Songs for parties, clubs and events',
    title: 'Custom party song — for parties, clubs and events',
    description:
      'Custom songs and hype tracks for parties, club nights, launches and events. Produced by Highscore Studio and delivered before your date.',
    intro:
      'A track made for your night — the name of the event, the host, the crowd it is for. Something to open with, to hype the room, or to post in the run-up so people actually turn up.',
    projectType: 'event',
    packages: ['song_video', 'social_pack', 'event_package'],
    gets: [
      'A track built around your event and its name',
      'Shout-outs for hosts, sponsors or the guest list',
      'Short cuts for the run-up posts',
      'Delivered before the date, not on it',
    ],
    faqs: [
      { q: 'Can you shout out our sponsors?', a: 'Yes. Tell us who needs naming and where, and we work them in.' },
      { q: 'Can I get short clips for promotion?', a: 'Yes — the Social Starter Pack gives you a few videos cut for every platform, which is what you want in the week before an event.' },
    ],
  },
];

export const OCCASION_BY_SLUG: Record<string, Occasion> = Object.fromEntries(
  OCCASIONS.map((o) => [o.slug, o]),
);
