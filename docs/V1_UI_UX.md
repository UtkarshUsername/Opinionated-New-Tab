# V1 UI/UX Spec (Dense “Locked-in” Dashboard)

## Aesthetic direction
Compact, dense, focused — inspired by developer tooling/analytics UIs (like the provided screenshots at ![design inspiration 1](../image.png) and ![design inspiration 2](../image2.png)).

**Design principles**
- Everything important is visible without scrolling on a laptop screen, 1 screen height page only.
- Clear hierarchy, subtle separators, minimal ornamentation.
- Fast to parse: numbers aligned, small caps/mono for metadata.
- Keyboard-first, mouse optional.

## Dashboard layout (New Tab)

### Overall structure
Three-column grid, dense spacing, no background imagery.

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Brand/Today]      [Quick Add ______________________]   [Time/Date] │
├───────────────────────┬───────────────────────────┬─────────────────┤
│ Tasks                 │ Currently Working On       │ Countdown       │
│ - [ ] ...             │ - Project A  (ends Feb 20) │ Label + target  │
│ - [x] ... (dim)       │ - Project B  (ends Mar 02) │ time remaining  │
│                       │ [Open Timeline]            │ [Edit] [Export] │
│ [Show completed]      │                           │                 │
└───────────────────────┴───────────────────────────┴─────────────────┘
```

### Components
- **Top bar**
  - left: day context (“Mon • Feb 9, 2026”)
  - center: Quick Add input (dominant)
  - right: time (small, not distracting)
- **Tasks pane**
  - flat list, checkboxes, selection highlight
  - completed tasks are dimmed and optionally hidden
- **Currently Working On pane**
  - list of active projects (derived)
  - “Open Timeline” button/link
- **Countdown pane**
  - label + target time
  - time remaining
  - “Edit” opens a compact modal

## Timeline layout (Projects page)

### Overall structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ Projects Timeline     [New Project]  [Back to Dashboard]             │
├──────────────┬──────────────────────────────────────────────────────┤
│ Project list │  Date axis (weeks)                                    │
│ - Project A  │  |Feb|Mar|Apr|...                                      │
│ - Project B  │  [o────────────o]                                      │
│              │  [o────o]                                             │
└──────────────┴──────────────────────────────────────────────────────┘
```

### Interactions (timeline)
- Create project
- Click project row to select
- Drag start/end handles to adjust dates
- Edit dates precisely in a side panel or inline popover
- Archive/delete from a small actions menu

## Density + typography guidelines (for implementers)
- Spacing: prefer `gap-2`, `p-2`/`p-3` scale; avoid large cards.
- Type sizes: 12–14px for lists, 16–18px for headers.
- Use a mono font for:
  - countdown numbers
  - timestamps/dates
  - keyboard hint overlay

## Accessibility
- Focus states must be visible.
- All controls reachable via keyboard.
- Sufficient contrast in dark theme.

