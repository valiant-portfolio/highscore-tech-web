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
  ADDRESS, AREAS_SERVED, BUSINESS_NAME, EMAIL, GEO, LEGAL_NAME,
  OPENING_HOURS, PHONE, PRICE_RANGE, REGIONS_SERVED, SOCIAL_PROFILES,
} from '@/lib/seo/business';

// ── Organization ──────────────────────────────────────────────────────────
export function organizationSchema(siteUrl: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: siteUrl,
    logo: `${siteUrl}/full-logo.png`,
    description:
      'Highscore Tech is an AI & software development studio building AI systems, integrating models like Claude and Groq into new and existing products, and shipping web and mobile software for clients worldwide.',
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
    ...(SOCIAL_PROFILES.length > 0 && { sameAs: SOCIAL_PROFILES }),
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
    name,
    url: siteUrl,
    inLanguage: 'en-US',
    publisher: { '@type': 'Organization', name },
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
