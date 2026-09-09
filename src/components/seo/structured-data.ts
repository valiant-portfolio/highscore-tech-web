// schema.org generators for JSON-LD. Pure functions; <JsonLd> serialises
// them into <script type="application/ld+json"> tags in <head>.
//
// Validate with https://search.google.com/test/rich-results when changed.
//
// Why this file earns its keep: Google reads LocalBusiness JSON-LD first when
// it assembles an AI Overview for a local query, and AI Overviews now appear on
// roughly half of all searches. Every NAP value below comes from lib/seo/business
// so the site, the schema and the Google Business Profile cannot drift apart —
// a mismatch between them fails entity validation and quietly costs ranking.

import {
  ADDRESS, AGENCY_ALT_NAMES, AGENCY_KNOWS_ABOUT, AGENCY_NAME, AGENCY_PROFILES,
  AREAS_SERVED, BUSINESS_NAME, CAC_NUMBER, EMAIL, FOUNDED, FOUNDER, GEO,
  LEGAL_NAME, OPENING_HOURS, PHONE, PRICE_RANGE, REGIONS_SERVED,
  SOCIAL_PROFILES,
} from '@/lib/seo/business';

/* Stable @id anchors. Every node below points at these rather than repeating
   itself, which is what turns four separate JSON-LD blobs into one entity
   Google can reason about. Without them the Organization, the WebSite and the
   LocalBusiness read as three unrelated things that happen to share a name —
   and with a name as contested as "Highscore", that ambiguity is the whole
   problem. */
export const orgId = (siteUrl: string) => `${siteUrl}/#organization`;
export const founderId = (siteUrl: string) => `${siteUrl}/about#founder`;
export const siteId = (siteUrl: string) => `${siteUrl}/#website`;

// ── Organization ──────────────────────────────────────────────────────────
export function organizationSchema(siteUrl: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId(siteUrl),
    name,
    legalName: `${AGENCY_NAME} Ltd`,
    // Every spelling a person might type or a directory might record. Stating
    // them explicitly stops Google guessing which "Highscore" a mention meant.
    alternateName: [...AGENCY_ALT_NAMES],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/full-logo.png`,
      width: 440,
      height: 130,
    },
    image: `${siteUrl}/full-logo.png`,
    // Never the bare word. The name always travels with the city and what we
    // actually do, because that pairing is what separates us from an edtech
    // platform, a game-streaming service and X-ray diffraction software that
    // all answer to "HighScore".
    description:
      `${AGENCY_NAME} is a Lagos-based AI and software development company `
      + `(CAC RC ${CAC_NUMBER}) building AI systems, web and mobile software for `
      + 'clients in Nigeria and worldwide. It also runs Highscore Studio, its '
      + 'music and video branch, which produces custom songs, jingles and advert films.',
    slogan: 'AI systems and software, built to ship.',
    // A government registration number is unique, externally verifiable, and
    // belongs to exactly one company — among the strongest disambiguation
    // signals a young brand can offer.
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'Corporate Affairs Commission (Nigeria) RC number',
      value: CAC_NUMBER,
    },
    ...(FOUNDED && { foundingDate: FOUNDED }),
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: ADDRESS.region,
        addressCountry: ADDRESS.country,
      },
    },
    // A named, real person attached to the company. None of the other
    // "Highscore" entities have this anchor.
    founder: { '@id': founderId(siteUrl) },
    knowsAbout: [...AGENCY_KNOWS_ABOUT],
    knowsLanguage: ['en-NG', 'en'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English'],
      email: 'admin@highzcore.tech',
      url: `${siteUrl}/contact`,
      ...(PHONE && { telephone: PHONE }),
      areaServed: 'NG',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.country,
      ...(ADDRESS.street && { streetAddress: ADDRESS.street }),
    },
    areaServed: [
      { '@type': 'Country', name: 'Nigeria' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'Canada' },
    ],
    // Declaring the sub-brand here is what stops Highscore Studio reading as a
    // separate, competing entity that happens to share our domain.
    brand: [
      { '@type': 'Brand', name: AGENCY_NAME },
      { '@type': 'Brand', name: BUSINESS_NAME, url: `${siteUrl}/studio` },
    ],
    ...(AGENCY_PROFILES.length > 0 && { sameAs: AGENCY_PROFILES }),
  };
}

// ── Person — the founder ──────────────────────────────────────────────────
/**
 * Published so the company has a human anchor Google can verify against
 * LinkedIn and elsewhere. `worksFor` points back at the Organization @id, which
 * closes the loop: the person proves the company is real, and the company gives
 * the person a role.
 */
export function founderSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': founderId(siteUrl),
    name: FOUNDER.name,
    jobTitle: FOUNDER.jobTitle,
    worksFor: { '@id': orgId(siteUrl) },
    url: `${siteUrl}/about`,
    nationality: { '@type': 'Country', name: 'Nigeria' },
    knowsAbout: [...AGENCY_KNOWS_ABOUT],
    ...(FOUNDER.sameAs.length > 0 && { sameAs: [...FOUNDER.sameAs] }),
  };
}

// ── LocalBusiness ─────────────────────────────────────────────────────────
/**
 * The one that actually moves local ranking, and the one almost no Lagos
 * competitor publishes. Google matches these fields against the Google Business
 * Profile to confirm the site and the listing are the same entity; every value
 * here must be identical to what the profile carries.
 *
 * Emitted once per page tree (the Studio layout), not per page — duplicating an
 * identical LocalBusiness node on every route adds nothing and risks confusing
 * the parser about which is canonical.
 */
export function localBusinessSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    // A recording studio is the most specific type schema.org offers for what
    // the Studio actually does. Specificity is the point: the more precise the
    // type, the better Google can match us to a narrow query.
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${siteUrl}/studio#business`,
    name: BUSINESS_NAME,
    legalName: LEGAL_NAME,
    url: `${siteUrl}/studio`,
    image: `${siteUrl}/full-logo.png`,
    logo: `${siteUrl}/full-logo.png`,
    description:
      'Highscore Studio writes and produces custom songs, jingles and advert '
      + 'videos in Lagos, Nigeria — for birthdays, weddings, funerals, churches '
      + 'and businesses. Business packages include a website, Google Business '
      + 'Profile setup and search listing, so a customer can actually find you.',
    email: EMAIL,
    ...(PHONE && { telephone: PHONE }),
    priceRange: PRICE_RANGE,
    currenciesAccepted: 'NGN',
    // Bank transfer and Paystack are the two that matter to a Lagos buyer
    // deciding whether we are real. Google surfaces these on the profile.
    paymentAccepted: 'Bank transfer, Card, Paystack',
    address: {
      '@type': 'PostalAddress',
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.country,
      ...(ADDRESS.street && { streetAddress: ADDRESS.street }),
      ...(ADDRESS.postalCode && { postalCode: ADDRESS.postalCode }),
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.lat,
      longitude: GEO.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...OPENING_HOURS.days],
        opens: OPENING_HOURS.opens,
        closes: OPENING_HOURS.closes,
      },
    ],
    // Delivery is digital, so the service area is genuinely wider than the
    // address. Naming neighbourhoods matters because Lagosians search at
    // neighbourhood level, never by local government area.
    areaServed: [
      ...AREAS_SERVED.map((name) => ({ '@type': 'City', name })),
      ...REGIONS_SERVED.map((name) => ({ '@type': 'AdministrativeArea', name })),
    ],
    knowsLanguage: ['en-NG', 'en'],
    // Studio is a branch of the agency, not a separate business. Saying so
    // lets every signal either brand earns accrue to the same entity.
    parentOrganization: { '@id': orgId(siteUrl) },
    ...(SOCIAL_PROFILES.length > 0 && { sameAs: SOCIAL_PROFILES }),
  };
}

// ── OfferCatalog — the whole price list, in one machine-readable block ─────
/**
 * Publishing every price as structured data is the natural extension of the
 * decision to publish them on the page at all. It is what lets a package and
 * its price be quoted back inside an AI Overview, where a rival answering
 * "DM for price" has nothing to quote.
 */
export function offerCatalogSchema(opts: {
  siteUrl: string;
  name: string;
  items: ReadonlyArray<{
    name: string;
    description: string;
    priceNgn: number;
    path: string;
    /** True when the figure is a floor rather than the price. */
    from?: boolean;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: opts.name,
    url: `${opts.siteUrl}/studio/pricing`,
    itemListElement: opts.items.map((it, i) => ({
      '@type': 'Offer',
      position: i + 1,
      name: it.name,
      description: it.description,
      price: it.priceNgn,
      priceCurrency: 'NGN',
      url: `${opts.siteUrl}${it.path}`,
      availability: 'https://schema.org/InStock',
      ...(it.from && {
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: it.priceNgn,
          priceCurrency: 'NGN',
        },
      }),
      itemOffered: {
        '@type': 'Service',
        name: it.name,
        description: it.description,
        provider: { '@type': 'Organization', name: BUSINESS_NAME },
      },
    })),
  };
}

// ── WebSite ──────────────────────────────────────────────────────────────
export function websiteSchema(siteUrl: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': siteId(siteUrl),
    name,
    alternateName: [...AGENCY_ALT_NAMES],
    url: siteUrl,
    inLanguage: 'en-NG',
    // By @id, not by repeating the name — so the site and the company are one
    // node in Google's graph rather than two that merely agree.
    publisher: { '@id': orgId(siteUrl) },
  };
}

// ── Service — one per Studio offering / occasion page ─────────────────────
export function serviceSchema(opts: {
  siteUrl: string;
  name: string;
  description: string;
  path: string;
  /** Lowest price, if the page has one. Rendered as "from". */
  priceFrom?: number | null;
  /** ISO currency for priceFrom. */
  currency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: 'Custom music and video production',
    url: `${opts.siteUrl}${opts.path}`,
    provider: {
      '@type': 'Organization',
      name: 'Highscore Tech',
      url: opts.siteUrl,
    },
    areaServed: [
      ...AREAS_SERVED.map((name) => ({ '@type': 'City', name })),
      { '@type': 'Country', name: 'Nigeria' },
    ],
    ...(opts.priceFrom != null && {
      offers: {
        '@type': 'Offer',
        price: opts.priceFrom,
        priceCurrency: opts.currency ?? 'NGN',
        availability: 'https://schema.org/InStock',
        url: `${opts.siteUrl}${opts.path}`,
      },
    }),
  };
}

// ── FAQPage — lets the questions surface directly in search results ────────
export function faqSchema(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// ── BreadcrumbList ────────────────────────────────────────────────────────
export function breadcrumbSchema(crumbs: ReadonlyArray<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
