// Portfolio queries — server-only reads against portfolio_projects.
// All callers run inside RSCs / server actions / static generation; the
// table's public-read RLS policy makes anon access fine.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Cookie-free anon client — safe to call inside generateStaticParams /
// generateMetadata / sitemap, which run without an HTTP request and so
// can't read cookies.
function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  summary: string;
  body_md: string | null;
  tech_stack: string[];
  category: string | null;
  cover_image_url: string | null;
  images: string[];
  video_url: string | null;
  year: number | null;
  external_url: string | null;
  sort_order: number;
}

export async function listProjects(): Promise<PortfolioProject[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('id, slug, title, client, summary, body_md, tech_stack, category, cover_image_url, images, video_url, year, external_url, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('year', { ascending: false });
  if (error) {
    console.error('listProjects failed:', error.message);
    return [];
  }
  return (data ?? []) as PortfolioProject[];
}

export async function getProject(slug: string): Promise<PortfolioProject | null> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('id, slug, title, client, summary, body_md, tech_stack, category, cover_image_url, images, video_url, year, external_url, sort_order')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) {
    console.error(`getProject(${slug}) failed:`, error.message);
    return null;
  }
  return (data as PortfolioProject) ?? null;
}

export async function listCategories(): Promise<string[]> {
  const projects = await listProjects();
  const set = new Set<string>();
  projects.forEach((p) => p.category && set.add(p.category));
  return Array.from(set).sort();
}

// Used by generateStaticParams + sitemap, both of which run without
// cookies. Falls back to anon client.
export async function listProjectSlugs(): Promise<string[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('slug')
    .eq('published', true);
  if (error) {
    console.error('listProjectSlugs failed:', error.message);
    return [];
  }
  return (data ?? []).map((r: { slug: string }) => r.slug);
}
