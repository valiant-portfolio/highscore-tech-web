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

  business_starter: {
    bestFor: 'Any business that wants to be seen and heard — a shop, a service, a brand starting out.',
    turnaround: '7 working days from payment',
    deliverables: [
      {
        title: 'A jingle written around your offer',
        detail:
          'We write it about what you actually sell, what you charge and where you are. The point is not a nice tune — it is a nice tune that makes someone call you.',
      },
      {
        title: 'A finished advert video',
        detail:
          'Not just audio. You get a complete advert video built around the jingle — made with AI, or from the photos and clips you send us, whichever suits your business better.',
      },
      {
        title: 'Full commercial usage rights, forever',
        detail:
          'Run it anywhere for as long as you like — radio, TV, social, in your shop, on hold on your phone line. It is yours. No licence renewals, no per-play fees back to us.',
      },
      {
        title: 'Your song on Instagram and Facebook',
        detail:
          'We load your jingle into the Instagram and Facebook audio library. After that, you or anyone on your team can open the app, search your business name and pick your own song for any Reel or Story — so every post sounds like you, forever, without asking us.',
      },
      {
        title: 'WhatsApp status cuts',
        detail:
          'Short versions cut to the length WhatsApp status allows, so you can post the advert straight to status the day you get it.',
      },
      {
        title: 'Cut for every platform',
        detail:
          'Wide for Facebook and YouTube, square for feeds, vertical for status, Reels and TikTok. One job, every format — you are never cropping things yourself.',
      },
      {
        title: 'Cover artwork for the song',
        detail: 'Branded artwork that shows when the audio plays, so it looks like a real release rather than a file.',
      },
      {
        title: 'One round of changes',
        detail: 'Get a price wrong or change your number? One round of corrections is included.',
      },
    ],
    process: [
      'You fill the brief — what you sell, your prices, your location, your customer.',
      'We write the script and lyrics and send them for approval before recording.',
      'We record and produce the jingle, then build the advert video around it.',
      'You get everything, plus your song loaded into Instagram and Facebook.',
    ],
    notIncluded: [
      'Radio and TV airtime — add placement below and we book the stations for you.',
      'Us coming to film on location — that is the full campaign package.',
    ],
  },

  business_reach: {
    bestFor: 'A business whose customers are on the road and on the radio, not only on the phone.',
    turnaround: '10 working days from payment',
    deliverables: [
      {
        title: 'Everything in Jingle + advert video',
        detail:
          'The full jingle, the advert video, commercial rights, your song on Instagram and Facebook, WhatsApp cuts, platform formats and cover artwork — all of it, included.',
      },
      {
        title: 'Radio-ready spots — 15, 30 and 60 seconds',
        detail:
          'Your advert re-cut and mixed to the three lengths stations actually sell, levelled to broadcast standard so nothing is rejected when you take it in.',
      },
      {
        title: 'Road banner and street signage artwork',
        detail:
          'Print-ready artwork for the banners outside your shop, along your street, or at the junction — sized properly for the printer, matching the advert so people connect the two.',
      },
      {
        title: 'Shop-front and vehicle branding artwork',
        detail:
          'The same design worked up for your signboard and your bus or keke, so your brand is doing the advertising while it moves.',
      },
      {
        title: 'Extra video cuts for the campaign',
        detail:
          'More short versions from the same production, so you are posting something different each week instead of the same clip.',
      },
      {
        title: 'Two rounds of changes',
        detail: 'More room to get it right, because more is riding on it.',
      },
    ],
    process: [
      'You fill the brief — what you sell, where you are, and where the banners will go.',
      'We script and send everything for approval before we produce.',
      'We produce the jingle, the advert video, the radio spots and the print artwork.',
      'You get the files, the artwork print-ready, and your song on Instagram and Facebook.',
    ],
    notIncluded: [
      'Printing and mounting the banners — we give you print-ready artwork; your printer does the rest.',
      'Radio and TV airtime — add placement below and we book the stations for you.',
    ],
  },

  business_broadcast: {
    bestFor: 'A business ready for television, and one that wants customers to find them on Google too.',
    turnaround: '12 working days from payment',
    deliverables: [
      {
        title: 'Everything in Radio & street',
        detail:
          'The jingle, the advert video, commercial rights, Instagram and Facebook audio, WhatsApp cuts, radio spots, banner and vehicle artwork — all included.',
      },
      {
        title: 'A TV-spec broadcast master',
        detail:
          'Your advert finished to the technical standard television stations require — resolution, audio levels, safe margins. This is what stops a station sending you away.',
      },
      {
        title: 'Your business on Google Maps and Search',
        detail:
          'We set up and properly fill in your Google Business Profile — hours, services, photos, location, category. This is the listing that shows when someone nearby searches what you sell, and it is the single biggest free win most businesses leave empty.',
      },
      {
        title: 'Google review link set up for you',
        detail:
          'A direct link you can send customers to leave a review, because reviews are what push you above competitors in local search.',
      },
      {
        title: 'Website search basics',
        detail:
          'If you have a website, we fix the titles, descriptions and speed issues that keep it off the first page. If you do not, we point your listing where the customers should land.',
      },
      {
        title: 'A campaign plan for the year',
        detail:
          'A simple written plan for when to push, which channel to use for which season, and what to say — so the advert is used well instead of run once and forgotten.',
      },
      {
        title: 'Two rounds of changes',
        detail: 'Across everything, not per item.',
      },
    ],
    process: [
      'You fill the brief and we look at your current search presence.',
      'We script and send everything for approval.',
      'We produce the jingle, video, radio spots, TV master and print artwork.',
      'We set up your Google listing and hand over the campaign plan.',
    ],
    notIncluded: [
      'Ongoing SEO month to month — that is the Google ranking retainer.',
      'Radio and TV airtime — add placement below and we book the stations for you.',
      'Printing and mounting banners.',
    ],
  },

  business_complete: {
    bestFor: 'A business where the real place, the real product and the real people are the selling point.',
    turnaround: '14 working days, including the shoot day',
    deliverables: [
      {
        title: 'Everything in TV & Google',
        detail:
          'The jingle, advert video, commercial rights, Instagram and Facebook audio, WhatsApp cuts, radio spots, banner and vehicle artwork, TV master, Google listing and campaign plan — every bit of it.',
      },
      {
        title: 'A filming day at your location',
        detail:
          'We come to you with our crew and equipment and shoot for the day — the premises, the product, the process, your team at work. Real footage of the real place beats anything generated.',
      },
      {
        title: 'A professionally filmed and graded advert',
        detail:
          'Properly lit, framed and colour graded, cut to your jingle. This is the version that makes a customer trust you before they arrive.',
      },
      {
        title: 'Professional photographs from the same day',
        detail:
          'Edited stills handed over for your social pages, your Google listing, your flyers and your website. Most businesses pay separately for these.',
      },
      {
        title: 'A month of social content from the shoot',
        detail:
          'We cut the footage into a batch of short videos — enough to keep posting for weeks off one filming day, instead of one advert and nothing else.',
      },
      {
        title: 'Priority turnaround and a direct line',
        detail: 'Your job goes to the front of our queue, and you deal with us directly rather than through a form.',
      },
      {
        title: 'Three rounds of changes',
        detail: 'Across everything, until it is right.',
      },
    ],
    process: [
      'You fill the brief and we agree a shoot date.',
      'We script the jingle and the advert and send them for approval.',
      'We come and film — usually half to a full day, depending on the location.',
      'We produce, edit and grade everything, set up your Google listing, and deliver the lot.',
    ],
    notIncluded: [
      'Travel outside Lagos — quoted before we start, never added afterwards.',
      'Paid actors, models, or a venue we have to rent.',
      'Radio and TV airtime — add placement below and we book the stations for you.',
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
