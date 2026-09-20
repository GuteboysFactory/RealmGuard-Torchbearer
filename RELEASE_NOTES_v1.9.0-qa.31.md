# Realm Guard / Torchbearer v1.9.0-qa.31 — Recruitment Relationship NPC Review

This build connects the completed Ranger Recruitment flow to the verified Quick NPC Library.

## After Ranger creation
The Ranger is created first, exactly as before.

For a GM, a separate optional Relationship NPC review then appears with:
- Create All
- Choose NPCs
- Not Now

No NPC is created automatically.

## Review contents
The review uses the Ranger's M8 Social Network / Recruitment relationship people, including:
- parents
- senior artisan
- mentor
- friend
- enemy

Each person shows their relationship role and a suggested Quick NPC search where useful.

## Choose NPCs
Choose NPCs opens a checklist so the GM can decide which relationship people should receive NPC Actors now.

Create All selects every relationship person for creation.

Not Now leaves the relationship people recorded without Actor links. They can still be created later from Character -> Relationships using qa.30.

## Quick NPC handoff
For each selected person:
1. Quick NPC Library opens,
2. search is prefilled using Recruitment identity data,
3. GM explicitly chooses the template,
4. Actor is created using the person's name,
5. Actor goes into NPC - PC Relations,
6. PersonRecord.actorUuid is linked automatically.

The Quick NPC template provides the NPC's game data.
Recruitment/M8 provides the person's identity.

## Search hints
Suggested searches use profession and clean culture hints where available.

Examples:
- Friend / Innkeeper / Bree -> innkeeper bree
- Senior Artisan / Smith -> smith plus useful homeland culture
- Mentor -> ranger plus useful homeland culture
- Orc Enemy -> orc plus useful culture/type context

## Permissions
The post-Recruitment NPC review is GM-only.
If a non-GM completes Recruitment, relationship data is still preserved and a GM can create those NPCs later from the Relationships page.

## Explicitly unchanged
- Ranger creation rules
- Recruitment Skill/Trait/Wise/Gear logic
- Circles behavior
- M8 status/history behavior
- no automatic NPC creation
- no Group templates yet

Group templates remain a later Quick NPC Library expansion. Group-created NPCs will use the dedicated Actor folder NPCs Groups.
