"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Search, Upload } from "lucide-react"
import { useState } from "react"
import { mappedIconsByClass } from "@/assets/classes"
import { Button, Input, Modal } from "@/components/ui"
import type { LostArkClass } from "@/db/schema"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

interface PreviewCharacter {
  guid: string
  name: string
  class: string
  agsClass: string
  itemLevel: number
}

interface PreviewResponse {
  rosterGuid: string
  region: string
  world: string
  characters: PreviewCharacter[]
}

interface ImportResponse {
  id: string
  name: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function ImportRosterModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const [region, setRegion] = useState("NA")
  const [rosterName, setRosterName] = useState("")
  const [characterName, setCharacterName] = useState("")
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const previewMutation = useMutation({
    mutationFn: (data: { region: string; characterName: string }) =>
      httpClient.post<PreviewResponse>("/api/rosters/import/preview", data),
    onSuccess: (data) => {
      setPreview(data)
      setSelected(new Set())
    },
  })

  const importMutation = useMutation({
    mutationFn: (data: {
      name: string
      rosterGuid: string
      characters: { guid: string; name: string; agsClass: string; itemLevel: number }[]
    }) => httpClient.post<ImportResponse>("/api/rosters/import", data),
  })

  function handleClose() {
    setPreview(null)
    setSelected(new Set())
    setRosterName("")
    setCharacterName("")
    onClose()
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!characterName.trim()) return
    previewMutation.mutate({ region, characterName: characterName.trim() })
  }

  function toggleCharacter(guid: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(guid)) next.delete(guid)
      else next.add(guid)
      return next
    })
  }

  async function handleImport() {
    if (!preview) return
    const charsToImport = preview.characters.filter((c) => selected.has(c.guid))
    if (charsToImport.length === 0) return
    await promise(
      importMutation.mutateAsync({
        name: rosterName.trim(),
        rosterGuid: preview.rosterGuid,
        characters: charsToImport.map((c) => ({
          guid: c.guid,
          name: c.name,
          agsClass: c.agsClass,
          itemLevel: c.itemLevel,
        })),
      }),
      { loading: "Creating roster...", success: "Roster created!", error: (err: Error) => err.message },
    )
    queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Roster">
      <form onSubmit={handleSearch} className="mb-4 flex flex-col gap-3">
        <Input
          type="text"
          value={rosterName}
          onChange={(e) => setRosterName(e.target.value)}
          placeholder="Roster name"
        />
        <div className="flex gap-2">
          <Input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Region"
            className="w-24 shrink-0"
          />
          <Input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Character name"
            className="flex-1"
          />
        </div>
        <Button
          type="submit"
          icon={
            previewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />
          }
          disabled={!characterName.trim() || previewMutation.isPending}
        >
          {previewMutation.isPending ? "Searching..." : "Search"}
        </Button>
      </form>

      {previewMutation.isError && (
        <p className="mb-3 text-sm text-danger">
          {previewMutation.error instanceof Error ? previewMutation.error.message : "Search failed"}
        </p>
      )}
      {importMutation.isError && (
        <p className="mb-3 text-sm text-danger">
          {importMutation.error instanceof Error ? importMutation.error.message : "Import failed"}
        </p>
      )}

      {preview && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Found <span className="font-medium text-gray-200">{preview.characters.length}</span> characters on{" "}
            <span className="text-gray-200">{preview.world}</span> ({preview.region})
          </p>

          <div className="max-h-80 space-y-1.5 overflow-y-auto">
            {preview.characters.map((char) => {
              const isSelected = selected.has(char.guid)
              const ClassIcon = mappedIconsByClass[char.class as LostArkClass]
              return (
                <button
                  key={char.guid}
                  type="button"
                  onClick={() => toggleCharacter(char.guid)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-surface-hover"
                  }`}
                >
                  <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4 rounded border-gray-600" />
                  <div className="flex flex-1 items-center gap-2">
                    {ClassIcon && <ClassIcon className="size-4 shrink-0 text-gray-400" />}
                    <span className="text-sm font-medium text-gray-200">{char.name}</span>
                    <span className="text-xs text-gray-500">IL {char.itemLevel}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-700 pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              icon={
                importMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />
              }
              onClick={handleImport}
              disabled={!rosterName.trim() || selected.size === 0 || importMutation.isPending}
            >
              {importMutation.isPending ? "Importing..." : `Import (${selected.size})`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
