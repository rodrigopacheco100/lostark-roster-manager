"use client"

import { Button } from "@/components/ui/Button"

type FloatingSaveBarProps = {
  onSave: () => void
  onDiscard?: () => void
  saving?: boolean
  canSave?: boolean
}

export function FloatingSaveBar({ onSave, onDiscard, saving, canSave = true }: FloatingSaveBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
      <div className="flex items-center gap-3 rounded-xl border border-gray-700/50 bg-surface-elevated px-5 py-3 shadow-2xl pointer-events-auto">
        <span className="text-sm text-gray-300">Reorder mode</span>
        <Button onClick={onSave} disabled={saving || !canSave}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {onDiscard && (
          <Button variant="ghost" onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
        )}
      </div>
    </div>
  )
}
