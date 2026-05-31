"use client"

import { Clock, FileDown, Loader2, Unlink } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useLoaLogsPoller } from "@/components/LoaLogsPoller"
import { Badge, Button, PageHeader } from "@/components/ui"
import type { ImportEntry } from "@/lib/loa-logs/file-handle"
import { handleFromDrop } from "@/lib/loa-logs/file-handle"

function timeAgo(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString()
}

const INITIAL_DISPLAY = 30
const LOAD_MORE = 20

function ImportHistory({ entries }: { entries: ImportEntry[] }) {
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY)
  const listRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 150) {
      setDisplayCount((prev) => Math.min(prev + LOAD_MORE, entries.length))
    }
  }, [entries.length])

  useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY)
  }, [entries.length])

  return (
    <div ref={listRef} onScroll={handleScroll} className="max-h-64 overflow-y-auto rounded-lg border border-gray-800">
      {entries.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">No imports yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-3 py-2 font-medium">Boss</th>
              <th className="px-3 py-2 font-medium">Character</th>
              <th className="px-3 py-2 font-medium">Difficulty</th>
              <th className="px-3 py-2 font-medium text-right">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {entries.slice(0, displayCount).map((e, i) => (
              <tr key={`${e.fightStart}|${e.characterName}|${e.bossName}`} className="text-gray-300">
                <td className="px-3 py-2 whitespace-nowrap">{e.bossName}</td>
                <td className="px-3 py-2 whitespace-nowrap">{e.characterName}</td>
                <td className="px-3 py-2 whitespace-nowrap capitalize">{e.difficulty}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-gray-500" title={formatTime(e.importedAt)}>
                  {timeAgo(e.importedAt)}
                </td>
              </tr>
            ))}
            {displayCount < entries.length && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-center text-xs text-gray-600">
                  Scroll for more...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function LoaLogsPage() {
  const { isConnected, isPolling, fileName, recentImports, lastImportAt, connect, disconnect } = useLoaLogsPoller()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const item = e.dataTransfer.items[0]
    if (!item) return

    const handle = await handleFromDrop(item)
    if (!handle) {
      toast.error("Drag-and-drop not supported in this browser. Click to select instead.")
      return
    }

    try {
      await connect(handle)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect")
    }
  }

  return (
    <div>
      <PageHeader title="Loa Logs Import" />

      <div className="space-y-6 max-w-xl">
        <div className="rounded-xl border border-gray-800 bg-surface-elevated p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">Auto-Import</h2>

          <div className="flex items-center gap-3 mb-4">
            <Badge color={isConnected ? "green" : "gray"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
            {isPolling && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>

          {isConnected && fileName && (
            <p className="text-sm text-gray-400 mb-1">
              Watching <code className="text-blue-300">{fileName}</code> — polls every minute.
            </p>
          )}

          {isConnected && lastImportAt && (
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last import: {timeAgo(lastImportAt)}
            </p>
          )}

          {!isConnected && (
            <div
              onClick={() => connect()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") connect()
              }}
              className={`mb-4 flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/80"
              }`}
            >
              <FileDown className={`h-10 w-10 ${isDragging ? "text-blue-400" : "text-gray-500"}`} />
              <div>
                <p className={`text-sm font-medium ${isDragging ? "text-blue-300" : "text-gray-300"}`}>
                  {isDragging ? "Drop to connect" : "Drop encounters.db here or click to select"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  The file is processed entirely in your browser. The connection persists across sessions.
                </p>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="flex items-center gap-3">
              <Button onClick={disconnect} icon={<Unlink className="h-4 w-4" />} variant="secondary">
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="rounded-xl border border-gray-800 bg-surface-elevated p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Import History</h2>
            <ImportHistory entries={recentImports} />
          </div>
        )}
      </div>
    </div>
  )
}
