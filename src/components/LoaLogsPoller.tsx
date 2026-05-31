"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { httpClient } from "@/lib/api"
import { loadEncounters, matchEncounters } from "@/lib/loa-logs/client"
import type { ImportEntry } from "@/lib/loa-logs/file-handle"
import {
  addImportHistory,
  checkHandlePermission,
  clearAllStorage,
  clearCheckpoint,
  getCheckpoint,
  getFileInfo,
  getImportHistory,
  getStoredHandle,
  requestFileHandle,
  requestHandlePermission,
  setCheckpoint,
  setFileInfo,
  storeFileHandle,
} from "@/lib/loa-logs/file-handle"

type PollerContextValue = {
  isConnected: boolean
  isPolling: boolean
  fileName: string | null
  recentImports: ImportEntry[]
  lastImportAt: number | null
  connect: (handle?: FileSystemFileHandle) => Promise<void>
  disconnect: () => Promise<void>
}

const PollerContext = createContext<PollerContextValue | null>(null)

export function useLoaLogsPoller() {
  const ctx = useContext(PollerContext)
  if (!ctx) throw new Error("useLoaLogsPoller must be used within LoaLogsPollerProvider")
  return ctx
}

const POLL_INTERVAL = 60_000

type RaidDiff = { id: string; difficulty: string }
type Raid = { id: string; slug: string; name: string; difficulties: RaidDiff[] }
type Roster = { id: string; name: string; characters: { id: string; name: string }[] }
type BatchResult = { updated: number }

function LoaLogsPollerInner({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleRef = useRef<FileSystemFileHandle | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [recentImports, setRecentImports] = useState<ImportEntry[]>([])

  const lastImportAt = recentImports.length > 0 ? recentImports[0].importedAt : null

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
    const handle = handleRef.current
    if (!handle) {
      stopPolling()
      setIsConnected(false)
      return
    }

    const permState = await checkHandlePermission(handle)
    if (permState === "denied") {
      await clearAllStorage()
      handleRef.current = null
      setIsConnected(false)
      setFileName(null)
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

      const existingTimestamps = new Set(
        getImportHistory().map((e) => `${e.fightStart}|${e.characterName}|${e.bossName}`),
      )
      const newMatches = matches.filter(
        (m) => !existingTimestamps.has(`${m.fightStart}|${m.characterName}|${m.bossName}`),
      )

      if (newMatches.length === 0) {
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
        updates: newMatches.map((m) => ({
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

      const now = Date.now()
      const importEntries: ImportEntry[] = newMatches.map((m) => ({
        fightStart: m.fightStart,
        importedAt: now,
        bossName: m.bossName,
        characterName: m.characterName,
        difficulty: m.difficulty,
      }))
      addImportHistory(importEntries)
      setRecentImports(getImportHistory())
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Auto-import failed: ${msg}`)

      if (msg.includes("NotFoundError") || msg.includes("handle is invalid")) {
        await clearAllStorage()
        handleRef.current = null
        setFileName(null)
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

  const connect = useCallback(
    async (handle?: FileSystemFileHandle) => {
      if (!handle) {
        handle = await requestFileHandle()
      } else {
        const ok = await requestHandlePermission(handle)
        if (!ok) throw new Error("Permission denied for the selected file")
        clearCheckpoint()
      }
      handleRef.current = handle
      await storeFileHandle(handle)
      setFileInfo(handle.name)
      setFileName(handle.name)
      setRecentImports(getImportHistory())
      startPolling()
    },
    [startPolling],
  )

  const disconnect = useCallback(async () => {
    stopPolling()
    handleRef.current = null
    await clearAllStorage()
    setIsConnected(false)
    setFileName(null)
    setRecentImports([])
    toast("Disconnected from Loa Logs", { icon: "ℹ️" })
  }, [stopPolling])

  useEffect(() => {
    setRecentImports(getImportHistory())
    getStoredHandle().then(async (handle) => {
      if (!handle) {
        const info = getFileInfo()
        if (info) setFileName(info.fileName)
        return
      }
      setFileName(handle.name)
      setFileInfo(handle.name)
      const perm = await checkHandlePermission(handle)
      if (perm === "granted") {
        handleRef.current = handle
        startPolling()
      } else if (perm === "denied") {
        await clearAllStorage()
        setFileName(null)
      }
    })
    return () => stopPolling()
  }, [startPolling, stopPolling])

  const ctx: PollerContextValue = {
    isConnected,
    isPolling,
    fileName,
    recentImports,
    lastImportAt,
    connect,
    disconnect,
  }

  return <PollerContext.Provider value={ctx}>{children}</PollerContext.Provider>
}

export function LoaLogsPollerProvider({ children }: { children: React.ReactNode }) {
  return <LoaLogsPollerInner>{children}</LoaLogsPollerInner>
}
