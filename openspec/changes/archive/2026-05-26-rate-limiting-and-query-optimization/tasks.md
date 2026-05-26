## 1. Implement Rate Limiter

- [x] 1.1 Create `src/lib/rate-limit.ts` with in-memory sliding window Map
- [x] 1.2 Add identifier logic: userId (authenticated) or IP (anonymous)
- [x] 1.3 Integrate rate limiter into `src/proxy.ts` before route handler
- [x] 1.4 Return 429 JSON response with `Retry-After` header when limit exceeded
- [x] 1.5 Handle rate limit errors in `src/lib/api.ts` http client

## 2. Optimize React Query Configuration

- [x] 2.1 Update `src/app/providers.tsx` with global defaults (staleTime: 30s, gcTime: 5min, retry: 2)
- [x] 2.2 Update Dashboard page query: add staleTime 30s, keep refetchInterval 60s
- [x] 2.3 Update friends page query: add staleTime 60s, remove refetchInterval
- [x] 2.4 Update groups list page query: add staleTime 60s, remove refetchInterval
- [x] 2.5 Update rosters list page query: add staleTime 60s, remove refetchInterval
- [x] 2.6 Update groups detail page query: add staleTime 30s
- [x] 2.7 Update rosters detail page query: add staleTime 30s

## 3. Verification

- [x] 3.1 Run `pnpm run typecheck` and fix any errors
- [x] 3.2 Run `pnpm run lint` and fix any errors
- [x] 3.3 Run `pnpm run build` and verify clean build
- [x] 3.4 Smoke-test dev server and verify no 429 false positives on normal navigation
