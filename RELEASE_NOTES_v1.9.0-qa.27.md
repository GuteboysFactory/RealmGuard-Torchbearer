# Realm Guard / Torchbearer v1.9.0-qa.27 — M8 Relationship UI Foundation

This build places the verified M8 Social Network foundation onto the Ranger Character > Relationships page without changing Legacy Mixed gameplay authority.

## Character > Relationships
The page now presents Social Network relationship cards with:
- person name
- relationship role
- relationship status
- profession / people / location when available
- relationship origin
- history count
- Actor-link state

The presentation uses current Legacy Mixed relationship fields as the visible source and overlays stored normalized M8 metadata such as:
- status changes
- relationship history
- optional actorUuid linkage

This means legacy field edits remain visible while normalized relationship metadata is preserved.

## Existing Actor linking
Each relationship person can:
- Link Existing Actor
- Open linked Actor
- Unlink Actor

Linking selects an existing Foundry Character/NPC Actor.
It never creates a new NPC.
Unlink removes only actorUuid; it never deletes the linked Actor.

## Legacy compatibility
Legacy Relationship Fields remain available in a collapsible compatibility section:
- Parents
- Senior Artisan
- Mentor
- Friend / Ally
- Enemy / Rival

These remain the Legacy Mixed gameplay source for this build.

## Explicitly unchanged
- no Circles live integration
- no Recruitment dual-write
- no automatic NPC creation
- no Quick NPC Library integration
- no relationship gameplay authority handoff
- no legacy-field deletion

## Architecture
Person remains separate from Actor.
Relationship remains separate from Person.
Role remains separate from Status.
M8 remains a compatibility/shadow data layer with a live presentation UI.
