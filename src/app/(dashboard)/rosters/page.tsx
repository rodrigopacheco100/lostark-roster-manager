"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Card, Button, Input, PageHeader, EmptyState } from "@/components/ui"
import { Sword, Plus, Pencil, Trash2, X, Check } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Roster = {
  id: string
  name: string
  characters: { id: string }[]
}

export default function RostersPage() {
  const { data: rosters, mutate } = useSWR<Roster[]>("/api/rosters", fetcher)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await fetch("/api/rosters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
    setNewName("")
    mutate()
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return
    await fetch(`/api/rosters/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    })
    setEditingId(null)
    mutate()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this roster and all its characters?")) return
    await fetch(`/api/rosters/${id}`, { method: "DELETE" })
    mutate()
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
                  <Button variant="primary" size="sm" onClick={() => handleUpdate(roster.id)} icon={<Check className="h-4 w-4" />}>
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
                    <span className="text-sm text-gray-500">
                      {roster.characters.length} characters
                    </span>
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
