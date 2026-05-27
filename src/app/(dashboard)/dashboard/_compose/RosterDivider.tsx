"use client"

export function RosterDivider({ name, characterCount }: { name: string; characterCount?: number }) {
  return (
    <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
      {name}
      {characterCount !== undefined && (
        <span className="ml-2 font-normal normal-case text-gray-600">{characterCount} chars</span>
      )}
    </div>
  )
}
