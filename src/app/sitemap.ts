import type { MetadataRoute } from 'next';
import { listProjectSlugs } from '@/lib/portfolio/queries';
import { listCourseSlugs } from '@/lib/academy/queries';

// /sitemap.xml — public, indexable routes. Dynamic slugs from portfolio
// and academy are pulled at build time.

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

  const [portfolioSlugs, courseSlugs] = await Promise.all([
    listProjectSlugs(),
    listCourseSlugs(),
  ]);

  return [
    make('/',          'weekly',  1.0),
    make('/services',  'monthly', 0.9),
    make('/portfolio', 'weekly',  0.9),
    make('/academy',   'weekly',  0.95),
    make('/about',     'monthly', 0.7),
    make('/contact',   'monthly', 0.6),
    ...portfolioSlugs.map((slug) => make(`/portfolio/${slug}`, 'monthly', 0.7)),
    ...courseSlugs.map((slug) => make(`/academy/${slug}`, 'monthly', 0.85)),
  ];
}
