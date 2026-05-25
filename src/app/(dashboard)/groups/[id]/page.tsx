"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { Card, Button, Input, PageHeader, Badge, Modal } from "@/components/ui"
import { Copy, LogOut, Trash2, Crown, Shield, User, UserMinus, Ban, UserCheck, ArrowLeftRight, ArrowLeft } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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
  const { data: group, mutate } = useSWR<GroupDetail>(`/api/groups/${params.id}`, fetcher)
  const { data: currentUser } = useSWR<{ id: string }>("/api/user/me", fetcher)

  const [copied, setCopied] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const myMembership = group?.members.find((m) => m.id === currentUser?.id)
  const isOwner = myMembership?.role === "owner"
  const isAdmin = myMembership?.role === "admin" || isOwner

  async function handleAction(url: string, method: string, body?: object) {
    setActionLoading(url)
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    setActionLoading(null)
    if (!res.ok) {
      const err = await res.json()
      alert(err.error ?? "Action failed")
      return false
    }
    mutate()
    return true
  }

  async function handleCopyCode() {
    if (!group) return
    const link = `${window.location.origin}/groups/join?code=${group.inviteCode}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLeave() {
    if (!confirm("Sair do grupo?")) return
    const ok = await handleAction(`/api/groups/${params.id}/leave`, "POST")
    if (ok) router.push("/groups")
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.")) return
    const ok = await handleAction(`/api/groups/${params.id}`, "DELETE")
    if (ok) router.push("/groups")
  }

  async function handleTransfer(targetUserId: string) {
    const targetName = group?.members.find((m) => m.id === targetUserId)?.name
    if (!confirm(`Transferir liderança para ${targetName}?`)) return
    await handleAction(`/api/groups/${params.id}/transfer`, "POST", { targetUserId })
  }

  async function handleChangeRole(targetUserId: string, role: string) {
    await handleAction(`/api/groups/${params.id}/members/${targetUserId}/role`, "PUT", { role })
  }

  async function handleKick(targetUserId: string) {
    const targetName = group?.members.find((m) => m.id === targetUserId)?.name
    if (!confirm(`Remover ${targetName} do grupo?`)) return
    await handleAction(`/api/groups/${params.id}/kick`, "POST", { userId: targetUserId })
  }

  async function handleBan(targetUserId: string) {
    const targetName = group?.members.find((m) => m.id === targetUserId)?.name
    if (!confirm(`Banir ${targetName} do grupo?`)) return
    await handleAction(`/api/groups/${params.id}/ban`, "POST", { userId: targetUserId })
  }

  async function handleUnban(targetUserId: string) {
    await handleAction(`/api/groups/${params.id}/unban`, "POST", { userId: targetUserId })
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
        <button onClick={() => router.push("/groups")} className="rounded-lg p-2 text-gray-400 hover:bg-surface-hover hover:text-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-2xl font-bold text-gray-100">{group.name}</h1>
        <div className="flex gap-2">
          {!isOwner && (
            <Button variant="ghost" onClick={handleLeave} icon={<LogOut className="h-4 w-4" />}>
              Sair do grupo
            </Button>
          )}
          {isOwner && (
            <Button variant="ghost" onClick={handleDelete} icon={<Trash2 className="h-4 w-4 text-danger" />}>
              Excluir grupo
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-400">Link de Convite</p>
        <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-4 py-3">
          <code className="flex-1 truncate font-mono text-sm text-blue-400">
            {typeof window !== "undefined" ? `${window.location.origin}/groups/join?code=${group.inviteCode}` : group.inviteCode}
          </code>
          <Button variant="ghost" size="sm" onClick={handleCopyCode} icon={<Copy className="h-4 w-4" />}>
            {copied ? "Copiado!" : "Copiar"}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-200">Membros ({group.members.length})</h2>
        </div>
        <div className="mt-3 space-y-2">
          {group.members.map((member) => {
            const canManage = (isOwner && member.role !== "owner") || (isAdmin && member.role === "member")
            return (
              <Card key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {member.image && (
                    <img src={member.image} alt="" className="h-8 w-8 rounded-full" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-200">
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="ml-1 text-sm text-gray-500">(você)</span>
                        )}
                      </p>
                      <Badge
                        color={
                          member.role === "owner" ? "yellow" :
                          member.role === "admin" ? "blue" : "gray"
                        }
                      >
                        {member.role === "owner" ? <Crown className="mr-1 h-3 w-3 inline" /> :
                          member.role === "admin" ? <Shield className="mr-1 h-3 w-3 inline" /> :
                            <User className="mr-1 h-3 w-3 inline" />}
                        {member.role === "owner" ? "Dono" : member.role === "admin" ? "Admin" : "Membro"}
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
                          title="Transferir liderança"
                        />
                        {member.role === "member" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleChangeRole(member.id, "admin")}
                            icon={<Shield className="h-4 w-4" />}
                            title="Promover a admin"
                          />
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleChangeRole(member.id, "member")}
                            icon={<User className="h-4 w-4" />}
                            title="Rebaixar a membro"
                          />
                        )}
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleKick(member.id)}
                      icon={<UserMinus className="h-4 w-4" />}
                      title="Remover"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBan(member.id)}
                      icon={<Ban className="h-4 w-4 text-danger" />}
                      title="Banir"
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
          <h2 className="mb-3 text-lg font-semibold text-gray-200">Banidos ({group.bans.length})</h2>
          <div className="space-y-2">
            {group.bans.map((ban) => (
              <Card key={ban.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ban.image && <img src={ban.image} alt="" className="h-8 w-8 rounded-full" />}
                  <p className="font-medium text-gray-400">{ban.name}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUnban(ban.id)}
                  icon={<UserCheck className="h-4 w-4" />}
                >
                  Desbanir
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
