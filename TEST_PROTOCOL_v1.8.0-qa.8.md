# QA Protocol — v1.8.0-qa.8

## Visual identity
- GM action choices: dark/gold base with wine-red bottom accent.
- Ranger action choices: dark/gold base with olive/green-gold bottom accent.
- GM/Ranger Goal, Disposition, Lock Cards, Roll Action and Maneuver controls use the same side identity.
- Resolve Tie / Finish Conflict remain neutral gold.
- Abort Conflict remains destructive red.
- Exchange Weapon / Tool panel is parchment-aligned and no longer reads as a detached black slab.

## Responsive / scrolling
Test at approximately:
- 2560x1440
- 1920x1080
- 1366x768
- 1280x720

For Start Conflict, Goal editor, Starting Disposition, Conflict roll, Disarm and Custom Tool:
- content never extends irretrievably beyond viewport
- inner body scrolls vertically
- no horizontal overflow at laptop width
- DialogV2 footer buttons remain reachable

Conflict window:
- resize still works
- internal body scroll still works
- planning/action/maneuver/compromise remain reachable

## Regression
- qa.6 runtime/state handoff still enabled
- resolution mismatches 0
- state mismatches 0
- action planning and exchange-scoped tools unchanged
- roll dialogs still open above Conflict window
