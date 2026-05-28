## Why

The current profile page is a read-only view that displays OAuth provider data (name, image) and the friend code. Users cannot customize their display name or avatar URL. Additionally, the friend code is shown on the profile page but functionally only matters in the friends tab, creating redundancy. The dashboard owner listing lacks avatars, making it harder to visually identify users at a glance.

## What Changes

- **Profile editing**: Users can edit their display name and avatar image URL from the profile page
- **Avatar URL with preview**: Image input shows a live preview of the entered URL; no file upload
- **First-access creation only**: User data (name, image) is set only on account creation, never overwritten on subsequent logins — only OAuth account linking occurs
- **OAuth linking**: When logging in with a different provider, only link the provider ID — do not overwrite editable profile fields
- **Friend code removed from profile**: Friend code section removed from the profile page; it stays in the friends tab where it belongs
- **Dashboard avatar**: `OwnerInfo` type extended with `image`, dashboard API returns image URL, and `OwnerSection` renders the avatar next to the owner name

## Capabilities

### New Capabilities
- `profile-editing`: Allow users to edit their display name and avatar URL with live image preview on the profile page

### Modified Capabilities
- `dashboard-layout`: OwnerSection now shows user avatar next to the owner name
- `data-fetching`: Dashboard API response schema extended with `image` field in OwnerInfo

## Impact

- **Schema**: No DB schema changes — `image` column already exists on `users` table
- **API**: New `PUT /api/user/me` endpoint for updating name/image; `GET /api/dashboard` response extended with `image` field in owner info
- **Auth**: `signIn` callback in `src/lib/auth.ts` stops overwriting `name` and `image` on re-login (only links provider ID)
- **Profile page**: Server component → client component (for edit interactions); friend code section removed
- **Dashboard**: `OwnerInfo` type gains optional `image`; `OwnerSection` renders avatar
- **Friends page**: Friend code display remains unchanged
