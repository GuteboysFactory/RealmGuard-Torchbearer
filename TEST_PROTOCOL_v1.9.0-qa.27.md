# Realm Guard / Torchbearer v1.9.0-qa.27 — M8 Relationship UI QA

## Gate A — migrated Ranger view
Open the Ranger used in qa.26 and go to Character > Relationships.

Expected:
- normalized relationship cards are visible
- Friend reflects the stored qa.26 status ESTRANGED
- Friend shows the history count
- Baran Dev displays profession/location
- the previously linked Actor appears as linked
- no legacy relationship data is missing

## Gate B — Open linked Actor
On a card with a resolved Actor link, click Open.

Expected:
- the linked Actor sheet opens
- the Ranger relationship data is unchanged

## Gate C — Unlink
Click Unlink on the same relationship.

Expected:
- Actor-link badge disappears
- Link Existing Actor becomes available
- linked NPC/Character Actor still exists
- relationship status/history remain unchanged

## Gate D — Link Existing Actor
Click Link Existing Actor.

Expected:
- focused dialog lists existing Character/NPC Actors
- current Ranger is excluded
- choose an Actor and confirm
- card updates to show linked Actor
- Open becomes available
- no Actor is created

## Gate E — legacy fallback Ranger
Open a Ranger that has NOT been explicitly M8-migrated.

Expected:
- relationship cards are still built from legacy fields
- source badge reports LEGACY_FALLBACK
- no automatic normalized storage write occurs merely by opening the sheet

## Gate F — legacy compatibility fields
Expand Legacy Relationship Fields.

Expected:
- Parents
- Senior Artisan
- Mentor
- Friend
- Enemy
remain present and editable.

Edit one harmless legacy field and save/blur normally.

Expected:
- normal Legacy Mixed field behavior remains intact
- relationship card reflects the current legacy value after render
- normalized status/history/Actor link metadata is not deleted

## Gate G — reload
Reload Foundry.

Expected:
- Relationship UI still renders
- normalized status/history remains
- Actor link remains when linked
- legacy fields remain intact
- no Circles/Recruitment/gameplay behavior changes

## PASS criteria
qa.27 passes when the Character Relationships page can safely present M8 normalized metadata and link/unlink/open existing Actors while Legacy Mixed relationship fields remain intact and authoritative.
