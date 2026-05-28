## 1. Layout Change in OwnerSection

- [x] 1.1 Replace roster container classes: change `space-y-3 pl-1` to `flex flex-wrap gap-3`
- [x] 1.2 Add responsive width classes to each roster card `<div>`: add `w-full sm:min-w-[320px] sm:flex-1`

## 2. Verification

- [x] 2.1 Verify rosters display side-by-side on viewports wider than 768px
- [x] 2.2 Verify rosters collapse to single column on viewports narrower than 768px
- [x] 2.3 Verify all interactions still work (raid toggles, owner collapse/expand, avatar loading)
- [x] 2.4 Verify no horizontal overflow on narrow viewports
