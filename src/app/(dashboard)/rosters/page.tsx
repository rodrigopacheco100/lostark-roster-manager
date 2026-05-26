"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Pencil, Plus, Sword, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button, Card, EmptyState, Input, PageHeader } from "@/components/ui"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

type Roster = {
  id: string
  name: string
  characters: { id: string }[]
}

export default function RostersPage() {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const { data: rosters } = useQuery<Roster[]>({
    queryKey: ["/api/rosters"],
    queryFn: () => httpClient.get<Roster[]>("/api/rosters"),
    staleTime: 10_000,
  })
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const { confirm } = useConfirm()

  const createMutation = useMutation({
    mutationFn: (name: string) => httpClient.post<Roster>("/api/rosters", { name }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => httpClient.put(`/api/rosters/${id}`, { name }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => httpClient.delete(`/api/rosters/${id}`),
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await promise(createMutation.mutateAsync(newName), {
      loading: "Creating...",
      success: "Roster created!",
      error: (err: Error) => err.message,
    })
    setNewName("")
    queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return
    await promise(updateMutation.mutateAsync({ id, name: editName }), {
      loading: "Updating...",
      success: "Roster updated!",
      error: (err: Error) => err.message,
    })
    setEditingId(null)
    queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete roster",
      message: "Delete this roster and all its characters? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    })
    if (!ok) return
    await promise(deleteMutation.mutateAsync(id), {
      loading: "Deleting...",
      success: "Roster deleted",
      error: (err: Error) => err.message,
    })
    queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })
  }

  return (
    <div>
      <PageHeader title="Rosters" />

      <form onSubmit={handleCreate} className="mb-8 flex gap-2">
        <Input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New roster name"
          className="flex-1"
        />
        <Button type="submit" icon={<Plus className="h-4 w-4" />}>
          Create
        </Button>
      </form>

      {rosters?.length === 0 ? (
        <EmptyState
          icon={<Sword className="h-12 w-12" />}
          title="No rosters yet"
          description="Create your first roster to start tracking characters and raids."
        />
      ) : (
        <div className="space-y-3">
          {rosters?.map((roster) => (
            <Card key={roster.id} className="flex items-center justify-between">
              {editingId === roster.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdate(roster.id)}
                    icon={<Check className="h-4 w-4" />}
                  >
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} icon={<X className="h-4 w-4" />}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/rosters/${roster.id}`}
                      className="font-medium text-gray-200 transition-colors hover:text-blue-400"
                    >
                      {roster.name}
                    </Link>
                    <span className="text-sm text-gray-500">{roster.characters.length} characters</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Pencil className="h-4 w-4" />}
                      onClick={() => {
                        setEditingId(roster.id)
                        setEditName(roster.name)
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4 text-danger" />}
                      onClick={() => handleDelete(roster.id)}
                    />
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
