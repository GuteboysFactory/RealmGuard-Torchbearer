# Realm Guard / Torchbearer v1.9.0-qa.26 — M8 Social Network Foundation

M8 begins with a backend-only, non-destructive Social Network foundation.

## Domain model
Adds:
- PersonRecord
- Relationship
- RelationshipRole
- RelationshipStatus
- RelationshipOrigin
- RelationshipHistory
- SocialNetworkSnapshot

Person and Actor remain separate concepts.
Relationship role and relationship status remain separate concepts.
A PersonRecord may optionally link to an Actor through actorUuid, but no NPC Actor is created automatically.

## Repository / service
Adds:
- SocialNetworkRepository
- SocialNetworkService
- deterministic source-slot IDs
- duplicate protection
- optional Person -> Actor linking
- relationship status history
- compatibility fallback reads

## Legacy migration
The foundation can read existing Ranger social data from:
- Recruitment mother / father flags
- system.parents
- system.seniorArtisan
- system.mentor
- system.friend
- system.enemy

Recruitment-created records use the Recruitment origin.
Older arbitrary strings are preserved conservatively as raw legacy values instead of being aggressively parsed.

Migration is explicit and GM-controlled in this build.
Nothing is auto-migrated on startup.
Existing legacy fields are never deleted or rewritten.

## Shadow runtime
Exposes:
- game.realmGuard.core.m8.getStatus()
- game.realmGuard.core.m8.previewActor(actorOrId)
- game.realmGuard.core.m8.previewAll()
- game.realmGuard.core.m8.migrateActor(actorOrId)
- game.realmGuard.core.m8.migrateAll()
- repository compatibility reads
- social people / relationships / byRole
- relationship status history update
- optional Actor linking

## Deliberately NOT active yet
- no Character Relationships UI replacement
- no Circles live integration
- no Recruitment dual-write
- no automatic migration
- no automatic NPC creation
- no GM NPC-creation prompt
- no Quick NPC Library integration
- Legacy Mixed remains gameplay authority
