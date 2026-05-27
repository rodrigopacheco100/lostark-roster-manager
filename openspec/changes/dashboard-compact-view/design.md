## Context

The dashboard currently has a three-level collapsible hierarchy:

```
OwnerSection (collapsible)
  └── RosterSection (Card, collapsible)
        └── Character blocks (Card-like)
              └── RaidCheckbox pills
```

This makes scanning across characters and rosters difficult — each expansion level adds visual noise and vertical space. The `RosterSection` component duplicates the collapse pattern and aggregate summary logic from `OwnerSection`.

The proposed change flattens this to:

```
OwnerSection (collapsible)
  ├── Owner-level aggregate pills (kept)
  └── Roster divider (line + roster name pill)
        └── Table rows (character rows with inline raids)
      Roster divider
        └── Table rows
```

## Goals / Non-Goals

**Goals:**
- Flatten the dashboard hierarchy by removing `RosterSection` as a wrapper
- Display characters as compact table rows (not card blocks)
- Use divider-with-label pattern for roster separation
- Preserve all existing raid toggle functionality (`useRaidToggleQueue`, `RaidCheckbox`)
- Reduce total vertical space by ~40% for a typical expanded view

**Non-Goals:**
- Change the API or data model
- Add new dependencies (CSS frameworks, table libraries)
- Change the owner-level collapsible pattern
- Modify `RaidCheckbox` component or `useRaidToggleQueue` hook
- Reorder or group characters within a roster

## Decisions

### Decision: Inline roster rendering inside OwnerSection instead of separate component

| Option | Result |
|--------|--------|
| Rewrite `OwnerSection` to inline roster rendering | Simple, removes indirection, one fewer component |
| Keep `RosterSection` but change its internal layout | Doesn't address the nesting issue |

**Rationale**: `RosterSection` currently only wraps characters. Inlining its logic into `OwnerSection` removes an unnecessary abstraction layer and simplifies state. The roster iteration becomes a flat `.map()` inside the owner's expanded block.

### Decision: CSS grid for character rows instead of HTML `<table>`

CSS grid gives us table-like alignment without the semantic or layout rigidity of `<table>` elements. Each row is a `grid grid-cols-[auto_auto_auto_1fr] gap-x-3` with consistent column alignment across all characters.

Alternative considered: `<table>` elements — better for screen readers but overkill here; the "table" is purely visual, not tabular data.

### Decision: `<div>` border + name pill for roster divider

```
──────────────── [Roster Name] ────────────────
```

Implemented as:
```tsx
<div className="relative flex items-center py-2">
  <div className="flex-grow border-t border-gray-700" />
  <span className="mx-3 shrink-0 text-xs font-medium text-gray-500">{roster.rosterName}</span>
  <div className="flex-grow border-t border-gray-700" />
</div>
```

This matches the visual pattern from the raid combobox design (line + label pill).

### Decision: Remove per-roster aggregate summary pills

The owner-level pills already aggregate across all rosters. With the table view showing all characters and their raids inline, the per-roster pills add visual noise without additional information. This is a pure removal — no replacement needed.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Loss of per-roster collapse: users with many characters across many rosters lose the ability to hide specific rosters | The owner-level collapse still works. If users complain, we can add roster-level collapse later without changing the table layout |
| Dense layout feels cramped on small screens | The grid layout uses responsive column sizing; raid pills wrap naturally on narrow viewports |
| RosterSection.tsx removal could affect other pages if it's imported elsewhere | Check imports — `RosterSection` is only used in `OwnerSection`. Safe to remove |
