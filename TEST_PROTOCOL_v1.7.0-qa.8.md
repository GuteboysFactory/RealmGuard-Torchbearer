# TEST PROTOCOL — v1.7.0-qa.8

## Scope
Final Equipment cosmetic layout pass. Unassigned Gear moves from the right column to the left column beneath Containers. Equipment owns the main column. No Inventory mechanics change.

## A — Version
```js
console.log(game.system.version);
```
Expected: `1.7.0-qa.8`.

## B — Desktop layout
Open Ranger -> Inventory & Gear at normal desktop width.
Expected:
- Containers is top-left.
- Unassigned Gear is directly below Containers in the left column.
- Equipment occupies the full main/right column.
- There is no standalone Unassigned Gear panel to the right of Equipment.
- Equipment Figure Source / Ancestry / gear settings button remain unchanged.

## C — Unassigned Gear behavior
Drag equipped gear back to Unassigned Gear.
Expected:
- item becomes unassigned exactly as before.
- drag/drop highlight still works.
- item cards, edit/delete and orphan repair behavior remain unchanged.

## D — Containers
Create/equip a container if needed and drag gear into/out of it.
Expected:
- container placement unchanged.
- capacity unchanged.
- active/inactive behavior unchanged.
- Unassigned Gear remains below the Containers panel.

## E — Equipment slots
Check Head / Neck / Cloak / Torso / Left Hand / Right Hand / Belt / Pocket / Feet.
Expected:
- all slots remain usable.
- 2H lock remains correct.
- Equipment panel does not overlap the left rail.

## F — Responsive
Narrow the Actor sheet below ~900 px.
Expected order:
1. Containers
2. Unassigned Gear
3. Equipment
No horizontal overflow caused by the new layout.

## G — Figure settings regression
Click the gear icon beside Equipment Figure.
Expected:
- settings dialog opens.
- Apply / Cancel still work.
- Custom/Ancestry figures unchanged.

## H — M5 CORE regression
```js
console.log(game.realmGuard.core.m5.getStatus());
```
Expected:
- M5 shadow services unchanged.
- `liveApplication:false`.
- Legacy Mixed remains live authority.

## I — M2/M3/M4 regression
Perform one normal roll and one Nature/Condition roll.
Expected no new mismatch or duplicate write.

## PASS gate
- Desktop left rail layout PASS
- Unassigned Gear under Containers PASS
- Equipment main column PASS
- Unassigned drag/drop PASS
- Containers PASS
- Equipment slots / 2H PASS
- Responsive order PASS
- Figure settings PASS
- M5 CORE preserved PASS
- M2/M3/M4 preserved PASS
