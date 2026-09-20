# Realm Guard / Torchbearer v1.9.0-qa.24 — QA Protocol

## Gate A — Service & Specialty live counter
Reach Recruitment step 5.

1. Enter service checks one point at a time.
2. Watch the counter.

Expected:
- counter changes immediately, e.g. 0/6 -> 1/6 -> 4/6 -> 6/6
- exact allocation gets the completed visual state
- too many points gets the over-allocation state
- reducing points updates immediately
- Specialty selection is retained when chosen
- Continue accepts exactly the required number
- Continue still rejects under/over allocation
- Continue -> Back preserves committed values

## Gate B — Wise / Trait action buttons
Open Character > Overview.

Expected:
- edit pencil is clearly visible
- delete X is clearly visible
- hover/focus remains readable
- action buttons still work

## Gate C — Item Description
Open at least a Wise Item and one other Item type.

Expected:
- Description has a light parchment/theme background
- text is dark brown
- cursor is dark
- focus border is themed
- text saves normally after edit
- no black Description textarea remains

## Regression
- qa.23 Nature live result still works
- qa.23 Homeland live refresh still works
- Skills Quick Roll / Roll Window contrast remains fixed
- NPC Known Information remains readable
- Character/NPC/Item parchment framing remains intact

## PASS criteria
qa.24 passes when Service & Specialty is live-reactive and the two remaining parchment contrast issues are resolved without functional regressions.
