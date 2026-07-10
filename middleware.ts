import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
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
