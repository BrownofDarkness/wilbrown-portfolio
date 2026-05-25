import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { SESSION_COOKIE, verifySession } from "./lib/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/*
 * Proxy runs on every non-static request.
 *  - /admin/login is open
 *  - /admin/*     requires a valid JWT session cookie → else redirect to /admin/login
 *  - everything else → next-intl handles locale routing
 *
 * Admin routes are intentionally OUTSIDE the [locale] segment so they
 * don't get FR/EN prefixes (admin UI is FR-only, single user, no need).
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const authed = await verifySession(token);
    if (!authed) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
