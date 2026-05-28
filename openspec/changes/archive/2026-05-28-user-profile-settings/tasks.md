## 1. Auth — Stop overwriting name/image on re-login

- [x] 1.1 Modify `signIn` callback in `src/lib/auth.ts` to only set provider ID when user already exists (remove `name` and `image` from the update)
- [x] 1.2 Verify new user creation still sets `name`, `email`, `image`, `friendCode`, and provider ID on first sign-in

## 2. API — PUT /api/user/me endpoint

- [x] 2.1 Create `src/app/api/user/me/route.ts` PUT handler that accepts `{ name?: string, image?: string }` body
- [x] 2.2 Add Zod validation: name must be non-empty string, image must be valid image URL (.jpg, .png, .gif, .webp, etc) or null
- [x] 2.3 Update the user record in the database and return the updated user

## 3. Profile page — Convert to editable client component

- [x] 3.1 Convert `src/app/(dashboard)/profile/page.tsx` from server component to client component (`"use client"`)
- [x] 3.2 Add React Query `useQuery(["GET", "/api/user/me"], ...)` to fetch current user data
- [x] 3.3 Build edit form: display name text input + avatar URL text input
- [x] 3.4 Add live image preview: render `<Image>` with `unoptimized` when URL is non-empty, fallback placeholder on error
- [x] 3.5 Add `useMutation` + `toast.promise` for saving profile changes via PUT /api/user/me
- [x] 3.6 Remove friend code section from the profile page
- [x] 3.7 Invalidate `["/api/user/me"]` query after successful mutation

## 4. Dashboard — Add user avatar to OwnerSection

- [x] 4.1 Extend `OwnerInfo` type in `src/app/(dashboard)/dashboard/_types/index.ts` with `image: string | null`
- [x] 4.2 Update dashboard API `src/app/api/dashboard/route.ts` to include `image` field from user data for self, friends, and group members
- [x] 4.3 Update `OwnerSection` component to render avatar image next to the owner name

## 5. Polish — Zod validation & layout improvements

- [x] 5.1 Add Zod `.refine()` on backend to reject non-image URLs (check extension via regex)
- [x] 5.2 Add Zod `.refine()` on frontend `profileSchema` with same image URL validation
- [x] 5.3 Improve profile page layout: card-based sections (Avatar, Display Name, Email), larger 96px preview side-by-side with URL input
