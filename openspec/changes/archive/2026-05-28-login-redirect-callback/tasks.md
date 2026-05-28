## 1. AuthGuard Component

- [x] 1.1 Create `src/components/AuthGuard.tsx` — client component that reads pathname + search params and redirects unauthenticated users to `/auth/signin?callbackUrl=<encoded_url>`
- [x] 1.2 Modify `(dashboard)/layout.tsx` to use `<AuthGuard>` wrapping children instead of server-side `redirect()`

## 2. Dynamic callbackUrl on Sign-In Page

- [x] 2.1 Update `auth/signin/page.tsx` to read `callbackUrl` from `searchParams` and pass it to `signIn()` calls
- [x] 2.2 Extract pathname from callbackUrl via `new URL()` — handles both relative paths and absolute URLs from middleware
