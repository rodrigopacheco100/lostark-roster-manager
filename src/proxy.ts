import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import { checkRateLimit } from "@/lib/rate-limit"

export default withAuth(function middleware(req) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const userId = req.nextauth.token?.sub ?? null
    const result = checkRateLimit(userId)
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfter) },
        },
      )
    }
  }
})

export const config = {
  matcher: ["/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)"],
}
