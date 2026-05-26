## 1. Remove Raid CRUD UI Page

- [x] 1.1 Delete `src/app/(dashboard)/raids/` directory and all its contents

## 2. Remove Raid CRUD API Routes

- [x] 2.1 Strip CRUD endpoints from `src/app/api/raids/route.ts` — remove `POST` and `DELETE` handlers, keep only `GET`
- [x] 2.2 Delete `src/app/api/raids/difficulties/route.ts`

## 3. Remove Sidebar Navigation Link

- [x] 3.1 Remove the "Raids" link entry from `src/components/Sidebar.tsx`

## 4. Verify

- [x] 4.1 Run `pnpm run build` to confirm no compilation errors
- [x] 4.2 Confirm `GET /api/raids` still works (visible in build output)
- [x] 4.3 Confirm `/raids` no longer in route listing (returns 404)
