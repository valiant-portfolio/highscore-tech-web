// Next 16 renamed this convention from `middleware` to `proxy`, and the old
// name is not merely deprecated — it is IGNORED. Every subdomain rewrite in
// here silently stopped happening: admin., studio. and bot. all served the
// marketing site instead, with no warning in the build or the dev log.
//
// Renamed per the codemod (npx @next/codemod middleware-to-proxy).
//
// AND IT LIVES IN src/. The docs are explicit: "Create a proxy.ts file in the
// project root, OR INSIDE src IF APPLICABLE, so that it is located at the same
// level as pages or app." This app's app/ is src/app/, so a root-level
// proxy.ts is not loaded — and nothing says so. The build simply omits the
// "ƒ Proxy (Middleware)" line, and every subdomain serves the marketing site.
// That is how admin., studio. and bot. were all broken in production at once.
//
// If the subdomains ever stop routing again, check the build output for that
// line before looking anywhere else.

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'highzcore.tech';

// Signing in belongs to the admin subdomain only. These never resolve on the
// public site.
const AUTH_PATHS = ['/login', '/signup', '/forgot-password'];

const startsWithPath = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function proxy(request: NextRequest) {
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
  // ai.highzcore.tech is Highscore AI — the whole subdomain served from /ai,
  // same pattern as studio. and bot. Prefix matching means ai.localhost:3000
  // works with no hosts-file setup: browsers resolve anything under .localhost.
  const isAiHost = host.startsWith('ai.');
  // Only reroute on the real domain. On localhost there is no admin.* to send
  // anyone to, so /login has to keep working for local development.
  const isLiveHost = host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`);

  // admin.highzcore.tech IS the portal. The bare subdomain shows the panel when
  // you are signed in; when you are not, /admin's own guard bounces you to
  // /login on this same host. Rewrite rather than redirect so the subdomain
  // stays in the address bar.
  // bot.highzcore.tech IS the trading bot — the whole subdomain, not one page
  // inside something else. Every path is served from /bot, so the desk sees
  // bot.highzcore.tech/ and /trade/9813924405 rather than a route that says it
  // is a corner of the admin panel.
  //
  // Shared paths are left alone: /login has to resolve on THIS host (signing in
  // must not bounce you off the dashboard's own domain), and /api and /_next
  // belong to the framework.
  if (isBotHost) {
    const shared = pathname.startsWith('/api') || pathname.startsWith('/_next')
      || pathname.startsWith('/bot') || pathname.startsWith('/login')
      || pathname.startsWith('/profile');
    if (!shared) {
      const url = request.nextUrl.clone();
      url.pathname = `/bot${pathname === '/' ? '' : pathname}`;
      // Carry the path the visitor actually asked for. After the rewrite the
      // app only sees /bot/trade/123, and the sign-in bounce has no way to
      // know whether to send them back to /trade/123 or /bot/trade/123 — so
      // it used to give up and send everyone to the desk. A Telegram "Open
      // chart" link for one ticket landed on the list of all of them.
      const headers = new Headers(request.headers);
      headers.set('x-bot-path', pathname);
      return NextResponse.rewrite(url, { request: { headers } });
    }
  }

  // The dashboard answers on bot. and NOWHERE else. /bot or the old
  // /admin/trading-bot on another host would be a second front door to the
  // money screen — another URL to share, to bookmark, and to forget when
  // access is reviewed. Redirected, not 404'd, so old links still land
  // somewhere useful on the host they should have used.
  if (isLiveHost && !isBotHost
      && (startsWithPath(pathname, '/bot') || startsWithPath(pathname, '/admin/trading-bot'))) {
    const url = new URL(request.url);
    url.hostname = `bot.${ROOT_DOMAIN}`;
    url.port = '';
    // The pages moved out of /admin; send an old link to the new shape rather
    // than to a path that no longer exists.
    url.pathname = pathname.replace(/^\/admin\/trading-bot/, '').replace(/^\/bot/, '') || '/';
    return NextResponse.redirect(url);
  }

  if (isAdminHost) {
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
  } else if (isLiveHost && !isBotHost && !isAiHost && AUTH_PATHS.some((p) => startsWithPath(pathname, p))) {
    // Someone found /login on the public site — send them to the portal,
    // keeping any ?next= so they still land where they were headed.
    //
    // NOT from bot. — the dashboard signs you in on its own host. Bouncing to
    // admin. to log in and then honouring ?next=/ lands you on the admin
    // panel, which is the one place the trading bot is not supposed to be.
    const url = new URL(request.url);
    url.hostname = `admin.${ROOT_DOMAIN}`;
    url.port = '';
    return NextResponse.redirect(url);
  }

  // ai.highzcore.tech serves Highscore AI, which lives at /ai in this app.
  // Rewrite (not redirect) so the subdomain stays in the address bar, and the
  // landing page reads ai.highzcore.tech/ rather than a path that says it is a
  // corner of something else.
  if (isAiHost) {
    const shared = pathname.startsWith('/api') || pathname.startsWith('/_next')
      || pathname.startsWith('/ai') || pathname.startsWith('/login');
    if (!shared) {
      const url = request.nextUrl.clone();
      url.pathname = `/ai${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
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

  // Fail open: this runs on every route, so a thrown error here would
  // crash the whole site (Netlify shows "edge function invocation failed").
  // If session handling throws, let the request through — every protected
  // page/layout still re-checks access server-side, so nothing leaks.
  try {
    return await updateSession(request);
  } catch (err) {
      console.error('[proxy] updateSession threw, passing request through:', err);
    return NextResponse.next();
  }
}

// Skip static assets and image-optimised paths.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
};
