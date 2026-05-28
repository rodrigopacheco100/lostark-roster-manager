## ADDED Requirements

### Requirement: Reorder characters via drag-and-drop
The system SHALL allow the user to reorder characters within a roster by dragging and dropping character cards on the roster detail page (`/rosters/[id]`).

#### Scenario: Enter reorder mode
- **WHEN** the user clicks the "Reorder" button on the roster detail page
- **THEN** the button SHALL become disabled
- **AND** drag handles SHALL appear on each character card
- **AND** a floating save bar SHALL appear at the bottom of the page with "Save Changes" (disabled) and "Discard"

#### Scenario: Drag character to new position
- **WHEN** the user drags a character card to a new position while in reorder mode
- **AND** drops it
- **THEN** the UI SHALL immediately update to show the new order (internal SortableList state)
- **AND** the "Save Changes" button SHALL become enabled

#### Scenario: Save reorder changes
- **WHEN** the user clicks "Save Changes" on the floating bar
- **THEN** the system SHALL send a `PUT /api/characters/reorder` request with `{ ids: string[], rosterId: string }`
- **AND** on success, SHALL invalidate the roster detail query, hide the save bar, and re-enable the "Reorder" button
- **AND** on error, SHALL show an error toast

#### Scenario: Discard reorder changes
- **WHEN** the user clicks "Discard" on the floating bar
- **THEN** the system SHALL invalidate the roster detail query (refetch server order)
- **AND** SHALL hide the save bar and re-enable the "Reorder" button

### Requirement: Characters are ordered everywhere
The system SHALL display characters within each roster in the user's defined order (by `sort_order`, then `created_at` as fallback) on all pages.

#### Scenario: Character order persists across pages
- **WHEN** the user reorders and saves characters in a roster on `/rosters/[id]`
- **AND** navigates to another page that shows characters within that roster
- **THEN** the characters SHALL appear in the saved order

### Requirement: Drag handle visibility and movement
- **WHEN** reorder mode is active
- **THEN** each character card SHALL display a drag handle (`GripVertical`) on its left side
- **AND** the DragOverlay SHALL include the drag handle to maintain identical card width
- **AND** cards SHALL only move vertically during drag (horizontal movement restricted)
- **AND** the original position placeholder SHALL have `opacity: 0.3` during drag
