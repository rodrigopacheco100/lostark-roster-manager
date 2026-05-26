## Context

The app uses native browser `confirm()` and `alert()` dialogs across 5 page files (10 total usages). These don't match the dark theme and provide a poor UX. The existing UI components (Modal, Button, Card, Badge) use Tailwind with a dark surface-based design system.

## Goals / Non-Goals

**Goals:**
- Toast system: non-blocking, auto-dismissing notifications for success/error/info
- Confirm dialog: styled replacement for `confirm()` that matches the app theme
- Replace all `confirm()` and `alert()` calls across the codebase
- Keep it simple — no external dependencies, reuse existing Modal component patterns

**Non-Goals:**
- Toast queue with pause-on-hover (not needed at this scale)
- Customizable toast positions (bottom-right is standard)
- Animated enter/exit (CSS transitions are sufficient)

## Decisions

### Toast: React Context + useReducer
- A `ToastProvider` wraps the app in `layout.tsx` (next to existing `Providers`)
- `useToast()` returns `{ toast: (message, type) => void }`
- Toasts auto-dismiss after 4 seconds
- Stack up to 5 toasts, newest at bottom, oldest removed first on overflow
- Types: `success` (green), `error` (red), `info` (blue) — using existing Tailwind color tokens
- Icons from lucide-react (CheckCircle, XCircle, Info)
- Render via a portal-like approach: render in a fixed container

### ConfirmDialog: Extended Modal pattern
- Leverage the existing `Modal` component (already has overlay, close, title)
- `ConfirmDialog` wraps Modal with confirm/cancel buttons
- Usage: `const confirmed = await showConfirm({ title, message, confirmLabel, cancelLabel })` — promise-based like native `confirm()`
- Return a promise that resolves to boolean
- Implemented via a shared ref or state callback pattern

### Component Design
- Toast renderer: fixed `bottom-4 right-4` with `z-50`, stacked with `gap-2`
- Each toast: rounded card with icon + message + close button, slide-in via translate
- ConfirmDialog: uses Modal with `max-w-sm`, destructive actions in red

## Risks / Trade-offs

- **Promise-based confirm**: Requires a stateful approach (store resolver callback). Slightly more complex than direct calls, but matches `confirm()` API well.
- **No toast animation library**: Manual CSS transitions may be less smooth than Framer Motion. Mitigation: simple translateY + opacity transitions are sufficient for this use case.
- **Toast in layout means client component**: The ToastProvider must be a client component, which is fine since layout already has providers.
