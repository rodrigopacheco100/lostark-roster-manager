## 1. CircularProgress Component

- [x] 1.1 Create `src/components/ui/CircularProgress.tsx` with SVG-based circular progress bar, including CSS `transition` on `stroke-dashoffset` for smooth animation
- [x] 1.2 Implement `getProgressColor()` helper that returns interpolated color: gray (0%) → red (1%) → yellow (50%) → green (100%)
- [x] 1.3 Export `CircularProgress` from `src/components/ui/index.ts`

## 2. Dashboard Page Cleanup

- [x] 2.1 Remove `PageHeader` import and usage from `src/app/(dashboard)/dashboard/page.tsx`
- [x] 2.2 Remove the subtitle `<p>` line ("Auto-refreshes every 60 seconds")
- [x] 2.3 Remove the global progress `Card` (horizontal bar + "Weekly Progress" + X/Y raids completed)
- [x] 2.4 Remove `Skeleton` import and skeleton loading for the progress card if no longer used elsewhere

## 3. OwnerSection Integration

- [x] 3.1 Import `CircularProgress` in `src/app/(dashboard)/dashboard/_compose/OwnerSection.tsx`
- [x] 3.2 Compute per-owner completion stats (total raids, completed raids, percentage) inside `OwnerSection`
- [x] 3.3 Render `CircularProgress` right-aligned in the collapse header button using `justify-between`
