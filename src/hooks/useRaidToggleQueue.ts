"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"
import type { DashboardData } from "@/app/(dashboard)/dashboard/_types"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

export type ToggleEntry = {
  characterId: string
  raidDifficultyId: string
  completed: boolean
}

function flipInCache(data: DashboardData, characterId: string, raidDifficultyId: string, completed: boolean) {
  const updated = structuredClone(data)
  for (const group of updated.rosters) {
    for (const roster of group.rosters) {
      for (const char of roster.characters) {
        if (char.id !== characterId) continue
        for (const r of char.raids) {
          if (r.raidDifficultyId === raidDifficultyId) r.completed = completed
        }
      }
    }
  }
  let totalAssigned = 0
  let totalCompleted = 0
  for (const group of updated.rosters) {
    for (const roster of group.rosters) {
      for (const char of roster.characters) {
        totalAssigned += char.raids.length
        totalCompleted += char.raids.filter((r) => r.completed).length
      }
    }
  }
  updated.summary = { totalAssigned, totalCompleted }
  return updated
}

export function useRaidToggleQueue() {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const queueRef = useRef<Map<string, ToggleEntry>>(new Map())
  const snapshotRef = useRef<DashboardData | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(async () => {
    if (queueRef.current.size === 0) return
    const updates = Array.from(queueRef.current.values())
    queueRef.current.clear()
    const prevSnapshot = snapshotRef.current
    snapshotRef.current = null

    try {
      await promise(httpClient.post("/api/raids/batch", { updates }), {
        loading: "Saving...",
        success: "Raids updated!",
        error: (err: Error) => err.message,
      })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    } catch {
      if (prevSnapshot) {
        queryClient.setQueryData<DashboardData>(["dashboard"], prevSnapshot)
      }
    }
  }, [queryClient, promise])

  const enqueue = useCallback(
    (entry: ToggleEntry) => {
      if (queueRef.current.size === 0) {
        queryClient.cancelQueries({ queryKey: ["dashboard"] })
        snapshotRef.current = structuredClone(queryClient.getQueryData<DashboardData>(["dashboard"])) ?? null
      }

      const key = `${entry.characterId}:${entry.raidDifficultyId}`
      queueRef.current.set(key, entry)

      queryClient.setQueryData<DashboardData>(["dashboard"], (old) => {
        if (!old) return old
        return flipInCache(old, entry.characterId, entry.raidDifficultyId, entry.completed)
      })

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, 1500)
    },
    [queryClient, flush],
  )

  useEffect(() => {
    function onLeave() {
      if (queueRef.current.size === 0) return
      const updates = Array.from(queueRef.current.values())
      queueRef.current.clear()
      snapshotRef.current = null
      navigator.sendBeacon("/api/raids/batch", new Blob([JSON.stringify({ updates })], { type: "application/json" }))
    }
    window.addEventListener("beforeunload", onLeave)
    return () => window.removeEventListener("beforeunload", onLeave)
  }, [])

  return { enqueue }
}
