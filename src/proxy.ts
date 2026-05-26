import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  if (!req.auth && !req.nextUrl.pathname.startsWith("/auth")) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: ["/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico).*)"],
}
