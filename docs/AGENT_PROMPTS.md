# Copy/paste prompts for implementation agents

These prompts assume the agent can edit code in this repo and run `pnpm dev/build`.

## Prompt: Dashboard (New Tab) agent
You are implementing V1 of an opinionated “locked-in” new tab dashboard in this repo.

Requirements:
- Follow `docs/V1_PRODUCT_SPEC.md`, `docs/V1_UI_UX.md` (also see image.ong and image2.png for fesign inspiration), `docs/V1_DATA_MODEL.md`, `docs/V1_COUNTDOWN_WIDGET.md`.
- Replace the existing `src/newtab` exam countdown UI with the new dashboard:
  - Quick Add input (`/` focuses)
  - Tasks flat list (toggle complete, delete with undo)
  - Currently Working On (derived from projects)
  - Countdown widget (editable label + target)
  - Link + shortcut `t` opens Timeline page
  - Shortcut `c` opens countdown edit, `?` opens keyboard help overlay
- Use `browser.storage.local` only; store all state under `ont_v1`.
- Dense, compact dark theme, inspired by analytics/devtools UIs.

Deliver:
- Code changes + brief notes of keyboard shortcuts and file entry points.
- Ensure it builds and runs in `pnpm dev` for both Chrome and Firefox targets.

## Prompt: Timeline agent
You are implementing the Projects Timeline page for the same extension.

Requirements:
- Follow the same docs.
- Add a new extension page: `timeline/timeline.html` + JS.
- Render a gantt-like timeline:
  - dates across the top (horizontal axis)
  - project rows below
  - each project has start and end points connected by a line/bar
- CRUD projects, drag handles, precise date inputs.
- Persist to `browser.storage.local` under `ont_v1`.
- Ensure dashboard derives active projects correctly.

Deliver:
- Code changes + notes on how to open timeline from dashboard.
- Confirm cross-browser compatibility (Chrome/Firefox).

## Prompt: Storage + import/export agent
You are implementing a small, safe local storage layer and import/export for the extension.

Requirements:
- `browser.storage.local` only.
- Single root key `ont_v1` with schema in `docs/V1_DATA_MODEL.md`.
- Implement helpers:
  - `getState()` (init defaults if missing/corrupt)
  - `setState(state)` (writes + updates `updatedAt`)
  - `updateState(fn)` (transaction-like)
- Export JSON download
- Import JSON replace mode (minimum), with validation and friendly error UI.

Deliver:
- Code changes and quick manual test steps.

## Prompt: Polish/QA agent
You are polishing V1 UI/UX and hardening edge cases.

Checklist:
- Keyboard navigation + visible focus ring
- Empty/error states
- Countdown correctness and past-target behavior
- Dense layout polish (spacing, typography, alignment)
- No network calls required
- Test in Chrome and Firefox

Deliver:
- PR-style summary of changes + before/after screenshots if possible.

