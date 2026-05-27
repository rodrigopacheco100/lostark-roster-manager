"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

type RaidDifficulty = { id: string; difficulty: string; minIlvl: number }
type Raid = { id: string; name: string; difficulties: RaidDifficulty[] }
type CharacterRaid = { id: string; raidDifficulty: RaidDifficulty & { raid: Pick<Raid, "id" | "name"> } }
type Character = { id: string; name: string; class: string; itemLevel: number; characterRaids: CharacterRaid[] }

interface RaidComboboxProps {
  character: Character
  allRaids: Raid[]
  rosterId: string
  onClose: () => void
}

export function RaidCombobox({ character, allRaids, rosterId, onClose }: RaidComboboxProps) {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const [isPopoverOpen, setIsPopoverOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    return new Set(character.characterRaids.map((cr) => cr.raidDifficulty.id))
  })
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedCount = checkedIds.size
  const maxReached = selectedCount >= 3

  const syncMutation = useMutation({
    mutationFn: (ids: string[]) =>
      httpClient.put<{ added: number; removed: number }>(`/api/characters/${character.id}/raids`, {
        raidDifficultyIds: ids,
      }),
  })

  useEffect(() => {
    if (isPopoverOpen) {
      const timer = setTimeout(() => searchRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isPopoverOpen])

  useEffect(() => {
    if (!isPopoverOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsPopoverOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsPopoverOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isPopoverOpen])

  const filteredRaids = useMemo(() => {
    if (!searchQuery.trim()) return allRaids
    const q = searchQuery.toLowerCase()
    return allRaids
      .map((raid) => ({
        ...raid,
        difficulties: raid.difficulties.filter(
          (rd) => raid.name.toLowerCase().includes(q) || rd.difficulty.toLowerCase().includes(q),
        ),
      }))
      .filter((raid) => raid.difficulties.length > 0 || raid.name.toLowerCase().includes(q))
  }, [allRaids, searchQuery])

  function getRaidIdForDifficulty(difficultyId: string): string | undefined {
    for (const raid of allRaids) {
      for (const rd of raid.difficulties) {
        if (rd.id === difficultyId) return raid.id
      }
    }
    return undefined
  }

  function isDuplicateRaidGroup(difficultyId: string): boolean {
    const targetRaidId = getRaidIdForDifficulty(difficultyId)
    if (!targetRaidId) return false
    return Array.from(checkedIds).some((cid) => {
      if (cid === difficultyId) return false
      return getRaidIdForDifficulty(cid) === targetRaidId
    })
  }

  function getChipLabel(difficultyId: string): string {
    for (const raid of allRaids) {
      for (const rd of raid.difficulties) {
        if (rd.id === difficultyId) return `${raid.name} (${rd.difficulty})`
      }
    }
    return difficultyId
  }

  function toggleCheck(difficultyId: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(difficultyId)) {
        next.delete(difficultyId)
      } else {
        if (next.size >= 3) return prev
        if (isDuplicateRaidGroup(difficultyId)) return prev
        next.add(difficultyId)
      }
      return next
    })
  }

  async function handleChipRemove(e: React.MouseEvent, difficultyId: string) {
    e.stopPropagation()
    const next = new Set(checkedIds)
    next.delete(difficultyId)
    setCheckedIds(next)

    try {
      await promise(syncMutation.mutateAsync(Array.from(next)), {
        loading: "Removing raid...",
        success: "Raid removed!",
        error: (err: Error) => err.message,
      })
      queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
    } catch {
      setCheckedIds(new Set(character.characterRaids.map((cr) => cr.raidDifficulty.id)))
    }
  }

  async function handleSave() {
    try {
      await promise(syncMutation.mutateAsync(Array.from(checkedIds)), {
        loading: "Saving raids...",
        success: "Raids updated!",
        error: (err: Error) => err.message,
      })
      queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
      onClose()
    } catch {
      // popover stays open on error
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        className="flex w-3xl items-center gap-1.5 rounded-lg border border-gray-700 bg-surface-elevated px-3 py-2 text-sm text-gray-200 transition-colors hover:border-gray-600"
      >
        {selectedCount > 0 ? (
          <div className="flex flex-1 flex-wrap gap-1">
            {Array.from(checkedIds).map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-md bg-surface-hover px-2 py-0.5 text-xs text-gray-200"
              >
                {getChipLabel(id)}
                <button
                  type="button"
                  onClick={(e) => handleChipRemove(e, id)}
                  disabled={syncMutation.isPending}
                  className="text-gray-500 transition-colors hover:text-danger"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="flex-1 text-left text-gray-400">Edit Raids (0/3)</span>
        )}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isPopoverOpen ? "rotate-180" : ""}`} />
      </button>

      {isPopoverOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-1 w-3xl min-w-[300px] rounded-lg border border-gray-700 bg-surface-elevated shadow-xl"
        >
          <div className="border-b border-gray-700 p-2">
            <div className="flex items-center gap-2 rounded-md border border-gray-700 bg-surface-hover px-3 py-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search raids..."
                className="flex-1 bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-500"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-gray-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-90 overflow-y-auto p-1">
            {filteredRaids.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-gray-500">No raids found</p>
            ) : (
              filteredRaids.map((raid) => {
                const eligible = raid.difficulties.filter((rd) => character.itemLevel >= rd.minIlvl)
                if (eligible.length === 0) return null

                return (
                  <div key={raid.id}>
                    <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                      {raid.name}
                    </div>
                    {eligible.map((rd) => {
                      const isChecked = checkedIds.has(rd.id)
                      const blockedByMax = !isChecked && maxReached
                      const blockedByDuplicate = !isChecked && isDuplicateRaidGroup(rd.id)
                      const isDisabled = blockedByMax || blockedByDuplicate

                      return (
                        <button
                          key={rd.id}
                          type="button"
                          onClick={() => toggleCheck(rd.id)}
                          disabled={isDisabled}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            isChecked
                              ? "bg-blue-500/10 text-blue-400"
                              : isDisabled
                                ? "cursor-not-allowed text-gray-600"
                                : "text-gray-300 hover:bg-surface-hover"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              isChecked ? "border-blue-500 bg-blue-500 text-white" : "border-gray-600 bg-transparent"
                            } ${isDisabled ? "opacity-30" : ""}`}
                          >
                            {isChecked && <Check className="h-3 w-3" />}
                          </span>
                          <span className="flex-1">{rd.difficulty}</span>
                          <span className="text-xs text-gray-500">IL {rd.minIlvl}</span>
                          {blockedByDuplicate && <span className="text-xs text-gray-500">Already selected</span>}
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-700 px-3 py-2">
            <span className={`text-xs ${maxReached ? "text-amber-400" : "text-gray-500"}`}>
              {selectedCount}/3 slots used
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCheckedIds(new Set(character.characterRaids.map((cr) => cr.raidDifficulty.id)))
                  setIsPopoverOpen(false)
                  onClose()
                }}
                className="rounded-md px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={syncMutation.isPending}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {syncMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
