# Realm Guard / Torchbearer v1.9.0-qa.30 — Relationship -> Quick NPC

This build connects M8 Relationships to the verified Quick NPC Library.

## Character -> Relationships
Unlinked relationship people now expose:
- Create NPC
- Link Existing Actor

Create NPC is GM-only.

## Relationship creation flow
When the GM clicks Create NPC:
1. the relationship PersonRecord is resolved,
2. Quick NPC Library opens,
3. search is prefilled from the person's profession and useful culture/location hints,
4. GM explicitly chooses a template,
5. a normal editable NPC Actor is created,
6. the Actor is named after the relationship person,
7. the Actor is placed in the Actor folder `NPC - PC Relations`,
8. that folder is created automatically if missing,
9. PersonRecord.actorUuid is linked to the new Actor,
10. the relationship card updates to Open / Unlink.

No NPC is created until the GM explicitly clicks Create NPC and chooses a template.

## Search prefill
The prefill favors occupation first and only adds culture hints when they map cleanly to the Quick NPC Library.

Example:
- Baran Dev / Inkeeper / Bree
- prefill normalizes known legacy spelling to `innkeeper bree`

Specific locations that are not library cultures do not unnecessarily narrow the search.

## Existing Actor behavior
Link Existing Actor is unchanged.
Existing Actors are never moved into NPC - PC Relations.

Unlink is unchanged:
- only actorUuid is removed
- the NPC Actor itself is not deleted

## Architecture
The Quick NPC Library remains the single template source.
M8 defines who the person is.
Quick NPC defines what kind of NPC is created.

Created NPC Actors remain fully editable and detached from their source template.

## Explicitly unchanged
- no automatic relationship NPC creation
- no Create All relationship NPCs
- no Ranger Creation Wizard NPC creation yet
- no Circles changes
- no relationship status/history changes
- no group templates yet

Group templates such as Group - Orc remain a later Quick NPC Library expansion.
