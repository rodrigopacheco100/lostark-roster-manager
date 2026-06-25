"use client"

import { Check, X } from "lucide-react"
import type { ToggleEntry } from "@/hooks/useRaidToggleQueue"

export function RaidCheckbox({
  raid,
  characterId,
  isOwner,
  enqueue,
}: {
  raid: { characterRaidId: string; raidDifficultyId: string; raidName: string; difficulty: string; completed: boolean }
  characterId: string
  isOwner: boolean
  enqueue: (entry: ToggleEntry) => void
}) {
  return (
    <button
      type="button"
      disabled={!isOwner}
      onClick={() => enqueue({ characterId, raidDifficultyId: raid.raidDifficultyId, completed: !raid.completed })}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
        raid.completed ? "bg-green-900/40 text-green-400" : "bg-surface-hover text-gray-400"
      } ${isOwner ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      {raid.completed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {raid.raidName} {raid.difficulty}
    </button>
  )
}
