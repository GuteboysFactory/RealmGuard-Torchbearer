# Realm Guard / Torchbearer v1.9.0-qa.23 — QA Protocol

## Gate A — Nature live result
Open Recruit Ranger / Create Ranger and reach Dunadan Nature.

1. Start with no answers: result should show Nature 3.
2. Toggle Second Age: result should immediately show Nature 4.
3. Toggle Loss: immediately Nature 5.
4. Toggle Wilds: immediately Nature 4.
5. Untoggle one answer and verify immediate recalculation.
6. Continue and then Back.

PASS:
- no Continue is needed to refresh the displayed Nature
- the same answer state/value is preserved through Continue/Back
- existing 2–6 validation still works

## Gate B — Homeland live choices
Reach Homeland.

1. Choose Rhudaur.
2. Skill/Trait choices must appear immediately.
3. Pick one Skill/Trait.
4. Change Homeland to Rhovanion.

PASS:
- card updates immediately
- old Skill/Trait selections are cleared
- new Rhovanion choices appear immediately
- Continue accepts valid new choices
- Back/Continue does not lose the committed Homeland state

## Gate C — Character parchment contrast
Open Character > Overview.

PASS:
- Wise names are dark/readable
- Trait names and ratings are dark/readable
- edit/delete controls remain dark buttons with light icons/text

## Gate D — Skills contrast
Open Skills.

PASS:
- Quick Roll text is readable on pale green controls
- Roll Window text is readable on pale tan controls
- trained/untrained cards retain qa.21 hierarchy
- perform one Quick Roll and one Roll Window roll

## Gate E — NPC Known Information
Open an NPC that has synced Known Information.

PASS:
- body text is dark/readable on parchment
- subtitle/small prose remains readable
- Tome/link controls remain identifiable
- normal NPC panels remain readable

## Gate F — Wise helper
Create a Ranger with at least one Wise and open that Wise Item.

PASS:
Description states that Wises are unrated in Legacy Mixed and that MG1E-style rated Wises may be represented as custom Skills.

## Regression gate
- NPC qa.22 visuals remain intact.
- Item qa.22 visuals remain intact.
- Inventory & Gear drag/drop remains intact.
- Recruitment still creates the same Actor/Items as before except for updated Wise description text.

## PASS criteria
qa.23 is PASS when the live Recruitment controls work without refresh/Continue tricks and all reported parchment contrast regressions are resolved.
