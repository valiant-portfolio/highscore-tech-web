import type { MetadataRoute } from 'next';
import { listProjectSlugs } from '@/lib/portfolio/queries';

// /sitemap.xml — public, indexable routes. Dynamic portfolio slugs are
// pulled at build time. Academy URLs are gone: teaching is retired from the
// public site and those paths now 301 (see next.config.ts).

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
  ];
}
