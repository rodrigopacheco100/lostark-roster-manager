## 1. Flush Success Path

- [x] 1.1 In `src/hooks/useRaidToggleQueue.ts`, change `queryClient.invalidateQueries(...)` to `await queryClient.invalidateQueries(...)` in the flush success path
- [x] 1.2 After the await, iterate over `queueRef.current.values()` and re-apply each pending entry's optimistic state via `queryClient.setQueryData` using `flipInCache`
- [x] 1.3 Move `isTogglingRef.current = false` to after the re-apply step
