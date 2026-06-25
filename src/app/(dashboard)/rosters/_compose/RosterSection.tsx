"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, ChevronDown, ChevronRight, GripVertical, Link2, Pencil, Plus, Trash2, Upload, X } from "lucide-react"

import { useState } from "react"
import { AddRosterCharactersModal } from "@/components/AddRosterCharactersModal"

import { SortableList } from "@/components/SortableList"
import { Button, Card, Input, Select } from "@/components/ui"
import { LostArkClass } from "@/db/schema"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"
import type { Character, Raid, Roster } from "../_types"
import { CharacterRow } from "./CharacterRow"

const classOptions = Object.values(LostArkClass).map((c) => ({ value: c, label: c }))

interface Props {
  roster: Roster
  isExpanded: boolean
  isReorderingRosters: boolean
  allRaids: Raid[] | undefined
  onToggleExpand: () => void
  editingRosterId: string | null
  editRosterName: string
  onStartEditRoster: () => void
  onEditRosterNameChange: (value: string) => void
  onSaveRoster: () => Promise<void>
  onCancelRosterEdit: () => void
  onDeleteRoster: () => Promise<void>
  charReordering: boolean
  charReorderDirty: boolean
  onStartCharReorder: () => void
  onCharReorder: (ids: string[]) => void
  onSaveCharReorder: () => Promise<void>
  onDiscardCharReorder: () => void
  charReorderPending: boolean
}

export function RosterSection({
  roster,
  isExpanded,
  isReorderingRosters,
  allRaids,
  onToggleExpand,
  editingRosterId,
  editRosterName,
  onStartEditRoster,
  onEditRosterNameChange,
  onSaveRoster,
  onCancelRosterEdit,
  onDeleteRoster,
  charReordering,
  charReorderDirty,
  onStartCharReorder,
  onCharReorder,
  onSaveCharReorder,
  onDiscardCharReorder,
  charReorderPending,
}: Props) {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const { confirm } = useConfirm()

  // Per-roster character state
  const [charForm, setCharForm] = useState({ name: "", class: LostArkClass.Berserker, itemLevel: "" })
  const [editingChar, setEditingChar] = useState<string | null>(null)
  const [editCharData, setEditCharData] = useState<
    Record<string, { name: string; class: LostArkClass; itemLevel: string }>
  >({})
  const [raidComboboxCharId, setRaidComboboxCharId] = useState<string | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const isEditingRoster = editingRosterId === roster.id

  // Mutations
  const addCharMutation = useMutation({
    mutationFn: (data: { name: string; class: LostArkClass; itemLevel: number }) =>
      httpClient.post(`/api/rosters/${roster.id}/characters`, data),
  })

  const updateCharMutation = useMutation({
    mutationFn: ({ id, name, class: c, itemLevel }: { id: string; name: string; class: string; itemLevel: number }) =>
      httpClient.put(`/api/characters/${id}`, { name, class: c, itemLevel }),
  })

  const deleteCharMutation = useMutation({
    mutationFn: (id: string) => httpClient.delete(`/api/characters/${id}`),
  })

  const removeRaidMutation = useMutation({
    mutationFn: ({ characterId, characterRaidId }: { characterId: string; characterRaidId: string }) =>
      httpClient.delete(`/api/characters/${characterId}/raids?characterRaidId=${characterRaidId}`),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })

  async function handleAddCharacter(e: React.FormEvent) {
    e.preventDefault()
    if (!charForm.name.trim() || !charForm.itemLevel) return
    await promise(
      addCharMutation.mutateAsync({
        name: charForm.name,
        class: charForm.class,
        itemLevel: parseInt(charForm.itemLevel, 10),
      }),
      { loading: "Adding...", success: "Character added!", error: (err: Error) => err.message },
    )
    setCharForm({ name: "", class: LostArkClass.Berserker, itemLevel: "" })
    invalidate()
  }

  async function handleUpdateCharacter(id: string) {
    const data = editCharData[id]
    if (!data?.name.trim() || !data.itemLevel) return
    await promise(
      updateCharMutation.mutateAsync({
        id,
        name: data.name,
        class: data.class,
        itemLevel: parseInt(data.itemLevel, 10),
      }),
      { loading: "Updating...", success: "Character updated!", error: (err: Error) => err.message },
    )
    setEditingChar(null)
    invalidate()
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
    await promise(deleteCharMutation.mutateAsync(id), {
      loading: "Deleting...",
      success: "Character deleted",
      error: (err: Error) => err.message,
    })
    invalidate()
  }

  async function handleRemoveRaid(characterId: string, characterRaidId: string) {
    await promise(removeRaidMutation.mutateAsync({ characterId, characterRaidId }), {
      loading: "Removing...",
      success: "Raid removed!",
      error: (err: Error) => err.message,
    })
    invalidate()
  }

  const showExpandedContent = isExpanded && !isReorderingRosters

  return (
    <Card>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex flex-1 cursor-pointer items-center gap-3 bg-transparent text-left"
          onClick={onToggleExpand}
        >
          {isEditingRoster ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="text"
                value={editRosterName}
                onChange={(e) => onEditRosterNameChange(e.target.value)}
                autoFocus
                className="flex-1"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSaveRoster()
                }}
                icon={<Check className="h-4 w-4" />}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCancelRosterEdit()
                }}
                icon={<X className="h-4 w-4" />}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
              )}
              <span className="font-medium text-gray-200">
                {roster.name}
              </span>
              {roster.rosterGuid && (
                <span title="Linked to AGS API">
                  <Link2 className="h-3.5 w-3.5 text-blue-400" />
                </span>
              )}
              <span className="text-sm text-gray-500">{roster.characters.length} characters</span>
            </>
          )}
        </button>
        {!isEditingRoster && (
          <span className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={<Pencil className="h-4 w-4" />}
              onClick={(e) => {
                e.stopPropagation()
                onStartEditRoster()
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="h-4 w-4 text-danger" />}
              onClick={(e) => {
                e.stopPropagation()
                onDeleteRoster()
              }}
            />
          </span>
        )}
      </div>

      {showExpandedContent && (
        <div className="mt-3 border-t border-gray-700 pt-3">
          <form onSubmit={handleAddCharacter} className="mb-3 flex flex-wrap items-center gap-1.5">
            <Input
              type="text"
              value={charForm.name}
              onChange={(e) => setCharForm({ ...charForm, name: e.target.value })}
              placeholder="Character name"
              className="h-8 text-sm"
            />
            <Select
              value={charForm.class}
              onChange={(e) => setCharForm({ ...charForm, class: e.target.value as LostArkClass })}
              options={classOptions}
              className="h-8 w-36 text-sm"
            />
            <Input
              type="number"
              value={charForm.itemLevel}
              onChange={(e) => setCharForm({ ...charForm, itemLevel: e.target.value })}
              placeholder="Item level"
              className="h-8 w-24 text-sm"
            />
            <Button type="submit" size="sm" icon={<Plus className="h-3.5 w-3.5" />} className="h-8">
              Add
            </Button>
            {roster.rosterGuid && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Upload className="h-3.5 w-3.5" />}
                onClick={() => setImportModalOpen(true)}
                className="h-8"
              >
                Import
              </Button>
            )}
          </form>

          {roster.characters.length > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onStartCharReorder}
                icon={<GripVertical className="h-4 w-4" />}
              >
                {charReordering ? "Cancel Reorder" : "Reorder"}
              </Button>
              {charReordering && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onSaveCharReorder}
                    disabled={!charReorderDirty || charReorderPending}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDiscardCharReorder}
                    disabled={charReorderPending}
                  >
                    Discard
                  </Button>
                </>
              )}
            </div>
          )}

          {roster.characters.length === 0 ? (
            <p className="text-sm text-gray-500">No characters in this roster.</p>
          ) : (
            <SortableList
              key={String(charReordering)}
              items={roster.characters}
              onReorder={onCharReorder}
              sortable={charReordering}
              className="space-y-1"
            >
              {(char: Character) => (
                <CharacterRow
                  character={char}
                  isEditing={editingChar === char.id}
                  editData={editCharData[char.id] ?? null}
                  onStartEdit={() => {
                    setEditingChar(char.id)
                    setEditCharData((prev) => ({
                      ...prev,
                      [char.id]: {
                        name: char.name,
                        class: char.class as LostArkClass,
                        itemLevel: String(char.itemLevel),
                      },
                    }))
                  }}
                  onEditChange={(data) => setEditCharData((prev) => ({ ...prev, [char.id]: data }))}
                  onSaveEdit={() => handleUpdateCharacter(char.id)}
                  onCancelEdit={() => setEditingChar(null)}
                  onDelete={() => handleDeleteCharacter(char.id)}
                  onRemoveRaid={(characterRaidId) => handleRemoveRaid(char.id, characterRaidId)}
                  raidComboboxOpen={raidComboboxCharId === char.id}
                  onToggleRaidCombobox={() => setRaidComboboxCharId(char.id)}
                  onCloseRaidCombobox={() => setRaidComboboxCharId(null)}
                  allRaids={allRaids ?? []}
                  rosterId={roster.id}
                />
              )}
            </SortableList>
          )}
        </div>
      )}

      <AddRosterCharactersModal
        rosterId={roster.id}
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </Card>
  )
}
