"use client"

import { useMutation } from "@tanstack/react-query"
import { Check, X } from "lucide-react"
import { httpClient } from "@/lib/api"
import type { CharacterRaidData } from "../_types"

export function RaidCheckbox({
  raid,
  characterId,
  isOwner,
  onToggle,
}: {
  raid: CharacterRaidData
  characterId: string
  isOwner: boolean
  onToggle: () => void
}) {
  const { mutate, isPending } = useMutation({
    mutationFn: ({ raidDifficultyId, completed }: { raidDifficultyId: string; completed: boolean }) =>
      httpClient.patch(`/api/characters/${characterId}/raids`, { raidDifficultyId, completed }),
    onSuccess: () => onToggle(),
  })

  return (
    <button
      type="button"
      disabled={!isOwner || isPending}
      onClick={() => mutate({ raidDifficultyId: raid.raidDifficultyId, completed: !raid.completed })}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${raid.completed ? "bg-green-900/40 text-green-400" : "bg-surface-hover text-gray-400"
        } ${isOwner ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      {raid.completed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {raid.raidName} ({raid.difficulty})
    </button>
  )
}
