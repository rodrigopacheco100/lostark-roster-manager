## 1. Move owner pills into header row

- [x] 1.1 Move raidGroups pills from the separate `<div>` below the header button into the header button row (between name and CircularProgress), wrapped in a `flex flex-wrap gap-1` span
- [x] 1.2 Remove the dedicated pill row below the header

## 2. Increase owner avatar

- [x] 2.1 Increase owner avatar from `h-6 w-6` (24x24) to `h-8 w-8` (32x32), update Image width/height and fallback span classes, increase fallback text to `text-sm`

## 3. Verify

- [x] 3.1 Run the dev server and confirm the dashboard renders without errors
- [x] 3.2 Confirm owner avatar is at 32x32
- [x] 3.3 Confirm owner-level raid pills now appear inline in the header row (between name and progress circle)
- [x] 3.4 Confirm no pills appear below the header row
- [x] 3.5 Confirm RosterDivider and roster sections are unchanged
- [x] 3.6 Confirm raid toggle interaction still works
