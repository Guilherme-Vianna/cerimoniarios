import { NextResponse, type NextRequest } from "next/server";
import {
  ACCOUNT_ONLY_PATHS,
  GUEST_COOKIE,
  HOME_PATH,
  LOGIN_PATH,
  NEXT_PARAM,
  PROTECTED_PATHS,
  SESSION_COOKIE,
} from "@/lib/auth/constants";
import { safeNextPath } from "@/lib/auth/next-path";

function matches(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function toLogin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const login = new URL(LOGIN_PATH, request.url);
  if (pathname !== HOME_PATH) login.searchParams.set(NEXT_PARAM, `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isGuest = hasSession && request.cookies.has(GUEST_COOKIE);
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === LOGIN_PATH && hasSession && !isGuest) {
    const next = safeNextPath(searchParams.get(NEXT_PARAM)) ?? HOME_PATH;
    return NextResponse.redirect(new URL(next, request.url));
  }
  if (matches(pathname, PROTECTED_PATHS) && !hasSession) return toLogin(request);
  if (matches(pathname, ACCOUNT_ONLY_PATHS) && isGuest) return toLogin(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/inicio/:path*",
    "/prova/:path*",
    "/revisar/:path*",
    "/flashcards/:path*",
    "/ranking/:path*",
    "/ajuda/:path*",
    "/conta/:path*",
  ],
};
