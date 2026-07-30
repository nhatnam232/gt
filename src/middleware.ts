import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("better-auth.session_token")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }
  }

  // Block cron endpoints from the public internet - only Vercel's cron service
  // sends the CRON_SECRET header
  if (pathname.startsWith("/api/cron")) {
    const secret = request.headers.get("x-cron-secret")
    const expected = process.env.CRON_SECRET
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/cron/:path*"],
}
