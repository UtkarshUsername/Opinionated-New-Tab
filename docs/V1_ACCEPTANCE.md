# V1 Acceptance Checklist (Definition of Done)

## Core behavior
- New Tab opens to dashboard with no visible lag.
- You can decide next action in ~10 seconds:
  - quick add works
  - tasks are visible and editable
  - active projects are visible
  - countdown is visible

## Tasks
- Add task via Quick Add (`Enter`).
- Toggle completion via checkbox and keyboard (`Space`).
- Completed tasks are dimmed and optionally hidden.
- Delete task includes a visible Undo affordance.
- State persists after closing/opening new tabs.

## Projects timeline
- Timeline page opens from dashboard via link and `t`.
- Create/edit/delete/archive project works.
- Start/end dates are editable (drag + precise field).
- Multiple overlapping projects render clearly.
- Dashboard “Currently Working On” reflects active projects correctly.

## Countdown
- Countdown can be set (label + target) and persists.
- Correctly transitions to “Reached” when past.
- Edit is accessible via UI and `c`.

## Keyboard + accessibility
- Focus ring visible.
- `Esc` closes modals/overlays.
- `?` help overlay lists shortcuts.
- Shortcuts do not trigger while typing in inputs (except `Esc`).

## Data + privacy
- Uses `browser.storage.local` only.
- No required network calls.
- Export JSON works.
- Import JSON (replace) works with validation errors handled gracefully.

## Cross-browser
- Works in Chrome and Firefox builds.
- Manifest and build pipeline remain intact.

