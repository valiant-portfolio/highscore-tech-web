// Academy queries — cookie-free anon reads against courses + course_modules.
// Same shape as portfolio/queries.ts so they can run inside RSCs, sitemap,
// and generateStaticParams without an HTTP request.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export type CourseMode = 'online' | 'offline' | 'hybrid';

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  full_description: string | null;
  price_ngn: number;
  duration_weeks: number | null;
  mode: CourseMode;
  level: string | null;
  outcomes: string[];
  prerequisites: string[];
  image_url: string | null;
  sort_order: number;
}

export interface CourseLesson {
  title: string;
  summary?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  sort_order: number;
  title: string;
  summary: string | null;
  lessons: CourseLesson[];
}

export interface CourseWithModules extends Course {
  modules: CourseModule[];
}

const COURSE_COLS =
  'id, slug, title, summary, full_description, price_ngn, duration_weeks, mode, level, outcomes, prerequisites, image_url, sort_order';

export async function listCourses(): Promise<Course[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('courses')
    .select(COURSE_COLS)
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('listCourses failed:', error.message);
    return [];
  }
  return (data ?? []) as Course[];
}

export async function getCourseWithModules(slug: string): Promise<CourseWithModules | null> {
  const supabase = anonClient();
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select(COURSE_COLS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (courseErr) {
    console.error(`getCourseWithModules(${slug}) failed:`, courseErr.message);
    return null;
  }
  if (!course) return null;

  const { data: modules, error: modErr } = await supabase
    .from('course_modules')
    .select('id, course_id, sort_order, title, summary, lessons')
    .eq('course_id', (course as Course).id)
    .order('sort_order', { ascending: true });
  if (modErr) {
    console.error(`course_modules(${slug}) failed:`, modErr.message);
    return { ...(course as Course), modules: [] };
  }
  return { ...(course as Course), modules: (modules ?? []) as CourseModule[] };
}

export async function listCourseSlugs(): Promise<string[]> {
  const supabase = anonClient();
  const { data, error } = await supabase
    .from('courses')
    .select('slug')
    .eq('published', true);
  if (error) {
    console.error('listCourseSlugs failed:', error.message);
    return [];
  }
  return (data ?? []).map((r: { slug: string }) => r.slug);
}

// Price formatter — Naira with thousands separator, no decimals.
export function formatNgn(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
