## Context

The dashboard layout (`(dashboard)/layout.tsx`) is a server component that calls `redirect("/auth/signin")` when no session exists. This loses the original URL. The sign-in page (`auth/signin/page.tsx`) is a client component that calls `signIn(provider, { callbackUrl: "/dashboard" })` with a hardcoded destination. There is no mechanism to pass the original URL through the login flow.

## Goals / Non-Goals

**Goals:**
- Preserve the original URL through redirect → login → OAuth → post-login redirect
- Apply to all protected routes under `(dashboard)/layout.tsx`
- Fall back to `/dashboard` when no callbackUrl is present

**Non-Goals:**
- Changing middleware (`proxy.ts`) — not needed since layout-level protection suffices
- Modifying the OAuth provider callbacks in `auth.ts` — NextAuth handles the redirect automatically via `callbackUrl`
- Protecting API routes differently — they already return 401

## Decisions

- **Client-side AuthGuard component**: A "use client" component reads `usePathname() + useSearchParams()`, constructs the full current URL, and redirects to `/auth/signin?callbackUrl=<encoded_url>`. The server layout becomes a thin wrapper that renders `<AuthGuard>`. This gives us access to the client-side router for accurate URL capture.
- **searchParams on sign-in page**: The sign-in page reads `searchParams.callbackUrl` from the URL, falling back to `"/dashboard"`. This is passed to `signIn(provider, { callbackUrl })`. NextAuth's OAuth flow preserves this through the redirect chain.
- **Landing page unchanged**: The landing page (`page.tsx`) is a server component that renders a direct link to `/auth/signin`. No callback needed here since the user isn't coming from a protected route.

## Risks / Trade-offs

- **Flash of unprotected content**: The client AuthGuard renders children briefly before redirecting → Mitigation: render `null` (or a spinner) while session is loading using `useSession().status`.
- **Extra client-side render**: Server redirect is faster → Mitigation: the auth check is local (no network), so the client redirect completes within the same frame in most cases.
