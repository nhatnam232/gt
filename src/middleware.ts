import { NextRequest, NextResponse } from "next/server"

const PROTECTED = ["/admin"]
const AUTH_PAGES = ["/sign-in", "/sign-up"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Check for a session cookie (Better Auth uses `better-auth.session_token`)
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token")

  if (!sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
