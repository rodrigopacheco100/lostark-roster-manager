"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, Badge, Button, Input, PageHeader } from "@/components/ui"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/useToast"
import { Plus, Trash2, X } from "lucide-react"
import { http } from "@/lib/api"

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
  const queryClient = useQueryClient()
  const { toast, promise } = useToast()
  const { data: raids } = useQuery<Raid[]>({
    queryKey: ["/api/raids"],
    queryFn: () => http.get<Raid[]>("/api/raids"),
  })
  const [name, setName] = useState("")
  const [difficulties, setDifficulties] = useState([{ difficulty: "", minIlvl: "" }])
  const { confirm } = useConfirm()

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

  const createMutation = useMutation({
    mutationFn: (data: { name: string; difficulties: { difficulty: string; minIlvl: number }[] }) =>
      http.post("/api/raids", data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      http.delete(`/api/raids?id=${id}`),
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const validDiffs = difficulties.filter((d) => d.difficulty.trim() && d.minIlvl)
    await promise(
      createMutation.mutateAsync({
        name: name.trim(),
        difficulties: validDiffs.map((d) => ({ difficulty: d.difficulty.trim(), minIlvl: parseInt(d.minIlvl) })),
      }),
      { loading: "Creating...", success: "Raid created!", error: (err: Error) => err.message },
    )
    setName("")
    setDifficulties([{ difficulty: "", minIlvl: "" }])
    queryClient.invalidateQueries({ queryKey: ["/api/raids"] })
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete raid",
      message: "Are you sure you want to delete this raid?",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    })
    if (!ok) return
    await promise(
      deleteMutation.mutateAsync(id),
      { loading: "Deleting...", success: "Raid deleted", error: (err: Error) => err.message },
    )
    queryClient.invalidateQueries({ queryKey: ["/api/raids"] })
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
