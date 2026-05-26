## Why

The app has no way for users to support the project financially. A "Buy Me a Coffee" button provides a low-friction donate option for users who find the tool valuable.

## What Changes

- Add a "Buy Me a Coffee" link button in the sidebar, below the navigation links and above the sign-out button
- Link opens https://buymeacoffee.com/axiosz in a new tab
- Uses the official "Buy Me a Coffee" button styling (coffee cup icon + "Buy me a coffee" text)

## Capabilities

### New Capabilities
- `donate-button`: A sidebar donation link to Buy Me a Coffee

### Modified Capabilities
- *(none)*

## Impact

- `src/components/Sidebar.tsx` — add donate link with external icon, positioned above sign-out
