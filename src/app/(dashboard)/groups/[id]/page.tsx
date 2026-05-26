"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowLeftRight,
  Ban,
  Copy,
  Crown,
  LogOut,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserMinus,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge, Button, Card } from "@/components/ui"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

type Member = {
  id: string
  name: string
  image: string | null
  role: string
  joinedAt: string
}

type GroupDetail = {
  id: string
  name: string
  inviteCode: string
  createdAt: string
  members: Member[]
  bans?: { id: string; name: string; image: string | null; bannedAt: string }[]
}

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    data: group,
    isError: groupFetchFailed,
    error,
  } = useQuery<GroupDetail>({
    queryKey: [`/api/groups/${params.id}`],
    queryFn: () => httpClient.get<GroupDetail>(`/api/groups/${params.id}`),
    retry: false,
  })
  const { data: currentUser } = useQuery<{ id: string }>({
    queryKey: ["/api/user/me"],
    queryFn: () => httpClient.get<{ id: string }>("/api/user/me"),
  })
  const { confirm } = useConfirm()
  const { toast, promise } = useToast()

  useEffect(() => {
    if (groupFetchFailed) {
      toast(error instanceof Error ? error.message : "Error loading group", "error")
      router.push("/groups")
    }
  }, [groupFetchFailed, toast, router.push, error?.message, error])

  const [copied, setCopied] = useState(false)

  const myMembership = group?.members.find((m) => m.id === currentUser?.id)
  const isOwner = myMembership?.role === "owner"
  const isAdmin = myMembership?.role === "admin" || isOwner

  const groupMutation = useMutation({
    mutationFn: ({ url, method, body }: { url: string; method: string; body?: object }) => {
      if (method === "PUT") return httpClient.put(url, body)
      if (method === "DELETE") return httpClient.delete(url)
      return httpClient.post(url, body)
    },
  })

  async function handleCopyCode() {
    if (!group) return
    const link = `${window.location.origin}/groups/join?code=${group.inviteCode}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLeave() {
    const ok = await confirm({
      title: "Leave group",
      message: "Are you sure you want to leave this group?",
      confirmLabel: "Leave",
      cancelLabel: "Cancel",
    })
    if (!ok) return
    await promise(groupMutation.mutateAsync({ url: `/api/groups/${params.id}/leave`, method: "POST" }), {
      loading: "Please wait...",
      success: "You left the group",
      error: (err: Error) => err.message,
    })
    queryClient.invalidateQueries({ queryKey: [`/api/groups/${params.id}`] })
    router.push("/groups")
  }

  async function handleDelete() {
    if (!group) {
      toast("Group not found", "error")
      router.push("/groups")
      return
    }

    const ok = await confirm({
      title: "Delete group",
      message: "Are you sure you want to delete this group? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    })
    if (!ok) return
    await promise(groupMutation.mutateAsync({ url: `/api/groups/${params.id}`, method: "DELETE" }), {
      loading: "Please wait...",
      success: `Group ${group.name} deleted`,
      error: (err: Error) => err.message,
    })
    queryClient.invalidateQueries({ queryKey: [`/api/groups/${params.id}`] })
    router.push("/groups")
  }

  async function handleTransfer(targetUserId: string) {
    const targetName = group?.members.find((m) => m.id === targetUserId)?.name
    const ok = await confirm({
      title: "Transfer ownership",
      message: `Transfer group ownership to ${targetName}?`,
      confirmLabel: "Transfer",
      cancelLabel: "Cancel",
    })
    if (!ok) return
    await promise(
      groupMutation.mutateAsync({ url: `/api/groups/${params.id}/transfer`, method: "POST", body: { targetUserId } }),
      {
        loading: "Please wait...",
        success: `Ownership transferred to ${targetName}`,
        error: (err: Error) => err.message,
      },
    )
    queryClient.invalidateQueries({ queryKey: [`/api/groups/${params.id}`] })
  }

  async function handleChangeRole(targetUserId: string, role: string) {
    const targetName = group?.members.find((m) => m.id === targetUserId)?.name
    await promise(
      groupMutation.mutateAsync({
        url: `/api/groups/${params.id}/members/${targetUserId}/role`,
        method: "PUT",
        body: { role },
      }),
      {
        loading: "Please wait...",
        success: role === "admin" ? `${targetName} promoted to admin` : `${targetName} demoted to member`,
        error: (err: Error) => err.message,
      },
    )
    queryClient.invalidateQueries({ queryKey: [`/api/groups/${params.id}`] })
  }

  async function handleKick(targetUserId: string) {
    const targetName = group?.members.find((m) => m.id === targetUserId)?.name
    const ok = await confirm({
      title: "Remove member",
      message: `Remove ${targetName} from the group?`,
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    })
    if (!ok) return
    await promise(
      groupMutation.mutateAsync({
        url: `/api/groups/${params.id}/kick`,
        method: "POST",
        body: { userId: targetUserId },
      }),
      { loading: "Please wait...", success: `${targetName} removed from group`, error: (err: Error) => err.message },
    )
    queryClient.invalidateQueries({ queryKey: [`/api/groups/${params.id}`] })
  }

  async function handleBan(targetUserId: string) {
    const targetName = group?.members.find((m) => m.id === targetUserId)?.name
    const ok = await confirm({
      title: "Ban member",
      message: `Ban ${targetName} from the group? They will not be able to rejoin via invite link.`,
      confirmLabel: "Ban",
      cancelLabel: "Cancel",
      destructive: true,
    })
    if (!ok) return
    await promise(
      groupMutation.mutateAsync({
        url: `/api/groups/${params.id}/ban`,
        method: "POST",
        body: { userId: targetUserId },
      }),
      { loading: "Please wait...", success: `${targetName} banned`, error: (err: Error) => err.message },
    )
    queryClient.invalidateQueries({ queryKey: [`/api/groups/${params.id}`] })
  }

  async function handleUnban(targetUserId: string) {
    await promise(
      groupMutation.mutateAsync({
        url: `/api/groups/${params.id}/unban`,
        method: "POST",
        body: { userId: targetUserId },
      }),
      { loading: "Please wait...", success: "Ban removed", error: (err: Error) => err.message },
    )
    queryClient.invalidateQueries({ queryKey: [`/api/groups/${params.id}`] })
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/groups")}
          className="rounded-lg p-2 text-gray-400 hover:bg-surface-hover hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-2xl font-bold text-gray-100">{group.name}</h1>
        <div className="flex gap-2">
          {!isOwner && (
            <Button variant="ghost" onClick={handleLeave} icon={<LogOut className="h-4 w-4" />}>
              Leave group
            </Button>
          )}
          {isOwner && (
            <Button variant="ghost" onClick={handleDelete} icon={<Trash2 className="h-4 w-4 text-danger" />}>
              Delete group
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-400">Invite Link</p>
        <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-4 py-3">
          <code className="flex-1 truncate font-mono text-sm text-blue-400">
            {typeof window !== "undefined"
              ? `${window.location.origin}/groups/join?code=${group.inviteCode}`
              : group.inviteCode}
          </code>
          <Button variant="ghost" size="sm" onClick={handleCopyCode} icon={<Copy className="h-4 w-4" />}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-200">Members ({group.members.length})</h2>
        </div>
        <div className="mt-3 space-y-2">
          {group.members.map((member) => {
            const canManage = (isOwner && member.role !== "owner") || (isAdmin && member.role === "member")
            return (
              <Card key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {member.image && (
                    <Image
                      src={member.image}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                      unoptimized
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-200">
                        {member.name}
                        {member.id === currentUser?.id && <span className="ml-1 text-sm text-gray-500">(you)</span>}
                      </p>
                      <Badge color={member.role === "owner" ? "yellow" : member.role === "admin" ? "blue" : "gray"}>
                        {member.role === "owner" ? (
                          <Crown className="mr-1 h-3 w-3 inline" />
                        ) : member.role === "admin" ? (
                          <Shield className="mr-1 h-3 w-3 inline" />
                        ) : (
                          <User className="mr-1 h-3 w-3 inline" />
                        )}
                        {member.role === "owner" ? "Owner" : member.role === "admin" ? "Admin" : "Member"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    {isOwner && member.role !== "owner" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTransfer(member.id)}
                          icon={<ArrowLeftRight className="h-4 w-4" />}
                          title="Transfer ownership"
                        />
                        {member.role === "member" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleChangeRole(member.id, "admin")}
                            icon={<Shield className="h-4 w-4" />}
                            title="Promote to admin"
                          />
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleChangeRole(member.id, "member")}
                            icon={<User className="h-4 w-4" />}
                            title="Demote to member"
                          />
                        )}
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleKick(member.id)}
                      icon={<UserMinus className="h-4 w-4" />}
                      title="Remove"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBan(member.id)}
                      icon={<Ban className="h-4 w-4 text-danger" />}
                      title="Ban"
                    />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {group.bans && group.bans.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-200">Banned ({group.bans.length})</h2>
          <div className="space-y-2">
            {group.bans.map((ban) => (
              <Card key={ban.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ban.image && (
                    <Image src={ban.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full" unoptimized />
                  )}
                  <p className="font-medium text-gray-400">{ban.name}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUnban(ban.id)}
                  icon={<UserCheck className="h-4 w-4" />}
                >
                  Unban
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
