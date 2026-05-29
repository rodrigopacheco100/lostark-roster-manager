export function getCurrentWeeklyWindow(): { startMs: number; endMs: number } {
  const now = new Date()

  const dayOfWeek = now.getUTCDay()
  const daysSinceWednesday = dayOfWeek >= 3 ? dayOfWeek - 3 : dayOfWeek + 4

  const wednesday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceWednesday, 7, 0, 0, 0),
  )

  const nextWednesday = new Date(wednesday)
  nextWednesday.setUTCDate(nextWednesday.getUTCDate() + 7)

  return {
    startMs: wednesday.getTime(),
    endMs: nextWednesday.getTime(),
  }
}
