const store = new Map<string, number[]>()

const WINDOW_MS = 60_000
const AUTH_LIMIT = 100
const ANON_LIMIT = 20

function prune(timestamps: number[]): number[] {
  const cutoff = Date.now() - WINDOW_MS
  return timestamps.filter((t) => t > cutoff)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfter: number | null
}

export function checkRateLimit(userId: string | null): RateLimitResult {
  const key = userId ?? "anon"
  const limit = userId ? AUTH_LIMIT : ANON_LIMIT

  let timestamps = store.get(key) ?? []
  timestamps = prune(timestamps)

  if (timestamps.length >= limit) {
    const retryAfter = Math.ceil((timestamps[0] + WINDOW_MS - Date.now()) / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }

  timestamps.push(Date.now())
  store.set(key, timestamps)
  return { allowed: true, remaining: limit - timestamps.length, retryAfter: null }
}
