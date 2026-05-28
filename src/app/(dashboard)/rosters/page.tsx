"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, GripVertical, Pencil, Plus, Sword, Trash2, Upload, X } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"
import { FloatingSaveBar } from "@/components/FloatingSaveBar"
import { ImportRosterModal } from "@/components/ImportRosterModal"
import { SortableList } from "@/components/SortableList"
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
  const [reorderDirty, setReorderDirty] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const workingOrderRef = useRef<string[]>([])
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

  const [importModalOpen, setImportModalOpen] = useState(false)

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => httpClient.put("/api/rosters/reorder", { ids }),
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

  function handleReorder(ids: string[]) {
    workingOrderRef.current = ids
    setReorderDirty(true)
  }

  async function handleSaveReorder() {
    const ids = workingOrderRef.current
    if (ids.length === 0) return
    await promise(reorderMutation.mutateAsync(ids), {
      loading: "Saving order...",
      success: "Order saved!",
      error: (err: Error) => err.message,
    })
    setReorderDirty(false)
    setIsReordering(false)
    queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })
  }

  function handleDiscardReorder() {
    queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })
    setReorderDirty(false)
    setIsReordering(false)
  }

  function toggleReorder() {
    setIsReordering((v) => !v)
  }

  return (
    <div>
      <PageHeader title="Rosters" />

      <form onSubmit={handleCreate} className="mb-2 flex gap-2">
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
        <Button
          type="button"
          variant="secondary"
          icon={<Upload className="h-4 w-4" />}
          onClick={() => setImportModalOpen(true)}
        >
          Import
        </Button>
      </form>
      {rosters && rosters.length > 0 && (
        <div className="mb-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleReorder}
            disabled={isReordering}
            icon={<GripVertical className="h-4 w-4" />}
          >
            Reorder
          </Button>
        </div>
      )}

      {rosters?.length === 0 ? (
        <EmptyState
          icon={<Sword className="h-12 w-12" />}
          title="No rosters yet"
          description="Create your first roster to start tracking characters and raids."
        />
      ) : (
        <SortableList items={rosters ?? []} onReorder={handleReorder} sortable={isReordering} className="space-y-3">
          {(roster) => (
            <Card className="flex items-center justify-between">
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
          )}
        </SortableList>
      )}
      {isReordering && (
        <FloatingSaveBar
          onSave={handleSaveReorder}
          onDiscard={handleDiscardReorder}
          saving={reorderMutation.isPending}
          canSave={reorderDirty}
        />
      )}
      <ImportRosterModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
    </div>
  )
}
