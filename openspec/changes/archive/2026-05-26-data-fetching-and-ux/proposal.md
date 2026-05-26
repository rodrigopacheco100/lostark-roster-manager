## Why

The app had inconsistent data-fetching patterns (SWR + @tanstack/react-query), ad-hoc mutation logic with raw `fetch()` calls, Portuguese UI text mixed with English, and a dashboard layout that scrolled the entire page instead of only the content area. Consolidating these patterns reduces technical debt, improves UX consistency, and makes the codebase easier to maintain.

## What Changes

- Migrate all pages from SWR to @tanstack/react-query's `useQuery`
- Remove `swr` package from dependencies
- Standardize all mutations using `useMutation` + `toast.promise(mutateAsync(...))`
- Create a generic `http` client in `src/lib/api.ts` using axios with get/post/put/patch/delete methods (replacing per-page fetchers)
- Translate all user-facing text from Portuguese to English (UI labels, toasts, confirm dialogs, API error messages)
- Fix dashboard layout to use `h-screen overflow-hidden` with fixed sidebar and scrollable content area
- Fix `api.ts` error messages from Portuguese to English

## Capabilities

### New Capabilities
- `data-fetching`: Data fetching infrastructure using @tanstack/react-query's `useQuery` hook across all pages
- `mutation-pattern`: Standardized mutation pattern using `useMutation` + `toast.promise(mutateAsync(...))`
- `http-client`: Generic HTTP client in `src/lib/api.ts` using axios with get/post/put/patch/delete methods and error extraction from `response.data.error`
- `i18n-english`: English-only UI — all user-facing text translated to English
- `dashboard-layout`: Dashboard layout with fixed sidebar and scrollable main content area

### Modified Capabilities

<!-- No existing capabilities modified — all are new additions -->

## Impact

- **Removed dependency**: `swr` from package.json
- **Modified 7 page files**: All pages under `src/app/(dashboard)/` updated to use `useQuery` and `useMutation`
- **New file**: `src/lib/api.ts` — generic `http` client using axios (get/post/put/patch/delete)
- **Added dependency**: `axios` to package.json
- **Modified 9 files**: UI text translated to English across groups, friends, rosters, raids, sidebar, useConfirm
- **Modified layout**: `src/app/(dashboard)/layout.tsx` — `h-screen overflow-hidden` + `overflow-y-auto` on `<main>`
- **Modified API routes**: Error messages in API routes standardized to English
