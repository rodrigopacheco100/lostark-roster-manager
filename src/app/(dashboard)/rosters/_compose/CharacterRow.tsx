"use client"

import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { RaidCombobox } from "@/components/raid/RaidCombobox"
import { Badge, Button, Input, Select } from "@/components/ui"
import { LostArkClass } from "@/db/schema"
import type { Character, Raid } from "../_types"

interface Props {
  character: Character
  isEditing: boolean
  editData: { name: string; class: LostArkClass; itemLevel: string } | null
  onStartEdit: () => void
  onEditChange: (data: { name: string; class: LostArkClass; itemLevel: string }) => void
  onSaveEdit: () => Promise<void>
  onCancelEdit: () => void
  onDelete: () => Promise<void>
  onRemoveRaid: (characterRaidId: string) => Promise<void>
  raidComboboxOpen: boolean
  onToggleRaidCombobox: () => void
  onCloseRaidCombobox: () => void
  allRaids: Raid[]
  rosterId: string
}

const classOptions = Object.values(LostArkClass).map((c) => ({ value: c, label: c }))

export function CharacterRow({
  character,
  isEditing,
  editData,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onRemoveRaid,
  raidComboboxOpen,
  onToggleRaidCombobox,
  onCloseRaidCombobox,
  allRaids,
  rosterId,
}: Props) {
  if (isEditing && editData) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-surface-hover px-3 py-1.5">
        <Input
          type="text"
          value={editData.name}
          onChange={(e) => onEditChange({ ...editData, name: e.target.value })}
          className="h-7 text-sm"
        />
        <Select
          value={editData.class}
          onChange={(e) => onEditChange({ ...editData, class: e.target.value as LostArkClass })}
          options={classOptions}
          className="h-7 w-36 text-sm"
        />
        <Input
          type="number"
          value={editData.itemLevel}
          onChange={(e) => onEditChange({ ...editData, itemLevel: e.target.value })}
          className="h-7 w-20 text-sm"
        />
        <Button size="sm" onClick={onSaveEdit} icon={<Check className="h-3.5 w-3.5" />} className="h-7">
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancelEdit} icon={<X className="h-3.5 w-3.5" />} className="h-7">
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg bg-surface-hover px-3 py-1.5">
      <span className="text-sm font-medium text-gray-200">{character.name}</span>
      <Badge color="gray" className="shrink-0 text-xs">
        {character.class}
      </Badge>
      <span className="shrink-0 text-xs text-gray-500">IL {character.itemLevel}</span>

      {character.characterRaids.map((cr) => (
        <span
          key={cr.id}
          className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-gray-700/50 px-1.5 py-0.5 text-xs text-gray-300"
        >
          <Badge color="blue" className="text-xs">
            {cr.raidDifficulty.raid.name}
          </Badge>
          <span className="text-gray-500">({cr.raidDifficulty.difficulty})</span>
          <button
            type="button"
            onClick={() => onRemoveRaid(cr.id)}
            className="text-gray-500 transition-colors hover:text-danger"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {raidComboboxOpen ? (
        <RaidCombobox character={character} allRaids={allRaids} rosterId={rosterId} onClose={onCloseRaidCombobox} />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleRaidCombobox}
          icon={<Plus className="h-3.5 w-3.5" />}
          className="h-7 shrink-0 px-1.5 text-xs"
        >
          {character.characterRaids.length > 0 ? "Raids" : "Add Raids"}
        </Button>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartEdit}
          icon={<Pencil className="h-3.5 w-3.5" />}
          className="h-7 px-1.5"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          icon={<Trash2 className="h-3.5 w-3.5 text-danger" />}
          className="h-7 px-1.5"
        />
      </div>
    </div>
  )
}
