# v1.9.0-qa.37 — Living Relationship Status QA

## Gate A — load / regression
Install qa.37 in Foundry VTT 13.351 and open a Ranger with Recruitment relationships.

Expected:
- world loads normally
- Relationships tab renders
- existing names, profession/location and Actor links are intact

## Gate B — Status action
As GM, open Relationships.

Expected:
- every relationship card has a **Status** button
- current status badge is still visible
- Friend begins Friendly when inherited from Recruitment
- Enemy begins Hostile when inherited from Recruitment

## Gate C — change status
On a Friend, press Status and change:
`Friendly -> Estranged`

Enter an optional reason such as:
`Refused aid after the patrol`

Enter an optional session:
`Session 8`

Expected:
- save closes normally
- card now shows Estranged
- relationship gains one History record
- legacy `system.friend` field remains unchanged

## Gate D — history presentation
Expand Relationship History.

Expected:
- shows `Friendly -> Estranged`
- reason is shown when entered
- session/reference is shown when entered
- history count is 1

## Gate E — second transition
Change the same relationship:
`Estranged -> Neutral`

Expected:
- status is Neutral
- history count becomes 2
- previous history remains
- newest transitions appear first in the compact preview

## Gate F — unchanged-status safety
Open Status again and save Neutral -> Neutral.

Expected:
- notification says status is unchanged
- no additional RelationshipHistory record is created

## Gate G — reload persistence
Reload Foundry / reopen the Actor.

Expected:
- current Relationship status remains Neutral
- history remains present
- Actor link remains present if one existed

## Gate H — Relationship NPC regression
For an unlinked relationship, Create NPC or Link Existing Actor.

Expected:
- creation/linking works as before
- Relationship NPC still goes to `NPC - PC Relations`
- status/history remains intact after linking

## Gate I — non-GM presentation
Open the Ranger as a player/owner.

Expected:
- status badge/history can be viewed
- Status edit action is not available
- existing sheet interactions are unaffected

## PASS
qa.37 passes when Relationship status can change safely with append-only history, survives reload, preserves Legacy Mixed source fields and does not regress NPC/Actor linking.


## VERIFIED RESULT

**PASS — 2026-09-21 / Foundry VTT 13.351**

Live QA confirmed:
- Relationship status action is available to GM
- status transitions persist correctly
- RelationshipHistory appends correctly
- reason/session references display correctly
- unchanged status creates no duplicate history
- reload persistence works
- Relationship NPC / Actor linking regression remains intact
- non-GM presentation remains read-only for status editing

No blocking issues were reported during qa.37 live validation.
