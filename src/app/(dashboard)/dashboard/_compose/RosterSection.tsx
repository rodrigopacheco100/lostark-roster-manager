"use client"

import { useState, useMemo } from "react"
import { Card, Badge } from "@/components/ui"
import { Swords, ChevronDown, ChevronRight } from "lucide-react"
import { RaidCheckbox } from "./RaidCheckbox"
import type { RosterData } from "../_types"

export function RosterSection({
  roster,
  isOwner,
  onToggle,
}: {
  roster: RosterData
  isOwner: boolean
  onToggle: () => void
}) {
  const [collapsed, setCollapsed] = useState(true)

  const raidGroups = useMemo(() => {
    const groups = new Map<string, { raidName: string; difficulty: string; total: number; completed: number }>()
    for (const char of roster.characters) {
      for (const r of char.raids) {
        const key = `${r.raidName}::${r.difficulty}`
        const existing = groups.get(key) ?? { raidName: r.raidName, difficulty: r.difficulty, total: 0, completed: 0 }
        existing.total++
        if (r.completed) existing.completed++
        groups.set(key, existing)
      }
    }
    return Array.from(groups.values())
  }, [roster.characters])

  return (
    <Card>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="mb-3 flex w-full items-center gap-2"
      >
        {collapsed ? <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />}
        <h3 className="font-medium text-gray-100">{roster.rosterName}</h3>
        <span className="text-sm text-gray-500 ml-auto">{roster.totalCharacters} chars</span>
      </button>

      <div className="mb-3 flex flex-wrap gap-1">
        {raidGroups.map((g) => (
          <span
            key={`${g.raidName}::${g.difficulty}`}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              g.completed === g.total
                ? "bg-green-900/40 text-green-400"
                : "bg-surface-hover text-gray-400"
            }`}
          >
            {g.completed}/{g.total} {g.raidName} ({g.difficulty})
          </span>
        ))}
      </div>

      {!collapsed && (
        <div className="space-y-2">
          {roster.characters.map((char) => {
            const charCompletedRaids = char.raids.filter((r) => r.completed).length
            return (
              <div key={char.id} className="rounded-lg bg-surface-hover p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-200">{char.name}</span>
                  <Badge color="gray">{char.class}</Badge>
                  <span className="text-gray-500">IL {char.itemLevel}</span>
                  {char.raids.length > 0 && (
                    <span className="ml-auto text-xs text-gray-500">
                      {charCompletedRaids}/{char.raids.length}
                    </span>
                  )}
                </div>
                {char.raids.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Swords className="mr-0.5 h-3.5 w-3.5 text-gray-500 self-center" />
                    {char.raids.map((r, i) => (
                      <RaidCheckbox
                        key={r.characterRaidId ?? i}
                        raid={r}
                        characterId={char.id}
                        isOwner={isOwner}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
