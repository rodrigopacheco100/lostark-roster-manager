"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Sword } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FloatingSaveBar } from "@/components/FloatingSaveBar"
import { ImportRosterModal } from "@/components/ImportRosterModal"
import { SortableList } from "@/components/SortableList"
import { EmptyState, PageHeader } from "@/components/ui"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"
import { RosterSection } from "./_compose/RosterSection"
import { getCooldownRemaining, RosterToolbar } from "./_compose/RosterToolbar"
import type { Raid, Roster } from "./_types"

const COOLDOWN_MS = 60 * 60 * 1000

export default function RostersPage() {
  const queryClient = useQueryClient()
  const { promise } = useToast()
  const { confirm } = useConfirm()
  const { data: rosters } = useQuery<Roster[]>({
    queryKey: ["/api/rosters"],
    queryFn: () => httpClient.get<Roster[]>("/api/rosters"),
    staleTime: 10_000,
  })
  const { data: allRaids } = useQuery<Raid[]>({
    queryKey: ["/api/raids"],
    queryFn: () => httpClient.get<Raid[]>("/api/raids"),
    staleTime: 10_000,
  })

  // Roster-level state
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [reorderDirty, setReorderDirty] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(getCooldownRemaining)
  const workingOrderRef = useRef<string[]>([])
  const [expandedRosters, setExpandedRosters] = useState<Set<string>>(new Set())
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [charReorderRosterId, setCharReorderRosterId] = useState<string | null>(null)
  const [charReorderDirty, setCharReorderDirty] = useState(false)
  const charWorkingOrderRef = useRef<string[]>([])

  const hasLinkedRosters = rosters?.some((r) => r.rosterGuid) ?? false

  useEffect(() => {
    if (cooldownRemaining <= 0) return
    const id = setInterval(() => {
      const remaining = getCooldownRemaining()
      setCooldownRemaining(remaining)
      if (remaining <= 0) clearInterval(id)
    }, 10000)
    return () => clearInterval(id)
  }, [cooldownRemaining])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (name: string) => httpClient.post<Roster>("/api/rosters", { name }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => httpClient.put(`/api/rosters/${id}`, { name }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => httpClient.delete(`/api/rosters/${id}`),
  })

  const syncMutation = useMutation({
    mutationFn: () => httpClient.post<{ updated: number }>("/api/rosters/sync-ilvl"),
  })

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => httpClient.put("/api/rosters/reorder", { ids }),
  })

  const charReorderMutation = useMutation({
    mutationFn: ({ ids, rosterId }: { ids: string[]; rosterId: string }) =>
      httpClient.put("/api/characters/reorder", { ids, rosterId }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })

  // Handlers
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await promise(createMutation.mutateAsync(newName), {
      loading: "Creating...",
      success: "Roster created!",
      error: (err: Error) => err.message,
    })
    setNewName("")
    invalidate()
  }

  async function handleUpdateRoster(id: string) {
    if (!editName.trim()) return
    await promise(updateMutation.mutateAsync({ id, name: editName }), {
      loading: "Updating...",
      success: "Roster updated!",
      error: (err: Error) => err.message,
    })
    setEditingId(null)
    invalidate()
  }

  async function handleDeleteRoster(id: string) {
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
    invalidate()
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
    invalidate()
  }

  function handleDiscardReorder() {
    invalidate()
    setReorderDirty(false)
    setIsReordering(false)
  }

  function toggleReorder() {
    setIsReordering((v) => !v)
  }

  async function handleSync() {
    await promise(syncMutation.mutateAsync(), {
      loading: "Syncing item levels...",
      success: (res) => `${res.updated} character(s) updated`,
      error: (err: Error) => err.message,
    })
    localStorage.setItem("ags:ilvl-sync:last-sync-ts", new Date().toISOString())
    setCooldownRemaining(COOLDOWN_MS)
    invalidate()
  }

  function handleCharReorder(ids: string[]) {
    charWorkingOrderRef.current = ids
    setCharReorderDirty(true)
  }

  async function handleSaveCharReorder(rosterId: string) {
    const ids = charWorkingOrderRef.current
    if (ids.length === 0) return
    await promise(charReorderMutation.mutateAsync({ ids, rosterId }), {
      loading: "Saving order...",
      success: "Order saved!",
      error: (err: Error) => err.message,
    })
    setCharReorderDirty(false)
    setCharReorderRosterId(null)
    invalidate()
  }

  function handleDiscardCharReorder() {
    charWorkingOrderRef.current = []
    invalidate()
    setCharReorderDirty(false)
    setCharReorderRosterId(null)
  }

  function toggleRosterExpand(rosterId: string) {
    if (isReordering) return
    setExpandedRosters((prev) => {
      const next = new Set(prev)
      if (next.has(rosterId)) next.delete(rosterId)
      else next.add(rosterId)
      return next
    })
  }

  return (
    <div>
      <PageHeader title="Rosters" />

      <RosterToolbar
        newName={newName}
        onNewNameChange={setNewName}
        onCreate={handleCreate}
        onImportOpen={() => setImportModalOpen(true)}
        hasLinkedRosters={hasLinkedRosters}
        syncPending={syncMutation.isPending}
        cooldownRemaining={cooldownRemaining}
        onSync={handleSync}
        rosters={rosters}
        isReordering={isReordering}
        onToggleReorder={toggleReorder}
      />

      {rosters?.length === 0 ? (
        <EmptyState
          icon={<Sword className="h-12 w-12" />}
          title="No rosters yet"
          description="Create your first roster to start tracking characters and raids."
        />
      ) : (
        <SortableList items={rosters ?? []} onReorder={handleReorder} sortable={isReordering} className="space-y-3">
          {(roster) => (
            <RosterSection
              roster={roster}
              isExpanded={expandedRosters.has(roster.id)}
              isReorderingRosters={isReordering}
              allRaids={allRaids}
              onToggleExpand={() => toggleRosterExpand(roster.id)}
              editingRosterId={editingId}
              editRosterName={editName}
              onStartEditRoster={() => {
                setEditingId(roster.id)
                setEditName(roster.name)
              }}
              onEditRosterNameChange={setEditName}
              onSaveRoster={() => handleUpdateRoster(roster.id)}
              onCancelRosterEdit={() => setEditingId(null)}
              onDeleteRoster={() => handleDeleteRoster(roster.id)}
              charReordering={charReorderRosterId === roster.id}
              charReorderDirty={charReorderDirty}
              onStartCharReorder={() => {
                charWorkingOrderRef.current = []
                setCharReorderRosterId(charReorderRosterId === roster.id ? null : roster.id)
                setCharReorderDirty(false)
              }}
              onCharReorder={handleCharReorder}
              onSaveCharReorder={() => handleSaveCharReorder(roster.id)}
              onDiscardCharReorder={handleDiscardCharReorder}
              charReorderPending={charReorderMutation.isPending}
            />
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
