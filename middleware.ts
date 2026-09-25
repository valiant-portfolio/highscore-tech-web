import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'highzcore.tech';

// Signing in belongs to the admin subdomain only. These never resolve on the
// public site.
const AUTH_PATHS = ['/login', '/signup', '/forgot-password'];

const startsWithPath = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';
  const { pathname } = request.nextUrl;

  const isAdminHost = host.startsWith('admin.');
  // bot.highzcore.tech is the trading-bot dashboard on its own subdomain — the
  // money screen, not a tab inside the admin panel. It behaves exactly like
  // admin. does, landing on a different page: no second auth path, no separate
  // permission model. `requireSection('trading-bot')` still decides who gets in.
  //
  // Matching on the prefix rather than the full host means bot.localhost:3000
  // works with no setup — browsers resolve anything under .localhost — so the
  // login bounce and the permission refusal can both be proved before the
  // domain is pointed anywhere.
  const isBotHost = host.startsWith('bot.');
  // Only reroute on the real domain. On localhost there is no admin.* to send
  // anyone to, so /login has to keep working for local development.
  const isLiveHost = host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`);

  // admin.highzcore.tech IS the portal. The bare subdomain shows the panel when
  // you are signed in; when you are not, /admin's own guard bounces you to
  // /login on this same host. Rewrite rather than redirect so the subdomain
  // stays in the address bar.
  // The dashboard answers on bot. and NOWHERE else. Reaching it at
  // admin.highzcore.tech/admin/trading-bot would be a second front door to the
  // money screen — a different URL to share, to bookmark, and to forget when
  // access is being reviewed. Redirect rather than 404 so an old bookmark
  // still lands somewhere useful, on the host it should have been using.
  if (isLiveHost && !isBotHost && startsWithPath(pathname, '/admin/trading-bot')) {
    const url = new URL(request.url);
    url.hostname = `bot.${ROOT_DOMAIN}`;
    url.port = '';
    return NextResponse.redirect(url);
  }

  if (isAdminHost || isBotHost) {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = isBotHost ? '/admin/trading-bot' : '/admin';
      return NextResponse.rewrite(url);
    }
    // Everything else passes through untouched — including /login, which MUST
    // stay on this host. The branch below sends /login on the public site to
    // the admin subdomain; letting it catch bot. as well would bounce you off
    // the dashboard's own domain to sign in, which is the one thing the brief
    // says not to do.
  } else if (isLiveHost && AUTH_PATHS.some((p) => startsWithPath(pathname, p))) {
    // Someone found /login on the public site — send them to the portal,
    // keeping any ?next= so they still land where they were headed.
    const url = new URL(request.url);
    url.hostname = `admin.${ROOT_DOMAIN}`;
    url.port = '';
    return NextResponse.redirect(url);
  }

  // studio.highzcore.tech serves the Studio section, which lives at /studio in
  // this same app. Rewrite (not redirect) so the subdomain stays in the address
  // bar. Paths that already start with /studio are left alone so the rewrite
  // can't double up, and shared routes (/api, /_next, /contact…) still resolve.
  if (host.startsWith('studio.')) {
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
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
};
