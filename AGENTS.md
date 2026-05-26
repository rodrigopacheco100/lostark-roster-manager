# Lost Ark Tools - Project Context

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite via Drizzle ORM
- **Auth**: NextAuth v5
- **Data Fetching**: @tanstack/react-query v5 (useQuery for reads, useMutation for writes)
- **HTTP Client**: axios (shared fetcher in `src/lib/api.ts`)
- **Styling**: Tailwind CSS with dark theme
- **UI**: react-hot-toast (toasts), custom Modal/ConfirmDialog components
- **Form Validation**: react-hook-form + @hookform/resolvers + zod (installed, not yet in use)

## Architecture
- `/src/app/api/` — Next.js API route handlers (groups, friends, rosters, raids, dashboard, auth)
- `/src/app/(dashboard)/` — Authenticated page components (groups, friends, rosters, raids, dashboard)
- `/src/lib/` — Shared utilities (`api.ts` with fetcher, `queries.ts` with DB query functions)
- `/src/hooks/` — React hooks (`useToast.ts`, `useConfirm.ts`)

## Key Conventions
- All user-facing text in English (UI, toasts, confirm dialogs, API errors)
- Mutations use `useMutation` + `toast.promise(mutateAsync(...))` (Option B)
- Detail pages use `retry: false` + `useEffect` for error toast + redirect
- Query invalidation via `useQueryClient().invalidateQueries()`
- Dashboard layout: `h-screen overflow-hidden` container, fixed sidebar, scrollable `<main>`
- Error messages extracted from `error.response.data.error` (axios)
- HTTP calls via generic `http` object (`http.get`, `http.post`, `http.put`, `http.patch`, `http.delete`) from `src/lib/api.ts`

## Completed Changes
### add-toast-and-dialogs (archived)
Toast system (react-hot-toast), confirm dialog (promise-based), replaced all native confirm/alert calls.

### data-fetching-and-ux (active, complete)
- SWR → React Query migration across all 7 pages
- Generic `http` client in `src/lib/api.ts` (get/post/put/patch/delete via axios)
- Mutation standardization with useMutation + toast.promise
- English translation of all UI text
- Dashboard layout fix (fixed sidebar, scrollable content)

## Next Steps
- Implement react-hook-form + zod validation on forms
- Add loading skeletons / spinners

## Existing OpenSpec Specs
- `openspec/specs/confirm-dialog/` — Confirm dialog capability
- `openspec/specs/toast-system/` — Toast notification capability
