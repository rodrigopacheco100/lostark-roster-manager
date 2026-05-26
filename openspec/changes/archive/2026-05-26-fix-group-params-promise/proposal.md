## Why

Next.js 16 made `params` a Promise in page components. The group detail page at `groups/[id]/page.tsx` accesses `params.id` synchronously, causing a runtime error: "params is a Promise and must be unwrapped with `React.use()` before accessing its properties."

## What Changes

- Migrate `GroupDetailPage` from `params` prop to `useParams()` hook from `next/navigation` (consistent with `rosters/[id]/page.tsx`)
- Remove `params` from the component signature and use `const params = useParams()` instead
- Replace all `params.id` references with the extracted `groupId` variable

## Capabilities

### New Capabilities

No new capabilities — this is a compatibility fix.

### Modified Capabilities

No existing capabilities are changing at the spec level — this is an implementation fix only.

## Impact

- `src/app/(dashboard)/groups/[id]/page.tsx` — modified (only broken file found in full codebase audit)

All 13 route handlers already use `await params` correctly. `rosters/[id]/page.tsx` already uses `useParams()`. No other files affected.
