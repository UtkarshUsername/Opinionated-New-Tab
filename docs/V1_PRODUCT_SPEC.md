# Opinionated New Tab — V1 Product Spec

## Product intent
An opinionated, dense “locked-in” new tab that helps you decide what to do next in **10 seconds**, then execute with minimal friction.

V1 is **local-only** (no accounts), **keyboard-first**, and ships as a **Chrome + Firefox new-tab extension**.

## Primary user
You (focused knowledge worker) using the new tab as a fast control panel: capture tasks, see what’s active, and stay oriented.

## What V1 includes

### 1) Dashboard (New Tab)
**Goal:** decide next action quickly, without browsing a “dashboard museum”.

**Core panes**
- **Quick Add**: single input, `Enter` adds a task to the top.
- **Tasks (flat list)**: add/check/uncheck/delete/undo; no projects/tags/priority in V1.
- **Currently Working On**: shows **all active projects** derived from the timeline (see rules below).
- **Countdown**: a countdown widget to a chosen date+time (configurable label + target).
- **Timeline link**: one click (and shortcut) to open the Timeline page.

**Non-goals for V1**
- No quotes, wallpapers, music, feeds, calendar integrations, or “widgets marketplace”.

### 2) Timeline (Projects)
**Goal:** keep a simple multi-project view across weeks/months.

**What it is**
- A gantt-like view with **dates across the top (horizontal axis)**.
- A list of **projects as rows**.
- Each project is represented by:
  - a **start point**,
  - an **end point**,
  - a **connecting line/bar** between them.

**Capabilities**
- Create, rename, delete/archive projects
- Set or edit start/end dates (drag handles + precise date fields)
- Multiple projects may overlap

## “Currently Working On” rules
- A project is **active** if `today` is between `startDate` and `endDate` inclusive (local timezone).
- Dashboard shows:
  - all active projects, sorted by soonest end date
  - if more than 3, show first 3 + “+N more”

## Countdown widget (V1)
- Single countdown in V1
- Shows:
  - label (editable)
  - time remaining (days/hours/minutes/seconds)
  - target timestamp (editable)
- If target is in the past: show “Reached” state (still display target)

## Key interactions (keyboard-first)
**Global**
- `/` focus Quick Add
- `t` open Timeline
- `c` open Countdown edit
- `?` show keyboard help overlay

**Tasks**
- `Enter` on Quick Add: add task
- `↑/↓` move selection
- `Space` toggle complete
- `Backspace` delete selected (with undo toast)
- `u` undo last change (best-effort V1)

## Information architecture
- `New Tab` (dashboard): the only page you see constantly
- `Timeline` (projects): secondary page, opened intentionally

## Data + privacy constraints
- Must use `browser.storage.local` only (no `sync` in V1).
- No network fetches required for core functionality.
- Provide manual **Export / Import** of all data as JSON.

## Success metric (V1)
After 7 days, you can credibly say: “I get things done using it.”

## V1 scope boundaries (explicit)
In V1 we will not add:
- tagging, priorities, recurring tasks
- calendar sync, auth, cloud sync
- analytics/history tracking (beyond basic completed state)

