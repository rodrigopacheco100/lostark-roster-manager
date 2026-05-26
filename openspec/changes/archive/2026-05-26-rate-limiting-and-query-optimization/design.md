## Context

The project uses Next.js 16 with the proxy convention for middleware. All API routes at `/api/*` are unprotected from abuse — no request caps, no sliding windows, no retry limits. React Query is used across 7 pages but only the Dashboard page sets `refetchInterval` (60s); all other queries use defaults (infinite stale-time, no caching). This wastes bandwidth, especially on pages like friends/groups that rarely change.

## Goals / Non-Goals

**Goals:**
- Server-side rate limiting on all `/api/*` routes with configurable limits
- Global React Query defaults for reasonable stale/cache times
- Per-page query optimization to minimize network requests
- Exponential backoff for mutation retries
- Graceful UX when rate-limited (toast message)

**Non-Goals:**
- Rate limiting on static assets, auth pages, or Next.js internals
- Persistent rate limit state across server restarts (in-memory is fine)
- Client-side request throttling (we rely on React Query dedup)
- IP-based blocking or CAPTCHA integration

## Decisions

1. **In-memory sliding window via `Map` with timestamps** — No external dependency (Redis, Upstash). Simple `Map<string, number[]>` that stores timestamps per identifier (IP or userId). Old entries pruned on each check. Good enough for single-instance Next.js; can swap for Redis later.

2. **Rate limit in proxy.ts** — The Next.js proxy (formerly middleware) runs before every request. We check limits there and return 429 before the route handler fires. This protects all API routes uniformly.

3. **Identifier: authenticated userId when available, IP fallback** — Authenticated users get higher limits. Anonymous requests use the IP from `request.headers.get("x-forwarded-for")` with lower limits.

4. **Global React Query defaults in Providers** — `staleTime: 30_000` (30s), `gcTime: 300_000` (5min), `retry: 2` with exponential backoff. This reduces refetches while keeping data reasonably fresh.

5. **Per-page overrides** — Dashboard (auto-refetch 60s) keeps its interval but adds `staleTime: 30_000`. Static pages (friends, groups, rosters) get `staleTime: 60_000` and no interval.

## Risks / Trade-offs

- **In-memory state lost on restart** — Acceptable for local dev; production would use Redis.
- **Proxy overhead** — Rate limit check adds ~0.1ms per request. Negligible.
- **Rate limit false positives** — Aggressive limits could block legitimate users. Mitigation: generous defaults (100 req/min authenticated, 20 req/min anonymous).
- **React Query staleTime too high** — Users may see stale data. Mitigation: Dashboard keeps 60s refetch, mutation invalidation ensures fresh data after writes.
