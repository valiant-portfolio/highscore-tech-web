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

  {
    slug: 'funeral-song',
    name: 'Funerals & memorials',
    heading: 'A tribute song for someone you have lost',
    title: 'Funeral & memorial tribute song — written for their life',
    description:
      'A custom tribute song for a funeral, burial or memorial in Nigeria, from ₦45,000. Their name, their life, their voice remembered — with a film cut from your own photographs.',
    intro:
      'A burial programme ends. The canopy comes down, the guests travel home, and what is left is photographs. We write a song about the person — what they did, how they spoke, what they were to everybody who came — and produce it properly, so there is something the family can still play in ten years.',
    projectType: 'event',
    packages: ['occasion_song', 'occasion_film', 'short_song'],
    gets: [
      'Their name and their story in the words, not a general hymn',
      'A film cut from your own photographs of them',
      'Something to play at the service, the reception and the wake-keep',
      'Guest tributes collected and included, on The Full Story',
    ],
    faqs: [
      { q: 'How quickly can you make a funeral song?', a: 'A short tribute song is usually ready in about three days, a full song in five. Nigerian burials are often planned weeks ahead, but if yours is sooner, message us before ordering and we will tell you honestly whether we can meet the date.' },
      { q: 'Can you use our own photographs?', a: 'Yes. The Full Story cuts a film from the photographs and clips the family already has — which for most families is the only footage that exists.' },
      { q: 'Can it be a gospel or hymn style?', a: 'Yes. Gospel, worship, choir and hymnal are all styles we write in, and for most Nigerian burials that is what is wanted. Tell us the church and the tradition and we write to it.' },
      { q: 'Can family members abroad contribute?', a: 'Yes. On The Full Story we collect voice or video messages from guests and family wherever they are, and work them into the film.' },
    ],
  },
  {
    slug: 'anniversary-song',
    name: 'Anniversaries',
    heading: 'A song for your anniversary, about the years you have had',
    title: 'Custom anniversary song — written about your marriage',
    description:
      'A custom wedding anniversary song from ₦45,000 — written from your own story, sung by a real vocalist and produced by Highscore Studio in Lagos.',
    intro:
      'Ten years, twenty-five, fifty. The photographs from the wedding are already framed. What nobody has is a song about what happened after it — the house, the children, the years that were hard and the ones that were not.',
    projectType: 'event',
    packages: ['occasion_song', 'short_song', 'occasion_film'],
    gets: [
      'Written from your actual years together, not a template love song',
      'Both names sung, and the date',
      'A film cut from the wedding photographs and everything since',
      'Ready to play at the party, or sent privately as a surprise',
    ],
    faqs: [
      { q: 'Can I keep it a surprise?', a: 'Yes, and most people do. We deliver to a private link only you can open, so nothing reaches them until you play it.' },
      { q: 'Can you include our children?', a: 'Yes — names, ages, the things they say. Those details are usually what makes the room go quiet.' },
      { q: 'What if we do not have many photographs?', a: 'Then take the song on its own, or add a video generated from a handful of images. We work with what exists.' },
    ],
  },
  {
    slug: 'naming-ceremony-song',
    name: 'Naming ceremonies',
    heading: 'A song for the naming ceremony, with the baby’s name in it',
    title: 'Naming ceremony song — with the baby’s name sung',
    description:
      'A custom naming ceremony song from ₦45,000, with the baby’s name sung and the family named. Produced by Highscore Studio in Lagos and delivered before the day.',
    intro:
      'Eight days after a birth, the whole family gathers and the name is finally said out loud. We write a song around that name — what it means, who chose it, the family it comes from — and have it ready to play the morning of the ceremony.',
    projectType: 'event',
    packages: ['short_song', 'occasion_song', 'occasion_film'],
    gets: [
      'The baby’s name sung, and what the name means',
      'Both families named — grandparents included',
      'Ready before the eighth day, not on it',
      'A keepsake card with a QR code, so guests can play it later',
    ],
    faqs: [
      { q: 'The ceremony is in eight days. Can you make it?', a: 'Usually yes — a short song takes about three days. Message us before you order and we will confirm the date honestly rather than take the money and rush it.' },
      { q: 'Can the song say what the name means?', a: 'Yes, and it is the best part of these songs. Tell us the meaning and who chose it, in whatever language, and we write it in.' },
      { q: 'Can you sing in Yoruba, Igbo or Hausa?', a: 'We can carry names, phrases and blessings in your language inside the song. Tell us exactly what should be said and how it is pronounced.' },
    ],
  },
  {
    slug: 'campaign-jingle',
    name: 'Political campaigns',
    heading: 'Campaign jingles and adverts for the 2027 elections',
    title: 'Campaign jingle Nigeria — political adverts for 2027',
    description:
      'Campaign jingles, adverts and full media campaigns for Nigerian elections, from ₦250,000. Rally-ready audio, films cut for every screen, up to four languages, and media booked at the station’s own rate.',
    intro:
      'The jingle is the part of a campaign people repeat without being asked. We write it around the name, the office and the promise, produce it in the languages the constituency actually speaks, and cut it for the rally speakers, the radio, the television and the phone.',
    projectType: 'political',
    packages: ['campaign_jingle', 'campaign_pack', 'campaign_full'],
    gets: [
      'A jingle built to be chanted back, not just heard',
      'Up to four languages, so the whole constituency hears it',
      'Rally-ready audio that survives an outdoor PA',
      'Media planned and booked, with every spot confirmed as run',
    ],
    faqs: [
      { q: 'How fast can a campaign jingle be produced?', a: 'The jingle on its own takes about five days. The full pack takes fourteen, and a whole managed campaign thirty. In an election season, book earlier than you think you need to.' },
      { q: 'Can you handle radio and television placement?', a: 'Yes. We plan the campaign, cost it before anything is booked, negotiate the rate, book the slots and confirm each one ran. Airtime is billed at the station’s own rate plus 15% for the booking — we publish the real station rates on our pricing page rather than burying them in a package.' },
      { q: 'Can it be recorded in more than one language?', a: 'Yes — two languages on the Campaign Jingle, up to four on the Campaign Pack. That is usually what decides whether a constituency hears you or hears past you.' },
      { q: 'Do you film rallies?', a: 'On the Full Campaign, yes: rallies, walkabouts and the constituency itself, with fresh content cut through the campaign rather than one advert reused until polling day.' },
    ],
  },
  {
    slug: 'graduation-song',
    name: 'Graduations',
    heading: 'A song for their graduation, about the years it took',
    title: 'Custom graduation song — a gift they will keep',
    description:
      'A custom graduation song from ₦45,000 — their name, their course, the years it took. Written and produced by Highscore Studio in Lagos, delivered in about three days.',
    intro:
      'Everybody sends a photograph and a caption. A song is the one gift nobody else in the family thought of — their name, the school, the course, and what it actually cost them to finish it.',
    projectType: 'birthday',
    packages: ['short_song', 'occasion_song', 'occasion_film'],
    gets: [
      'Their name, their school and their course in the words',
      'The story behind the degree, not just congratulations',
      'A video with the words on screen, ready to post',
      'Delivered in about three days',
    ],
    faqs: [
      { q: 'Can I get it before the ceremony?', a: 'Yes — a short song takes about three days. Order the week before and it is ready to play on the day.' },
      { q: 'Can you mention the university?', a: 'Yes. The school, the course, the year, the people who paid the fees — whatever you want said.' },
      { q: 'Can I post it on Instagram?', a: 'Yes, it is yours. Every package with video is cut for social, so it fits the feed without you having to crop it.' },
    ],
  },
];

export const OCCASION_BY_SLUG: Record<string, Occasion> = Object.fromEntries(
  OCCASIONS.map((o) => [o.slug, o]),
);
