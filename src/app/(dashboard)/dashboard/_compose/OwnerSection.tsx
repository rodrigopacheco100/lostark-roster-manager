"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useMemo, useRef, useState } from "react"
import { mappedIconsByClass } from "@/assets/classes"
import { Table } from "@/components/ui"
import type { ToggleEntry } from "@/hooks/useRaidToggleQueue"
import type { OwnerRosters } from "../_types"
import { RaidCheckbox } from "./RaidCheckbox"
import { RosterDivider } from "./RosterDivider"

export function OwnerSection({ group, enqueue }: { group: OwnerRosters; enqueue: (entry: ToggleEntry) => void }) {
  const [collapsed, setCollapsed] = useState(true)
  const isOwner = group.owner.isMe
  const [avatarError, setAvatarError] = useState(false)
  const prevImageRef = useRef(group.owner.image)
  if (prevImageRef.current !== group.owner.image) {
    prevImageRef.current = group.owner.image
    setAvatarError(false)
  }

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
    <div className="rounded-lg border border-gray-800 bg-surface p-3">
      <button type="button" onClick={() => setCollapsed(!collapsed)} className="mb-2 flex w-full items-center gap-2">
        {collapsed ? (
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" />
        )}
        {group.owner.image && !avatarError ? (
          <Image
            src={group.owner.image}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full object-cover"
            unoptimized
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-medium text-gray-500">
            {group.owner.name[0]?.toUpperCase() ?? "?"}
          </span>
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
            {g.completed}/{g.total} {g.raidName} {g.difficulty}
          </span>
        ))}
      </div>
      {!collapsed && (
        <div className="flex flex-wrap gap-3">
          {group.rosters.map((roster) => (
            <div key={roster.rosterId} className="w-full sm:min-w-[620px] sm:flex-1 rounded-lg border border-gray-800 bg-surface-elevated">
              <RosterDivider name={roster.rosterName} characterCount={roster.totalCharacters} />
              <div className="pb-2">
                <Table.Root>
                  <Table.Head>
                    <Table.Row>
                      <Table.Header className="w-[1%] whitespace-nowrap">Name</Table.Header>
                      <Table.Header className="w-[1%] whitespace-nowrap">ilvl</Table.Header>
                      <Table.Header>Raids</Table.Header>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {roster.characters.map((char) => {
                      return (
                        <Table.Row key={char.id}>
                          <Table.Cell className="w-[1%] whitespace-nowrap">
                            <span className="inline-flex items-center gap-2 font-medium text-gray-200">
                              {(() => {
                                const Icon = mappedIconsByClass[char.class]
                                return Icon ? (
                                  <Icon width={18} height={18} className="shrink-0 text-gray-400" />
                                ) : (
                                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] text-gray-500">
                                    {char.class[0]}
                                  </span>
                                )
                              })()}
                              {char.name}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="w-[1%] whitespace-nowrap text-gray-500">{char.itemLevel}</Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-1">
                              {char.raids.map((r, i) => (
                                <RaidCheckbox
                                  key={r.characterRaidId ?? i}
                                  raid={r}
                                  characterId={char.id}
                                  isOwner={isOwner}
                                  enqueue={enqueue}
                                />
                              ))}
                              {char.raids.length === 0 && (
                                <span className="text-xs text-gray-600">No raids assigned</span>
                              )}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
