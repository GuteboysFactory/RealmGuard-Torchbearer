# Realm Guard / Torchbearer v1.9.0-qa.31 — Smart Recruitment Relationship NPC Review

This build upgrades the post-Recruitment Relationship NPC review so the GM does not have to manually identify a template for every person.

## Core flow
The Ranger is created first, unchanged.

The GM then gets:
- Create All
- Choose NPCs
- Not Now

Realm Guard automatically resolves a suggested Quick NPC template for every Recruitment relationship person before the GM decides whether to create them.

No NPC is created before the GM explicitly chooses Create All or Create Selected.

## Automatic template resolution
The resolver uses structured Recruitment / M8 data rather than the person's name.

It considers:
- relationship role
- profession / specialty
- homeland / culture
- people / type
- location where it maps cleanly to a library culture
- expected competence for the relationship role

Default competence guidance:
- Parent -> Ordinary
- Friend -> Ordinary
- Senior Artisan -> Skilled
- Mentor -> Veteran
- Enemy -> Skilled

Examples:
- Baran Dev · Friend · Innkeeper · Bree -> Bree Innkeeper · Ordinary
- Senior Artisan · Smith -> a relevant Smith template, normally Skilled
- Mentor -> a relevant Ranger template, normally Veteran
- Orc Enemy -> a relevant Orc template, normally Skilled

## GM review
The review shows:
- person name
- relationship role
- derived search context
- suggested Quick NPC template

The normal path requires no extra template selection.

A Change Template button remains available as an optional override for special cases. It opens Quick NPC Library in selection-only mode and does not create an NPC by itself.

## Creation
Create All:
- creates every listed relationship NPC directly from its suggestion

Choose NPCs:
- opens a checklist
- Create Selected creates only the checked people
- suggested templates are already resolved
- Change Template remains optional

Created Actors:
- use the relationship person's name
- use template stats / Skills / Gear
- go to NPC - PC Relations
- are linked back through PersonRecord.actorUuid
- remain normal editable Actors detached from the source template

## Explicitly unchanged
- Ranger Recruitment rules
- no automatic creation without GM approval
- Circles behavior
- M8 status/history
- qa.30 Relationship -> Create NPC flow
- no Group templates yet

Future Group templates remain assigned to the dedicated Actor folder NPCs Groups.
