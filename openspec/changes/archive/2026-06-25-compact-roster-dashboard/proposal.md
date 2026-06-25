## Why

The owner raid summary pills sit in a separate row below the header, consuming vertical space. Moving them into the same row as the owner name saves space and lets more users be visible on screen at once. The owner avatar (24x24) also feels small relative to the name text.

## What Changes

- Increase owner avatar size from 24x24 to 32x32 for better visibility
- Move the owner-level raid summary pills from the separate row below the header into the header button row (between name and progress circle)
- Remove the dedicated pill row below the header

## Capabilities

### New Capabilities
- `dashboard-compact-layout`: Moves owner-level raid summary pills from a dedicated row below the header into the header button row, and increases the owner avatar to 32x32. No other layout or component changes.

### Modified Capabilities
<!-- No existing spec requirements changed — purely a layout repositioning -->

## Impact

- `src/app/(dashboard)/dashboard/_compose/OwnerSection.tsx` — Move raidGroups pills from separate `<div>` below header into the header `<button>` row; increase owner avatar from h-6 w-6 to h-8 w-8
- No API, type, or other component changes
