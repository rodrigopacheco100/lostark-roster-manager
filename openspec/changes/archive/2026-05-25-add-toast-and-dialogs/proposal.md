## Why

The app currently uses native `confirm()` and `alert()` for user feedback and confirmations. These are jarring, unstyled, and inconsistent with the app's dark theme. A toast notification system provides non-blocking feedback for success/error messages, while a dialog component offers styled confirmation modals that match the app's design.

## What Changes

- Create a reusable `Toast` component with auto-dismiss and stacking support
- Create a reusable `ConfirmDialog` component for styled confirmations
- Create a `useToast` hook for easy toast management
- Replace all 9 `confirm()` calls across 5 files with `ConfirmDialog`
- Replace the single `alert()` call with a toast notification
- Add toast messages for user actions (friend request sent, group created, character deleted, etc.)

## Capabilities

### New Capabilities
- `toast-system`: Toast notification infrastructure — Toast component, useToast hook, auto-dismiss, stacking
- `confirm-dialog`: Confirmation dialog component replacing native confirm() with a styled modal

### Modified Capabilities

<!-- No existing capabilities are modified — this is a net-new UX feature -->

## Impact

- **New components**: `src/components/ui/Toast.tsx`, `src/components/ui/ConfirmDialog.tsx`
- **New hooks**: `src/hooks/useToast.ts`
- **Modified pages** (replace `confirm()`/`alert()` with dialogs/toasts):
  - `src/app/(dashboard)/groups/[id]/page.tsx` — 5 confirms + 1 alert
  - `src/app/(dashboard)/friends/page.tsx` — 1 confirm
  - `src/app/(dashboard)/rosters/[id]/page.tsx` — 1 confirm
  - `src/app/(dashboard)/raids/page.tsx` — 1 confirm
  - `src/app/(dashboard)/rosters/page.tsx` — 1 confirm
  - `src/app/(dashboard)/groups/page.tsx` — add toast on group created/joined
  - `src/app/(dashboard)/friends/page.tsx` — add toast on friend added/removed
