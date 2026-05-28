"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check, GripVertical, Pencil, Plus, Trash2, Upload, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AddRosterCharactersModal } from "@/components/AddRosterCharactersModal"
import { FloatingSaveBar } from "@/components/FloatingSaveBar"
import { RaidCombobox } from "@/components/raid/RaidCombobox"
import { SortableList } from "@/components/SortableList"
import { Badge, Button, Card, Input, PageHeader, Select } from "@/components/ui"
import { LostArkClass } from "@/db/schema"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

type RaidDifficulty = {
  id: string
  difficulty: string
  minIlvl: number
}

type Raid = {
  id: string
  name: string
  difficulties: RaidDifficulty[]
}

type CharacterRaid = {
  id: string
  raidDifficulty: RaidDifficulty & { raid: Raid }
}

type Character = {
  id: string
  name: string
  class: string
  itemLevel: number
  characterRaids: CharacterRaid[]
}

type Roster = {
  id: string
  name: string
  rosterGuid?: string | null
  characters: Character[]
}

const classOptions = Object.values(LostArkClass).map((c) => ({ value: c, label: c }))

export default function RosterDetailPage() {
  const params = useParams()
  const rosterId = params.id as string
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    data: roster,
    isError,
    error,
  } = useQuery<Roster>({
    queryKey: [`/api/rosters/${rosterId}`],
    queryFn: () => httpClient.get<Roster>(`/api/rosters/${rosterId}`),
    staleTime: 10_000,
    retry: false,
  })
  const { data: allRaids } = useQuery<Raid[]>({
    queryKey: ["/api/raids"],
    queryFn: () => httpClient.get<Raid[]>("/api/raids"),
    staleTime: 10_000,
  })
  const { confirm } = useConfirm()
  const { toast, promise } = useToast()

  useEffect(() => {
    if (isError) {
      toast(error instanceof Error ? error.message : "Error loading roster", "error")
      router.push("/rosters")
    }
  }, [isError, toast, router.push, error?.message, error])

  const [newName, setNewName] = useState("")
  const [newClass, setNewClass] = useState<LostArkClass>(LostArkClass.Berserker)
  const [newItemLevel, setNewItemLevel] = useState("")
  const [editingChar, setEditingChar] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editClass, setEditClass] = useState<LostArkClass>(LostArkClass.Berserker)
  const [editItemLevel, setEditItemLevel] = useState("")

  const [raidComboboxCharId, setRaidComboboxCharId] = useState<string | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [reorderDirty, setReorderDirty] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const workingOrderRef = useRef<string[]>([])

  const addCharacterMutation = useMutation({
    mutationFn: (data: { name: string; class: LostArkClass; itemLevel: number }) =>
      httpClient.post(`/api/rosters/${rosterId}/characters`, data),
  })

  const updateCharacterMutation = useMutation({
    mutationFn: ({
      id,
      name,
      class: charClass,
      itemLevel,
    }: {
      id: string
      name: string
      class: string
      itemLevel: number
    }) => httpClient.put(`/api/characters/${id}`, { name, class: charClass, itemLevel }),
  })

  const deleteCharacterMutation = useMutation({
    mutationFn: (id: string) => httpClient.delete(`/api/characters/${id}`),
  })

  const removeRaidMutation = useMutation({
    mutationFn: ({ characterId, characterRaidId }: { characterId: string; characterRaidId: string }) =>
      httpClient.delete(`/api/characters/${characterId}/raids?characterRaidId=${characterRaidId}`),
  })

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => httpClient.put("/api/characters/reorder", { ids, rosterId }),
  })

  async function handleAddCharacter(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newItemLevel) return
    await promise(
      addCharacterMutation.mutateAsync({ name: newName, class: newClass, itemLevel: parseInt(newItemLevel, 10) }),
      { loading: "Adding...", success: "Character added!", error: (err: Error) => err.message },
    )
    setNewName("")
    setNewItemLevel("")
    queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
  }

  async function handleUpdateCharacter(id: string) {
    if (!editName.trim() || !editItemLevel) return
    await promise(
      updateCharacterMutation.mutateAsync({
        id,
        name: editName,
        class: editClass,
        itemLevel: parseInt(editItemLevel, 10),
      }),
      { loading: "Updating...", success: "Character updated!", error: (err: Error) => err.message },
    )
    setEditingChar(null)
    queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
  }

  async function handleDeleteCharacter(id: string) {
    const ok = await confirm({
      title: "Delete character",
      message: "Are you sure you want to delete this character?",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    })
    if (!ok) return
    await promise(deleteCharacterMutation.mutateAsync(id), {
      loading: "Deleting...",
      success: "Character deleted",
      error: (err: Error) => err.message,
    })
    queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
  }

  async function handleRemoveRaid(characterId: string, characterRaidId: string) {
    await promise(removeRaidMutation.mutateAsync({ characterId, characterRaidId }), {
      loading: "Removing...",
      success: "Raid removed!",
      error: (err: Error) => err.message,
    })
    queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
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
    queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
  }

  function handleDiscardReorder() {
    queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
    setReorderDirty(false)
    setIsReordering(false)
  }

  function toggleReorder() {
    setIsReordering((v) => !v)
  }

  if (!roster) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div>
      <Link
        href="/rosters"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-blue-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to rosters
      </Link>
      <PageHeader title={roster.name} />

      <form onSubmit={handleAddCharacter} className="mb-2 flex flex-wrap gap-2">
        <Input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Character name" />
        <Select
          value={newClass}
          onChange={(e) => setNewClass(e.target.value as LostArkClass)}
          options={classOptions}
          className="w-40"
        />
        <Input
          type="number"
          value={newItemLevel}
          onChange={(e) => setNewItemLevel(e.target.value)}
          placeholder="Item level"
          className="w-28"
        />
        <Button type="submit" icon={<Plus className="h-4 w-4" />}>
          Add Character
        </Button>
        {roster.rosterGuid && (
          <Button
            type="button"
            variant="secondary"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => setImportModalOpen(true)}
          >
            Import Characters
          </Button>
        )}
      </form>
      {roster.characters.length > 0 && (
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

      <SortableList items={roster.characters} onReorder={handleReorder} sortable={isReordering} className="space-y-3">
        {(char) => (
          <Card>
            {editingChar === char.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <Select
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value as LostArkClass)}
                  options={classOptions}
                  className="w-40"
                />
                <Input
                  type="number"
                  value={editItemLevel}
                  onChange={(e) => setEditItemLevel(e.target.value)}
                  className="w-24"
                />
                <Button size="sm" onClick={() => handleUpdateCharacter(char.id)} icon={<Check className="h-4 w-4" />}>
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingChar(null)} icon={<X className="h-4 w-4" />}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-200">{char.name}</span>
                    <Badge color="gray">{char.class}</Badge>
                    <span className="text-sm text-gray-500">IL {char.itemLevel}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingChar(char.id)
                        setEditName(char.name)
                        setEditClass(char.class as LostArkClass)
                        setEditItemLevel(String(char.itemLevel))
                      }}
                      icon={<Pencil className="h-4 w-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCharacter(char.id)}
                      icon={<Trash2 className="h-4 w-4 text-danger" />}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  {char.characterRaids.length > 0 ? (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {char.characterRaids.map((cr) => (
                        <span
                          key={cr.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-surface-hover px-2.5 py-1 text-sm text-gray-300"
                        >
                          <Badge color="blue">{cr.raidDifficulty.raid.name}</Badge>
                          <span className="text-gray-500">({cr.raidDifficulty.difficulty})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRaid(char.id, cr.id)}
                            className="ml-1 text-gray-500 transition-colors hover:text-danger"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-3 text-sm text-gray-500">No raids assigned</p>
                  )}

                  {raidComboboxCharId === char.id && allRaids ? (
                    <RaidCombobox
                      character={char}
                      allRaids={allRaids}
                      rosterId={rosterId}
                      onClose={() => setRaidComboboxCharId(null)}
                    />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRaidComboboxCharId(char.id)}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Edit Raids
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        )}
      </SortableList>
      {isReordering && (
        <FloatingSaveBar
          onSave={handleSaveReorder}
          onDiscard={handleDiscardReorder}
          saving={reorderMutation.isPending}
          canSave={reorderDirty}
        />
      )}
      <AddRosterCharactersModal rosterId={rosterId} isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
    </div>
  )
}
