import { NextResponse } from "next/server";

const PROJECT_ID = (typeof process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID === "string" && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID.trim()) || "";
const SESSION_COOKIE_NAME = PROJECT_ID ? `a_session_${PROJECT_ID}` : "";

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Coach app and complete-setup: require session cookie
  if (pathname.startsWith("/app") || pathname === "/complete-setup" || pathname === "/complete-setup/") {
    const session = SESSION_COOKIE_NAME ? request.cookies.get(SESSION_COOKIE_NAME)?.value : null;
    if (!session?.trim()) {
      const to = pathname.startsWith("/app") ? "/login" : "/login";
      return NextResponse.redirect(new URL(to, request.url));
    }
    return NextResponse.next();
  }

  // Member portal: require session except on portal login page
  if (pathname.startsWith("/portal")) {
    if (pathname === "/portal/login" || pathname === "/portal/login/") {
      return NextResponse.next();
    }
    const session = SESSION_COOKIE_NAME ? request.cookies.get(SESSION_COOKIE_NAME)?.value : null;
    if (!session?.trim()) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
