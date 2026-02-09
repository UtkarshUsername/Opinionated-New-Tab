# V1 Handoff (How you ship + maintain)

## Local dev
- Install deps: `pnpm install`
- Run dev:
  - Chrome: `pnpm dev` (or set target env per repo conventions)
  - Firefox: set `TARGET_BROWSER=firefox`, then `pnpm dev`

## Build
- Production bundle: `pnpm build`
- Output: `dist/`

## Release checklist (Chrome + Firefox)
- Confirm `browser.storage.local` is used everywhere (no `sync`).
- Confirm dashboard opens on new tab (override still set).
- Export/import tested.
- Icons + name/description updated for the new product.
- Remove any exam-specific copy and assets.

## Support / debugging notes
- If users report “data missing”, have them:
  - export JSON
  - re-import JSON (replace)
  - ensure extension storage permissions enabled

## V2 ideas (do not build in V1)
- Optional history (what you did)
- Cloud sync + encryption
- Calendar integration (read-only) to auto-create time blocks
- Per-task “next action” and lightweight grouping
- Multiple countdowns

