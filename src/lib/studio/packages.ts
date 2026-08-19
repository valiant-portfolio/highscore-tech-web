// Full detail for every Studio package.
//
// Split out of catalog.ts because this is sales copy, not configuration, and it
// keeps growing — websites, Google ranking and more are coming, and each one
// needs to explain itself properly before anyone will pay for it.
//
// Every package answers the same four questions, in the order a customer asks
// them:
//   1. Is this for me?            → bestFor
//   2. What exactly do I get?     → deliverables (each with a real explanation)
//   3. How does it work?          → process
//   4. What is NOT included?      → notIncluded
//
// That last one matters more than it looks. Saying plainly what a price does
// not cover is what stops an argument three weeks later.

export interface Deliverable {
  /** Short label — this is what the compact cards show. */
  title: string;
  /** The explanation. Written for someone who has never bought this before. */
  detail: string;
}

export interface PackageDetail {
  /** One line: who should buy this. */
  bestFor: string;
  /** e.g. "3–5 working days from payment". */
  turnaround: string;
  deliverables: Deliverable[];
  /** How the job runs, start to finish. */
  process: string[];
  /** Said plainly, so nobody is surprised later. */
  notIncluded: string[];
}

export const PACKAGE_DETAIL: Record<string, PackageDetail> = {
  /* ── Personal & occasions ──────────────────────────────────────────── */

  personal_song: {
    bestFor: 'One person or one day — a birthday, an anniversary, a proposal, a thank-you.',
    turnaround: '3–5 working days from payment',
    deliverables: [
      {
        title: 'A song written from scratch about them',
        detail:
          'Not a template with a name dropped in. You tell us who they are — what they love, how they talk, the memory only you two share — and we write the lyrics around that. Their name is sung in it.',
      },
      {
        title: 'Sung and produced properly',
        detail:
          'Real vocals over a full arrangement in the style you pick — Afrobeats, R&B, highlife, gospel, whatever suits them. It should sound like something off the radio, not a voice note.',
      },
      {
        title: 'Clean audio file, yours to keep',
        detail:
          'You get a high-quality MP3 you can play at the party, post on WhatsApp status, or keep forever. No watermark, no expiry.',
      },
      {
        title: 'One round of changes',
        detail:
          'If a name is pronounced wrong or a line does not sit right, tell us and we fix it. One round is included.',
      },
    ],
    process: [
      'You fill the brief — who it is for and what makes them them.',
      'We write the lyrics and send them to you first, so nothing is a surprise.',
      'We record and produce the song.',
      'You get it on WhatsApp, Telegram or email, on or before the date we promised.',
    ],
    notIncluded: [
      'Video — add a package with video if you want one.',
      'Commercial use. This is for personal celebration, not for advertising a business.',
    ],
  },

  personal_video_edit: {
    bestFor: 'You already have photos and clips of the person or the day, and want them turned into something.',
    turnaround: '5–7 working days from payment',
    deliverables: [
      {
        title: 'Everything in the Personal song',
        detail: 'The full custom song, written, sung and produced, with one round of changes.',
      },
      {
        title: 'Your own photos and clips, edited into a video',
        detail:
          'Send us what you have — phone photos, old pictures, video from the day — and we cut them together in time with the song. Colour corrected so everything looks like it belongs.',
      },
      {
        title: 'Titles and names on screen',
        detail: 'Their name, the date, a message at the end — whatever you want the video to say.',
      },
      {
        title: 'Cut for every platform',
        detail:
          'You get the full video plus a vertical cut for WhatsApp status, Instagram and TikTok, so you are not cropping it yourself.',
      },
    ],
    process: [
      'You fill the brief and send your photos and clips (WhatsApp is fine).',
      'We write the lyrics and send them for approval.',
      'We produce the song, then edit your material to it.',
      'You get the song and every video cut, delivered your way.',
    ],
    notIncluded: [
      'Filming. This package edits footage you already have.',
      'Buying stock footage to fill gaps — if you are short of material, the AI video package is the better fit.',
    ],
  },

  personal_ai_video: {
    bestFor: 'You want a full video but have little or no footage to work with.',
    turnaround: '5–7 working days from payment',
    deliverables: [
      {
        title: 'Everything in the Personal song',
        detail: 'The full custom song, written, sung and produced, with one round of changes.',
      },
      {
        title: 'A complete video created with AI',
        detail:
          'We generate the visuals to match the song and the story — scenes, motion, mood. No shoot, no crew, no waiting for a free weekend.',
      },
      {
        title: 'Your photos brought to life',
        detail:
          'Send the pictures you do have and we turn them into moving video, so the person is genuinely in it rather than it being generic footage.',
      },
      {
        title: 'Cut for every platform',
        detail: 'Full video plus vertical cuts for status, Reels and TikTok.',
      },
    ],
    process: [
      'You fill the brief and send any photos you want included.',
      'We write the lyrics and send them for approval.',
      'We produce the song, then generate and edit the video to it.',
      'You get everything on your chosen channel.',
    ],
    notIncluded: [
      'Filming or a crew.',
      'Exact likeness guarantees — AI video is stylised by nature. If you need real footage of a real place, choose a filmed package.',
    ],
  },

  event_package: {
    bestFor: 'A wedding, a big birthday, a church programme or a launch — where the day itself needs content.',
    turnaround: '10–14 working days; we lock delivery to your event date',
    deliverables: [
      {
        title: 'A custom song for the day',
        detail:
          'Written around your story or your programme theme — your names, how you met, what the day is for. Ready for the first dance, the entrance or the opening.',
      },
      {
        title: 'Multiple videos, not one',
        detail:
          'A main video plus separate cuts you can use at different moments — the countdown post, the entrance, the thank-you afterwards.',
      },
      {
        title: 'A highlight edit',
        detail: 'A short, punchy version built to be shared, which is the one people actually forward.',
      },
      {
        title: 'Social cut-downs for the run-up and the day after',
        detail:
          'Short vertical clips for the weeks before, so people are talking about it before it happens, and for the day after while it is still fresh.',
      },
      {
        title: 'Delivery locked to your date',
        detail:
          'We work backwards from the event, not forwards from the order. You have it in hand before the day, with time to say if something is wrong.',
      },
      {
        title: 'One round of changes before the day',
        detail: 'Names, pronunciation, running order — corrected before it matters.',
      },
    ],
    process: [
      'You fill the brief with the date, the names and what the day is about.',
      'We agree a schedule working backwards from your event.',
      'Lyrics to you for approval, then the song, then the videos.',
      'Everything delivered with room to spare before the day.',
    ],
    notIncluded: [
      'Filming on the day itself — that is quoted separately.',
      'Printing, venue or event management.',
    ],
  },

  /* ── Business & brands ─────────────────────────────────────────────── */

  business_jingle: {
    bestFor: 'A business that wants to be remembered — and wants the advert to actually say what it sells.',
    turnaround: '5–7 working days from payment',
    deliverables: [
      {
        title: 'A jingle written around your offer',
        detail:
          'We write it about what you actually sell, what you charge and where you are. The point is not a nice tune — it is a nice tune that makes someone call you.',
      },
      {
        title: 'Scripted to say what a customer must hear',
        detail:
          'Your prices, your location, your phone number, your one reason to choose you. Written so it lands in the first few seconds, because that is all you get.',
      },
      {
        title: 'Full commercial usage rights',
        detail:
          'Run it anywhere, for as long as you like — radio, TV, social, in your shop, on hold on your phone line. It is yours. No licence renewals, no per-play fees back to us.',
      },
      {
        title: 'Broadcast-quality master',
        detail:
          'Mixed and levelled to the standard stations actually accept, so you are not rejected when you take it to radio.',
      },
      {
        title: 'Social cuts included',
        detail: 'Shorter versions for WhatsApp status, Instagram and TikTok, from the same recording.',
      },
      {
        title: 'One round of changes',
        detail: 'Get a price wrong or change your number? One round of corrections is included.',
      },
    ],
    process: [
      'You fill the brief — what you sell, your prices, your location, your customer.',
      'We write the script and lyrics and send them for approval before recording.',
      'We record, produce and master it.',
      'You get the master plus every cut, delivered your way.',
    ],
    notIncluded: [
      'Video — add a video package if you want one.',
      'Radio or TV airtime — add those below and we produce and place it; the station’s airtime is your budget.',
    ],
  },

  business_video_edit: {
    bestFor: 'You already have footage of your business — the shop, the product, the team — and want a real advert from it.',
    turnaround: '7–10 working days from payment',
    deliverables: [
      {
        title: 'Everything in the Business jingle',
        detail: 'The full jingle, scripted around your offer, with commercial rights and a broadcast master.',
      },
      {
        title: 'Your footage cut into a finished advert',
        detail:
          'Send what you have — phone video of the shop, product photos, pictures of the team — and we build the advert around it, cut in time with the jingle and colour corrected so it looks deliberate.',
      },
      {
        title: 'Your details on screen',
        detail:
          'Prices, address, phone number, social handles — on screen at the moment they matter, so someone can act without replaying it.',
      },
      {
        title: 'Cut for every platform',
        detail:
          'Wide for TV and Facebook, square for feeds, vertical for status, Reels and TikTok. One shoot, every format.',
      },
    ],
    process: [
      'You fill the brief and send your footage and photos.',
      'We script the jingle and send it for approval.',
      'We produce the jingle, then edit your material into the advert.',
      'You get the jingle, the full advert and every cut.',
    ],
    notIncluded: [
      'Filming — this package edits material you already have.',
      'Airtime for radio or TV.',
    ],
  },

  business_ai_video: {
    bestFor: 'A business that wants a proper advert without stopping trading for a shoot.',
    turnaround: '7–10 working days from payment',
    deliverables: [
      {
        title: 'Everything in the Business jingle',
        detail: 'The full jingle, scripted around your offer, with commercial rights and a broadcast master.',
      },
      {
        title: 'A complete advert video generated with AI',
        detail:
          'We build the visuals to match your script — the scenes, the product moments, the pace. No shoot day, no closing the shop, no crew fee.',
      },
      {
        title: 'Your business in it, not stock footage',
        detail:
          'Send photos of your shop, your products, your team, and we turn them into moving video, so customers recognise the actual place.',
      },
      {
        title: 'Broadcast-ready master plus platform cuts',
        detail:
          'A TV-spec version alongside wide, square and vertical cuts for everywhere else.',
      },
    ],
    process: [
      'You fill the brief and send any photos of the business.',
      'We script the jingle and advert and send them for approval.',
      'We produce the jingle, then generate and edit the video to it.',
      'You get the master and every cut.',
    ],
    notIncluded: [
      'Filming or a crew.',
      'Airtime for radio or TV.',
    ],
  },

  business_shoot: {
    bestFor: 'A business where the real place, the real product and the real people are the selling point.',
    turnaround: '10–14 working days, including the shoot day',
    deliverables: [
      {
        title: 'Everything in the Business jingle',
        detail: 'The full jingle, scripted around your offer, with commercial rights and a broadcast master.',
      },
      {
        title: 'A filming day at your location',
        detail:
          'We come to you with our crew and equipment and shoot for the day — the premises, the product, the process, your team at work.',
      },
      {
        title: 'A professionally filmed and edited advert',
        detail:
          'Properly lit and framed, cut to the jingle, graded so your business looks its best. This is the version that makes a customer trust you before they arrive.',
      },
      {
        title: 'Stills you can keep using',
        detail:
          'Photographs from the same day, edited and handed over — for your social pages, your Google listing, your flyers, your website.',
      },
      {
        title: 'Broadcast-ready master plus platform cuts',
        detail: 'TV-spec master, plus wide, square and vertical versions.',
      },
    ],
    process: [
      'You fill the brief and we agree a shoot date.',
      'We script the jingle and the advert and send them for approval.',
      'We come and film — usually half to a full day, depending on the location.',
      'We produce, edit and grade, then deliver everything.',
    ],
    notIncluded: [
      'Travel outside Lagos — quoted before we start, never added afterwards.',
      'Paid actors, models or a venue we have to rent.',
      'Airtime for radio or TV.',
    ],
  },

  /* ── Ongoing ───────────────────────────────────────────────────────── */

  ads_management: {
    bestFor: 'You have something worth advertising and want someone to actually run the ads properly.',
    turnaround: 'Live within 5 working days of your first payment',
    deliverables: [
      {
        title: 'We run your ads across Google, Meta and TikTok',
        detail:
          'Account set up correctly, campaigns built, audiences chosen. You do not need to touch Ads Manager.',
      },
      {
        title: 'Creatives built from your jingle and video',
        detail:
          'We cut what we already made for you into the formats each platform actually rewards, rather than uploading one file everywhere.',
      },
      {
        title: 'Targeting and tracking set up properly',
        detail:
          'Pointed at the people who buy what you sell — by location, age and interest — with conversion tracking so we can tell what worked instead of guessing.',
      },
      {
        title: 'Monthly optimisation',
        detail:
          'We check what is working every month, kill what is not, and put the budget where the results are.',
      },
      {
        title: 'A report you can actually read',
        detail:
          'What was spent, what came back, what we changed and why — in plain language, not a dashboard screenshot.',
      },
    ],
    process: [
      'We agree your monthly ad budget and what counts as a result.',
      'We set up the accounts, tracking and first campaigns.',
      'Ads go live; we watch and adjust.',
      'You get a report each month and we agree the next month’s plan.',
    ],
    notIncluded: [
      'The ad spend itself — that is your budget and is paid to Google, Meta or TikTok directly, never through us.',
      'Making the jingle or video, if you do not already have one.',
    ],
  },

  google_ranking: {
    bestFor: 'A business whose customers search before they buy — and who is currently invisible when they do.',
    turnaround: 'Work starts within 5 working days; ranking movement takes 2–3 months',
    deliverables: [
      {
        title: 'A full check of where you stand today',
        detail:
          'What you rank for now, what your competitors rank for, and the searches your customers actually type. You get the list, not just the conclusion.',
      },
      {
        title: 'Your website fixed for search',
        detail:
          'Titles, descriptions, headings, speed, mobile layout and the technical things Google reads before a human ever sees the page.',
      },
      {
        title: 'Content written to rank',
        detail:
          'Pages and posts built around the searches worth winning, written for people first so they still convert once someone lands.',
      },
      {
        title: 'Google Business Profile set up and maintained',
        detail:
          'The map listing with your hours, photos, services and reviews — often the single biggest win for a local business, and the one most people leave empty.',
      },
      {
        title: 'A monthly ranking report',
        detail: 'Where you moved, what came in from search, and what we are doing next.',
      },
    ],
    process: [
      'We audit your site and your competitors and agree the target searches.',
      'We fix the site, then publish content on a schedule.',
      'We build and maintain your Google Business Profile.',
      'You get a report each month showing movement.',
    ],
    notIncluded: [
      'Guaranteed position one — nobody can honestly promise that, and anyone who does is selling you something.',
      'Building the website itself, if you do not have one yet.',
    ],
  },

  content_retainer: {
    bestFor: 'A brand that would rather show up every week than appear once and disappear.',
    turnaround: 'First content live within 7 working days of starting',
    deliverables: [
      {
        title: 'A set number of videos every month',
        detail:
          'Agreed up front so you know exactly what you are getting. Made fresh each month rather than recycled.',
      },
      {
        title: 'Seasonal jingles and campaign refreshes',
        detail:
          'New angles for Christmas, Ramadan, back-to-school, your anniversary — so the message stays current instead of going stale.',
      },
      {
        title: 'Cut for every platform and posted on schedule',
        detail:
          'We format for each place and keep to a posting calendar, so the pages stay alive without you thinking about it.',
      },
      {
        title: 'Priority turnaround',
        detail: 'Retainer work goes to the front of our queue. If something urgent comes up, you are not waiting behind one-off orders.',
      },
    ],
    process: [
      'We agree the monthly volume and the content plan.',
      'We produce a batch each month and share it for approval.',
      'We post on schedule, or hand it to your team to post.',
      'We review what performed and shape the next month around it.',
    ],
    notIncluded: [
      'Paid ad spend.',
      'Broadcast airtime.',
    ],
  },

  brand_engine: {
    bestFor: 'A brand that wants one team running everything, and would rather not manage five suppliers.',
    turnaround: 'Onboarding within 7 working days; everything running inside a month',
    deliverables: [
      {
        title: 'Everything in the Content retainer',
        detail: 'The full monthly video volume, seasonal campaigns, formatting and scheduled posting.',
      },
      {
        title: 'Ads management included',
        detail: 'Google, Meta and TikTok campaigns run for you, using the content we are already making.',
      },
      {
        title: 'Google ranking included',
        detail: 'Ongoing SEO and your Google Business Profile maintained, so search brings people in alongside the ads.',
      },
      {
        title: 'Outdoor branding artwork',
        detail:
          'Billboards, banners, signage, vehicle and shop-front artwork — designed to match the campaign so everything looks like one brand.',
      },
      {
        title: 'Broadcast campaigns planned across the year',
        detail:
          'Radio and TV mapped to your busy seasons rather than booked in a panic. Production included; airtime quoted per campaign.',
      },
      {
        title: 'A direct line to us',
        detail: 'One point of contact, first in the queue, and a monthly call to look at what is working.',
      },
    ],
    process: [
      'We start with a session on your business, your seasons and your numbers.',
      'We build the year’s plan — content, ads, search and broadcast.',
      'Everything runs monthly, reported in one place.',
      'We meet monthly to adjust.',
    ],
    notIncluded: [
      'Ad spend and broadcast airtime — your budget, paid to the platforms and stations.',
      'Billboard rental and printing, quoted per site.',
    ],
  },
};

/** Detail is optional at the type level so a new package can ship before its copy is written. */
export function detailFor(key: string): PackageDetail | undefined {
  return PACKAGE_DETAIL[key];
}

/**
 * The bullet list for compact cards and the order summary.
 *
 * Derived from the deliverables above so the short list and the full page can
 * never drift apart — `fallback` only carries a package whose detail copy has
 * not been written yet.
 */
export function includeTitles(key: string, fallback: string[] = []): string[] {
  const d = PACKAGE_DETAIL[key];
  return d ? d.deliverables.map((x) => x.title) : fallback;
}
