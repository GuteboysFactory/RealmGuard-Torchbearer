# v1.9.0-qa.30 — Relationship -> Quick NPC QA

## Gate A — Create NPC button
Open a Ranger -> Character -> Relationships.

Expected:
- unlinked relationships show Create NPC and Link Existing Actor
- linked relationships still show Open / Unlink
- Create NPC is GM-only

## Gate B — Baran / Friend
Use a relationship such as Baran Dev:
- profession: Innkeeper / legacy Inkeeper
- location: Bree

Click Create NPC.

Expected:
- Quick NPC Library opens
- search is prefilled with a useful query such as `innkeeper bree`
- no Actor has been created yet

Close the library without choosing a template.

Expected:
- no NPC is created
- relationship remains unlinked

## Gate C — choose template
Click Create NPC again and choose an appropriate template such as Bree Innkeeper · Ordinary.

Expected:
- one NPC Actor is created
- Actor name is Baran Dev, not the template name
- stats / Skills / Gear come from the chosen template
- Actor is fully editable
- relationship becomes linked automatically
- card shows Open / Unlink

## Gate D — folder
Check Actors directory.

Expected:
- folder `NPC - PC Relations` exists
- it is created automatically if it did not exist
- the newly created relationship NPC is inside it

Create another relationship NPC.

Expected:
- same existing folder is reused
- no duplicate relationship folders are created

## Gate E — Open / Unlink
Click Open.

Expected:
- created NPC sheet opens

Click Unlink.

Expected:
- Actor remains in NPC - PC Relations
- relationship returns to Create NPC / Link Existing Actor
- no Actor is deleted

## Gate F — Link Existing Actor regression
Use Link Existing Actor on an unlinked relationship.

Expected:
- existing behavior still works
- selected Actor remains in its current folder
- it is NOT moved into NPC - PC Relations

## Gate G — persistence
Create/link a relationship NPC, reload Foundry, reopen the Ranger.

Expected:
- Actor remains in NPC - PC Relations
- relationship link persists
- Open works
- status/history and legacy relationship fields remain intact

## PASS
qa.30 passes when the GM can explicitly turn a PersonRecord into a complete Quick NPC in seconds, automatically link it back to the relationship, and keep relationship-created Actors neatly organized without creating anything automatically.
