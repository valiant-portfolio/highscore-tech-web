import type { MetadataRoute } from 'next';
import { listProjectSlugs } from '@/lib/portfolio/queries';
import { OCCASIONS } from '@/lib/studio/occasions';
import { PACKAGES } from '@/lib/studio/catalog';

// /sitemap.xml — public, indexable routes. Dynamic portfolio slugs are
// pulled at build time. Academy URLs are gone: teaching is retired from the
// public site and those paths now 301 (see next.config.ts).
//
// Studio pages are listed here too. They live on studio.highzcore.tech, but
// that host serves the same /studio/* paths from this app, so one sitemap
// covers both and Google follows the canonical on each page.
// Deliberately absent: /studio/order/<reference>, which is per-customer and
// carries its own noindex.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech').replace(/\/$/, '');
  const now = new Date();

  const make = (
    path: string,
    freq: MetadataRoute.Sitemap[number]['changeFrequency'],
    pri: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority: pri,
  });

  const portfolioSlugs = await listProjectSlugs();

  return [
    make('/',          'weekly',  1.0),
    make('/services',  'monthly', 0.9),
    make('/portfolio', 'weekly',  0.9),
    make('/about',     'monthly', 0.7),
    make('/contact',   'monthly', 0.6),
    ...portfolioSlugs.map((slug) => make(`/portfolio/${slug}`, 'monthly', 0.7)),

    // Studio
    make('/studio',         'weekly',  0.95),
    make('/studio/pricing', 'weekly',  0.9),
    make('/studio/work',    'weekly',  0.8),
    make('/studio/order',   'monthly', 0.75),
    make('/studio/contact', 'monthly', 0.6),
    // The occasion pages are the ones built to rank.
    ...OCCASIONS.map((o) => make(`/studio/songs/${o.slug}`, 'weekly', 0.9)),
    // One page per package, explaining exactly what the price covers.
    ...PACKAGES.map((p) => make(`/studio/packages/${p.key}`, 'monthly', 0.85)),
  ];
}
