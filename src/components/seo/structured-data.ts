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
      'Highscore Tech is an AI development studio building AI systems for clients, shipping software products globally, and running an in-house academy that hires its best students.',
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

// ── EducationalOrganization (for the academy arm) ────────────────────────
export function academySchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Highscore Tech Academy',
    url: `${siteUrl}/academy`,
    parentOrganization: { '@type': 'Organization', name: 'Highscore Tech', url: siteUrl },
    description:
      'In-person and online software training in Frontend, Backend, Full stack, Python, React Native, and Python ML/AI. Top graduates are hired into Highscore Tech.',
  };
}

// ── Course schema — one per course on /academy/[slug] ───────────────────
export function courseSchema(opts: {
  siteUrl: string;
  slug: string;
  title: string;
  description: string;
  priceNgn: number;
  durationWeeks?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: opts.title,
    description: opts.description,
    url: `${opts.siteUrl}/academy/${opts.slug}`,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Highscore Tech Academy',
      url: `${opts.siteUrl}/academy`,
    },
    offers: {
      '@type': 'Offer',
      price: opts.priceNgn,
      priceCurrency: 'NGN',
      availability: 'https://schema.org/InStock',
      url: `${opts.siteUrl}/academy/${opts.slug}`,
    },
    ...(opts.durationWeeks && {
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: ['Online', 'Onsite'],
        courseWorkload: `PT${opts.durationWeeks}W`,
      },
    }),
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
