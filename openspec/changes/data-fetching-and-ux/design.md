## Context

The app used two data-fetching libraries (SWR and @tanstack/react-query). @tanstack/react-query was already installed and used for a handful of queries, while SWR handled the majority. Mutations used either raw `fetch()` or a `handleAction()` wrapper with inconsistent error handling and toast feedback. The API client was duplicated across per-page fetcher functions. All user-facing text was in Portuguese, and the dashboard layout scrolled the entire page including the sidebar.

## Goals / Non-Goals

**Goals:**
- Single data-fetching library: @tanstack/react-query with `useQuery`
- Consistent mutation pattern: `useMutation` + `toast.promise(mutateAsync(...))`
- Shared API client in `src/lib/api.ts` using axios
- English-only UI across all pages, components, toasts, confirm dialogs, and API errors
- Dashboard layout: fixed sidebar, only content area scrolls

**Non-Goals:**
- Server-side data fetching or SSR patterns
- Internationalization (i18n) framework — English-only is sufficient
- Migration to a different HTTP client (fetch → axios is the only change)
- CSS framework changes — all layout uses existing Tailwind classes

## Decisions

### SWR → React Query
- @tanstack/react-query v5 was already a dependency with broader ecosystem support (devtools, mutations, query invalidation)
- `queryKey` array replaces SWR string keys; `useQueryClient().invalidateQueries()` replaces `mutate()`
- `retry: false` on detail pages to avoid retrying on 403/404 (redirect instead)
- `useEffect` + toast + `router.push()` for error handling on detail pages

### Mutation Pattern (Option B)
- `useMutation` for the mutation lifecycle, `toast.promise(mutateAsync(...))` for the loading→success/error transition
- `onSuccess` callback invalidates related query keys to refresh cached data
- `useConfirm` (promise-based) replaces native `confirm()` before destructive actions

### Axios API Client
- One shared `fetcher<T>` in `src/lib/api.ts` instead of per-page fetcher functions
- Error messages extracted from `error.response.data.error` (API returns `{ error: string }`)
- Axios interceptors not needed — simple wrapper is sufficient for this app's needs

### English Translation
- All Portuguese UI strings replaced inline (no i18n library) — English is the only supported language
- API error messages also standardized to English at the source
- Confirm dialog defaults changed from "Cancelar"/"Confirmar" to "Cancel"/"Confirm"

### Dashboard Layout
- `h-screen overflow-hidden` on the dashboard container prevents body scroll
- Sidebar uses `h-screen` to fill viewport height
- `<main>` uses `overflow-y-auto` to scroll only the content area
- Pure CSS solution — no JS scroll detection needed

## Risks / Trade-offs

- **No i18n infrastructure**: Adding a new language later would require extracting all strings. Acceptable since English-only is the current requirement.
- **No axios interceptors**: If auth token refresh or request logging becomes needed, interceptors must be added later. Simple wrapper keeps things minimal for now.
- **toast.promise pattern**: Two-step pattern (useMutation + toast.promise) is slightly more verbose than a single hook, but provides better loading state UX.
