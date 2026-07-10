// Session refresh middleware for Supabase. Three jobs:
//   1. Refresh expired access tokens by calling getUser()
//   2. Gate /profile, /admin, /staff, /onboarding — bounce anon to /login
//   3. Bounce signed-in users away from /login, /signup, /forgot-password
//      to whichever role-appropriate dashboard they belong on.
//   4. Force students that haven't onboarded into /onboarding before they
//      can use /profile or /enrol.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { sectionForPath, allowedHrefs } from '@/lib/admin/sections';

const PROTECTED_PREFIXES   = ['/profile', '/admin', '/staff', '/onboarding'];
const GUEST_ONLY_PREFIXES  = ['/login', '/signup', '/forgot-password'];
// Students who haven't onboarded yet can only touch these routes.
const ONBOARDING_ALLOWED   = ['/onboarding', '/auth', '/api', '/_next'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not put logic between createServerClient and getUser()
  // or sessions can be silently invalidated.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Guard protected routes for anonymous visitors.
  if (!user && PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // 2. Bounce signed-in users away from guest-only routes.
  if (user && GUEST_ONLY_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const url = request.nextUrl.clone();
    url.pathname = profile?.role === 'admin' ? '/admin'
                 : profile?.role === 'staff' ? '/staff'
                 : '/profile';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 3. Onboarding enforcement — students must finish before going anywhere
  //    sensitive. Admin/staff are exempt (they bypass onboarding).
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, onboarded_at, admin_sections')
      .eq('id', user.id)
      .maybeSingle();
    const isStudent = !profile || profile.role === 'student';
    const needsOnboarding = isStudent && !profile?.onboarded_at;
    if (needsOnboarding) {
      // Already on /onboarding or an exempt path (api, auth callback) — let
      // them through.
      const allowed = ONBOARDING_ALLOWED.some((p) => path === p || path.startsWith(`${p}/`));
      if (!allowed) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        url.search = '';
        return NextResponse.redirect(url);
      }
    }

    // 4. /admin section guard. Admins reach everything; a staff member reaches
    //    only the sections listed in their `admin_sections`. This is the single
    //    choke point — admin pages read through the service client and trust the
    //    route to be unreachable, so a section they lack must never render.
    const section = sectionForPath(path);
    if (section) {
      const isAdmin = profile?.role === 'admin';
      const granted = (profile?.admin_sections as string[] | null) ?? [];
      if (!isAdmin && !granted.includes(section.key)) {
        const url = request.nextUrl.clone();
        // Bounce to their first granted section, else off /admin entirely.
        const firstHref = allowedHrefs(granted)[0];
        url.pathname = firstHref ?? (profile?.role === 'staff' ? '/staff' : '/profile');
        url.search = '';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
