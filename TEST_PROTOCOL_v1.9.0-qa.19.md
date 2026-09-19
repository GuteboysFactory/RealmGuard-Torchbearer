# Realm Guard / Torchbearer v1.9.0-qa.19 — Framed Character Parchment QA

## Scope

Visual-only Character sheet background/frame update.

## Gate A — framed parchment

Open a Ranger Character sheet.

Expected:
- the cleaner framed parchment is visible
- all four ornate corners remain intact
- the centre stays calm and readable
- no image tiling

## Gate B — resize / 9-slice behavior

Resize the Character window:
- wide
- narrow
- tall
- short

Expected:
- corners keep their proportions
- side edges stretch vertically
- top/bottom edges stretch horizontally
- the centre fills the remaining area
- no duplicated corners, seams or exposed dark legacy background

## Gate C — qa.18 surface harmony regression

Expected:
- Character information panels still use parchment/ink styling
- header/navigation/interactive controls retain dark forest/brass identity
- Wises, Traits, Relationships and Notes remain readable
- Level/Talent focal elements remain distinct

## Gate D — isolation

Switch to Skills / Inventory & Gear and open NPC / Item / Conflict windows.

Expected:
- no functional regression
- no Character frame leaks to unrelated applications
- approved Gear / Conflict visuals remain unchanged

## PASS criteria

qa.19 passes when the framed parchment behaves cleanly at all practical Character window sizes and qa.18 readability remains intact.
