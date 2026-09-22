# v1.10.0-qa.4 — M9 CORE Live Transactional Commit QA

**QA RESULT:** 🟢✅ PASS — CORE live creation, rollback fault injection, provenance, M8 normalization, parity guard and Legacy QA fallback verified in Foundry VTT 13.351.

**Foundry target:** 13.351  
**GOLD fallback:** v1.9.0  
**Previous M9 gate:** v1.10.0-qa.3 PASS  
**Gameplay change:** NONE INTENDED  
**Draft authority:** CORE M9  
**Validation authority:** CORE M9  
**Commit authority:** CORE M9  
**Legacy commit:** QA-only explicit fallback

## Gate A — authority

```js
game.realmGuard.core.m9.getStatus()
```

Expected:
- mode = CORE_LIVE_COMMIT
- authority = CORE_M9
- draftAuthority = CORE_M9
- validationAuthority = CORE_M9
- commitAuthority = CORE_M9
- liveApplication.commit = true
- liveApplication.provenance = true
- liveApplication.relationships = true
- commitMode = CORE.

## Gate B — normal complete Ranger
Create one complete Guided or Quick Ranger.

Expected:
- exactly one Actor is created
- PC folder placement is unchanged
- Skills, Traits, unrated Wises, Gear, Conditions, Nature, Will, Health, Resources, Circles, Fate and Persona match qa.3 / Legacy Mixed behavior
- Recruitment compatibility flags remain present
- Chat card appears only after the character transaction succeeds
- Relationship NPC Review remains optional and GM-controlled.

Then inspect:

```js
game.realmGuard.core.m9.commitHistory()
```

Latest row should have:
- success = true
- authority = CORE_M9
- rolledBack = false
- completedPhases includes WRITE_PROVENANCE.

## Gate C — provenance
On the newly created Ranger inspect:

```js
game.actors.getName("YOUR RANGER NAME").getFlag("realm-guard", "creationProvenance")
```

Expected:
- profileId = realm-guard-legacy-mixed
- profileVersion = 4
- createdAt populated
- answers / allocations / grants / derivedValues present
- rulesProfileId present
- rulesProfileVersion present
- rulesSnapshotHash begins with fnv1a-.

Existing pre-qa.4 Rangers must not be modified.

## Gate D — normalized M8 Recruitment relationships
On the new Ranger:

```js
game.realmGuard.core.m8.repository.readStored(game.actors.getName("YOUR RANGER NAME"))
```

Expected:
- stored normalized Social Network exists immediately
- Recruitment people/relationships are represented once
- Friend is Friendly
- Enemy is Hostile
- origin/source remains Recruitment-compatible
- no automatic NPC Actor is created.

## Gate E — parity guard
After normal creation:

```js
game.realmGuard.core.m9.getStatus()
game.realmGuard.core.m9.history()
```

Expected:
- mismatches = 0
- commitMismatches = 0
- allParity = true
- allCommitParity = true.

A parity mismatch must block CORE commit before Actor mutation.

## Gate F — transactional rollback fault injection
QA only. Arm one controlled one-shot failure:

```js
game.realmGuard.core.m9.testCommitFailure("CREATE_ITEMS")
```

Create a Ranger and complete Review.

Expected:
- creation fails deliberately
- any newly created partial Actor is deleted
- no Ranger with that name remains in Actors
- no Recruitment chat card is posted
- no Relationship NPC Review opens.

Inspect:

```js
game.realmGuard.core.m9.commitHistory()
```

Latest row should have:
- success = false
- phase = CREATE_ITEMS
- rolledBack = true
- injected = true.

The failure injection automatically disarms after one commit attempt.

## Gate G — explicit Legacy emergency fallback
QA only:

```js
game.realmGuard.core.m9.setCommitMode("LEGACY")
```

Create one test Ranger. It should use the preserved Legacy createRanger implementation before any CORE mutation begins.

Return immediately to:

```js
game.realmGuard.core.m9.setCommitMode("CORE")
```

This is an emergency QA rollback path only, not normal authority.

## PASS
qa.4 passes when CORE creates normal Rangers transactionally, provenance and normalized M8 relationships persist, legacy-compatible output remains parity-clean, and an injected post-Actor failure leaves no partial Ranger or post-commit side effects.
