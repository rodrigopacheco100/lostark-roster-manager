"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Copy, Plus, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button, Card, EmptyState, Input, Modal, PageHeader } from "@/components/ui"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

type Group = {
  id: string
  name: string
  inviteCode: string
  role: string
  memberCount: number
}

export default function GroupsPage() {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const { data: groups } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    queryFn: () => httpClient.get<Group[]>("/api/groups"),
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createName, setCreateName] = useState("")

  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [inviteCodeInput, setInviteCodeInput] = useState("")
  const [joinError, setJoinError] = useState("")
  const [joinPreview, setJoinPreview] = useState<{ id: string; name: string; memberCount: number } | null>(null)

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: (name: string) => httpClient.post<Group>("/api/groups", { name }),
  })

  const joinMutation = useMutation({
    mutationFn: ({ groupId, inviteCode }: { groupId: string; inviteCode: string }) =>
      httpClient.post(`/api/groups/${groupId}/join`, { inviteCode }),
  })

  async function handleCreate() {
    if (!createName.trim()) return
    await promise(createMutation.mutateAsync(createName.trim()), {
      loading: "Creating group...",
      success: "Group created!",
      error: (err: Error) => err.message,
    })
    setCreateName("")
    setCreateModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ["/api/groups"] })
  }

  async function handleResolveCode() {
    setJoinError("")
    setJoinPreview(null)
    if (!inviteCodeInput.trim()) {
      setJoinError("Enter an invite code")
      return
    }
    try {
      const data = await httpClient.get<{ id: string; name: string; memberCount: number }>(
        `/api/groups/join?code=${encodeURIComponent(inviteCodeInput.trim())}`,
      )
      setJoinPreview(data)
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Invalid invite code")
    }
  }

  async function handleJoin() {
    if (!joinPreview) return
    await promise(joinMutation.mutateAsync({ groupId: joinPreview.id, inviteCode: inviteCodeInput.trim() }), {
      loading: "Joining...",
      success: `You joined ${joinPreview.name}!`,
      error: (err: Error) => err.message,
    })
    setInviteCodeInput("")
    setJoinPreview(null)
    setJoinModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ["/api/groups"] })
  }

  async function _handleCopyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Groups"
        action={
          <div className="flex gap-2">
            <Button onClick={() => setJoinModalOpen(true)} icon={<UserPlus className="h-4 w-4" />}>
              Join
            </Button>
            <Button onClick={() => setCreateModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
              Create Group
            </Button>
          </div>
        }
      />

      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false)
          setCreateName("")
        }}
        title="Create Group"
      >
        <div className="space-y-4">
          <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Group name..." />
          <Button onClick={handleCreate} className="w-full">
            Create
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={joinModalOpen}
        onClose={() => {
          setJoinModalOpen(false)
          setInviteCodeInput("")
          setJoinPreview(null)
          setJoinError("")
        }}
        title="Join Group"
      >
        <div className="space-y-4">
          <Input
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            placeholder="Invite code..."
          />
          {!joinPreview && (
            <Button onClick={handleResolveCode} className="w-full" variant="secondary">
              Find Group
            </Button>
          )}
          {joinError && <p className="text-xs text-danger">{joinError}</p>}
          {joinPreview && (
            <div className="rounded-lg border border-gray-700 bg-surface-hover p-4">
              <p className="font-medium text-gray-200">{joinPreview.name}</p>
              <p className="text-sm text-gray-500">{joinPreview.memberCount} member(s)</p>
              <Button onClick={handleJoin} className="mt-3 w-full">
                Join
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {groups?.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No groups"
          description="Create a group or join one using an invite code."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups?.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="group cursor-pointer transition-colors hover:border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-200">{group.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{group.memberCount} member(s)</p>
                    <span className="mt-1 inline-block rounded-full bg-surface-hover px-2 py-0.5 text-xs capitalize text-gray-400">
                      {group.role === "owner" ? "Owner" : group.role === "admin" ? "Admin" : "Member"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      const link = `${window.location.origin}/groups/join?code=${group.inviteCode}`
                      navigator.clipboard.writeText(link)
                      setCopiedCode(group.inviteCode)
                      setTimeout(() => setCopiedCode(null), 2000)
                    }}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-surface-hover hover:text-gray-300"
                    title="Copy invite link"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedCode === group.inviteCode && (
                      <span className="absolute -mt-6 ml-4 text-xs text-green-400">Copied!</span>
                    )}
                  </button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
