# Realm Guard / Torchbearer v1.9.0-qa.26 — M8 Social Network Foundation QA

This QA is intentionally backend/shadow-only.

## Gate A — startup
Open a world with at least one Ranger.

Console:
game.realmGuard.core.m8.getStatus()

Expected:
- phase M8
- mode SHADOW_READ_COMPATIBILITY
- liveApplication false
- gameplay preservation flags remain false/no-change for Circles, Recruitment and sheet behavior

## Gate B — preview existing Ranger
Console:
game.realmGuard.core.m8.previewActor("<RANGER_ACTOR_ID>")

Expected:
- stored false before migration
- people / relationships are generated from existing legacy fields
- mother and father are separate records when Recruitment flags exist
- Friend is role FRIEND / status FRIENDLY
- Enemy is role ENEMY / status HOSTILE
- no legacy Actor fields are altered

Run preview twice.

Expected:
- person IDs and relationship IDs are identical both times

## Gate C — conservative legacy read
Preview an older/manual Ranger whose relationship fields contain free text.

Expected:
- raw strings remain preserved
- no aggressive comma/name parsing unless the source is known Recruitment data
- no data is deleted

## Gate D — explicit migration
As GM:
await game.realmGuard.core.m8.migrateActor("<RANGER_ACTOR_ID>")

Then:
game.realmGuard.core.m8.previewActor("<RANGER_ACTOR_ID>")

Expected:
- stored true
- normalized snapshot exists under Realm Guard flags
- old system.parents / seniorArtisan / mentor / friend / enemy still exist unchanged

Run migrateActor again.

Expected:
- created false
- no duplicates are added

## Gate E — relationship status history
Choose one relationship id from preview and run:

await game.realmGuard.core.m8.social.updateRelationshipStatus(
  "<RANGER_ACTOR_ID>",
  "<RELATIONSHIP_ID>",
  "ESTRANGED",
  { reason: "QA status change", sessionId: "qa-26", source: "PLAY" }
)

Expected:
- relationship status changes in normalized storage
- one history entry is appended
- legacy visible relationship field is unchanged

## Gate F — optional Actor linkage
Choose a PersonRecord and an existing NPC Actor UUID:

await game.realmGuard.core.m8.social.linkActor(
  "<RANGER_ACTOR_ID>",
  "<PERSON_ID>",
  "<NPC_ACTOR_UUID>"
)

Expected:
- PersonRecord.actorUuid is populated
- no new NPC is created
- legacy relationship text is unchanged

## Gate G — reload
Reload Foundry after a migrated actor.

Expected:
- stored normalized data survives reload
- preview reports stored true
- IDs, status history and actorUuid survive

## PASS criteria
qa.26 passes when normalized Social Network storage can preview, explicitly migrate, retain history/linkage and reload without changing Legacy Mixed gameplay or deleting/replacing any existing relationship fields.
