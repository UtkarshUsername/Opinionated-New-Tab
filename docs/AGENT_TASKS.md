# Implementation Briefs for Other AI Agents (V1)

You (implementer) are working in this repo. Follow the product specs:
- `docs/V1_PRODUCT_SPEC.md`
- `docs/V1_UI_UX.md`
- `docs/V1_DATA_MODEL.md`
- `docs/V1_COUNTDOWN_WIDGET.md`

## Non-negotiables
- Keep **Chrome + Firefox** support intact.
- Use **`browser.storage.local`** only (local-first, no sync).
- No wallpapers/quotes/music/exam-specific UI in V1.
- Dense, compact UI (no big cards, no empty whitespace).
- Keyboard-first flows must work.

## Repo context (what exists today)
- Vite + Tailwind + DaisyUI + `webextension-polyfill`
- Existing pages: `src/newtab/*`, `src/popup/*`, `src/background/*`
- Manifest already overrides new tab.

## Agent 1: Dashboard implementer (New Tab)
**Goal:** Replace the existing countdown-focused new tab with the new dashboard.

Deliverables
- New dashboard UI implementing:
  - Quick Add
  - Tasks list (flat)
  - Currently Working On (derived from projects)
  - Countdown widget (V1)
  - Link/shortcut to Timeline page
- Keyboard shortcuts: `/`, `t`, `c`, `?` and task navigation/toggling
- Storage layer (local-only) that reads/writes the `ont_v1` object

Acceptance criteria
- Opening a new tab shows the dashboard instantly and feels dense/focused.
- Add/check/uncheck/delete tasks works.
- Countdown can be set and persists.
- Currently Working On updates based on projects state.
- No reliance on `browser.storage.sync`.

## Agent 2: Timeline implementer (Projects page)
**Goal:** Add a `timeline` page and connect it.

Deliverables
- New extension page `timeline/timeline.html` + `timeline.js` (or equivalent)
- Gantt-like view:
  - dates across top
  - project rows
  - start/end handles connected by a line/bar
- CRUD:
  - create project
  - edit name
  - edit start/end (drag + precise inputs)
  - archive/delete
- Writes to the same `ont_v1` storage key

Acceptance criteria
- Timeline is accessible from dashboard (`t` + link).
- Projects persist and appear as active on dashboard when in range.
- Multiple concurrent projects display correctly.

## Agent 3: Storage + import/export implementer
**Goal:** Create a small storage module + export/import UI entry points.

Deliverables
- `getState()`, `setState()`, `updateState(fn)` helpers
- Safe initialization if empty/corrupt
- Export:
  - downloads JSON file
- Import:
  - replace mode (minimum)
  - validate shape + version

Acceptance criteria
- Export produces a usable JSON file.
- Import restores state and refreshes UI.

## Agent 4: Polish + QA sweep
**Goal:** Make it feel “complete”, catch edge cases, and ensure cross-browser.

Checklist
- Focus states, keyboard nav, ESC closes modals
- Empty states: no tasks, no projects, no countdown
- Error handling around storage failures
- Visual density: spacing, typography, alignment
- Confirm in Chrome + Firefox

## Constraints / suggestions
- Avoid adding heavy new deps in V1.
- Prefer simple HTML/CSS/SVG for the timeline rendering.
- Keep the build pipeline intact (`pnpm dev`, `pnpm build`).

