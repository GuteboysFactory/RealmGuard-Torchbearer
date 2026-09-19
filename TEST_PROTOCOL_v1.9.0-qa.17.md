# Realm Guard / Torchbearer v1.9.0-qa.17 — Character Parchment Background QA

## Scope

Visual-only Character sheet background update.

No rules, Actor data, CORE authority, M7 behavior, Recruitment behavior or M8 Social Network behavior is changed.

## Gate A — background visible

Open an existing Ranger Character sheet.

Expected:
- the selected parchment artwork fills the Character window background
- no repeating/tiling
- no exposed legacy radial-gradient background around the edges

## Gate B — responsive resize

Resize the Character window:
- wider
- narrower
- taller
- shorter

Expected:
- parchment continuously adapts to the current window dimensions
- the artwork remains a single full-window background
- no seams or duplicate copies appear

## Gate C — sheet regression

Verify:
- portrait controls
- Station / Homeland / Age / Concept
- Fate / Persona / Checks
- Nature / Will / Health / Resources / Circles
- Character / Skills / Inventory & Gear navigation
- form editing and scrolling

Expected:
- all controls remain usable
- no data changes occur from this visual patch

## Gate D — isolation

Open:
- NPC sheet
- Item sheet
- Conflict window

Expected:
- no new Character parchment background leaks into those UIs

## PASS criteria

qa.17 passes when the selected parchment artwork cleanly fills and resizes with the Character window, does not tile, and causes no functional or cross-window regression.
