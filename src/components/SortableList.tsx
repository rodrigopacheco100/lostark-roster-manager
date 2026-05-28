"use client"

import { closestCenter, DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Transform } from "@dnd-kit/utilities"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type SortableItemProps = {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      className="flex items-center gap-2"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-gray-500 hover:text-gray-300 transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function DragHandle() {
  return (
    <button type="button" className="cursor-grab touch-none text-gray-500 transition-colors" aria-hidden>
      <GripVertical className="h-4 w-4" />
    </button>
  )
}

type SortableListProps<T extends { id: string }> = {
  items: T[]
  onReorder: (ids: string[]) => void
  children: (item: T, isDragging?: boolean) => React.ReactNode
  className?: string
  sortable?: boolean
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
  className,
  sortable = false,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [orderedItems, setOrderedItems] = useState(items)

  useEffect(() => {
    setOrderedItems(items)
  }, [items])

  const activeItem = activeId ? orderedItems.find((item) => item.id === activeId) : null

  const restrictToVerticalAxis = useCallback(
    ({ transform }: { transform: Transform }) => ({
      ...transform,
      x: 0,
    }),
    [],
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id)
    const newIndex = orderedItems.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newItems = arrayMove(orderedItems, oldIndex, newIndex)
    setOrderedItems(newItems)
    onReorder(newItems.map((item) => item.id))
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  if (!sortable) {
    return (
      <div className={className}>
        {items.map((item) => (
          <div key={item.id}>{children(item)}</div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={orderedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {orderedItems.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {children(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div className="flex items-center gap-2">
            <DragHandle />
            <div className="flex-1 min-w-0 opacity-90">{children(activeItem, true)}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
