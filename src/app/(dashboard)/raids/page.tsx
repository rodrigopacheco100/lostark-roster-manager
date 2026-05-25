"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, Badge, Button, Input, PageHeader } from "@/components/ui"
import { Plus, Trash2, X } from "lucide-react"

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

export default function RaidsPage() {
  const { data: raids, mutate } = useSWR<Raid[]>("/api/raids", fetcher)
  const [name, setName] = useState("")
  const [difficulties, setDifficulties] = useState([{ difficulty: "", minIlvl: "" }])

  function addDifficultyRow() {
    setDifficulties([...difficulties, { difficulty: "", minIlvl: "" }])
  }

  function updateDifficultyRow(i: number, field: "difficulty" | "minIlvl", value: string) {
    const next = [...difficulties]
    next[i] = { ...next[i], [field]: value }
    setDifficulties(next)
  }

  function removeDifficultyRow(i: number) {
    setDifficulties(difficulties.filter((_, idx) => idx !== i))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const validDiffs = difficulties.filter((d) => d.difficulty.trim() && d.minIlvl)
    await fetch("/api/raids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        difficulties: validDiffs.map((d) => ({ difficulty: d.difficulty.trim(), minIlvl: parseInt(d.minIlvl) })),
      }),
    })
    setName("")
    setDifficulties([{ difficulty: "", minIlvl: "" }])
    mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this raid?")) return
    await fetch(`/api/raids?id=${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div>
      <PageHeader title="Raids" />

      <Card className="mb-8">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Raid name"
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400">Difficulties</p>
            {difficulties.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="text"
                  value={d.difficulty}
                  onChange={(e) => updateDifficultyRow(i, "difficulty", e.target.value)}
                  placeholder="e.g. Normal"
                />
                <Input
                  type="number"
                  value={d.minIlvl}
                  onChange={(e) => updateDifficultyRow(i, "minIlvl", e.target.value)}
                  placeholder="Min iLvl"
                  className="w-28"
                />
                {difficulties.length > 1 && (
                  <Button variant="ghost" size="sm" type="button" onClick={() => removeDifficultyRow(i)} icon={<X className="h-4 w-4 text-danger" />}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" type="button" onClick={addDifficultyRow} icon={<Plus className="h-4 w-4" />}>
              Add difficulty
            </Button>
          </div>

          <Button type="submit">Create</Button>
        </form>
      </Card>

      <div className="space-y-2">
        {raids?.map((raid) => (
          <Card key={raid.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-200">{raid.name}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {raid.difficulties.map((d) => (
                  <Badge key={d.id} color="gray">
                    {d.difficulty} (iLvl {d.minIlvl})
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(raid.id)} icon={<Trash2 className="h-4 w-4 text-danger" />} />
          </Card>
        ))}
      </div>
    </div>
  )
}
