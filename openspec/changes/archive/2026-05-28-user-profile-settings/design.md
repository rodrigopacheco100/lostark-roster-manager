## Context

The user profile is currently a read-only server component displaying data from the OAuth provider (name, avatar) and the friend code. Users have no way to customize their display identity. The auth `signIn` callback sets `name`, `image`, and provider IDs on every sign-in, which would overwrite any custom values. The dashboard owner listing only shows names, making it harder to visually scan.

The `users` table already has an `image` column — no schema migration is needed.

## Goals / Non-Goals

**Goals:**
- Allow users to edit display name and avatar URL on the profile page
- Show avatar preview when entering an image URL (no file upload)
- Stop overwriting `name` and `image` on re-login (only link provider IDs)
- Remove friend code from the profile page
- Show user avatar in the dashboard OwnerSection
- Extend dashboard API to include the `image` field

**Non-Goals:**
- File/image upload (URL-based only)
- Email changes (always sourced from OAuth)
- Friend code editing or regeneration (stays in friends tab)

## Decisions

### D1: Client component for profile page
The profile page must become a client component (`"use client"`) to support form interactions, image preview, and toast notifications. The initial data is fetched via React Query (`GET /api/user/me`), and updates go through `PUT /api/user/me`.

**Alternative considered:** Keeping as server component with a separate client edit modal. Rejected because the whole page is small — a single client component is simpler and avoids prop drilling.

### D2: Stop overwriting name/image in auth signIn callback
The `signIn` callback currently inserts or updates the user row with `name` and `image` from the provider on every sign-in. This change splits the logic:
- On **insert** (new user): set `name`, `email`, `image`, provider ID, `friendCode`
- On **update** (existing user): only set the provider ID — never touch `name`, `email`, or `image`

This ensures customized display values survive re-login.

### D3: Image URL preview without upload
The image input is a text field for a URL. When the URL is non-empty, an `<Image>` component renders below it with `unoptimized` (since it may be an external URL). A validation check on submit ensures the URL is a valid HTTP/HTTPS URL.

### D4: Dashboard API — extend OwnerInfo with image
The dashboard API already constructs `OwnerInfo` objects. Adding `image: user.image` is a backwards-compatible change — existing clients ignore unknown fields. The `OwnerSection` component renders a small avatar next to the owner name when `image` is present.

## Risks / Trade-offs

- **[Risk] External image hosting may be slow or unavailable** → Mitigation: use `unoptimized` with `next/image`'s `onError` to hide broken images gracefully
- **[Risk] User enters invalid image URL** → Mitigation: client-side URL validation and fallback styling (no image shown)
- **[Risk] Profile data race** → Mitigation: invalidate `["/api/user/me"]` query after successful mutation so UI re-renders from server
