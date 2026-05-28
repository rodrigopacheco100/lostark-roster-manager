"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { mappedIconsByClass } from "@/assets/classes"
import { Button, Modal } from "@/components/ui"
import { useToast } from "@/hooks/useToast"
import { LostArkClass } from "@/db/schema"
import { httpClient } from "@/lib/api"

interface PreviewCharacter {
  guid: string
  name: string
  class: string
  agsClass: string
  itemLevel: number
  alreadyInRoster: boolean
}

interface PreviewResponse {
  region: string
  world: string
  characters: PreviewCharacter[]
}

interface BulkResponse {
  created: number
  skipped: number
  characters: { name: string; characterGuid: string }[]
}

interface Props {
  rosterId: string
  isOpen: boolean
  onClose: () => void
}

export function AddRosterCharactersModal({ rosterId, isOpen, onClose }: Props) {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const previewMutation = useMutation({
    mutationFn: () =>
      httpClient.post<PreviewResponse>(`/api/rosters/${rosterId}/characters/preview-by-guid`),
    onSuccess: (data) => {
      setSelected(new Set())
    },
  })

  const importMutation = useMutation({
    mutationFn: (data: {
      characters: { guid: string; name: string; agsClass: string; itemLevel: number }[]
    }) => httpClient.post<BulkResponse>(`/api/rosters/${rosterId}/characters/bulk`, data),
  })

  function handleClose() {
    setSelected(new Set())
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      previewMutation.mutate()
    }
  }, [isOpen])

  const preview = previewMutation.data

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
        characters: charsToImport.map((c) => ({
          guid: c.guid,
          name: c.name,
          agsClass: c.agsClass,
          itemLevel: c.itemLevel,
        })),
      }),
      { loading: "Importing characters...", success: "Characters imported!", error: (err: Error) => err.message },
    )
    queryClient.invalidateQueries({ queryKey: [`/api/rosters/${rosterId}`] })
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Characters">
      {previewMutation.isPending && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {previewMutation.isError && (
        <p className="mb-3 text-sm text-danger">
          {previewMutation.error instanceof Error ? previewMutation.error.message : "Failed to load roster data"}
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
                  disabled={char.alreadyInRoster}
                  onClick={() => toggleCharacter(char.guid)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    char.alreadyInRoster
                      ? "cursor-not-allowed opacity-50"
                      : isSelected
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-surface-hover"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={char.alreadyInRoster}
                    readOnly
                    className="h-4 w-4 rounded border-gray-600"
                  />
                  <div className="flex flex-1 items-center gap-2">
                    {ClassIcon && <ClassIcon className="size-4 shrink-0 text-gray-400" />}
                    <span className="text-sm font-medium text-gray-200">{char.name}</span>
                    <span className="text-xs text-gray-500">IL {char.itemLevel}</span>
                  </div>
                  {char.alreadyInRoster && <span className="text-xs text-gray-500">Already in roster</span>}
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
              disabled={selected.size === 0 || importMutation.isPending}
            >
              {importMutation.isPending ? "Importing..." : `Import (${selected.size})`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
