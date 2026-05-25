"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, Button, PageHeader } from "@/components/ui"
import { Users, LogIn } from "lucide-react"

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
      setError("Nenhum código de convite fornecido.")
      setLoading(false)
      return
    }

    fetch(`/api/groups/join?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setGroup(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setError("Erro ao buscar grupo.")
        setLoading(false)
      })
  }, [code])

  async function handleJoin() {
    if (!group) return
    setJoining(true)
    setJoinError("")

    const res = await fetch(`/api/groups/${group.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code }),
    })

    if (!res.ok) {
      const data = await res.json()
      setJoinError(data.error ?? "Erro ao entrar no grupo.")
      setJoining(false)
      return
    }

    router.push(`/groups/${group.id}`)
  }

  return (
    <div>
      <PageHeader title="Entrar no Grupo" />

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
              <h2 className="text-lg font-semibold text-gray-200">Grupo não encontrado</h2>
              <p className="text-sm text-gray-400">{error}</p>
              <Button onClick={() => router.push("/groups")} variant="secondary">
                Voltar para Grupos
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
                <p className="mt-1 text-sm text-gray-500">{group.memberCount} membro(s)</p>
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
                  {joining ? "Entrando..." : "Entrar no Grupo"}
                </Button>
                <Button onClick={() => router.push("/groups")} variant="ghost">
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
