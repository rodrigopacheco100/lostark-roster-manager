"use client"

import { GripVertical, Plus, RefreshCw, Upload } from "lucide-react"
import { Button, Input } from "@/components/ui"
import type { Roster } from "../_types"

const COOLDOWN_KEY = "ags:ilvl-sync:last-sync-ts"
const COOLDOWN_MS = 60 * 60 * 1000

export function getCooldownRemaining(): number {
  const stored = localStorage.getItem(COOLDOWN_KEY)
  if (!stored) return 0
  const elapsed = Date.now() - new Date(stored).getTime()
  return Math.max(0, COOLDOWN_MS - elapsed)
}

export function formatCountdown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

interface Props {
  newName: string
  onNewNameChange: (value: string) => void
  onCreate: (e: React.FormEvent) => Promise<void>
  onImportOpen: () => void
  hasLinkedRosters: boolean
  syncPending: boolean
  cooldownRemaining: number
  onSync: () => Promise<void>
  rosters: Roster[] | undefined
  isReordering: boolean
  onToggleReorder: () => void
}

export function RosterToolbar({
  newName,
  onNewNameChange,
  onCreate,
  onImportOpen,
  hasLinkedRosters,
  syncPending,
  cooldownRemaining,
  onSync,
  rosters,
  isReordering,
  onToggleReorder,
}: Props) {
  return (
    <>
      <form onSubmit={onCreate} className="mb-2 flex gap-2">
        <Input
          type="text"
          value={newName}
          onChange={(e) => onNewNameChange(e.target.value)}
          placeholder="New roster name"
          className="flex-1"
        />
        <Button type="submit" icon={<Plus className="h-4 w-4" />}>
          Create
        </Button>
        <Button type="button" variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={onImportOpen}>
          Import
        </Button>
        {hasLinkedRosters && (
          <Button
            type="button"
            variant="secondary"
            icon={<RefreshCw className={`h-4 w-4 ${syncPending ? "animate-spin" : ""}`} />}
            onClick={onSync}
            disabled={syncPending || cooldownRemaining > 0}
          >
            {cooldownRemaining > 0
              ? `Sync ilvl (${formatCountdown(cooldownRemaining)})`
              : syncPending
                ? "Syncing..."
                : "Sync ilvl"}
          </Button>
        )}
      </form>
      {rosters && rosters.length > 0 && (
        <div className="mb-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleReorder}
            disabled={isReordering}
            icon={<GripVertical className="h-4 w-4" />}
          >
            Reorder
          </Button>
        </div>
      )}
    </>
  )
}
