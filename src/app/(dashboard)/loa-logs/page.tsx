"use client"

import { Link, Loader2, Unlink } from "lucide-react"
import { useLoaLogsPoller } from "@/components/LoaLogsPoller"
import { Badge, Button, PageHeader } from "@/components/ui"

export default function LoaLogsPage() {
  const { isConnected, isPolling, fileName: pollFileName, connect, disconnect } = useLoaLogsPoller()

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

          {isConnected && pollFileName && (
            <p className="text-sm text-gray-400 mb-4">
              Watching <code className="text-blue-300">{pollFileName}</code> — new clears are auto-imported every 30s.
            </p>
          )}

          {!isConnected && (
            <p className="text-sm text-gray-400 mb-4">
              Select your Loa Logs <code className="text-blue-300">encounters.db</code> to enable automatic raid
              importing. The file is processed entirely in your browser.
            </p>
          )}

          <div className="flex items-center gap-3">
            {isConnected ? (
              <Button onClick={disconnect} icon={<Unlink className="h-4 w-4" />} variant="secondary">
                Disconnect
              </Button>
            ) : (
              <Button onClick={connect} icon={<Link className="h-4 w-4" />}>
                Connect to Loa Logs
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
