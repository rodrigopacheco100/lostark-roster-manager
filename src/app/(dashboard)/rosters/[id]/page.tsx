"use client"

import { useState } from "react"
import useSWR from "swr"
import { useParams } from "next/navigation"
import Link from "next/link"
import { LostArkClass } from "@/db/schema"
import { Card, Badge, Button, Input, Select, PageHeader } from "@/components/ui"
import { ArrowLeft, Plus, Pencil, Trash2, X, Check } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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
  characters: Character[]
}

const classOptions = Object.values(LostArkClass).map((c) => ({ value: c, label: c }))

export default function RosterDetailPage() {
  const params = useParams()
  const rosterId = params.id as string
  const { data: roster, mutate } = useSWR<Roster>(`/api/rosters/${rosterId}`, fetcher)
  const { data: allRaids } = useSWR<Raid[]>("/api/raids", fetcher)

  const [newName, setNewName] = useState("")
  const [newClass, setNewClass] = useState<LostArkClass>(LostArkClass.Berserker)
  const [newItemLevel, setNewItemLevel] = useState("")
  const [editingChar, setEditingChar] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editClass, setEditClass] = useState<LostArkClass>(LostArkClass.Berserker)
  const [editItemLevel, setEditItemLevel] = useState("")

  const [assignCharId, setAssignCharId] = useState<string | null>(null)
  const [assignRaidDifficultyId, setAssignRaidDifficultyId] = useState("")

  async function handleAddCharacter(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newItemLevel) return
    await fetch(`/api/rosters/${rosterId}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, class: newClass, itemLevel: parseInt(newItemLevel) }),
    })
    setNewName("")
    setNewItemLevel("")
    mutate()
  }

  async function handleUpdateCharacter(id: string) {
    if (!editName.trim() || !editItemLevel) return
    await fetch(`/api/characters/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, class: editClass, itemLevel: parseInt(editItemLevel) }),
    })
    setEditingChar(null)
    mutate()
  }

  async function handleDeleteCharacter(id: string) {
    if (!confirm("Delete this character?")) return
    await fetch(`/api/characters/${id}`, { method: "DELETE" })
    mutate()
  }

  async function handleAssignRaid(characterId: string) {
    if (!assignRaidDifficultyId) return
    await fetch(`/api/characters/${characterId}/raids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raidDifficultyId: assignRaidDifficultyId }),
    })
    setAssignCharId(null)
    setAssignRaidDifficultyId("")
    mutate()
  }

  async function handleRemoveRaid(characterId: string, characterRaidId: string) {
    await fetch(`/api/characters/${characterId}/raids?characterRaidId=${characterRaidId}`, { method: "DELETE" })
    mutate()
  }

  function availableDifficulties(character: Character) {
    if (!allRaids) return []
    const result: { rdId: string; raidName: string; difficulty: string; minIlvl: number }[] = []
    const assignedRaidIds = new Set(character.characterRaids.map((cr) => cr.raidDifficulty.raid.id))
    for (const raid of allRaids) {
      if (assignedRaidIds.has(raid.id)) continue
      for (const rd of raid.difficulties) {
        if (character.itemLevel >= rd.minIlvl) {
          result.push({ rdId: rd.id, raidName: raid.name, difficulty: rd.difficulty, minIlvl: rd.minIlvl })
        }
      }
    }
    return result
  }

  if (!roster) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div>
      <Link href="/rosters" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-blue-400">
        <ArrowLeft className="h-4 w-4" /> Back to rosters
      </Link>
      <PageHeader title={roster.name} />

      <form onSubmit={handleAddCharacter} className="mb-8 flex flex-wrap gap-2">
        <Input
          type="text" value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Character name"
        />
        <Select
          value={newClass}
          onChange={(e) => setNewClass(e.target.value as LostArkClass)}
          options={classOptions}
          className="w-40"
        />
        <Input
          type="number" value={newItemLevel}
          onChange={(e) => setNewItemLevel(e.target.value)}
          placeholder="Item level"
          className="w-28"
        />
        <Button type="submit" icon={<Plus className="h-4 w-4" />}>
          Add Character
        </Button>
      </form>

      <div className="space-y-3">
        {roster.characters.map((char) => (
          <Card key={char.id}>
            {editingChar === char.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="text" value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Select
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value as LostArkClass)}
                  options={classOptions}
                  className="w-40"
                />
                <Input
                  type="number" value={editItemLevel}
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
                      variant="ghost" size="sm"
                      onClick={() => { setEditingChar(char.id); setEditName(char.name); setEditClass(char.class as LostArkClass); setEditItemLevel(String(char.itemLevel)) }}
                      icon={<Pencil className="h-4 w-4" />}
                    />
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleDeleteCharacter(char.id)}
                      icon={<Trash2 className="h-4 w-4 text-danger" />}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  {char.characterRaids.length > 0 ? (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {char.characterRaids.map((cr) => (
                        <span key={cr.id} className="inline-flex items-center gap-1 rounded-lg bg-surface-hover px-2.5 py-1 text-sm text-gray-300">
                          <Badge color="blue">{cr.raidDifficulty.raid.name}</Badge>
                          <span className="text-gray-500">({cr.raidDifficulty.difficulty})</span>
                          <button onClick={() => handleRemoveRaid(char.id, cr.id)} className="ml-1 text-gray-500 transition-colors hover:text-danger">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-3 text-sm text-gray-500">No raids assigned</p>
                  )}

                  {assignCharId === char.id ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={assignRaidDifficultyId}
                        onChange={(e) => setAssignRaidDifficultyId(e.target.value)}
                        options={[
                          { value: "", label: "Select raid" },
                          ...availableDifficulties(char).map((av) => ({
                            value: av.rdId,
                            label: `${av.raidName} - ${av.difficulty} (IL ${av.minIlvl})`,
                          })),
                        ]}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleAssignRaid(char.id)} icon={<Plus className="h-4 w-4" />}>
                        Add
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAssignCharId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setAssignCharId(char.id); setAssignRaidDifficultyId("") }}
                      disabled={char.characterRaids.length >= 3}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      {char.characterRaids.length >= 3 ? "Max raids (3)" : "Assign Raid"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
