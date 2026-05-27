"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import type { ToggleEntry } from "@/hooks/useRaidToggleQueue"
import type { OwnerRosters } from "../_types"
import { RosterSection } from "./RosterSection"

export function OwnerSection({ group, enqueue }: { group: OwnerRosters; enqueue: (entry: ToggleEntry) => void }) {
  const [collapsed, setCollapsed] = useState(true)
  const isOwner = group.owner.isMe

  const raidGroups = useMemo(() => {
    const groups = new Map<string, { raidName: string; difficulty: string; total: number; completed: number }>()
    for (const roster of group.rosters) {
      for (const char of roster.characters) {
        for (const r of char.raids) {
          const key = `${r.raidName}::${r.difficulty}`
          const existing = groups.get(key) ?? { raidName: r.raidName, difficulty: r.difficulty, total: 0, completed: 0 }
          existing.total++
          if (r.completed) existing.completed++
          groups.set(key, existing)
        }
      }
    }
    return Array.from(groups.values())
  }, [group.rosters])

  return (
    <div>
      <button type="button" onClick={() => setCollapsed(!collapsed)} className="mb-2 flex w-full items-center gap-2">
        {collapsed ? (
          <ChevronRight className="h-5 w-5 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 shrink-0" />
        )}
        <h2 className="text-xl font-semibold text-gray-100">
          {group.owner.name}
          {group.owner.groups && group.owner.groups.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">({group.owner.groups.join(", ")})</span>
          )}
        </h2>
      </button>
      <div className="mb-3 flex flex-wrap gap-1 pl-7">
        {raidGroups.map((g) => (
          <span
            key={`${g.raidName}::${g.difficulty}`}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              g.completed === g.total ? "bg-green-900/40 text-green-400" : "bg-surface-hover text-gray-400"
            }`}
          >
            {g.completed}/{g.total} {g.raidName} ({g.difficulty})
          </span>
        ))}
      </div>
      {!collapsed && (
        <div className="space-y-4 pl-1">
          {group.rosters.map((roster) => (
            <RosterSection key={roster.rosterId} roster={roster} isOwner={isOwner} enqueue={enqueue} />
          ))}
        </div>
      )}
    </div>
  )
}
