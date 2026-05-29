"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { httpClient } from "@/lib/api"
import { loadEncounters, matchEncounters } from "@/lib/loa-logs/client"
import {
  checkHandlePermission,
  clearCheckpoint,
  getCheckpoint,
  getStoredHandle,
  removeStoredHandle,
  requestFileHandle,
  requestHandlePermission,
  setCheckpoint,
} from "@/lib/loa-logs/file-handle"

type PollerResult = {
  totalCleared: number
  matched: number
  updated: number
  errors: string[]
}

type PollerContextValue = {
  isConnected: boolean
  isPolling: boolean
  lastResult: PollerResult | null
  fileName: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const PollerContext = createContext<PollerContextValue | null>(null)

export function useLoaLogsPoller() {
  const ctx = useContext(PollerContext)
  if (!ctx) throw new Error("useLoaLogsPoller must be used within LoaLogsPollerProvider")
  return ctx
}

const POLL_INTERVAL = 30_000

type RaidDiff = { id: string; difficulty: string }
type Raid = { id: string; slug: string; name: string; difficulties: RaidDiff[] }
type Roster = { id: string; name: string; characters: { id: string; name: string }[] }
type BatchResult = { updated: number }

function LoaLogsPollerInner({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [lastResult, setLastResult] = useState<PollerResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const raidsQuery = useQuery<Raid[]>({
    queryKey: ["/api/raids"],
    queryFn: () => httpClient.get<Raid[]>("/api/raids"),
    staleTime: 60_000,
  })

  const rostersQuery = useQuery<Roster[]>({
    queryKey: ["/api/rosters"],
    queryFn: () => httpClient.get<Roster[]>("/api/rosters"),
    staleTime: 60_000,
  })

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const doPoll = useCallback(async () => {
    const handle = await getStoredHandle()
    if (!handle) {
      stopPolling()
      setIsConnected(false)
      return
    }

    const permState = await checkHandlePermission(handle)
    if (permState === "denied") {
      await removeStoredHandle()
      setIsConnected(false)
      stopPolling()
      toast.error("File access denied. Reconnect on the Loa Logs page.")
      setIsPolling(false)
      return
    }
    if (permState === "prompt") {
      setIsConnected(false)
      stopPolling()
      setIsPolling(false)
      return
    }

    setIsPolling(true)

    try {
      const file = await handle.getFile()
      const buffer = await file.arrayBuffer()

      const checkpoint = getCheckpoint()
      const { encounters, checkpointReset } = await loadEncounters(buffer, checkpoint)

      if (encounters.length === 0) {
        if (checkpointReset) clearCheckpoint()
        setIsPolling(false)
        return
      }

      const rosters = rostersQuery.data ?? []
      const allCharacters = rosters.flatMap((r) => r.characters)
      const raids = raidsQuery.data ?? []
      const { matches, skipped } = matchEncounters(encounters, allCharacters, raids)

      if (matches.length === 0) {
        const last = encounters[encounters.length - 1]
        setCheckpoint({
          id: last.id,
          bossName: last.current_boss,
          difficulty: last.difficulty,
          playerName: last.local_player,
        })
        setIsPolling(false)
        return
      }

      const batchResult = await httpClient.post<BatchResult>("/api/raids/batch", {
        updates: matches.map((m) => ({
          characterId: m.characterId,
          raidDifficultyId: m.raidDifficultyId,
          completed: true,
        })),
      })

      const last = encounters[encounters.length - 1]
      setCheckpoint({
        id: last.id,
        bossName: last.current_boss,
        difficulty: last.difficulty,
        playerName: last.local_player,
      })

      queryClient.invalidateQueries({ queryKey: ["/api/raids"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })

      const summary: PollerResult = {
        totalCleared: encounters.length,
        matched: matches.length,
        updated: batchResult.updated,
        errors: skipped.map((s) => `${s.bossName}: ${s.reason}`),
      }
      setLastResult(summary)

      const uniqueChars = [...new Set(matches.map((m) => m.characterName))]
      toast.success(`Auto-imported ${batchResult.updated} raid(s) for ${uniqueChars.join(", ")}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Auto-import failed: ${msg}`)

      if (msg.includes("NotFoundError") || msg.includes("handle is invalid")) {
        await removeStoredHandle()
        setIsConnected(false)
        stopPolling()
      }
    } finally {
      setIsPolling(false)
    }
  }, [raidsQuery.data, rostersQuery.data, queryClient, stopPolling])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    setIsConnected(true)
    doPoll()
    intervalRef.current = setInterval(doPoll, POLL_INTERVAL)
  }, [doPoll])

  const connect = useCallback(async () => {
    const existing = await getStoredHandle()
    if (existing) {
      const ok = await requestHandlePermission(existing)
      if (ok) {
        setFileName(existing.name)
        startPolling()
        return
      }
      await removeStoredHandle()
    }

    const handle = await requestFileHandle()
    setFileName(handle.name)
    startPolling()
  }, [startPolling])

  const disconnect = useCallback(async () => {
    stopPolling()
    await removeStoredHandle()
    setIsConnected(false)
    setFileName(null)
    setLastResult(null)
    clearCheckpoint()
    toast("Disconnected from Loa Logs", { icon: "ℹ️" })
  }, [stopPolling])

  useEffect(() => {
    getStoredHandle().then(async (handle) => {
      if (handle) {
        setFileName(handle.name)
        const permState = await checkHandlePermission(handle)
        if (permState === "granted") {
          startPolling()
        } else if (permState === "denied") {
          await removeStoredHandle()
          setFileName(null)
        }
      }
    })
    return () => stopPolling()
  }, [startPolling, stopPolling])

  const ctx: PollerContextValue = { isConnected, isPolling, lastResult, fileName, connect, disconnect }

  return <PollerContext.Provider value={ctx}>{children}</PollerContext.Provider>
}

export function LoaLogsPollerProvider({ children }: { children: React.ReactNode }) {
  return <LoaLogsPollerInner>{children}</LoaLogsPollerInner>
}
