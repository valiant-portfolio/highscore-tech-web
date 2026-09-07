// Full detail for every Studio package.
//
// Split out of catalog.ts because this is sales copy, not configuration.
//
// Every package answers the same four questions, in the order a customer asks
// them:
//   1. Is this for me?            → bestFor
//   2. What exactly do I get?     → deliverables (each with a real explanation)
//   3. How does it work?          → process
//   4. What is NOT included?      → notIncluded
//
// That last one matters more than it looks. Saying plainly what a price does
// not cover is what stops an argument three weeks later — and on the business
// tiers it is where we state, every single time, that airtime is not inside
// the fee.

export interface Deliverable {
  /** Short label — this is what the compact cards show. */
  title: string;
  /** The explanation. Written for someone who has never bought this before. */
  detail: string;
}

export interface PackageDetail {
  /** One line: who should buy this. */
  bestFor: string;
  /** e.g. "3 working days from payment". */
  turnaround: string;
  deliverables: Deliverable[];
  /** How the job runs, start to finish. */
  process: string[];
  /** Said plainly, so nobody is surprised later. */
  notIncluded: string[];
}

export const PACKAGE_DETAIL: Record<string, PackageDetail> = {
  /* ══ Personal & occasions ═══════════════════════════════════════════════
     The physical item is deliberately not a mug or a hoodie. Souvenirs are
     the bottom of the Nigerian event budget — ₦1,000 to ₦3,000 a guest — and
     attaching one drags a ₦120,000 song down to feeling like a giveaway. The
     framed spoken-word tribute is the song made solid: it hangs on a wall,
     people photograph it, and it is the product rather than a freebie.     */

  short_song: {
    bestFor:
      'Someone who wants to surprise one person without thinking too hard about it — a birthday, a thank-you, a proposal, a well done.',
    turnaround: '3 working days from payment',
    deliverables: [
      {
        title: 'A one-minute song written about them',
        detail:
          'You send the name, the occasion, and three or four things about the person — how they laugh, what they always say, what they do for a living. We write a sixty-second song around that, and their name is sung in it. Not a template with a name dropped in.',
      },
      {
        title: 'Sung by a real vocalist',
        detail:
          'One voice over a full arrangement in the style you pick. It should sound like something off the radio, not a voice note.',
      },
      {
        title: 'A video with the words on screen',
        detail:
          'The song playing with the lyrics appearing as they are sung, so it can be watched with the sound off — which is how most people will first see it.',
      },
      {
        title: 'A private link that always works',
        detail:
          'WhatsApp crushes audio files and half the time they will not send at all. Your link never expires, never gets compressed, and is what actually gets forwarded round the family group.',
      },
      {
        title: 'A keepsake card with the QR code',
        detail:
          'A printed card carrying their name, the occasion and a code that plays the song when scanned. It turns a link into something you can put in an envelope and hand over.',
      },
    ],
    process: [
      'You fill the brief — who it is for and what makes them them.',
      'We write the words and send them to you first, so nothing is a surprise.',
      'We record and produce the song.',
      'You get the audio, the video and your private link on WhatsApp, Telegram or email.',
    ],
    notIncluded: [
      'A full-length song — this one is about sixty seconds. The Occasion Song is two to three minutes.',
      'An instrumental version, a private page, or the framed tribute.',
      'Commercial use. This is for personal celebration, not for advertising a business.',
    ],
  },

  occasion_song: {
    bestFor:
      'A wedding, a fiftieth, a retirement, an anniversary, a funeral — any occasion somebody has already decided matters.',
    turnaround: '5 working days from payment',
    deliverables: [
      {
        title: 'A full song, two to three minutes, from their real story',
        detail:
          'How the couple met. What the mother gave up. What the business survived to reach ten years. You tell us the whole story and we write a proper song from it — the kind you would hear on the radio, not a jingle with a name in it.',
      },
      {
        title: 'Professionally sung, fully produced',
        detail:
          'Real vocals with our full production behind them — the warm keys, the round bass, the horns. Mixed and mastered so it holds up on a big speaker at a venue, not just on a phone.',
      },
      {
        title: 'A video to go with it',
        detail:
          'A finished video built around the song and ready to post anywhere, with no footage needed from you.',
      },
      {
        title: 'Three cuts for three places',
        detail:
          'A tall version for WhatsApp status, reels and TikTok, a square one for the feed, and a wide one for a laptop or the screen in the hall. Cut properly for each, not one video squeezed into three shapes.',
      },
      {
        title: 'An instrumental version',
        detail:
          'The same song with the vocals stripped out. Hand it to the DJ. Play it as they walk in. Run it quietly under the speeches. The song works twice on the day.',
      },
      {
        title: 'A private page for the occasion',
        detail:
          'One link carrying the song, their photographs, and the story behind the words written out. That single link is what goes into the family group, the invitation and the programme — instead of a file nobody can open.',
      },
      {
        title: 'A QR code for the day',
        detail:
          'Printed on the invitation, the programme, the table cards or the cake table. Guests scan it and hear the song — often before the day has even arrived.',
      },
      {
        title: 'A framed spoken-word tribute',
        detail:
          'Not the song lyrics — a short written piece about the person. Who they are, what they survived, what they always say, what they mean to the people around them. Typeset with their name and the date, printed and framed. It goes on a wall and stays there.',
      },
    ],
    process: [
      'You fill the brief and tell us the story properly — the more you give, the better the song.',
      'We write the words and the spoken-word tribute, and send both to you before we record anything.',
      'We record, produce and mix the song, then cut the instrumental and the three social versions.',
      'We build your private page, generate the QR code, and send the frame to print.',
      'Everything is delivered together, on or before the date we promised.',
    ],
    notIncluded: [
      'A film edited from your own photos and footage — that is The Occasion Film.',
      'Release to Spotify and Apple Music — available as an add-on, or included in The Occasion Film.',
      'Frame delivery outside Lagos. We quote shipping separately, and the frame may arrive after the song.',
      'Commercial use. This is for celebration, not for advertising a business.',
    ],
  },

  occasion_film: {
    bestFor:
      'Anyone who wants something to play on the screen when the room goes quiet — the tribute at a funeral, the montage at a wedding, the film at a seventieth.',
    turnaround: '7 working days from payment; streaming live about two weeks after',
    deliverables: [
      {
        title: 'Everything in The Occasion Song',
        detail:
          'The full song, professional vocals, the instrumental, the three social cuts, the private page, the QR code and the framed tribute — all of it, before we get to what is new here.',
      },
      {
        title: 'A real film cut from your own pictures',
        detail:
          'You send your photographs and phone videos — old family pictures, wedding footage, the business in its first year — and an editor sits down and builds a film that runs to the song. This is real editing by a person, not an automatic slideshow.',
      },
      {
        title: 'Cut tall and wide',
        detail:
          'One version shaped for phones, status and reels, and one for a laptop, a projector or the screen at the venue. Both properly graded, both delivered.',
      },
      {
        title: 'Released on Spotify, Apple Music and YouTube Music',
        detail:
          'Published under the name you choose, so the song can be searched for and played by anybody, forever. Their mother’s song, sitting on Spotify like any other artist. This is the part nobody else in Nigeria is offering.',
      },
      {
        title: 'Guest messages, collected',
        detail:
          'Guests scan the QR code at the event and record a short message. Afterwards it all comes back to you as one collection — the voices of everyone who came, kept.',
      },
      {
        title: 'A larger framed tribute, and the tribute recorded',
        detail:
          'The spoken-word piece printed larger for the wall, and also read and recorded over a soft instrumental — a two-minute audio tribute that sits alongside the song.',
      },
      {
        title: 'Keepsake cards for guests',
        detail:
          'A run of printed cards carrying the QR code, so everyone who came can take the song home with them.',
      },
    ],
    process: [
      'You fill the brief and tell us the story.',
      'We write the song and the spoken-word tribute, and send both for approval.',
      'You send your photographs and video clips — we tell you exactly what works best.',
      'We record the song, record the tribute, and edit the film around your material.',
      'Everything is delivered, the frames and cards go to print, and the song is submitted to streaming.',
      'The song appears on Spotify and Apple Music about two weeks later, and we send you the links.',
    ],
    notIncluded: [
      'Filming on the day. We edit the footage you already have; we do not send a camera crew.',
      'Frame and card delivery outside Lagos, which we quote separately.',
      'Any control over how quickly Spotify and Apple approve a release, which is usually one to two weeks.',
      'Commercial use. This is for celebration, not for advertising a business.',
    ],
  },

  /* ══ Business & brands ══════════════════════════════════════════════════
     The website is the hook. A Nigerian SME already treats ₦250,000–₦400,000
     as the price of a website, so putting one inside a ₦180,000 package stops
     the price being a question at all — and it costs us a few hours of work
     we already do. "Done properly" beats "set up" everywhere below: almost
     every business technically has WhatsApp Business and an Instagram
     account, and almost none of them are configured. Pointing that out on the
     call is itself the sale.                                               */

  business_starter: {
    bestFor: 'A business that exists but cannot be found — no website, or a website Google has never seen.',
    turnaround: '7 working days from payment',
    deliverables: [
      {
        title: 'A custom jingle, in three lengths',
        detail:
          'Written around your name, what you sell and what makes people choose you. Delivered as sixty, thirty and fifteen-second masters, so it is ready for radio, social or a shop speaker without paying for a re-edit later.',
      },
      {
        title: 'A one-page website on your own domain',
        detail:
          'What you sell, real photographs, your prices and a WhatsApp button that opens a chat straight to you. Your own domain name, and hosting covered for the first year.',
      },
      {
        title: 'Your domain submitted to Google, properly',
        detail:
          'Most small Nigerian websites have never been submitted to Google at all — the owner paid for a site and assumed Google would find it. We register your domain in Google Search Console and submit a sitemap, so every page actually gets indexed instead of sitting invisible.',
      },
      {
        title: 'Pages written for what people really search',
        detail:
          'Page titles and descriptions built around the words your customers type — “tailor in Surulere”, not “Home”. Your name, address and phone number made identical everywhere Google looks, which is what local ranking runs on.',
      },
      {
        title: 'Google Business Profile claimed and filled',
        detail:
          'Claimed, verified, and filled in with photographs, opening hours and services — so you appear on Google Maps when somebody nearby searches for what you sell.',
      },
      {
        title: 'WhatsApp Business, done properly',
        detail:
          'Set up if you do not have it. If you do, we fix what is missing: your products loaded into the catalogue, business hours, an away message, a greeting, and a proper profile. Almost nobody has this configured.',
      },
      {
        title: 'Social profiles, done properly',
        detail:
          'Instagram, Facebook and TikTok set up or cleaned up — branded profile picture and cover art, a bio that says what you actually do, and the website link where it belongs.',
      },
      {
        title: 'A business email on your own domain',
        detail:
          'info@yourbusiness.com instead of a Gmail address. It costs almost nothing and it changes how a customer reads you in the first two seconds.',
      },
      {
        title: 'A QR code',
        detail:
          'For your banner, your card, your shop door. It scans straight to the website or the WhatsApp catalogue.',
      },
    ],
    process: [
      'You fill the brief — what you sell, where you are, and what a customer must hear.',
      'We write the jingle words and send them for approval.',
      'We record and produce the jingle, and build the website while it is in production.',
      'We claim and fill your Google listing, submit the site to Search Console, and set up or fix WhatsApp and your social profiles.',
      'Everything is handed over with the logins, and we walk you through it once on a call.',
    ],
    notIncluded: [
      'Radio, television or billboard airtime. Media is never inside a package price — it is quoted per campaign and billed at the station’s own rate plus 15% for the booking.',
      'An advert video — that starts with The Brand Pack.',
      'Ongoing posting or SEO work. This tier is a one-off build with nothing monthly.',
      'Hosting after the first year, which renews at cost.',
    ],
  },

  business_brand_pack: {
    bestFor: 'A business ready to be seen, not just found — one that needs something to show, not only somewhere to be found.',
    turnaround: '14 working days from payment, then one month of ongoing work',
    deliverables: [
      {
        title: 'Everything in The Starter',
        detail:
          'The jingle, the website on your own domain, Search Console and the sitemap, the Google listing, WhatsApp Business, the social profiles, the business email and the QR code — all of it.',
      },
      {
        title: 'A 30–60 second advert video',
        detail:
          'Built around your jingle, showing your product, your name and your offer. The thing you can actually put in front of somebody.',
      },
      {
        title: 'Cut for every screen',
        detail:
          'Three versions of the advert — tall for status, reels and TikTok, square for the feed, and wide for YouTube or a screen inside the shop.',
      },
      {
        title: 'Print-ready banner and billboard artwork',
        detail:
          'Artwork for a street banner, a poster or a billboard, at the correct sizes and resolution, ready to hand to any printer without them asking you for a better file.',
      },
      {
        title: 'One month of Google and social work included',
        detail:
          'Four social posts, posts to your Google Business Profile, review prompts sent to your customers, ongoing fixes to the site, and a report at the end showing exactly what people searched to find you.',
      },
    ],
    process: [
      'Everything in The Starter runs first — jingle, website, Google, profiles.',
      'We script the advert around your offer and send it for approval.',
      'We produce the advert and cut the three versions.',
      'We design the banner and billboard artwork.',
      'The included month of posting and Google work begins the day everything goes live.',
    ],
    notIncluded: [
      'Radio, television or billboard airtime and rental. Quoted per campaign, billed at the station’s own rate plus 15% for the booking.',
      'Printing and mounting of banners or billboards, and the LASAA and APCON permits.',
      'Filming on location — that starts with The Launch. This advert is produced from your product photographs and supplied material.',
      'Paid ad spend, which is your budget and is paid to the platforms.',
    ],
  },

  business_launch: {
    bestFor: 'A business opening, relaunching, or finally taking itself seriously — where real footage of the real place matters.',
    turnaround: '21 working days from payment, then three months of ongoing work',
    deliverables: [
      {
        title: 'Everything in The Brand Pack',
        detail:
          'The jingle, the website, all the Google and profile work, the advert video, the three cuts and the print artwork.',
      },
      {
        title: 'A full day filming on location',
        detail:
          'We come to you. Your shop, your staff, your product, your customers — real footage of your real business, not stock video of somebody else’s.',
      },
      {
        title: 'Photography from the same shoot',
        detail:
          'Stills shot on the day, edited and delivered — for the website, the profiles, the banner and everything you make afterwards. You stop paying for stock photos forever.',
      },
      {
        title: 'A real website, not a page',
        detail:
          'Five pages instead of one, with an online store if you sell products or a booking form if you sell time. Built to take orders, not just to exist.',
      },
      {
        title: 'Three months of Google work',
        detail:
          'Doubled from The Brand Pack, because ranking is slow and one month rarely shows it. Ongoing page work, listings, reviews and monthly reporting.',
      },
      {
        title: 'Eight social posts a month, for three months',
        detail:
          'Cut from your shoot footage and posted on schedule — so when the advert sends people to your page, the page is not empty.',
      },
      {
        title: 'Your ad accounts built and connected',
        detail:
          'Meta and Google ad accounts created properly, tracking connected to your website, and the creatives loaded, ready to run whenever you want to spend.',
      },
    ],
    process: [
      'You fill the brief and we agree a shoot date.',
      'We script the advert and write the jingle, and send both for approval.',
      'We film for a day at your location, and shoot stills at the same time.',
      'We edit the advert, cut the social versions, and build the five-page site around your new photographs.',
      'We set up the ad accounts and tracking, then the three included months of posting and Google work begin.',
    ],
    notIncluded: [
      'Radio, television or billboard airtime and rental. Quoted per campaign, billed at the station’s own rate plus 15%.',
      'Paid ad spend. The accounts are built and ready, but the budget is yours and goes to the platforms.',
      'Travel and accommodation outside Lagos, quoted before we start.',
      'Actors, models, presenters or licensed music, if the advert calls for them.',
    ],
  },

  business_campaign: {
    bestFor: 'A business that wants the whole city to know — and wants somebody else to handle the stations, the printers and the permits.',
    turnaround: '30 working days to launch, then ongoing',
    deliverables: [
      {
        title: 'Everything in The Launch',
        detail:
          'The shoot, the photography, the five-page site with a store or booking form, the jingle, the advert, all the cuts and all the Google work.',
      },
      {
        title: 'A real campaign plan, costed before anything is booked',
        detail:
          'Which stations, which weeks, which billboards, which streets — with the actual cost of every line written down. You approve the plan and the budget before a single naira of media is spent.',
      },
      {
        title: 'We book and manage the media',
        detail:
          'Radio, television, billboards and street banners. We negotiate the rate, book the slots, deliver the files to each station and confirm every single spot actually ran.',
      },
      {
        title: 'Masters cut to each station’s spec',
        detail:
          'Every station wants a different length, format and loudness. All of it delivered correctly the first time, so nothing gets rejected on the morning it was meant to air.',
      },
      {
        title: 'Outdoor handled end to end',
        detail:
          'Billboard printing, mounting, and the LASAA and APCON permits — the part most businesses do not know exists until they are fined for it.',
      },
      {
        title: 'Three months of everything included, with your ads run',
        detail:
          'Posting, Google work, and your paid advertising actually run for you across Meta and Google — not just set up.',
      },
      {
        title: 'One monthly report',
        detail:
          'What ran, where, how many people it reached, and what came back. One page, in plain language.',
      },
    ],
    process: [
      'We meet, agree the objective and the total budget, and write the campaign plan.',
      'You approve the plan, the stations and the spend before anything is committed.',
      'Everything in The Launch is produced — the shoot, the site, the jingle, the advert.',
      'Masters are cut to each station’s spec and delivered; billboards go to print and permits are filed.',
      'The campaign runs, we confirm every placement, and you get a report each month.',
    ],
    notIncluded: [
      'Airtime and billboard rental themselves. These are billed at the station’s own rate plus 15% for the booking — stations already give agencies 15–30% off card, so that 15% comes out of the discount and costs you nothing extra.',
      'Paid ad spend, which is your budget and goes to the platforms.',
      'Travel outside Lagos, quoted before we start.',
      'Talent fees and licensed music, if the campaign calls for them.',
    ],
  },

  /* ══ Political ══════════════════════════════════════════════════════════
     Presidential and National Assembly: 16 January 2027. Governorship and
     State Assembly: 6 February 2027. Campaigning legally opened 150 days
     before the poll, so this window is live now. Media houses charge
     campaigns a 31–50% premium as standard — a full-page newspaper is
     ₦920,000 political against ₦700,000 commercial, and Channels applies a
     50% political surcharge — so the production carries one too.

     ARCON accreditation is a hard prerequisite for placement, and a candidate
     who uses an unaccredited agency shares the liability. It is stated in
     notIncluded on every tier rather than buried.                          */

  campaign_jingle: {
    bestFor: 'A candidate who needs the one thing every Nigerian campaign runs on — a song people cannot stop humming.',
    turnaround: '5 working days from payment',
    deliverables: [
      {
        title: 'A campaign jingle built to be remembered',
        detail:
          'Your name, your office, your slogan and your promise, written into a song simple enough that a crowd can sing it back after hearing it twice. That is the entire job of a campaign jingle.',
      },
      {
        title: 'Every version you will need',
        detail:
          'Sixty, thirty and fifteen-second masters, so the same jingle works on radio, on social and over a rally speaker without a re-edit each time.',
      },
      {
        title: 'Up to two languages',
        detail:
          'A separate recorded version in each — English, Pidgin, Yoruba, Hausa or Igbo. Not a translation of the same recording: each one is performed properly so it lands in the ear of the people who speak it.',
      },
      {
        title: 'Rally-ready audio',
        detail:
          'Mastered loud and clean for a PA system in the open air, which is a completely different mix from something made for headphones.',
      },
      {
        title: 'Social cuts',
        detail:
          'Vertical video versions with the words on screen, ready for WhatsApp, TikTok and status — where campaign songs now actually spread.',
      },
    ],
    process: [
      'You fill the brief — the name, the office, the constituency, the promise, the languages.',
      'We write the words and send them for approval before recording. Nothing goes out unapproved.',
      'We record every language version and produce the jingle.',
      'You get all masters, all lengths and the social cuts together.',
    ],
    notIncluded: [
      'Radio and television airtime, which is billed at the station’s own rate plus 15% for the booking. Note that campaigns pay a 31–50% political premium on published rates.',
      'ARCON vetting and approval, which every advertisement must pass before it can air.',
      'Video advertising — that starts with the Campaign Pack.',
      'Additional languages beyond two, quoted per language.',
    ],
  },

  campaign_pack: {
    bestFor: 'A campaign that needs to be seen as well as heard, across every screen in the constituency.',
    turnaround: '14 working days from payment',
    deliverables: [
      {
        title: 'Everything in the Campaign Jingle',
        detail:
          'The jingle, every length, up to two languages, rally-ready masters and the social cuts.',
      },
      {
        title: 'A campaign advert video',
        detail:
          'Thirty to sixty seconds built around the jingle, cut from your rally footage, your photographs and supplied material — the record, the promise and the face, in one place.',
      },
      {
        title: 'Cut for every screen and every platform',
        detail:
          'Tall for status and TikTok, square for the feed, wide for television and projection at rallies. Each one cut properly rather than squeezed.',
      },
      {
        title: 'Poster, banner and billboard artwork',
        detail:
          'Print-ready at every size a printer will ask for — posters, street banners, gantries and 48-sheet billboards.',
      },
      {
        title: 'Up to four languages',
        detail:
          'Doubled from the jingle tier. Separate recorded versions across the languages your constituency actually speaks.',
      },
      {
        title: 'A social pack for your team',
        detail:
          'Profile art, cover images and a set of ready-to-post graphics, so every supporter page and ward group is posting the same campaign rather than nine different ones.',
      },
    ],
    process: [
      'We agree the message, the languages and the constituencies before anything is written.',
      'Words and scripts go to you for approval first.',
      'We record every language version and produce the advert.',
      'Artwork is designed at every print size and delivered ready for the printer.',
      'Everything is handed over as one organised pack your team can work from.',
    ],
    notIncluded: [
      'Radio, television and outdoor airtime and rental, billed at the station’s own rate plus 15%.',
      'ARCON vetting and approval, and any regulatory clearance the advert requires.',
      'Filming at rallies or on location — that is the Full Campaign.',
      'Billboard printing, mounting, and LASAA permits.',
    ],
  },

  campaign_full: {
    bestFor: 'A serious campaign that wants one team producing everything and placing it, from now to polling day.',
    turnaround: '30 working days to launch, then running to the poll',
    deliverables: [
      {
        title: 'Everything in the Campaign Pack',
        detail:
          'The jingle in every language and length, the advert video and every cut, and all the print and social artwork.',
      },
      {
        title: 'We film — rallies, walkabouts, the constituency',
        detail:
          'Our crew on the ground capturing the crowds, the handshakes and the places you are promising to fix. Real footage of your real campaign, refreshed as it goes.',
      },
      {
        title: 'A costed media plan, approved before booking',
        detail:
          'Which stations, which weeks, which billboards, which streets, and what each one costs — including the political premium — written down and approved before a naira is committed.',
      },
      {
        title: 'We book, place and confirm everything',
        detail:
          'Radio, television, billboards and banners across your constituency. Rates negotiated, slots booked, files delivered to each station, and every placement confirmed as having run.',
      },
      {
        title: 'Outdoor end to end',
        detail:
          'Billboard printing, mounting, and the LASAA and APCON permits handled — including the political surcharges most people discover far too late.',
      },
      {
        title: 'Fresh content through the campaign',
        detail:
          'New cuts as the campaign moves — a response to an opponent, a new promise, a big rally — turned round fast rather than waiting for the next production cycle.',
      },
      {
        title: 'Reporting every month',
        detail:
          'What ran, on which stations, in which weeks, and what it cost. One page you can hand to whoever is funding the campaign.',
      },
    ],
    process: [
      'We meet, agree the objective, the constituencies, the languages and the total budget.',
      'We write the campaign plan and cost every line. You approve it before anything is booked.',
      'We produce the jingle, the adverts and all artwork, and begin filming.',
      'Everything is submitted for ARCON vetting, then masters go to each station in their own spec.',
      'The campaign runs to polling day, with fresh cuts as it moves and a report each month.',
    ],
    notIncluded: [
      'Airtime, billboard rental and print costs. Billed at the station’s and printer’s own rates plus 15% for the booking. Campaigns pay a 31–50% political premium on published media rates — we quote the real number up front.',
      'ARCON accreditation of the campaign itself, and any legal or regulatory clearance beyond advertisement vetting.',
      'Travel and accommodation outside the agreed constituencies.',
      'Anything that breaches the Electoral Act or NBC rules — including partisan advertising in the 24 hours before polling day, which no station may run.',
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
