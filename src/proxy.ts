import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const userId = req.auth?.user?.id ?? null
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

  if (!req.auth && !req.nextUrl.pathname.startsWith("/auth")) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: ["/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)"],
}
