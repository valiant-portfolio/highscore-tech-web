// schema.org generators for JSON-LD. Pure functions; <JsonLd> serialises
// them into <script type="application/ld+json"> tags in <head>.
//
// Validate with https://search.google.com/test/rich-results when changed.

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
    },
    sameAs: [],
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
  /** Lowest price in USD, if the page has one. Rendered as "from". */
  priceFrom?: number | null;
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
    areaServed: 'Worldwide',
    ...(opts.priceFrom != null && {
      offers: {
        '@type': 'Offer',
        price: opts.priceFrom,
        priceCurrency: 'USD',
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
