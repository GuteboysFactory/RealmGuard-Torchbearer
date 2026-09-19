# Realm Guard / Torchbearer v1.9.0-qa.20 — Character Sub-Navigation QA

## Gate A — Character secondary menu

Open a Ranger Character sheet.

Expected:
- main menu remains Character / Skills / Inventory & Gear
- while Character is active, a second row shows Overview / Background / Relationships / Notes
- Overview is active on first open

## Gate B — subsection content

Expected:
- Overview: Belief / Goal / Instinct, Wises, Traits, Level & Talents
- Background: Biography, Lineage / House, House Insignia
- Relationships: Parents, Senior Artisan, Mentor, Friend / Ally, Enemy / Rival
- Notes: Character Notes

Edit at least one field on each subsection and verify persistence.

## Gate C — main tab isolation

Switch to Skills.

Expected:
- Character secondary menu is not visible
- Skills functions normally

Switch to Inventory & Gear.

Expected:
- Character secondary menu is not visible
- Gear functions normally

Return to Character.

Expected:
- last selected Character subsection is restored

## Gate D — resize / parchment

Resize the sheet wide, narrow, tall and short.

Expected:
- secondary menu wraps cleanly at smaller widths
- qa.19 framed parchment remains intact
- qa.18 parchment/ink surfaces remain readable

## Gate E — no rules/data regression

Expected:
- no Actor schema change
- no Recruitment change
- no CORE authority change
- no M8 Social Network behavior yet

## PASS criteria

qa.20 passes when nested Character navigation is clean, remembers its subsection, disappears outside Character, and all existing Character data continues to edit/save normally.
