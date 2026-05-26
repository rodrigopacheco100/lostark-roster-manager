## 1. Fix params Promise in group detail page

- [x] 1.1 Add `useParams` to the `next/navigation` import
- [x] 1.2 Remove `params` from the component signature (change to `export default function GroupDetailPage()`)
- [x] 1.3 Add `const params = useParams()` and `const groupId = params.id as string` at the top of the component body
- [x] 1.4 Replace all 16 `params.id` references with `groupId` throughout the component
- [x] 1.5 Verify the fix by running TypeScript check (no errors)
