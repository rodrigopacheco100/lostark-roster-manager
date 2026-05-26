## Why

The API routes have no rate limiting, making the app vulnerable to DDOS and brute-force attacks. Additionally, React Query pages like Dashboard auto-refetch every 60s unconditionally, and several pages fetch data without caching/stale-time optimizations, wasting bandwidth and degrading UX.

## What Changes

- Add a server-side rate limiter middleware for all `/api/*` routes (configurable limits per window)
- Optimize React Query queries with appropriate `staleTime`, `gcTime`, and `refetchInterval` to reduce unnecessary network requests
- Add deduplication and request batching where applicable
- Implement exponential backoff for mutation retries

## Capabilities

### New Capabilities
- `api-rate-limiter`: Server-side rate limiting for API routes to prevent abuse and DDOS
- `query-optimization`: Tune React Query configuration to reduce bandwidth and improve performance

### Modified Capabilities
- *(none — existing specs don't cover performance or security)*

## Impact

- `src/lib/api.ts` — add rate limit error handling
- `src/lib/auth.ts` or new `src/lib/rate-limit.ts` — rate limiter implementation
- All page components using `useQuery` — update query options (staleTime, gcTime, refetchInterval)
- `src/app/providers.tsx` — configure global React Query defaults
- `src/middleware.ts` → `src/proxy.ts` already — add rate limit check in proxy
- Potentially add `@upstash/ratelimit` (or in-memory alternative) as dependency
