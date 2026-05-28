## Why

When an unauthenticated user visits a protected URL (e.g., `/groups/join?code=abc`), the dashboard layout redirects to `/auth/signin` without preserving the original destination. After login, the user always lands on `/dashboard` — losing the context of what they were trying to access.

## What Changes

- **AuthGuard component**: Replace the server-side `redirect("/auth/signin")` in the dashboard layout with a client-side `<AuthGuard />` component that redirects to `/auth/signin?callbackUrl=<current_path>`
- **Dynamic callbackUrl on sign-in page**: Read `callbackUrl` from search params; fall back to `/dashboard` if not present
- **Landing page**: Apply same callback-passing pattern for the link to `/auth/signin`

## Capabilities

### New Capabilities
- `login-redirect-preservation`: Preserve the original destination URL through the login flow and redirect there after successful authentication

### Modified Capabilities
- *(none)*

## Impact

- **Layout**: `(dashboard)/layout.tsx` replaced with a thin wrapper + client `AuthGuard`
- **Sign-in page**: `auth/signin/page.tsx` reads `callbackUrl` from `searchParams`
- **Landing page**: `page.tsx` link passes optional callback
