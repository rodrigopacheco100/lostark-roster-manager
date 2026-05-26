"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, Button, PageHeader } from "@/components/ui"
import { Users, LogIn } from "lucide-react"
import { http } from "@/lib/api"

export default function JoinGroupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [group, setGroup] = useState<{ id: string; name: string; memberCount: number } | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState("")

  useEffect(() => {
    if (!code) {
      setError("No invite code provided.")
      setLoading(false)
      return
    }

    http.get<{ id: string; name: string; memberCount: number } | { error: string }>(`/api/groups/join?code=${encodeURIComponent(code)}`)
      .then((data) => {
        if ("error" in data) {
          setError(data.error)
        } else {
          setGroup(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "Error looking up group.")
        setLoading(false)
      })
  }, [code])

  async function handleJoin() {
    if (!group) return
    setJoining(true)
    setJoinError("")

    try {
      await http.post(`/api/groups/${group.id}/join`, { inviteCode: code })
      router.push(`/groups/${group.id}`)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Error joining group.")
      setJoining(false)
    }
  }

  return (
    <div>
      <PageHeader title="Join Group" />

      <div className="mx-auto max-w-md">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <Card className="text-center">
            <div className="flex flex-col items-center gap-4 py-8">
              <Users className="h-12 w-12 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-200">Group not found</h2>
              <p className="text-sm text-gray-400">{error}</p>
              <Button onClick={() => router.push("/groups")} variant="secondary">
                Back to Groups
              </Button>
            </div>
          </Card>
        )}

        {group && !loading && (
          <Card>
            <div className="flex flex-col items-center gap-4 py-8">
              <Users className="h-12 w-12 text-blue-400" />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-200">{group.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{group.memberCount} member(s)</p>
              </div>
              {joinError && (
                <p className="text-sm text-danger">{joinError}</p>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleJoin}
                  disabled={joining}
                  icon={<LogIn className="h-4 w-4" />}
                >
                  {joining ? "Joining..." : "Join Group"}
                </Button>
                <Button onClick={() => router.push("/groups")} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
