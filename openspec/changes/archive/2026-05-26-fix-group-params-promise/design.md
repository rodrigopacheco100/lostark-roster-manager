## Context

The group detail page at `src/app/(dashboard)/groups/[id]/page.tsx` is a Client Component (`"use client"`) that receives `params` as a prop. In Next.js 16, `params` and `searchParams` in page/layout components are Promises — accessing properties synchronously throws a runtime error.

Since the component uses hooks (`useQuery`, `useEffect`, `useState`), it cannot be made `async`. The fix is to use React's `use()` hook to unwrap the Promise at the top of the component.

## Goals / Non-Goals

**Goals:**
- Fix the `params` Promise error on the group detail page
- Keep the page as a Client Component (no architecture refactor)

**Non-Goals:**
- Fixing other pages that may have the same issue (out of scope)

## Decisions

- **Use `useParams()` from `next/navigation`** — Already the established pattern in this codebase (rosters detail page). Simpler than `React.use()` because it avoids passing `params` as a prop entirely. The component signature changes from `function GroupDetailPage({ params })` to `function GroupDetailPage()` and uses `const params = useParams()` internally.
- **Extract to a typed variable** — `const groupId = params.id as string` at the top of the component, then use `groupId` everywhere. Consistent with `rosters/[id]/page.tsx`.
- **No TypeScript type to update** on the component signature — `useParams()` returns `ReadonlyURLSearchParams | null`, so we cast with `as string`.

## Risks / Trade-offs

- No risks — this pattern is already proven in the rosters page. No architectural changes needed.
