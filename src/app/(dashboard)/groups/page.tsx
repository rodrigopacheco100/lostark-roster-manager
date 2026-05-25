"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Card, Button, Input, PageHeader, EmptyState, Modal } from "@/components/ui"
import { Users, UserPlus, Plus, LogOut, Copy, ArrowRight } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Group = {
  id: string
  name: string
  inviteCode: string
  role: string
  memberCount: number
}

export default function GroupsPage() {
  const { data: groups, mutate } = useSWR<Group[]>("/api/groups", fetcher)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createError, setCreateError] = useState("")

  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [inviteCodeInput, setInviteCodeInput] = useState("")
  const [joinError, setJoinError] = useState("")
  const [joinPreview, setJoinPreview] = useState<{ id: string; name: string; memberCount: number } | null>(null)

  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  async function handleCreate() {
    setCreateError("")
    if (!createName.trim()) return
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: createName.trim() }),
    })
    if (!res.ok) {
      const err = await res.json()
      setCreateError(err.error?.fieldErrors?.name?.[0] ?? "Failed to create group")
      return
    }
    setCreateName("")
    setCreateModalOpen(false)
    mutate()
  }

  async function handleResolveCode() {
    setJoinError("")
    setJoinPreview(null)
    if (!inviteCodeInput.trim()) {
      setJoinError("Enter an invite code")
      return
    }
    const res = await fetch(`/api/groups/join?code=${encodeURIComponent(inviteCodeInput.trim())}`)
    if (!res.ok) {
      const err = await res.json()
      setJoinError(err.error ?? "Invalid invite code")
      return
    }
    const data = await res.json()
    setJoinPreview(data)
  }

  async function handleJoin() {
    if (!joinPreview) return
    const res = await fetch(`/api/groups/${joinPreview.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: inviteCodeInput.trim() }),
    })
    if (!res.ok) {
      const err = await res.json()
      setJoinError(err.error ?? "Failed to join group")
      return
    }
    setInviteCodeInput("")
    setJoinPreview(null)
    setJoinModalOpen(false)
    mutate()
  }

  async function handleCopyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Grupos"
        action={
          <div className="flex gap-2">
            <Button onClick={() => setJoinModalOpen(true)} icon={<UserPlus className="h-4 w-4" />}>
              Entrar
            </Button>
            <Button onClick={() => setCreateModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
              Criar Grupo
            </Button>
          </div>
        }
      />

      <Modal isOpen={createModalOpen} onClose={() => { setCreateModalOpen(false); setCreateName(""); setCreateError("") }} title="Criar Grupo">
        <div className="space-y-4">
          <Input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Nome do grupo..."
          />
          {createError && <p className="text-xs text-danger">{createError}</p>}
          <Button onClick={handleCreate} className="w-full">
            Criar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={joinModalOpen} onClose={() => { setJoinModalOpen(false); setInviteCodeInput(""); setJoinPreview(null); setJoinError("") }} title="Entrar em Grupo">
        <div className="space-y-4">
          <Input
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            placeholder="Código de convite..."
            
          />
          {!joinPreview && (
            <Button onClick={handleResolveCode} className="w-full" variant="secondary">
              Buscar Grupo
            </Button>
          )}
          {joinError && <p className="text-xs text-danger">{joinError}</p>}
          {joinPreview && (
            <div className="rounded-lg border border-gray-700 bg-surface-hover p-4">
              <p className="font-medium text-gray-200">{joinPreview.name}</p>
              <p className="text-sm text-gray-500">{joinPreview.memberCount} membro(s)</p>
              <Button onClick={handleJoin} className="mt-3 w-full">
                Entrar
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {groups?.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Nenhum grupo"
          description="Crie um grupo ou entre em um usando o código de convite."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups?.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <Card className="group cursor-pointer transition-colors hover:border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-200">{group.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{group.memberCount} membro(s)</p>
                    <span className="mt-1 inline-block rounded-full bg-surface-hover px-2 py-0.5 text-xs capitalize text-gray-400">
                      {group.role === "owner" ? "Dono" : group.role === "admin" ? "Admin" : "Membro"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const link = `${window.location.origin}/groups/join?code=${group.inviteCode}`
                      navigator.clipboard.writeText(link)
                      setCopiedCode(group.inviteCode)
                      setTimeout(() => setCopiedCode(null), 2000)
                    }}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-surface-hover hover:text-gray-300"
                    title="Copiar link de convite"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedCode === group.inviteCode && (
                      <span className="absolute -mt-6 ml-4 text-xs text-green-400">Copiado!</span>
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
