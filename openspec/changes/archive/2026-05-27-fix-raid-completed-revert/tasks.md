## 1. Toggle Queue Flag

- [x] 1.1 Add `export const isTogglingRef = { current: false }` at module scope in `src/hooks/useRaidToggleQueue.ts`
- [x] 1.2 Set `isTogglingRef.current = true` at the start of the `enqueue` callback (after the `queueRef.current.size === 0` guard)
- [x] 1.3 Set `isTogglingRef.current = false` in the `flush` callback after `invalidateQueries` succeeds (inside the try block), and also in the catch block after restoring the snapshot

## 2. Dashboard Query

- [x] 2.1 Import `isTogglingRef` in `src/app/(dashboard)/dashboard/page.tsx`
- [x] 2.2 Change `refetchInterval: 20000` to a function: `refetchInterval: () => (isTogglingRef.current ? false : 20000)`
