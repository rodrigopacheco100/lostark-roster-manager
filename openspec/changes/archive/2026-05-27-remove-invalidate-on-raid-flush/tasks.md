## 1. Simplify flush success path

- [x] 1.1 Remove `invalidateQueries` call from the flush success path in `src/hooks/useRaidToggleQueue.ts`
- [x] 1.2 Remove the re-apply loop that iterated over `queueRef.current` after invalidate
- [x] 1.3 Keep `isTogglingRef.current = false` as the only cleanup in the success path
