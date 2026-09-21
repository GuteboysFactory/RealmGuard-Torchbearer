# v1.9.0-qa.38 — Dynamic Contacts QA

## Gate A — load
Install qa.38 in Foundry VTT 13.351 and open a Ranger.

Expected:
- Relationships tab loads normally
- existing Recruitment relationships remain intact
- **New Contact** is visible to GM

## Gate B — create Contact
Press **New Contact** and enter:
- Name: Haldric
- Profession: Smith
- People: Man
- Location: Tharbad
- Status: Neutral
- Notes: Met during play

Press Add Contact.

Expected:
- Contact appears on Relationships tab
- role is Contact
- status is Neutral
- profession / people / location display correctly
- no Actor/NPC is created automatically

## Gate C — persistence
Reload Foundry / reopen Ranger.

Expected:
- Contact remains present
- notes and status persist

## Gate D — duplicate protection
Try to create the same Contact again with the same:
Name + Profession + People + Location.

Expected:
- duplicate warning
- no second Contact appears
- no duplicate PersonRecord / Relationship is created

## Gate E — edit Contact
Press **Edit Contact** on Haldric.

Change Profession to:
`Master Smith`

Add/change Notes.

Expected:
- Contact updates in place
- no new Contact record appears
- status remains Neutral
- Actor link remains intact if one existed

## Gate F — Living Relationship integration
Change Haldric:
`Neutral -> Friendly`

Add a reason/session.

Expected:
- status becomes Friendly
- RelationshipHistory works exactly as qa.37
- PersonRecord edits remain intact

## Gate G — optional NPC creation
Press **Create NPC** on Haldric.

Expected:
- Quick NPC Library opens with useful matching context
- NPC is only created after explicit template choice
- created Actor goes to `NPC - PC Relations`
- Contact receives actorUuid link

## Gate H — Link Existing Actor
On another Dynamic Contact, use Link Existing Actor.

Expected:
- link works without NPC creation
- Open / Unlink work as before

## Gate I — Recruitment regression
Confirm Mother/Father/Senior Artisan/Mentor/Friend/Enemy remain unchanged.

Expected:
- Dynamic Contact creation does not rewrite legacy Recruitment fields
- no Recruitment relationship is converted into Contact

## Gate J — player presentation
Open Ranger as non-GM owner.

Expected:
- Contacts are visible
- status/history is visible
- New Contact / Edit Contact / Status editing are unavailable
- ordinary sheet use remains unaffected

## PASS
qa.38 passes when Contacts can be created, persisted, edited, protected from exact duplicates and reused by the existing Relationship/NPC linking tools without automatic NPC creation or Recruitment regression.


## VERIFIED RESULT

**PASS — 2026-09-21 / Foundry VTT 13.351**

Live QA confirmed:
- Dynamic Contacts can be created from Relationships
- no NPC Actor is created automatically
- reload persistence works
- exact duplicate protection works
- Contact editing updates the existing PersonRecord
- Living Relationship status/history remains intact
- explicit Create NPC still routes through Quick NPC into `NPC - PC Relations`
- Link Existing Actor / Open / Unlink remain functional
- Recruitment relationships remain unchanged
- player presentation remains non-destructive

No blocking issues were reported during qa.38 live validation.
