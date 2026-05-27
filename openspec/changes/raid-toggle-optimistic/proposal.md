## Why

The dashboard raid completion toggle feels sluggish — each click waits for a server round-trip before updating the UI, and the full dashboard re-fetches on every toggle. With optimistic UI, the checkbox flips instantly, making the dashboard feel responsive. The server sync happens in the background with automatic rollback on error.

## What Changes

- **Optimistic update in RaidCheckbox**: When the user clicks a raid toggle, the `completed` state flips immediately in the local cache (no waiting for the server)
- **Rollback on error**: If the PATCH request fails, the toggle reverts to its previous state and an error toast is shown
- **Background invalidation**: After the mutation settles (success or failure), the dashboard query is invalidated to ensure eventual consistency with the server
- **Error toast only**: No loading/success toast for toggles — the instant visual feedback replaces the need for loading indicators. Only errors are reported.

## Capabilities

### New Capabilities
- `optimistic-raid-toggle`: Instant visual feedback on raid completion toggle with background server sync and automatic rollback

### Modified Capabilities

None — this is a UX improvement to the existing toggle interaction, not a behavioral spec change.

## Impact

- **UI**: `src/app/(dashboard)/dashboard/_compose/RaidCheckbox.tsx` — rewrite the mutation to use optimistic update pattern (`onMutate`/`onError`/`onSettled` with `queryClient.setQueryData`)
- **Dependencies**: No new dependencies — `useQueryClient` and `useToast` are already available in the project
- **Cache structure**: The mutation directly mutates the `["dashboard"]` query cache via `structuredClone` + targeted update, then invalidates on settle
