# V1 Countdown Widget Spec

## Purpose
A single, always-visible countdown on the dashboard to keep urgency and orientation.

## Display
- **Label** (short text)
- **Target** (date + time)
- **Remaining**:
  - days, hours, minutes, seconds
  - align digits (mono)

## States
1) **Configured + future target**
   - show time remaining
2) **Configured + past target**
   - show “Reached”
   - still show the target timestamp
3) **Not configured**
   - show “Set countdown” CTA

## Editing UX
Editing happens in a compact modal or inline panel with:
- label text input
- datetime input
- buttons: Save / Cancel

## Persistence
- Saved in `settings.countdown` (`label`, `targetIso`) in `browser.storage.local`.

## Behavior details
- Update every second (setInterval)
- If the user edits the target, update immediately
- Use local timezone for input, store as ISO string

## Acceptance criteria
- Countdown stays correct across refresh/new-tab open
- No network calls required
- If storage is empty/corrupt, UI remains usable (falls back to “Set countdown”)

