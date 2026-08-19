import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // studio.highzcore.tech serves the Studio section, which lives at /studio in
  // this same app. Rewrite (not redirect) so the subdomain stays in the address
  // bar. Paths that already start with /studio are left alone so the rewrite
  // can't double up, and shared routes (/api, /_next, /contact…) still resolve.
  const host = request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';
  if (host.startsWith('studio.')) {
    const { pathname } = request.nextUrl;
    const shared = pathname.startsWith('/api') || pathname.startsWith('/_next')
      || pathname.startsWith('/studio') || pathname.startsWith('/contact')
      || pathname.startsWith('/login') || pathname.startsWith('/admin');
    if (!shared) {
      const url = request.nextUrl.clone();
      url.pathname = `/studio${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Fail open: middleware runs on every route, so a thrown error here would
  // crash the whole site (Netlify shows "edge function invocation failed").
  // If session handling throws, let the request through — every protected
  // page/layout still re-checks access server-side, so nothing leaks.
  try {
    return await updateSession(request);
  } catch (err) {
    console.error('[middleware] updateSession threw, passing request through:', err);
    return NextResponse.next();
  }
}

// Skip middleware on static assets and image-optimised paths.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
};
